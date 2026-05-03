from fastapi import FastAPI, Request, status, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import yaml
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.middlewares.logging_middleware import LoggingMiddleware
from app.models.student import Student  # noqa: F401
from app.models.user import User  # noqa: F401
from app.monitoring.dashboard import router as monitoring_router
from app.monitoring.health import router as health_router
from app.routes import auth, students, users

app = FastAPI(title=settings.app_name)

# Create tables if they don't exist (failsafe)
Base.metadata.create_all(bind=engine)

app.add_middleware(LoggingMiddleware)


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors (e.g. unique constraint violations)."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Data integrity error. This might be due to a duplicate entry or constraint violation.",
            "error_type": "integrity_error"
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with a cleaner format."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Validation failed for one or more fields."
        },
    )

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(monitoring_router)
app.include_router(health_router)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Student Management API is running"}


@app.get("/openapi.yaml", include_in_schema=False)
@app.get("/docs/yaml", include_in_schema=False)
def get_openapi_yaml():
    """Serve the OpenAPI specification in YAML format."""
    openapi_json = app.openapi()
    yaml_content = yaml.dump(openapi_json, sort_keys=False)
    return Response(content=yaml_content, media_type="application/x-yaml")
