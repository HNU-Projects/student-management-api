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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_admin
from app.models.user import User
from app.schemas.auth import UserResponse, EmailUpdate, PasswordUpdate, NameUpdate, UserRegister, UserUpdate
from app.utils.hashing import hash_password, verify_password

router = APIRouter()


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
    _: User = Depends(require_admin),  # Rejects non-admin users with 403
) -> list[User]:
    return db.query(User).order_by(User.id).all()


# ──────────────────────────────────────────────
# GET USER BY ID — Admin only
# ──────────────────────────────────────────────
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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
    return current_user


@router.put("/me/name", response_model=UserResponse)
def update_name(
    payload: NameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
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
    
    # Only update password if provided
    if payload.password:
        user.password = hash_password(payload.password)
        
    db.commit()
    db.refresh(user)
    
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
        
    if "role" in update_data:
        user.role = update_data["role"].value

    db.commit()
    db.refresh(user)
    
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
    logger.info(f"Audit: User {user_id} deleted by Admin {current_user.id}")
