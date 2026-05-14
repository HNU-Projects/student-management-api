# === Application Entry Point ===
# This is the heart of the FastAPI application. It:
#   1. Initializes the FastAPI app instance.
#   2. Configures Global Middlewares (CORS, Logging).
#   3. Sets up Prometheus instrumentation for Grafana.
#   4. Defines Global Exception Handlers for consistent error responses.
#   5. Mounts all API routers (Auth, Users, Students, Monitoring).

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.middlewares.logging_middleware import LoggingMiddleware
from app.middlewares.rate_limit_middleware import RateLimitMiddleware
from app.routes import auth, users, students, monitoring
from app.utils.logger import configure_logging

# --- 1. Initialise structured logging early ---
# Ensures all logs follow a consistent JSON format from the start.
configure_logging()

# --- 2. Create the FastAPI application ---
app = FastAPI(
    title=settings.app_name,
    description="Backend API for Student Management System",
    version="1.0.0"
)


# ---------------------------------------------------------------------------
# Middleware (order matters – outermost is listed first)
# ---------------------------------------------------------------------------
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.back_end_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Prometheus metrics  (/metrics endpoint for Grafana scraping)
# ---------------------------------------------------------------------------
try:
    from prometheus_fastapi_instrumentator import Instrumentator

    Instrumentator(
        should_group_status_codes=False,
        excluded_handlers=["/metrics"],
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=True)
except ImportError:
    pass  # prometheus-fastapi-instrumentator not installed – skip gracefully

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors (e.g. unique constraint violations)."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Data integrity error. This might be due to a duplicate entry or constraint violation.",
            "error_type": "integrity_error",
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """Handle Pydantic validation errors with a cleaner format."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder(
            {
                "detail": exc.errors(),
                "message": "Validation failed for one or more fields.",
            }
        ),
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring"])


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Student Management API is running"}
