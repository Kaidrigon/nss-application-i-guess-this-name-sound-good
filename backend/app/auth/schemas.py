# here we define the request and response schemas for user registration and login.
import re
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class UserRole(str, Enum):
    VOLUNTEER = "volunteer"
    COORDINATOR = "coordinator"
    ADMIN = "admin"


class ChangeRoleRequest(BaseModel):
    role: UserRole


# =========================================================
# SHARED PASSWORD VALIDATION
# =========================================================

def validate_strong_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one number")

    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError("Password must contain at least one special character")

    return password


def validate_login_id(value: str) -> str:
    value = value.strip()

    if not value:
        raise ValueError("A roll number, email, or phone number is required")

    if len(value) > 100:
        raise ValueError("Login ID must be 100 characters or less")

    return value


# =========================================================
# VOLUNTEER REGISTRATION
# =========================================================

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    login_id: str
    class_name: str = Field(..., min_length=2, max_length=100)
    year: int = Field(..., ge=1, le=4)
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("login_id")
    @classmethod
    def validate_login(cls, value: str) -> str:
        return validate_login_id(value)

    @field_validator("class_name")
    @classmethod
    def validate_class_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Class is required")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)


# =========================================================
# LOGIN
# =========================================================

class LoginRequest(BaseModel):
    login_id: str
    password: str

    @field_validator("login_id")
    @classmethod
    def validate_login(cls, value: str) -> str:
        return validate_login_id(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):
    id: str
    name: str
    roll_number: str | None = None
    email: str | None = None
    phone_number: str | None = None
    class_name: str | None = None
    year: int | None = None
    role: UserRole
    service_hours: float = 0


# =========================================================
# STAFF ACCOUNT CREATION
# =========================================================

class StaffAccountCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole
    email: str | None = None
    phone_number: str | None = None
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip().lower()

        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
            raise ValueError("Enter a valid email address")

        return value

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip()

        if not re.fullmatch(r"\+?[0-9 ()-]{7,20}", value):
            raise ValueError("Enter a valid phone number")

        digits = re.sub(r"\D", "", value)
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Phone number must contain 7 to 15 digits")

        return value

    @model_validator(mode="after")
    def require_contact(self):
        if not self.email and not self.phone_number:
            raise ValueError("Provide at least an email address or phone number")

        if self.role not in (UserRole.ADMIN, UserRole.COORDINATOR):
            raise ValueError("Staff accounts must be admin or coordinator")

        return self

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)


# =========================================================
# UPDATE PROFILE CONTACT DETAILS
# =========================================================

class ContactDetailsUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str | None = None
    phone_number: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip().lower()

        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
            raise ValueError("Enter a valid email address")

        return value

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip()

        if not re.fullmatch(r"\+?[0-9 ()-]{7,20}", value):
            raise ValueError("Enter a valid phone number")

        digits = re.sub(r"\D", "", value)
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Phone number must contain 7 to 15 digits")

        return value

    @model_validator(mode="after")
    def require_contact(self):
        if not self.email and not self.phone_number:
            raise ValueError("Provide at least an email address or phone number")
        return self


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordRequest(BaseModel):
    login_id: str
    new_password: str

    @field_validator("login_id")
    @classmethod
    def validate_login(cls, value: str) -> str:
        return validate_login_id(value)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)


# =========================================================
# CREATE COORDINATOR — LEGACY REQUEST SUPPORT
# =========================================================

class CreateCoordinatorRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    login_id: str
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("login_id")
    @classmethod
    def validate_login(cls, value: str) -> str:
        return validate_login_id(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)
