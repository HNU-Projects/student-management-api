from datetime import date
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re


class Gender(str, Enum):
    male = "male"
    female = "female"


class StudentStatus(str, Enum):
    active = "active"
    graduated = "graduated"
    suspended = "suspended"


class StudentBase(BaseModel):
    university_id: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=1, max_length=150)
    birth_date: date | None = None
    gender: Gender | None = None
    phone_number: str | None = Field(None, max_length=20)
    gpa: float = Field(default=0.0, ge=0, le=4.0)
    department: str = Field(..., min_length=1, max_length=100)
    enrollment_date: date = Field(default_factory=date.today)
    status: StudentStatus = StudentStatus.active

    @field_validator("birth_date")
    @classmethod
    def birth_date_must_be_in_past(cls, v: date | None) -> date | None:
        if v and v >= date.today():
            raise ValueError("Birth date must be in the past")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str | None) -> str | None:
        if v:
            # Simple regex for phone validation
            if not re.match(r"^\+?[0-9\s\-()]{7,20}$", v):
                raise ValueError("Invalid phone number format")
        return v


class StudentCreate(StudentBase):
    user_id: int


class StudentUpdate(BaseModel):
    university_id: str | None = Field(None, min_length=3, max_length=20)
    name: str | None = Field(None, min_length=1, max_length=150)
    birth_date: date | None = None
    gender: Gender | None = None
    phone_number: str | None = Field(None, max_length=20)
    gpa: float | None = Field(None, ge=0, le=4.0)
    department: str | None = Field(None, min_length=1, max_length=100)
    enrollment_date: date | None = None
    status: StudentStatus | None = None


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
