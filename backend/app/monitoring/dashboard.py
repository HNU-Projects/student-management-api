# === Monitoring Dashboard ===
# Provides two endpoints:
#   1. GET /monitoring/metrics  → returns raw JSON metrics (for programmatic access)
#   2. GET /monitoring/dashboard → returns an HTML page with a live metrics table
#
# The dashboard auto-refreshes every 10 seconds to show real-time data.

from __future__ import annotations

import time
import platform

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.monitoring.metrics import metrics_collector
from app.db.session import get_db
from app.cache.cache_manager import cache_manager

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

_start_time = time.time()


@router.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict:
    """System health check — DB, Redis, uptime, system info."""
    # Database check
    db_status = "online"
    db_latency = 0.0
    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - t0) * 1000, 2)
    except Exception:
        db_status = "offline"

    # Redis check
    redis_status = "online"
    redis_latency = 0.0
    try:
        t0 = time.time()
        cache_manager.client.ping()
        redis_latency = round((time.time() - t0) * 1000, 2)
    except Exception:
        redis_status = "offline"

    uptime = time.time() - _start_time

    return {
        "status": "healthy" if db_status == "online" else "degraded",
        "uptime_seconds": round(uptime, 1),
        "services": {
            "database": {"status": db_status, "latency_ms": db_latency},
            "redis": {"status": redis_status, "latency_ms": redis_latency},
        },
        "system": {
            "platform": platform.system(),
            "python_version": platform.python_version(),
            "disk": {"percent_used": "N/A"},
        },
    }


@router.get("/metrics")
def get_metrics() -> dict[str, object]:
    """Returns all collected metrics as raw JSON."""
    return metrics_collector.snapshot()



@router.get("/dashboard", response_class=HTMLResponse)
def get_dashboard() -> str:
    """
    Returns a simple HTML dashboard showing:
      - Total requests, errors, error rate, and system health status
      - Per-endpoint table with request count, avg response time, and error rate
      - Auto-refreshes every 10 seconds via JavaScript
    """
    snapshot = metrics_collector.snapshot()
    endpoints = snapshot["endpoints"]

    # Build table rows for each endpoint
    rows = ""
    for endpoint, values in endpoints.items():
        rows += (
            "<tr>"
            f"<td>{endpoint}</td>"
            f"<td>{values['request_count']}</td>"
            f"<td>{values['average_duration_ms']}</td>"
            f"<td>{values['error_rate']}%</td>"
            "</tr>"
        )

    if not rows:
        rows = "<tr><td colspan='4'>No traffic yet</td></tr>"

    return f"""
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Monitoring Dashboard</title>
  <style>
    body {{ font-family: Segoe UI, Arial, sans-serif; margin: 24px; color: #1f2937; }}
    .card {{ border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 16px; }}
    h1 {{ margin-top: 0; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ border: 1px solid #e5e7eb; padding: 8px; text-align: left; }}
    th {{ background: #f3f4f6; }}
  </style>
</head>
<body>
  <h1>Monitoring Dashboard</h1>

  <div class=\"card\">
    <p><strong>Total Requests:</strong> {snapshot['total_requests']}</p>
    <p><strong>Total Errors:</strong> {snapshot['total_errors']}</p>
    <p><strong>Overall Error Rate:</strong> {snapshot['overall_error_rate']}%</p>
    <p><strong>System Health:</strong> {snapshot['system_health']}</p>
  </div>

  <div class=\"card\">
    <h2>Endpoint Metrics</h2>
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Requests</th>
          <th>Avg Response Time (ms)</th>
          <th>Error Rate</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>

  <script>
    setTimeout(function () {{ window.location.reload(); }}, 10000);
  </script>
</body>
</html>
"""
