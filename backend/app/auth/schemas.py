# here we define the request and response schemas for user registration and login.
import re

from enum import Enum

from pydantic import BaseModel, Field, field_validator


class UserRole(str, Enum):
    VOLUNTEER = "volunteer"
    COORDINATOR = "coordinator"
    ADMIN = "admin"


class ChangeRoleRequest(BaseModel):
    role: UserRole


# ---------------------------------------------------------
# REGISTER REQUEST
# ---------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str

    login_id: str

    class_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    year: int = Field(
        ...,
        ge=1,
        le=4,
    )

    password: str

    @field_validator("login_id")
    @classmethod
    def validate_login_id(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Roll number or email is required"
            )

        if len(value) > 100:
            raise ValueError(
                "Roll number or email must be 100 characters or less"
            )

        return value

    @field_validator("class_name")
    @classmethod
    def validate_class_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Class is required"
            )

        return value

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


# ---------------------------------------------------------
# LOGIN REQUEST
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    login_id: str
    password: str

    @field_validator("login_id")
    @classmethod
    def validate_login_id(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Roll number or email is required"
            )

        return value


# ---------------------------------------------------------
# TOKEN RESPONSE
# ---------------------------------------------------------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# ---------------------------------------------------------
# USER RESPONSE
# ---------------------------------------------------------

class UserResponse(BaseModel):
    id: str
    name: str
    roll_number: str | None = None
    email: str | None = None
    class_name: str | None = None
    year: int | None = None
    role: UserRole
    service_hours: float


# ---------------------------------------------------------
# CHANGE PASSWORD
# ---------------------------------------------------------

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, password: str) -> str:
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


# ---------------------------------------------------------
# RESET PASSWORD
# ---------------------------------------------------------

class ResetPasswordRequest(BaseModel):
    login_id: str
    new_password: str

    @field_validator("login_id")
    @classmethod
    def validate_login_id(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Roll number or email is required"
            )

        return value

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, password: str) -> str:
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


# ---------------------------------------------------------
# CREATE COORDINATOR
# ---------------------------------------------------------

class CreateCoordinatorRequest(BaseModel):
    name: str

    login_id: str

    password: str

    @field_validator("login_id")
    @classmethod
    def validate_login_id(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Roll number or email is required"
            )

        if len(value) > 100:
            raise ValueError(
                "Roll number or email must be 100 characters or less"
            )

        return value

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