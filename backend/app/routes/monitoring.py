import time
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_admin
from app.cache.redis_client import get_cache_backend
from app.models.user import User
from app.monitoring.metrics import metrics_collector

router = APIRouter()

@router.get("/health")
def get_health(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Provides health status and system info for the frontend dashboard.
    """
    services = {
        "database": {"status": "offline", "latency_ms": 0},
        "redis": {"status": "offline", "latency_ms": 0}
    }
    
    # Check Database Latency
    try:
        start = time.perf_counter()
        db.execute(text("SELECT 1"))
        latency = round((time.perf_counter() - start) * 1000, 2)
        services["database"] = {"status": "online", "latency_ms": latency}
    except Exception:
        pass

    # Check Redis Latency
    try:
        start = time.perf_counter()
        backend = get_cache_backend()
        if hasattr(backend, "_client"):
            backend._client.ping()
            latency = round((time.perf_counter() - start) * 1000, 2)
            services["redis"] = {"status": "online", "latency_ms": latency}
        else:
            # InMemoryCache
            services["redis"] = {"status": "online", "latency_ms": 0.1}
    except Exception:
        pass

    # Overall status
    all_online = all(s["status"] == "online" for s in services.values())
    
    return {
        "status": "healthy" if all_online else "degraded",
        **metrics_collector.get_system_info(),
        "services": services
    }

@router.get("/metrics")
def get_metrics(_: User = Depends(require_admin)):
    """
    Returns the in-memory metrics snapshot for the frontend dashboard.
    """
    return metrics_collector.snapshot()
