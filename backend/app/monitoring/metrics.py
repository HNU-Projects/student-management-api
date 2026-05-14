# === Metrics Collector ===
# This file tracks performance and error statistics for every API endpoint.
# It's an in-memory metrics system — data resets when the app restarts.
#
# How it works:
#   1. The LoggingMiddleware calls record_request() after every HTTP request.
#   2. MetricsCollector stores counts, durations, and errors per endpoint.
#   3. The monitoring dashboard calls snapshot() to get a summary of all metrics.
#
# Thread safety: all operations are protected by a Lock since
# multiple requests can come in simultaneously (concurrent access).

from __future__ import annotations

from collections import deque
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
import platform
import time
from threading import Lock


@dataclass(slots=True)
class EndpointMetrics:
    """Tracks stats for a single endpoint (e.g., "GET /students")."""

    request_count: int = 0          # Total number of requests to this endpoint
    error_count: int = 0            # How many resulted in a 500+ error
    total_duration_ms: float = 0.0  # Sum of all response times (used to calculate average)

    @property
    def average_duration_ms(self) -> float:
        """Average response time in milliseconds."""
        if self.request_count == 0:
            return 0.0
        return round(self.total_duration_ms / self.request_count, 2)

    @property
    def error_rate(self) -> float:
        """Percentage of requests that resulted in server errors (500+)."""
        if self.request_count == 0:
            return 0.0
        return round((self.error_count / self.request_count) * 100.0, 2)


class MetricsCollector:
    """
    Central metrics tracker for the entire application.
    Stores per-endpoint stats and the last 25 errors for debugging.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._total_requests = 0
        self._total_errors = 0
        self._start_time = time.time()
        self._endpoint_metrics: dict[str, EndpointMetrics] = {}
        self._recent_errors: deque[dict[str, object]] = deque(maxlen=25)
        self._audit_logs: deque[dict[str, object]] = deque(maxlen=50)

    def record_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user: str = "anonymous",
        error_message: str | None = None,
    ) -> None:
        """
        Called by LoggingMiddleware after every request.
        Records the request's method, path, status, and duration.
        If it's a server error (500+), also stores the error details.
        """
        key = f"{method.upper()} {path}"  # e.g., "GET /students" or "POST /auth/login"
        rounded_duration = round(duration_ms, 2)
        is_error = status_code >= 500  # 500, 502, 503, etc. = server errors

        with self._lock:  # Thread-safe block
            self._total_requests += 1
            if is_error:
                self._total_errors += 1

            # Get or create metrics for this endpoint
            endpoint = self._endpoint_metrics.setdefault(key, EndpointMetrics())
            endpoint.request_count += 1
            endpoint.total_duration_ms += rounded_duration
            
            # Record in general audit logs
            self._audit_logs.appendleft(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "path": path,
                    "method": method.upper(),
                    "status_code": status_code,
                    "duration_ms": rounded_duration,
                    "user": user,
                }
            )


            if is_error:
                endpoint.error_count += 1
                # Store error details for the monitoring dashboard
                self._recent_errors.appendleft(
                    {
                        "timestamp": datetime.now(UTC).isoformat(),
                        "path": path,
                        "method": method.upper(),
                        "status_code": status_code,
                        "error": error_message or "Unhandled server error",
                    }
                )

    def get_system_info(self) -> dict[str, object]:
        """Returns basic system and uptime information."""
        return {
            "uptime_seconds": int(time.time() - self._start_time),
            "system": {
                "platform": platform.system(),
                "python_version": platform.python_version(),
            }
        }

    def snapshot(self) -> dict[str, object]:
        """
        Returns a complete snapshot of all collected metrics.
        Used by the /monitoring/metrics and /monitoring/dashboard endpoints.

        Includes:
          - Total requests and errors
          - Overall error rate percentage
          - System health status (healthy / degraded / unhealthy)
          - Per-endpoint breakdown (count, avg duration, error rate)
          - Last 25 errors for debugging
        """
        with self._lock:
            # Calculate the overall error rate
            overall_error_rate = (
                0.0
                if self._total_requests == 0
                else round((self._total_errors / self._total_requests) * 100.0, 2)
            )

            # Build per-endpoint stats
            endpoints: dict[str, dict[str, object]] = {}
            for key, value in self._endpoint_metrics.items():
                payload = asdict(value)
                payload["average_duration_ms"] = value.average_duration_ms
                payload["error_rate"] = value.error_rate
                endpoints[key] = payload

            # Determine system health based on error rate thresholds
            system_health = "healthy"        # < 10% errors
            if overall_error_rate >= 10.0:
                system_health = "degraded"   # 10-30% errors — something is wrong
            if overall_error_rate >= 30.0:
                system_health = "unhealthy"  # > 30% errors — critical

            return {
                "total_requests": self._total_requests,
                "total_errors": self._total_errors,
                "overall_error_rate": overall_error_rate,
                "system_health": system_health,
                "endpoints": endpoints,
                "recent_errors": list(self._recent_errors),
                "audit_logs": list(self._audit_logs),
            }



metrics_collector = MetricsCollector()
