# === Application Configuration ===
# This file loads all environment variables from the .env file
# and exposes them as a single, validated, immutable Settings object.
# Other modules access settings via: from app.core.config import settings

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Resolve the project root directory (2 levels up from this file: core → app → project root)
# Then load environment variables from the .env file located there.
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


# frozen=True  → makes the object immutable (can't change settings at runtime)
# slots=True   → optimizes memory usage
@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str                      # Display name of the application
    database_url: str                  # PostgreSQL connection string
    redis_url: str                     # Redis server URL for caching
    log_level: str                     # Logging level (DEBUG, INFO, WARN, ERROR)
    cache_default_ttl_seconds: int     # Default cache expiry time in seconds
    secret_key: str                    # Secret key used to sign JWT tokens
    access_token_expire_minutes: int   # How long a JWT token stays valid (in minutes)
    jwt_algorithm: str                 # Algorithm used for JWT signing (e.g., HS256)
    back_end_allowed_origins: list[str]  # CORS — which frontend URLs are allowed to call this API
    rate_limit_requests: int           # Max requests allowed in the window
    rate_limit_window: int             # Window duration in seconds
    rate_limit_penalty_base: int       # Initial lockout duration in seconds
    rate_limit_penalty_multiplier: float # How much the penalty grows exponentially


    def validate(self) -> None:
        """
        Checks that all critical settings have valid values.
        Raises ValueError immediately on startup if something is misconfigured,
        rather than failing silently at runtime.
        """
        if not self.database_url:
            raise ValueError("DATABASE_URL is required. Set it in the .env file.")
        if self.cache_default_ttl_seconds <= 0:
            raise ValueError("CACHE_DEFAULT_TTL_SECONDS must be greater than 0.")
        if not self.secret_key:
            raise ValueError("SECRET_KEY is required. Set it in the .env file.")
        if self.access_token_expire_minutes <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than 0.")
        if self.rate_limit_requests <= 0:
            raise ValueError("RATE_LIMIT_REQUESTS must be greater than 0.")
        if self.rate_limit_window <= 0:
            raise ValueError("RATE_LIMIT_WINDOW must be greater than 0.")


def _normalize_database_url(database_url: str) -> str:
    """
    SQLAlchemy requires the driver name in the URL.
    If the URL starts with 'postgresql://', we add '+psycopg' to specify the driver.
    Example: postgresql://user:pass@host/db → postgresql+psycopg://user:pass@host/db
    """
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


# @lru_cache ensures this function runs only ONCE.
# Every subsequent call returns the cached Settings object (singleton pattern).
@lru_cache
def get_settings() -> Settings:
    """
    Reads all environment variables, applies defaults where needed,
    builds the Settings object, validates it, and returns it.
    """
    resolved_settings = Settings(
        app_name=os.getenv("APP_NAME", "Student Management API"),
        database_url=_normalize_database_url(os.getenv("DATABASE_URL", "")),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        cache_default_ttl_seconds=int(os.getenv("CACHE_DEFAULT_TTL_SECONDS", "60")),
        secret_key=os.getenv("SECRET_KEY", ""),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        back_end_allowed_origins=os.getenv("BACK_END_ALLOWED_ORIGINS", "http://localhost:3000").split(","),
        rate_limit_requests=int(os.getenv("RATE_LIMIT_REQUESTS", "20")),
        rate_limit_window=int(os.getenv("RATE_LIMIT_WINDOW", "60")),
        rate_limit_penalty_base=int(os.getenv("RATE_LIMIT_PENALTY_BASE", "60")),
        rate_limit_penalty_multiplier=float(os.getenv("RATE_LIMIT_PENALTY_MULTIPLIER", "2.0")),
    )
    resolved_settings.validate()

    return resolved_settings


# === Global settings instance ===
# This is created once at import time. All modules use this single object.
# Usage: from app.core.config import settings
settings = get_settings()
