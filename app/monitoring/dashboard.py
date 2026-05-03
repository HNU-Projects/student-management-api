from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from app.monitoring.metrics import metrics_collector
from app.monitoring.health import health_check
from app.db.session import SessionLocal
from app.models.student import Student
from sqlalchemy import func

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/metrics")
def get_metrics() -> dict[str, object]:
    return metrics_collector.snapshot()


@router.get("/dashboard", response_class=HTMLResponse)
def get_dashboard() -> str:
    db = SessionLocal()
    try:
        health = health_check(db)
        # Fetch Student Stats
        total_students = db.query(Student).count()
        avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0.0
    finally:
        db.close()
        
    snapshot = metrics_collector.snapshot()
    endpoints = snapshot["endpoints"]
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
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Monitoring Dashboard</title>
  <style>
    :root {{
      --primary: #6366f1;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
    }}
    body {{ 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      margin: 0; 
      padding: 40px; 
      background: var(--bg); 
      color: var(--text);
      line-height: 1.5;
    }}
    .container {{ max-width: 1100px; margin: 0 auto; }}
    .header {{ margin-bottom: 32px; }}
    .header h1 {{ font-size: 2.25rem; font-weight: 800; margin: 0; background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }}
    .card {{ 
      background: var(--card-bg); 
      border-radius: 16px; 
      padding: 24px; 
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: transform 0.2s;
    }}
    .card:hover {{ transform: translateY(-4px); }}
    .card h2 {{ margin: 0 0 16px 0; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }}
    .metric-value {{ font-size: 1.875rem; font-weight: 700; }}
    .status-badge {{ 
      display: inline-flex; 
      align-items: center; 
      padding: 4px 12px; 
      border-radius: 9999px; 
      font-size: 0.75rem; 
      font-weight: 600; 
      text-transform: uppercase; 
    }}
    .status-healthy {{ background: #d1fae5; color: #065f46; }}
    .status-unhealthy {{ background: #fee2e2; color: #991b1b; }}
    
    table {{ width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }}
    th, td {{ padding: 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }}
    th {{ background: #f8fafc; font-weight: 600; color: #64748b; font-size: 0.875rem; }}
    tr:last-child td {{ border-bottom: none; }}
    .latency {{ font-family: monospace; color: #6366f1; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>System Monitoring</h1>
      <p>Real-time health and performance metrics</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Overall Status</h2>
        <div class="status-badge {'status-healthy' if health['status'] == 'healthy' else 'status-unhealthy'}">
          {health['status']}
        </div>
        <div style="margin-top: 12px; font-size: 0.875rem; color: #64748b;">Uptime: {health['uptime_seconds']}s</div>
      </div>
      
      <div class="card">
        <h2>Database</h2>
        <div class="metric-value latency">{health['services']['database'].get('latency_ms', 'N/A')}ms</div>
        <div style="font-size: 0.875rem; color: {'#10b981' if health['services']['database']['status'] == 'online' else '#ef4444'}">
          ● {health['services']['database']['status'].upper()}
        </div>
      </div>

      <div class="card">
        <h2>Redis</h2>
        <div class="metric-value latency">{health['services']['redis'].get('latency_ms', 'N/A')}ms</div>
        <div style="font-size: 0.875rem; color: {'#10b981' if health['services']['redis']['status'] == 'online' else '#ef4444'}">
          ● {health['services']['redis']['status'].upper()}
        </div>
      </div>

      <div class="card">
        <h2>Traffic</h2>
        <div class="metric-value">{snapshot['total_requests']}</div>
        <div style="font-size: 0.875rem; color: #64748b;">Errors: {snapshot['total_errors']} ({snapshot['overall_error_rate']}%)</div>
      </div>

      <div class="card">
        <h2>Students</h2>
        <div class="metric-value">{total_students}</div>
        <div style="font-size: 0.875rem; color: #64748b;">Avg GPA: {round(float(avg_gpa), 2)}</div>
      </div>
    </div>

    <div class="card" style="padding: 0;">
      <table style="margin: 0;">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Requests</th>
            <th>Avg Duration (ms)</th>
            <th>Error Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    setTimeout(function () {{ window.location.reload(); }}, 5000);
  </script>
</body>
</html>
"""
