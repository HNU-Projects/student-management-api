# === Authentication & Authorization Dependencies ===
# This file contains FastAPI "dependencies" — reusable functions that are
# injected into route handlers to handle authentication and role-based access.
#
# How it works:
#   1. A request comes in with a Bearer token in the Authorization header.
#   2. get_current_user() extracts the token, verifies it, and loads the user from the DB.
#   3. Role-checking functions (require_admin, require_student, require_roles)
#      ensure the user has the right permissions to access the endpoint.

from collections.abc import Callable, Iterable

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import oauth2_scheme
from app.db.session import get_db
from app.models.user import User
from app.utils.jwt import verify_access_token

# === Pre-defined error responses ===
# These are reused across multiple functions to keep error messages consistent.

# 401 Unauthorized — token is missing, invalid, or expired
_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# 403 Forbidden — user is authenticated but doesn't have the required role
_forbidden_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Not enough permissions",
)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Core authentication function. Every protected endpoint depends on this.
    Steps:
      1. Verify the JWT token and decode its payload.
      2. Extract the 'sub' (subject) claim — which contains the user's email.
      3. Look up the user in the database by email.
      4. Verify the role in the token matches the role in the DB (prevents stale tokens).
      5. Return the authenticated User object.
    """
    # Step 1: Verify the token — raises ValueError if invalid or expired
    try:
        payload = verify_access_token(token)
    except ValueError as exc:
        raise _credentials_exception from exc

    # Step 2: Get the user's email from the 'sub' claim
    sub = payload.get("sub")
    if sub is None:
        raise _credentials_exception

    # Step 3: Find the user in the database
    email = sub if isinstance(sub, str) else str(sub)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Step 4: Ensure the role in the token matches the DB (security check)
    # Prevents using an old token after a user's role has been changed.
    token_role = payload.get("role")
    if token_role is not None and token_role != user.role:

        raise _credentials_exception

    # Attach to request state for middleware access
    request.state.user = user
    return user



def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that restricts an endpoint to admin users only.
    Usage: @router.get("/admin-only", dependencies=[Depends(require_admin)])
    """
    if current_user.role != "admin":
        raise _forbidden_exception
    return current_user


def require_student(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that restricts an endpoint to student users only.
    Usage: @router.get("/student-only", dependencies=[Depends(require_student)])
    """
    if current_user.role != "student":
        raise _forbidden_exception
    return current_user


def require_roles(allowed_roles: Iterable[str]) -> Callable[..., User]:
    """
    Flexible role checker — accepts a list of allowed roles.
    Returns a dependency function that can be used in any endpoint.

    Usage:
        @router.get("/teachers-or-admins", dependencies=[Depends(require_roles(["admin", "teacher"]))])

    How it works:
      1. Converts the allowed roles to a frozenset for fast lookups.
      2. Returns an inner function that checks if the current user's role is in the set.
    """
    allowed = frozenset(allowed_roles)

    def role_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed:
            raise _forbidden_exception
        return current_user

    return role_dependency
