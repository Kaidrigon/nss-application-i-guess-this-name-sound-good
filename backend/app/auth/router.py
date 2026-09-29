# here bassically we are creating registration and logins and alot of things like hasing using security.py and schemas for request from schemas.py and then we are using the users_collection from database.py to store the user data in the db.
from fastapi import APIRouter, Depends, Header, HTTPException, status
from bson import ObjectId

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
)

from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.config import ADMIN_SETUP_KEY
from app.database import users_collection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ---------------------------------------------------------
# REGISTER VOLUNTEER
# ---------------------------------------------------------

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
async def register(user: RegisterRequest):

    existing_user = await users_collection.find_one(
        {"roll_number": user.roll_number}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roll number already registered",
        )

    new_user = {
        "name": user.name,
        "roll_number": user.roll_number,
        "password_hash": hash_password(user.password),
        "role": "volunteer",
        "service_hours": 0,
    }

    result = await users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


# ---------------------------------------------------------
# REGISTER FIRST ADMIN
# ---------------------------------------------------------

@router.post(
    "/register-admin",
    status_code=status.HTTP_201_CREATED,
)
async def register_admin(
    user: RegisterRequest,
    setup_key: str = Header(...),
):

    # Check admin setup key
    if setup_key != ADMIN_SETUP_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin setup key",
        )

    # Only allow this endpoint if no admin exists
    existing_admin = await users_collection.find_one(
        {"role": "admin"}
    )

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin setup has already been completed",
        )

    # Check if roll number already exists
    existing_user = await users_collection.find_one(
        {"roll_number": user.roll_number}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roll number already registered",
        )

    new_admin = {
        "name": user.name,
        "roll_number": user.roll_number,
        "password_hash": hash_password(user.password),
        "role": "admin",
        "service_hours": 0,
    }

    result = await users_collection.insert_one(new_admin)

    return {
        "message": "Admin registered successfully",
        "user_id": str(result.inserted_id),
    }


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(user: LoginRequest):

    existing_user = await users_collection.find_one(
        {"roll_number": user.roll_number}
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    password_is_valid = verify_password(
        user.password,
        existing_user["password_hash"],
    )

    if not password_is_valid:
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


# ---------------------------------------------------------
# CURRENT USER
# ---------------------------------------------------------

@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
):

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "roll_number": current_user["roll_number"],
        "role": current_user["role"],
        "service_hours": current_user["service_hours"],
    }


# ---------------------------------------------------------
# ADMIN TEST
# ---------------------------------------------------------

@router.get("/admin-test")
async def admin_test(
    current_user=Depends(require_admin),
):

    return {
        "message": "You have admin access",
        "admin": current_user["name"],
    }


# ---------------------------------------------------------
# CHANGE OWN PASSWORD
# ---------------------------------------------------------

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):

    # Verify current password
    if not verify_password(
        data.current_password,
        current_user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Prevent using the same password
    if verify_password(
        data.new_password,
        current_user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different",
        )

    # Hash new password
    new_password_hash = hash_password(
        data.new_password
    )

    # Update MongoDB
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": new_password_hash}},
    )

    return {
        "message": "Password changed successfully"
    }


# ---------------------------------------------------------
# RESET USER PASSWORD
# ---------------------------------------------------------

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    current_user=Depends(require_staff),
):

    user = await users_collection.find_one(
        {"roll_number": data.roll_number}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Coordinators can only reset volunteer passwords
    if (
        current_user["role"] == "coordinator"
        and user["role"] != "volunteer"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coordinators can only reset volunteer passwords",
        )

    new_password_hash = hash_password(
        data.new_password
    )

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_password_hash}},
    )

    return {
        "message": "Password reset successfully"
    }


# ---------------------------------------------------------
# GET ALL USERS
# ---------------------------------------------------------

@router.get("/users")
async def get_users(
    current_user=Depends(require_admin),
):

    users = []

    cursor = users_collection.find(
        {},
        {
            "password_hash": 0,
        },
    )

    async for user in cursor:
        users.append(
            {
                "id": str(user["_id"]),
                "name": user["name"],
                "roll_number": user["roll_number"],
                "role": user["role"],
                "service_hours": user.get(
                    "service_hours",
                    0,
                ),
            }
        )

    return users


# ---------------------------------------------------------
# CHANGE USER ROLE
# ---------------------------------------------------------

@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    data: ChangeRoleRequest,
    current_user=Depends(require_admin),
):

    # Validate ObjectId
    try:
        target_user_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    # Find target user
    target_user = await users_collection.find_one(
        {"_id": target_user_id}
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Prevent an admin from removing their own admin role
    if (
        str(current_user["_id"]) == user_id
        and data.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin role",
        )

    # Prevent the last admin from losing admin status
    if (
        target_user["role"] == "admin"
        and data.role != "admin"
    ):

        admin_count = await users_collection.count_documents(
            {"role": "admin"}
        )

        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one admin must remain",
            )

    # Update role
    await users_collection.update_one(
        {"_id": target_user_id},
        {"$set": {"role": data.role}},
    )

    return {
        "message": "User role updated successfully",
        "user_id": user_id,
        "new_role": data.role,
    }
