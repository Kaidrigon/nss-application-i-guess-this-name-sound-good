# here bassically we are creating registration and logins and alot of things like hasing using security.py and schemas for request from schemas.py and then we are using the users_collection from database.py to store the user data in the db.
import re

from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.auth.dependencies import (
    get_current_user,
    require_admin,
    require_staff,
)
from app.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    ChangePasswordRequest,
    ResetPasswordRequest,
    ChangeRoleRequest,
    ProfileUpdateRequest,
    StaffAccountCreateRequest,
    ContactDetailsUpdateRequest,
)
from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.config import ADMIN_SETUP_KEY
from app.database import users_collection


router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================================================
# HELPERS
# =========================================================

def is_email(value: str) -> bool:
    return bool(
        re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value.strip())
    )


def normalize_phone(value: str | None) -> str:
    """Normalize phone numbers for comparison."""
    if not value:
        return ""

    value = value.strip()
    digits = re.sub(r"\D", "", value)

    return f"+{digits}" if value.startswith("+") else digits


async def phone_number_is_taken(
    phone_number: str,
    exclude_user_id=None,
) -> bool:
    """Check phone uniqueness, including differently formatted numbers."""
    normalized = normalize_phone(phone_number)

    if not normalized:
        return False

    query = {}
    if exclude_user_id is not None:
        query["_id"] = {"$ne": exclude_user_id}

    cursor = users_collection.find(query, {"phone_number": 1})

    async for user in cursor:
        existing_phone = normalize_phone(user.get("phone_number"))
        if existing_phone and existing_phone == normalized:
            return True

    return False


async def find_user_by_login_id(login_id: str):
    """Find a user by email, roll number, or phone number."""
    login_id = login_id.strip()

    user = await users_collection.find_one(
        {
            "$or": [
                {"roll_number": login_id},
                {"email": login_id.lower()},
            ]
        }
    )

    if user:
        return user

    normalized_login = normalize_phone(login_id)
    if not normalized_login:
        return None

    cursor = users_collection.find(
        {"phone_number": {"$exists": True, "$ne": None}},
    )

    async for candidate in cursor:
        existing_phone = normalize_phone(candidate.get("phone_number"))
        if existing_phone and existing_phone == normalized_login:
            return candidate

    return None


def public_user(user: dict) -> dict:
    """Return user information without sensitive password data."""
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "roll_number": user.get("roll_number"),
        "email": user.get("email"),
        "phone_number": user.get("phone_number"),
        "class_name": user.get("class_name"),
        "year": user.get("year"),
        "role": user.get("role"),
        "service_hours": user.get("service_hours", 0),
    }


# =========================================================
# REGISTER VOLUNTEER
# =========================================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: RegisterRequest):
    login_id = user.login_id.strip()

    if is_email(login_id):
        email = login_id.lower()
        roll_number = None

        if await users_collection.find_one({"email": email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    else:
        roll_number = login_id
        email = None

        if await users_collection.find_one({"roll_number": roll_number}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Roll number already registered",
            )

    new_user = {
        "name": user.name.strip(),
        "roll_number": roll_number,
        "email": email,
        "phone_number": None,
        "class_name": user.class_name.strip(),
        "year": user.year,
        "password_hash": hash_password(user.password),
        "role": "volunteer",
        "service_hours": 0,
    }

    result = await users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


# =========================================================
# REGISTER FIRST ADMIN
# NOTE: This preserves your existing RegisterRequest contract.
# =========================================================

@router.post("/register-admin", status_code=status.HTTP_201_CREATED)
async def register_admin(
    user: RegisterRequest,
    setup_key: str = Header(..., alias="setup-key"),
):
    if setup_key != ADMIN_SETUP_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin setup key",
        )

    if await users_collection.find_one({"role": "admin"}):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin setup has already been completed",
        )

    login_id = user.login_id.strip()

    if is_email(login_id):
        email = login_id.lower()
        roll_number = None

        if await users_collection.find_one({"email": email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    else:
        roll_number = login_id
        email = None

        if await users_collection.find_one({"roll_number": roll_number}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Roll number already registered",
            )

    new_admin = {
        "name": user.name.strip(),
        "roll_number": roll_number,
        "email": email,
        "phone_number": None,
        "class_name": user.class_name.strip(),
        "year": user.year,
        "password_hash": hash_password(user.password),
        "role": "admin",
        "service_hours": 0,
    }

    result = await users_collection.insert_one(new_admin)

    return {
        "message": "Admin registered successfully",
        "user_id": str(result.inserted_id),
    }


# =========================================================
# CREATE STAFF ACCOUNT
# Admin can create coordinator or additional admin accounts.
# =========================================================

@router.post("/create-staff", status_code=status.HTTP_201_CREATED)
async def create_staff(
    data: StaffAccountCreateRequest,
    current_user=Depends(require_admin),
):
    name = data.name.strip()
    email = data.email.strip().lower() if data.email else None
    phone_number = data.phone_number.strip() if data.phone_number else None

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required",
        )

    if data.role not in ("admin", "coordinator"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff role must be admin or coordinator",
        )

    if not email and not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide an email address or phone number",
        )

    if email:
        if not is_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enter a valid email address",
            )

        if await users_collection.find_one({"email": email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already being used",
            )

    if phone_number and await phone_number_is_taken(phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is already being used",
        )

    new_staff = {
        "name": name,
        "roll_number": None,
        "email": email,
        "phone_number": phone_number,
        "class_name": None,
        "year": None,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "service_hours": 0,
    }

    result = await users_collection.insert_one(new_staff)

    return {
        "message": "Staff account created successfully",
        "user_id": str(result.inserted_id),
        "name": name,
        "role": data.role,
    }


# =========================================================
# LOGIN
# Volunteers: roll number or email
# Staff: email or phone number
# =========================================================

@router.post("/login", response_model=TokenResponse)
async def login(user: LoginRequest):
    login_id = user.login_id.strip()

    if is_email(login_id):
        login_id = login_id.lower()

    existing_user = await find_user_by_login_id(login_id)

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(user.password, existing_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        user_id=str(existing_user["_id"]),
        role=existing_user["role"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return public_user(current_user)


# =========================================================
# UPDATE VOLUNTEER PROFILE
# =========================================================

@router.patch("/me")
async def update_my_profile(
    data: ProfileUpdateRequest,
    current_user=Depends(get_current_user),
):
    if current_user.get("role") != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for volunteer profiles",
        )

    name = data.name.strip()
    login_id = data.login_id.strip()
    class_name = data.class_name.strip()

    if not name or not login_id or not class_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, login ID and class are required",
        )

    if is_email(login_id):
        new_email = login_id.lower()
        new_roll_number = None
        existing_user = await users_collection.find_one(
            {
                "email": new_email,
                "_id": {"$ne": current_user["_id"]},
            }
        )
        duplicate_message = "Email already registered"
    else:
        new_roll_number = login_id
        new_email = None
        existing_user = await users_collection.find_one(
            {
                "roll_number": new_roll_number,
                "_id": {"$ne": current_user["_id"]},
            }
        )
        duplicate_message = "Roll number already registered"

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=duplicate_message,
        )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "name": name,
                "roll_number": new_roll_number,
                "email": new_email,
                "class_name": class_name,
                "year": data.year,
            }
        },
    )

    updated_user = await users_collection.find_one(
        {"_id": current_user["_id"]}
    )

    return {
        "message": "Profile updated successfully",
        "user": public_user(updated_user),
    }


# =========================================================
# LEGACY VOLUNTEER PROFILE ENDPOINT
# =========================================================

@router.patch("/profile")
async def update_profile(
    data: ProfileUpdateRequest,
    current_user=Depends(get_current_user),
):
    # Retain this route for any frontend still using /auth/profile.
    if current_user.get("role") != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for volunteer profiles",
        )

    name = data.name.strip()
    login_id = data.login_id.strip()
    class_name = data.class_name.strip()

    if not name or not login_id or not class_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, login ID and class are required",
        )

    if is_email(login_id):
        new_email = login_id.lower()
        new_roll_number = None
        duplicate_query = {"email": new_email}
        duplicate_message = "Email is already being used by another user"
    else:
        new_roll_number = login_id
        new_email = None
        duplicate_query = {"roll_number": new_roll_number}
        duplicate_message = "Roll number is already being used by another user"

    duplicate_query["_id"] = {"$ne": current_user["_id"]}

    if await users_collection.find_one(duplicate_query):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=duplicate_message,
        )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "name": name,
                "roll_number": new_roll_number,
                "email": new_email,
                "class_name": class_name,
                "year": data.year,
            }
        },
    )

    updated_user = await users_collection.find_one(
        {"_id": current_user["_id"]}
    )

    return {
        "message": "Profile updated successfully",
        "user": public_user(updated_user),
    }


# =========================================================
# UPDATE STAFF CONTACT DETAILS
# Staff can add a missing email or phone number.
# Blank fields preserve existing values.
# =========================================================

@router.patch("/me/contact-details")
async def update_staff_contact_details(
    data: ContactDetailsUpdateRequest,
    current_user=Depends(get_current_user),
):
    if current_user.get("role") not in ("admin", "coordinator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for staff accounts",
        )

    name = data.name.strip()

    # Preserve existing contacts when the submitted field is blank.
    submitted_email = data.email.strip().lower() if data.email else None
    submitted_phone = (
        data.phone_number.strip() if data.phone_number else None
    )

    email = submitted_email or current_user.get("email")
    phone_number = submitted_phone or current_user.get("phone_number")

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required",
        )

    if not email and not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least an email address or phone number",
        )

    if submitted_email:
        if not is_email(submitted_email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enter a valid email address",
            )

        existing_email = await users_collection.find_one(
            {
                "email": submitted_email,
                "_id": {"$ne": current_user["_id"]},
            }
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already being used by another user",
            )

    if submitted_phone:
        if await phone_number_is_taken(
            submitted_phone,
            exclude_user_id=current_user["_id"],
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is already being used by another user",
            )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "name": name,
                "email": email,
                "phone_number": phone_number,
            }
        },
    )

    updated_user = await users_collection.find_one(
        {"_id": current_user["_id"]}
    )

    return {
        "message": "Contact details updated successfully",
        "user": {
            "id": str(updated_user["_id"]),
            "name": updated_user["name"],
            "email": updated_user.get("email"),
            "phone_number": updated_user.get("phone_number"),
            "role": updated_user["role"],
        },
    }


# =========================================================
# GET ADMIN NAMES
# =========================================================

@router.get("/admins")
async def get_admin_names():
    admins = []
    cursor = users_collection.find(
        {"role": "admin"},
        {"_id": 0, "name": 1},
    )

    async for admin in cursor:
        admins.append({"name": admin.get("name", "Administrator")})

    return admins


# =========================================================
# ADMIN TEST
# =========================================================

@router.get("/admin-test")
async def admin_test(current_user=Depends(require_admin)):
    return {
        "message": "You have admin access",
        "admin": current_user["name"],
    }


# =========================================================
# CHANGE OWN PASSWORD
# =========================================================

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):
    if not verify_password(
        data.current_password,
        current_user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if verify_password(data.new_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different",
        )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}},
    )

    return {"message": "Password changed successfully"}


# =========================================================
# RESET USER PASSWORD
# Admins can reset any account.
# Coordinators can reset volunteer passwords only.
# =========================================================

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    current_user=Depends(require_staff),
):
    login_id = data.login_id.strip()

    if is_email(login_id):
        login_id = login_id.lower()

    user = await find_user_by_login_id(login_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if (
        current_user["role"] == "coordinator"
        and user["role"] != "volunteer"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coordinators can only reset volunteer passwords",
        )

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}},
    )

    return {"message": "Password reset successfully"}


# =========================================================
# GET ALL USERS
# Admin only
# =========================================================

@router.get("/users")
async def get_users(current_user=Depends(require_admin)):
    users = []
    cursor = users_collection.find({}, {"password_hash": 0})

    async for user in cursor:
        users.append(public_user(user))

    return users


# =========================================================
# CHANGE USER ROLE
# Admin only
# =========================================================

@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    data: ChangeRoleRequest,
    current_user=Depends(require_admin),
):
    try:
        target_user_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    target_user = await users_collection.find_one({"_id": target_user_id})

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if (
        str(current_user["_id"]) == user_id
        and data.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin role",
        )

    if target_user["role"] == "admin" and data.role != "admin":
        admin_count = await users_collection.count_documents(
            {"role": "admin"}
        )

        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one admin must remain",
            )

    await users_collection.update_one(
        {"_id": target_user_id},
        {"$set": {"role": data.role}},
    )

    return {
        "message": "User role updated successfully",
        "user_id": user_id,
        "new_role": data.role,
    }
