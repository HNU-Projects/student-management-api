# === Student Model ===
# Represents the "students" table in the database.
# Each Student record holds academic information and is linked to a User account.
#
# Table relationship:
#   users (1) ──→ (many) students
#   One user can have student records, and each student belongs to exactly one user.

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# TYPE_CHECKING avoids circular imports — this import only runs during type-checking,
# not at runtime. Needed because User imports Student and Student imports User.
if TYPE_CHECKING:
    from app.models.user import User


class Student(Base):
    __tablename__ = "students"  # The actual table name in PostgreSQL

    # === Primary key — auto-incrementing unique ID for each student ===
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # === Student-specific fields ===
    university_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., "2024-CS-001"
    name: Mapped[str] = mapped_column(String(150), nullable=False)         # Full name
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)   # Optional date of birth
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Optional: "male", "female", etc.
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Optional contact number
    gpa: Mapped[float] = mapped_column(Float, nullable=False)              # Grade Point Average (0.0 - 4.0)
    department: Mapped[str] = mapped_column(String(100), nullable=False)   # e.g., "Computer Science"
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False)    # When the student enrolled
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")  # "active", "graduated", "suspended", etc.

    # === Foreign key — links this student to a user account ===
    # ondelete="CASCADE" means: if the user is deleted, their student record is also deleted.
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # === Relationship — allows accessing the User object from a Student instance ===
    # Example: student.user.email → gets the student's email from the users table
    user: Mapped["User"] = relationship(back_populates="students")
