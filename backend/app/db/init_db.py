# === Database Initialization ===
# This file creates all database tables based on the SQLAlchemy models.
# It's typically called once when the application starts for the first time.
#
# Note: In production, you'd normally use Alembic migrations instead of create_all().
# create_all() is convenient for development — it creates missing tables but
# does NOT update existing ones if their schema changes.

from app.db.base import Base
from app.db.session import engine

# These imports look unused, but they're essential!
# Importing the model modules forces Python to execute them, which registers
# the Student and User models with Base.metadata. Without this, create_all()
# wouldn't know about these tables and would create nothing.
from app.models import student, user  # noqa: F401


def init_db() -> None:
    """
    Scans all models registered with Base and creates their tables in the database.
    - If a table already exists → it's skipped (no data loss).
    - If a table is missing → it's created.
    """
    Base.metadata.create_all(bind=engine)
