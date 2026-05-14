# === Logging Middleware ===
# This middleware intercepts EVERY incoming HTTP request and:
#   1. Measures how long the request takes (response time).
#   2. Logs the request details (method, path, status code, duration, client IP).
#   3. Adds an "X-Response-Time-ms" header to the response.
#
# Middleware = code that runs BEFORE and AFTER every request automatically.
# Think of it as a wrapper around all your route handlers.

from __future__ import annotations

from time import perf_counter

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.utils.jwt import verify_access_token
from app.utils.logger import get_logger

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = perf_counter()
        client = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        
        # Try to extract user from JWT early (for error logging)
        user_email = "anonymous"
        auth_header = request.headers.get("authorization") # case-insensitive access
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header[7:] # skip "bearer "
            try:
                payload = verify_access_token(token)
                user_email = payload.get("sub", "unknown")
            except Exception:
                user_email = "invalid-token"

        try:
            # === Pass the request to the actual route handler ===
            response = await call_next(request)
            
            # After call_next, if a dependency set user in request.state, use that as it's more reliable
            if hasattr(request.state, "user_email"):
                user_email = request.state.user_email
            elif hasattr(request.state, "user") and hasattr(request.state.user, "email"):
                user_email = request.state.user.email

        except Exception as exc:
            # === If the route handler crashes (500 error) ===
            duration_ms = (perf_counter() - start) * 1000.0


            # Log the error with full traceback (logger.exception includes the stack trace)
            logger.exception(
                "request_failed",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": 500,
                    "duration_ms": round(duration_ms, 2),
                    "client": client,
                    "user": user_email,
                    "error": str(exc),
                },
            )
            raise  # Re-raise so FastAPI can return a proper 500 response

        # === AFTER the request is processed successfully ===
        duration_ms = (perf_counter() - start) * 1000.0
        rounded_duration = round(duration_ms, 2)


        # Log the completed request
        logger.info(
            "request_completed",
            extra={
                "method": method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": rounded_duration,
                "client": client,
                "user": user_email,
            },
        )

        # Add response time to the HTTP headers so the client can see it too
        response.headers["X-Response-Time-ms"] = str(rounded_duration)
        return response


