# === Redis Client — Caching Layer ===
# This file provides the low-level caching backends for the application.
# It supports two storage strategies:
#   1. Redis  — an external in-memory cache server (fast & persistent across restarts)
#   2. InMemory — a plain Python dict fallback (used when Redis is unavailable)

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Protocol

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


# === Protocol (Interface / Contract) ===
# Defines the shape that ANY cache backend must follow.
# Any class implementing these 4 methods can be used as a cache backend.
class CacheBackend(Protocol):
    def get(self, key: str) -> str | None: ...          # Retrieve a value by key

    def set(self, key: str, value: str, ttl_seconds: int) -> None: ...  # Store a value with a time-to-live

    def delete(self, key: str) -> None: ...              # Delete a single key

    def delete_prefix(self, prefix: str) -> int: ...     # Delete all keys starting with a given prefix


# === Redis Backend (external server) ===
# Redis is an extremely fast in-memory data store.
# Data survives app restarts since it lives on a separate server.
class RedisCacheBackend:
    def __init__(self, url: str) -> None:
        # Connect to the Redis server using the provided URL.
        # decode_responses=True ensures we get Python strings instead of raw bytes.
        self._client = Redis.from_url(url, decode_responses=True)

    def get(self, key: str) -> str | None:
        # Fetch the stored value — returns None if the key doesn't exist.
        return self._client.get(key)

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        # Store a value with an expiry time (ex = expiry in seconds).
        # After ttl_seconds, Redis automatically deletes the key.
        self._client.set(name=key, value=value, ex=ttl_seconds)

    def delete(self, key: str) -> None:
        # Remove a specific key from the cache.
        self._client.delete(key)

    def delete_prefix(self, prefix: str) -> int:
        # Find and delete all keys matching a prefix pattern.
        # Example: delete_prefix("students:") removes all student-related cache entries.
        keys = list(self._client.scan_iter(match=f"{prefix}*"))
        if not keys:
            return 0
        return int(self._client.delete(*keys))


# === Data structure for in-memory cached values ===
# Each stored value is paired with its expiration timestamp.
@dataclass(slots=True)
class _MemoryValue:
    value: str           # The cached string value
    expires_at: float    # Unix timestamp when this value expires


# === In-Memory Backend (fallback) ===
# Uses a plain Python dictionary as a cache when Redis is not available.
# ⚠️ Downside: all cached data is lost when the application restarts.
class InMemoryCacheBackend:
    def __init__(self) -> None:
        # Simple dict — key is a string, value is a _MemoryValue with expiry info.
        self._store: dict[str, _MemoryValue] = {}

    def get(self, key: str) -> str | None:
        item = self._store.get(key)
        if item is None:
            return None

        # Check if the value has expired
        if item.expires_at < time.time():
            self._store.pop(key, None)  # Remove the expired entry
            return None  # Treat it as if it never existed

        return item.value

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        # Store the value and calculate its expiration time.
        # Example: if ttl = 60s, expires_at = current_time + 60
        self._store[key] = _MemoryValue(
            value=value, expires_at=time.time() + ttl_seconds
        )

    def delete(self, key: str) -> None:
        # Remove a key safely — pop with None default avoids KeyError if missing.
        self._store.pop(key, None)

    def delete_prefix(self, prefix: str) -> int:
        # Collect all keys that start with the prefix, then remove them.
        keys = [key for key in self._store if key.startswith(prefix)]
        for key in keys:
            self._store.pop(key, None)
        return len(keys)  # Return how many keys were deleted


# === Global singleton for the selected backend ===
# Only one backend instance is created and reused throughout the app's lifetime.
_backend: CacheBackend | None = None


def get_cache_backend() -> CacheBackend:
    """
    Select and return the appropriate cache backend (singleton pattern):
    1. If a backend was already chosen → return it immediately (avoid re-checking).
    2. Try connecting to Redis and send a ping.
    3. If Redis responds → use RedisCacheBackend ✅
    4. If Redis is down (RedisError) → fall back to InMemoryCacheBackend ⚠️
    """
    global _backend
    if _backend is not None:
        return _backend

    try:
        candidate = RedisCacheBackend(settings.redis_url)
        candidate._client.ping()  # Verify Redis is actually reachable
        _backend = candidate
    except RedisError:
        # Redis is unavailable — fall back to in-memory cache
        _backend = InMemoryCacheBackend()

    return _backend
