import shutil
import time
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from redis import Redis
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health"])

START_TIME = time.time()


@router.get("")
def health_check(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Check the health of the system with real measurements.
    """
    services: dict[str, Any] = {}
    is_healthy = True

    # Check Database Latency
    try:
        db_start = time.perf_counter()
        db.execute(text("SELECT 1"))
        db_duration = round((time.perf_counter() - db_start) * 1000, 2)
        services["database"] = {"status": "online", "latency_ms": db_duration}
    except Exception as e:
        is_healthy = False
        services["database"] = {"status": "offline", "error": str(e)}

    # Check Redis Latency
    try:
        redis_start = time.perf_counter()
        redis_client = Redis.from_url(settings.redis_url, socket_connect_timeout=1)
        if redis_client.ping():
            redis_duration = round((time.perf_counter() - redis_start) * 1000, 2)
            services["redis"] = {"status": "online", "latency_ms": redis_duration}
        else:
            is_healthy = False
            services["redis"] = {"status": "offline"}
    except Exception as e:
        is_healthy = False
        services["redis"] = {"status": "offline", "error": str(e)}

    # Disk Usage
    try:
        total, used, free = shutil.disk_usage("/")
        disk_info = {
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "percent_used": round((used / total) * 100, 2),
        }
    except Exception:
        disk_info = "unavailable"

    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "services": services,
        "system": {
            "disk": disk_info,
        },
    }
