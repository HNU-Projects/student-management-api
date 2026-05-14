# === User Management Routes ===
# CRUD operations for user accounts. Most endpoints require authentication.
#
# Endpoints:
#   GET    /users/me          → Get the current logged-in user's profile
#   GET    /users/            → List all users (admin only)
#   POST   /users/            → Create a new user with any role (admin only)
#   PUT    /users/me/email    → Update the current user's email
#   PUT    /users/me/password → Update the current user's password
#   DELETE /users/{id}        → Delete a user account (admin only, can't delete self)

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.cache.cache_manager import cache_manager
from app.core.dependencies import get_current_user, get_db, require_admin
from app.models.user import User
from app.models.student import Student
from app.schemas.auth import UserResponse, EmailUpdate, PasswordUpdate, NameUpdate, UserRegister, UserUpdate
from app.utils.hashing import hash_password, verify_password

router = APIRouter()


def _user_list_cache_key(search: str | None, role: str | None, skip: int, limit: int) -> str:
    import hashlib
    import json
    raw = json.dumps({"s": search, "r": role, "sk": skip, "l": limit}, sort_keys=True)
    digest = hashlib.md5(raw.encode()).hexdigest()[:12]
    return f"users:list:{digest}"


# ──────────────────────────────────────────────
# GET MY PROFILE — Returns the current authenticated user's info
# ──────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# ──────────────────────────────────────────────
# LIST ALL USERS — Admin only
# ──────────────────────────────────────────────
@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    search: str | None = Query(None),
    role: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> list[User]:
    # Cache-Aside
    cache_key = _user_list_cache_key(search, role, skip, limit)
    cached = cache_manager.get_json(cache_key)
    if cached:
        return [User(**u) for u in cached]

    query = db.query(User)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.id).offset(skip).limit(limit).all()
    
    # Store in cache
    users_data = [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role} for u in users]
    cache_manager.set_json(cache_key, users_data)
    
    return users


# ──────────────────────────────────────────────
# GET USER BY ID — Admin only
# ──────────────────────────────────────────────
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    cache_key = f"users:detail:{user_id}"
    cached = cache_manager.get_json(cache_key)
    if cached:
        return User(**cached)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cache it
    user_data = {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    cache_manager.set_json(cache_key, user_data)
    
    return user


# ──────────────────────────────────────────────
# CREATE USER — Admin only (can assign any role)
# Unlike /auth/register which forces "student" role,
# this endpoint lets admins create users with any role.
# ──────────────────────────────────────────────
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserRegister,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    # Prevent duplicate emails
    existing = db.query(User).filter(User.email == str(payload.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = User(
        email=str(payload.email),
        password=hash_password(payload.password),  # Always hash before storing
        full_name=payload.full_name,
        role=payload.role.value,  # Admin can set the role (e.g., "admin", "student")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Invalidate cache
    cache_manager.invalidate_prefix("users:list")
    
    return user


# ──────────────────────────────────────────────
# UPDATE EMAIL — Current user only
# ──────────────────────────────────────────────
@router.put("/me/email", response_model=UserResponse)
def update_email(
    payload: EmailUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    # Make sure the new email isn't already taken by someone else
    existing = db.query(User).filter(User.email == str(payload.new_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    current_user.email = str(payload.new_email)
    db.commit()
    db.refresh(current_user)
    
    # Invalidate cache
    cache_manager.invalidate_key(f"users:detail:{current_user.id}")
    cache_manager.invalidate_prefix("users:list")
    return current_user


@router.put("/me/name", response_model=UserResponse)
def update_name(
    payload: NameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    current_user.full_name = payload.full_name
    
    # Sync with student record if it exists
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if student:
        student.name = payload.full_name
        
    db.commit()
    db.refresh(current_user)
    
    # Invalidate cache
    cache_manager.invalidate_key(f"users:detail:{current_user.id}")
    cache_manager.invalidate_prefix("users:list")
    return current_user


@router.put("/me/password")
def update_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the old password before allowing the change
    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    
    current_user.password = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated successfully"}


@router.put("/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    payload: UserRegister, # Using UserRegister to allow updating name/role
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is being changed and if it's taken
    if user.email != str(payload.email):
        existing = db.query(User).filter(User.email == str(payload.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = str(payload.email)

    user.full_name = payload.full_name
    user.role = payload.role.value
    
    # Sync with student record if it exists
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if student:
        student.name = payload.full_name
        
    # Only update password if provided
    if payload.password:
        user.password = hash_password(payload.password)
        
    db.commit()
    db.refresh(user)
    
    # Invalidate cache
    cache_manager.invalidate_key(f"users:detail:{user_id}")
    cache_manager.invalidate_prefix("users:list")
    
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info(f"Audit: User {user_id} updated by Admin")
    
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def patch_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    """Partial update of a user (PATCH)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    
    if "email" in update_data:
        existing = db.query(User).filter(User.email == str(update_data["email"])).first()
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = str(update_data["email"])
    
    if "password" in update_data and update_data["password"]:
        user.password = hash_password(update_data["password"])
        
    if "full_name" in update_data:
        user.full_name = update_data["full_name"]
        # Sync with student record if it exists
        student = db.query(Student).filter(Student.user_id == user_id).first()
        if student:
            student.name = update_data["full_name"]
            
    if "role" in update_data:
        user.role = update_data["role"].value

    db.commit()
    db.refresh(user)
    
    # Invalidate cache
    cache_manager.invalidate_key(f"users:detail:{user_id}")
    cache_manager.invalidate_prefix("users:list")
    
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info(f"Audit: User {user_id} partially updated (PATCH) by Admin")
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    # Prevent admins from accidentally deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    
    db.delete(user)
    db.commit()
    
    # Invalidate cache
    cache_manager.invalidate_key(f"users:detail:{user_id}")
    cache_manager.invalidate_prefix("users:list")
    
    logger.info(f"Audit: User {user_id} deleted by Admin {current_user.id}")
