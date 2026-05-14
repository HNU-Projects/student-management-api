# === Models Package Init ===
# Exports all database models so they can be imported from one place:
# from app.models import User, Student

from app.models.student import Student
from app.models.user import User

__all__ = ["User", "Student"]
