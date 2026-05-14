# === Monitoring Package Init ===
# Exports the monitoring router (HTTP endpoints) and the metrics collector (data tracker).
# - monitoring_router → adds /monitoring/metrics and /monitoring/dashboard endpoints
# - metrics_collector → singleton that records request stats (used by the logging middleware)

from app.monitoring.dashboard import router as monitoring_router
from app.monitoring.metrics import metrics_collector

__all__ = ["monitoring_router", "metrics_collector"]
