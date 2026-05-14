# === Middlewares Package Init ===
# Exports LoggingMiddleware so it can be imported cleanly:
# from app.middlewares import LoggingMiddleware

from app.middlewares.logging_middleware import LoggingMiddleware

__all__ = ["LoggingMiddleware"]
