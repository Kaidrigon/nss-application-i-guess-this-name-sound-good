# here bassically we are creating registration and logins and alot of things like hasing using security.py and schemas for request from schemas.py and then we are using the users_collection from database.py to store the user data in the db.
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.auth.dependencies import get_current_user, require_admin

from app.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
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


@router.post("/register", status_code=status.HTTP_201_CREATED)
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


@router.post("/register-admin", status_code=status.HTTP_201_CREATED)
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

    # Check if roll number already exists
    existing_user = await users_collection.find_one(
        {"roll_number": user.roll_number}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roll number already registered",
        )

    # Create admin
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


@router.post("/login", response_model=TokenResponse)
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
    
@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "roll_number": current_user["roll_number"],
        "role": current_user["role"],
        "service_hours": current_user["service_hours"],
    }
    
@router.get("/admin-test")
async def admin_test(current_user=Depends(require_admin)):
    return {
        "message": "You have admin access",
        "admin": current_user["name"],
    }