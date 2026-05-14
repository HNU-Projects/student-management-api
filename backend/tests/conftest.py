"""
Shared pytest fixtures for the Student Management System test suite.

Uses an in-memory SQLite database so tests are fast, isolated, and
don't need a running PostgreSQL instance.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app


# ---------------------------------------------------------------------------
# Database engine for tests (from .env)
# ---------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = settings.database_url

# Only use SQLite-specific args if it's actually SQLite
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    # StaticPool is usually for in-memory SQLite to keep it alive
    # For other DBs, we should use default pooling
    poolclass=StaticPool if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else None,
)

TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)



# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def setup_db():
    """Create all tables before each test, drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client():
    """FastAPI TestClient that uses the test database."""
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def db_session() -> Session:
    """Raw SQLAlchemy session for direct DB access in tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Convenience helpers
# ---------------------------------------------------------------------------

def _register_and_login(client: TestClient, email: str, password: str, full_name: str = "Test User", role: str = "student"):
    """Register a user then log in, returning (token, user_id)."""
    reg = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )
    user_id = reg.json()["id"]
    login = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    token = login.json()["access_token"]
    return token, user_id


def _make_admin(client: TestClient, db_session, email: str = "admin@test.com", password: str = "adminpass"):
    """Create an admin user via direct DB insert (bypassing the register
    endpoint which forces role=student), then log in to get a token."""
    from app.models.user import User
    from app.utils.hashing import hash_password

    db = TestingSessionLocal()
    user = User(
        email=email,
        password=hash_password(password),
        full_name="Admin User",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()

    login = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    token = login.json()["access_token"]
    return token, user_id
