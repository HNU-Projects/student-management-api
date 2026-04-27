from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.db.session import SessionLocal
from app.models.student import Student
from app.models.user import User


def seed_data(db: Session) -> None:
    email = os.getenv("SEED_USER_EMAIL", "student@example.com")
    password = os.getenv("SEED_USER_PASSWORD", "change_me")
    role = os.getenv("SEED_USER_ROLE", "student")
    name = os.getenv("SEED_STUDENT_NAME", "Sample Student")
    gpa = float(os.getenv("SEED_STUDENT_GPA", "3.5"))
    department = os.getenv("SEED_STUDENT_DEPARTMENT", "Computer Science")

    existing_user = db.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()
    if existing_user is not None:
        return

    user = User(email=email, password=password, role=role)
    db.add(user)
    db.flush()

    student = Student(name=name, gpa=gpa, department=department, user_id=user.id)
    db.add(student)
    db.commit()


def main() -> None:
    with SessionLocal() as db:
        seed_data(db)


if __name__ == "__main__":
    main()
