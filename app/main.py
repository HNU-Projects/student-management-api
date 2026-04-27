from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(title=settings.app_name)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Student Management API is running"}
