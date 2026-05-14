import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.cache.cache_manager import cache_manager
from app.core.dependencies import get_current_user, get_db, require_admin
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _list_cache_key(
    search: str | None,
    department: str | None,
    status_filter: str | None,
    gpa_min: float | None,
    gpa_max: float | None,
    skip: int,
    limit: int,
) -> str:
    """Build a deterministic cache key for the list endpoint."""
    raw = json.dumps(
        {"s": search, "d": department, "st": status_filter,
         "gmin": gpa_min, "gmax": gpa_max, "sk": skip, "l": limit},
        sort_keys=True,
    )
    digest = hashlib.md5(raw.encode()).hexdigest()[:12]
    return f"students:list:{digest}"


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Student:
    # Permission: admins can create for anyone; students only for themselves
    if current_user.role != "admin" and payload.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Verify the target user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent duplicate student records for the same user
    existing = db.query(Student).filter(Student.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student record already exists for this user")

    # Ensure university_id is globally unique
    existing_id = db.query(Student).filter(Student.university_id == payload.university_id).first()
    if existing_id:
        raise HTTPException(status_code=400, detail="University ID already exists")

    # Create and save the student
    student = Student(**payload.model_dump())
    db.add(student)
    
    # Sync name with User
    user.full_name = student.name
    
    db.commit()
    db.refresh(student)
    
    logger.info(f"Audit: Student created by User {current_user.id}. Student ID: {student.id}, University ID: {student.university_id}")
    
    # Clear cached student lists since data has changed
    cache_manager.invalidate_prefix("students:list")
    
    return student


# ──────────────────────────────────────────────
# LIST — Get all students with optional filters (admin only)
# ──────────────────────────────────────────────
@router.get("/", response_model=list[StudentResponse])
def list_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),  # Only admins can list all students
    search: str | None = Query(None, description="Search by name or university ID"),
    department: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    gpa_min: float | None = Query(None, ge=0, le=4.0),
    gpa_max: float | None = Query(None, ge=0, le=4.0),
    skip: int = Query(0, ge=0),      # Pagination: how many to skip
    limit: int = Query(10, ge=1, le=100),  # Pagination: max results per page
) -> list[Student]:
    # Cache-Aside: check cache first
    cache_key = _list_cache_key(search, department, status_filter, gpa_min, gpa_max, skip, limit)
    cached = cache_manager.get_json(cache_key)
    if cached is not None:
        logger.debug(f"Cache HIT for {cache_key}")
        return [Student(**item) for item in cached]

    logger.debug(f"Cache MISS for {cache_key}")
    query = db.query(Student)

    if search:
        query = query.filter(
            (Student.name.ilike(f"%{search}%")) |
            (Student.university_id.ilike(f"%{search}%"))
        )
    if department:
        query = query.filter(Student.department == department)
    if status_filter:
        query = query.filter(Student.status == status_filter)
    if gpa_min is not None:
        query = query.filter(Student.gpa >= gpa_min)
    if gpa_max is not None:
        query = query.filter(Student.gpa <= gpa_max)

    students = query.order_by(Student.id).offset(skip).limit(limit).all()

    # Store in cache
    students_data = [
        {
            "id": s.id,
            "university_id": s.university_id,
            "name": s.name,
            "birth_date": s.birth_date.isoformat() if s.birth_date else None,
            "gender": s.gender,
            "phone_number": s.phone_number,
            "gpa": s.gpa,
            "department": s.department,
            "enrollment_date": s.enrollment_date.isoformat(),
            "status": s.status,
            "user_id": s.user_id,
        }
        for s in students
    ]
    cache_manager.set_json(cache_key, students_data)
    return students


# ──────────────────────────────────────────────
# GET MY PROFILE — Current user's own student record
# ──────────────────────────────────────────────
@router.get("/me", response_model=StudentResponse)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Student:
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found for this user")
    return student


# ──────────────────────────────────────────────
# GET BY ID — Fetch a specific student (uses cache)
# ──────────────────────────────────────────────
@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Student:
    # Check the cache first for faster response
    cache_key = f"students:detail:{student_id}"
    cached = cache_manager.get_json(cache_key)
    if cached:
        # Even from cache, verify the user has permission to view
        if current_user.role != "admin" and cached["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return Student(**cached)

    # Cache miss — query the database
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Permission: admins can view anyone; students only themselves
    if current_user.role != "admin" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Store in cache for future requests
    student_data = {
        "id": student.id,
        "university_id": student.university_id,
        "name": student.name,
        "birth_date": student.birth_date.isoformat() if student.birth_date else None,
        "gender": student.gender,
        "phone_number": student.phone_number,
        "gpa": student.gpa,
        "department": student.department,
        "enrollment_date": student.enrollment_date.isoformat(),
        "status": student.status,
        "user_id": student.user_id
    }
    cache_manager.set_json(cache_key, student_data)
    
    return student


@router.put("/{student_id}", response_model=StudentResponse)
def replace_student(
    student_id: int,
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Student:
    """Full replacement update of a student record (PUT)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role != "admin" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = payload.model_dump()
    for key, value in update_data.items():
        setattr(student, key, value)

    # Sync name with User if it exists
    user = db.query(User).filter(User.id == student.user_id).first()
    if user:
        user.full_name = student.name

    db.commit()
    db.refresh(student)


    logger.info(f"Audit: Student {student_id} fully updated (PUT) by User {current_user.id}")

    cache_manager.invalidate_key(f"students:detail:{student_id}")
    cache_manager.invalidate_prefix("students:list")
    return student


@router.patch("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Student:
    """Partial update of a student record (PATCH)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role != "admin" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)

    # Sync name with User if it exists and name was updated
    if "name" in update_data:
        user = db.query(User).filter(User.id == student.user_id).first()
        if user:
            user.full_name = update_data["name"]

    db.commit()
    db.refresh(student)


    logger.info(f"Audit: Student {student_id} partially updated (PATCH) by User {current_user.id}")

    cache_manager.invalidate_key(f"students:detail:{student_id}")
    cache_manager.invalidate_prefix("students:list")
    return student


# ──────────────────────────────────────────────
# DELETE — Remove a student record (admin only)
# ──────────────────────────────────────────────
@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()

    logger.info(f"Audit: Student {student_id} deleted by Admin {current_user.id}")

    # Invalidate caches
    cache_manager.invalidate_key(f"students:detail:{student_id}")
    cache_manager.invalidate_prefix("students:list")


# ──────────────────────────────────────────────
# STATS — Aggregate student statistics (admin only)
# ──────────────────────────────────────────────
@router.get("/stats/summary")
def get_student_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Returns a summary dashboard with:
      - Total number of students
      - Average GPA across all students
      - Breakdown by department (how many students in each)
      - Breakdown by status (active, graduated, suspended, etc.)
    """
    total_students = db.query(Student).count()
    
    # Count students per department
    dept_stats = db.query(
        Student.department, func.count(Student.id)
    ).group_by(Student.department).all()
    
    # Count students per status
    status_stats = db.query(
        Student.status, func.count(Student.id)
    ).group_by(Student.status).all()
    
    # Calculate average GPA (returns None if no students, so default to 0.0)
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0.0
    
    return {
        "total_students": total_students,
        "average_gpa": round(float(avg_gpa), 2),
        "departments": {dept: count for dept, count in dept_stats},
        "statuses": {status: count for status, count in status_stats}
    }
