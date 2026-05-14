# === Base Model ===
# This is the parent class that ALL database models (tables) must inherit from.
# SQLAlchemy uses this class to track which models exist and how to create their tables.
#
# Example:
#   class Student(Base):
#       __tablename__ = "students"
#       id = Column(Integer, primary_key=True)
#
# When you call Base.metadata.create_all(), SQLAlchemy scans all classes
# that inherit from Base and creates their corresponding tables in the database.

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
