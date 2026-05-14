# === User Model ===
# Represents the "users" table in the database.
# Each User is an account that can log in and may have associated student records.
# Users have roles (e.g., "admin", "student") that control what they can access.

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# TYPE_CHECKING avoids circular imports at runtime (User ↔ Student reference each other)
if TYPE_CHECKING:
    from app.models.student import Student


class User(Base):
    __tablename__ = "users"  # The actual table name in PostgreSQL

    # === Columns ===
    id: Mapped[int] = mapped_column(primary_key=True, index=True)   # Auto-incrementing unique ID
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True         # Login email — must be unique
    )
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # Hashed password (never stored as plain text)
    full_name: Mapped[str] = mapped_column(String(150), nullable=True)  # Display name (optional)
    role: Mapped[str] = mapped_column(String(50), nullable=False)       # "admin" or "student" — controls permissions

    # === Relationship — a user can have multiple student records ===
    # back_populates="user" links this to Student.user (bidirectional relationship)
    # Example: user.students → list of all Student records belonging to this user
    students: Mapped[list["Student"]] = relationship(back_populates="user")
