from fastapi import FastAPI

from app.core.config import settings
from app.middlewares.logging_middleware import LoggingMiddleware
from app.monitoring.dashboard import router as monitoring_router
from app.routes import auth, users

app = FastAPI(title=settings.app_name)

app.add_middleware(LoggingMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(monitoring_router)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Student Management API is running"}
