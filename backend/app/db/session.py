# === Database Session Management ===
# This file sets up the connection to the PostgreSQL database
# and provides a way to get a database session for each request.
#
# Architecture:
#   engine      → the actual connection to the database
#   SessionLocal → a factory that creates new session objects
#   get_db()    → a FastAPI dependency that gives each request its own session

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Create the database engine (the connection pool to PostgreSQL).
# pool_pre_ping=True → before reusing a connection, SQLAlchemy sends a quick
# "ping" to check if it's still alive. Prevents errors from stale connections.
engine = create_engine(settings.database_url, pool_pre_ping=True)

# SessionLocal is a session factory — calling SessionLocal() creates a new session.
# autoflush=False  → don't automatically sync Python objects to DB before queries
# autocommit=False → require explicit commit() calls (safer, avoids partial writes)
SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, class_=Session
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session to route handlers.

    How it works:
      1. Creates a new session when a request comes in.
      2. Yields it to the route handler (the handler uses it to query/write data).
      3. Automatically closes the session after the request finishes (even if an error occurs).

    Usage in a route:
      @router.get("/students")
      def list_students(db: Session = Depends(get_db)):
          return db.query(Student).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
