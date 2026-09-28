# here we define the request and response schemas for user registration and login.
import re

from enum import Enum
from pydantic import BaseModel, field_validator


class UserRole(str, Enum):
    VOLUNTEER = "volunteer"
    ADMIN = "admin"


class RegisterRequest(BaseModel):
    name: str
    roll_number: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:

        if len(password) < 8:
            raise ValueError(
                "Password must be at least 8 characters long"
            )

        if not re.search(r"[A-Z]", password):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not re.search(r"[a-z]", password):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not re.search(r"\d", password):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return password


class LoginRequest(BaseModel):
    roll_number: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    roll_number: str
    role: UserRole
    service_hours: float