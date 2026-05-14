# === Logging Middleware ===
# This middleware intercepts EVERY incoming HTTP request and:
#   1. Measures how long the request takes (response time).
#   2. Logs the request details (method, path, status code, duration, client IP).
#   3. Records metrics for the monitoring dashboard.
#   4. Adds an "X-Response-Time-ms" header to the response.
#
# Middleware = code that runs BEFORE and AFTER every request automatically.
# Think of it as a wrapper around all your route handlers.

from __future__ import annotations

from time import perf_counter

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.monitoring.metrics import metrics_collector
from app.utils.logger import get_logger

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # === BEFORE the request is processed ===
        start = perf_counter()  # Start a high-precision timer
        client = request.client.host if request.client else "unknown"  # Get the client's IP address
        method = request.method  # GET, POST, PUT, DELETE, etc.
        path = request.url.path  # e.g., /students/5

        try:
            # === Pass the request to the actual route handler ===
            response = await call_next(request)
        except Exception as exc:
            # === If the route handler crashes (500 error) ===
            duration_ms = (perf_counter() - start) * 1000.0

            # Record the failed request in the metrics system
            metrics_collector.record_request(
                method=method,
                path=path,
                status_code=500,
                duration_ms=duration_ms,
                error_message=str(exc),
            )

            # Log the error with full traceback (logger.exception includes the stack trace)
            logger.exception(
                "request_failed",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": 500,
                    "duration_ms": round(duration_ms, 2),
                    "client": client,
                    "error": str(exc),
                },
            )
            raise  # Re-raise so FastAPI can return a proper 500 response

        # === AFTER the request is processed successfully ===
        duration_ms = (perf_counter() - start) * 1000.0
        rounded_duration = round(duration_ms, 2)

        # Record the successful request in the metrics system
        metrics_collector.record_request(
            method=method,
            path=path,
            status_code=response.status_code,
            duration_ms=rounded_duration,
        )

        # Log the completed request
        logger.info(
            "request_completed",
            extra={
                "method": method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": rounded_duration,
                "client": client,
            },
        )

        # Add response time to the HTTP headers so the client can see it too
        response.headers["X-Response-Time-ms"] = str(rounded_duration)
        return response
