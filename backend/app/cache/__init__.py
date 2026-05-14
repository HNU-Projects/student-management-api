# === Cache Package Init ===
# Makes the cache folder a Python package and exports cache_manager
# so other modules can simply do: from app.cache import cache_manager

from app.cache.cache_manager import cache_manager

# Defines the public API when using: from app.cache import *
__all__ = ["cache_manager"]
