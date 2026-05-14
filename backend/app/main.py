from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.middlewares.logging_middleware import LoggingMiddleware
from app.monitoring.dashboard import router as monitoring_router
from app.routes import auth, users, students
from app.utils.logger import configure_logging

# ---------------------------------------------------------------------------
# Initialise structured logging early
# ---------------------------------------------------------------------------
configure_logging()

# ---------------------------------------------------------------------------
# Create the application
# ---------------------------------------------------------------------------
app = FastAPI(title=settings.app_name)

# ---------------------------------------------------------------------------
# Middleware (order matters – outermost is listed first)
# ---------------------------------------------------------------------------
app.add_middleware(LoggingMiddleware)
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
        excluded_handlers=["/metrics", "/monitoring/dashboard"],
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
app.include_router(monitoring_router)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Student Management API is running"}
