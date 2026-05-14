from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Role(str, Enum):
    admin = "admin"
    student = "student"


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    full_name: str
    role: Role


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=1)
    full_name: Optional[str] = None
    role: Optional[Role] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: str | None = None
    role: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str | None
    role: str


class EmailUpdate(BaseModel):
    new_email: EmailStr


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=1)


class NameUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)

