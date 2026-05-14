# === Cache Manager — High-Level Caching Interface ===
# This is the layer the rest of the application interacts with.
# Instead of dealing with Redis or raw strings directly, other modules use
# CacheManager which handles JSON serialization/deserialization and TTL defaults.

from __future__ import annotations

import json
from collections.abc import Callable
from typing import TypeVar

from app.cache.redis_client import get_cache_backend
from app.core.config import settings

T = TypeVar("T")


class CacheManager:
    def __init__(self) -> None:
        # Get the appropriate backend (Redis or InMemory).
        # The selection happens automatically in redis_client.py.
        self._backend = get_cache_backend()

    def get_json(self, key: str) -> dict[str, object] | None:
        """
        Retrieve JSON data from the cache.
        1. Fetch the raw string from the backend.
        2. If not found → return None.
        3. If found → deserialize from JSON string to a Python dict.
        """
        raw = self._backend.get(key)
        if raw is None:
            return None
        return json.loads(raw)

    def set_json(
        self, key: str, payload: dict[str, object], ttl_seconds: int | None = None
    ) -> None:
        """
        Store JSON data in the cache.
        1. Serialize the dict to a JSON string via json.dumps.
        2. If no TTL is provided, use the default from app settings.
        3. Store it in the backend.
        Example: set_json("student:5", {"name": "Ahmed", "grade": 95}, ttl_seconds=120)
        """
        ttl = ttl_seconds or settings.cache_default_ttl_seconds
        self._backend.set(key, json.dumps(payload), ttl)

    def get_or_set_json(
        self,
        key: str,
        loader: Callable[[], dict[str, object]],
        ttl_seconds: int | None = None,
    ) -> dict[str, object]:
        """
        Fetch from cache — if missing, load fresh data, cache it, and return it.
        This is the most important method — implements the classic cache-aside pattern:
        1. Check the cache — if data exists → return it immediately (fast ⚡)
        2. If not cached → call the loader function (e.g., a DB query 🐢)
        3. Store the result in the cache for next time.
        4. Return the fresh result.

        Example:
            data = cache_manager.get_or_set_json(
                "students:all",
                loader=lambda: {"students": get_all_students_from_db()},
                ttl_seconds=300  # 5 minutes
            )
        """
        cached = self.get_json(key)
        if cached is not None:
            return cached

        fresh = loader()
        self.set_json(key=key, payload=fresh, ttl_seconds=ttl_seconds)
        return fresh

    def invalidate_key(self, key: str) -> None:
        """
        Delete a specific key from the cache.
        Use this when data changes — e.g., after updating a student's info.
        """
        self._backend.delete(key)

    def invalidate_prefix(self, prefix: str) -> int:
        """
        Delete all keys starting with a given prefix.
        Example: invalidate_prefix("students:") clears all student-related cache.
        Returns the number of keys that were deleted.
        """
        return self._backend.delete_prefix(prefix)


# === Singleton instance ===
# One CacheManager is created and shared across the entire application.
# Other modules import it via: from app.cache import cache_manager
cache_manager = CacheManager()
