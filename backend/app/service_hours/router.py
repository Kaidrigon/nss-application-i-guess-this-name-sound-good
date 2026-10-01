from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.auth.dependencies import (
    get_current_user,
    require_staff,
)

from app.database import (
    users_collection,
    service_hour_history_collection,
)


router = APIRouter(
    prefix="/service-hours",
    tags=["Service Hours"],
)


# =========================================================
# GET MY SERVICE HOURS
# =========================================================

@router.get("/me")
async def get_my_service_hours(
    current_user=Depends(get_current_user),
):
    total_hours = current_user.get("service_hours", 0)

    required_hours = 240

    remaining_hours = max(
        required_hours - total_hours,
        0,
    )

    completion_percentage = min(
        (total_hours / required_hours) * 100,
        100,
    )

    return {
        "user_id": str(current_user["_id"]),
        "name": current_user["name"],
        "roll_number": current_user["roll_number"],
        "service_hours": total_hours,
        "required_hours": required_hours,
        "remaining_hours": remaining_hours,
        "completion_percentage": round(
            completion_percentage,
            2,
        ),
    }


# =========================================================
# GET MY SERVICE-HOUR HISTORY
# =========================================================

@router.get("/me/history")
async def get_my_service_hour_history(
    current_user=Depends(get_current_user),
):
    history = []

    cursor = service_hour_history_collection.find(
        {
            "user_id": current_user["_id"],
        }
    ).sort(
        "recorded_at",
        -1,
    )

    async for record in cursor:
        history.append(
            {
                "id": str(record["_id"]),
                "event_id": str(record["event_id"]),
                "event_title": record["event_title"],
                "hours": record["hours"],
                "action": record["action"],
                "reason": record["reason"],
                "recorded_at": record.get(
                    "recorded_at"
                ),
            }
        )

    return {
        "user_id": str(current_user["_id"]),
        "total_records": len(history),
        "history": history,
    }


# =========================================================
# GET USER SERVICE HOURS
# =========================================================

@router.get("/users/{user_id}")
async def get_user_service_hours(
    user_id: str,
    current_user=Depends(require_staff),
):
    # -----------------------------------------------------
    # Validate user ID
    # -----------------------------------------------------

    try:
        user_object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    # -----------------------------------------------------
    # Find user
    # -----------------------------------------------------

    user = await users_collection.find_one(
        {"_id": user_object_id}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # -----------------------------------------------------
    # Only volunteers have service-hour records
    # -----------------------------------------------------

    if user["role"] != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service hours are only tracked for volunteers",
        )

    total_hours = user.get(
        "service_hours",
        0,
    )

    required_hours = 240

    remaining_hours = max(
        required_hours - total_hours,
        0,
    )

    completion_percentage = min(
        (total_hours / required_hours) * 100,
        100,
    )

    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "roll_number": user["roll_number"],
        "service_hours": total_hours,
        "required_hours": required_hours,
        "remaining_hours": remaining_hours,
        "completion_percentage": round(
            completion_percentage,
            2,
        ),
    }


# =========================================================
# GET USER SERVICE-HOUR HISTORY
# =========================================================

@router.get("/users/{user_id}/history")
async def get_user_service_hour_history(
    user_id: str,
    current_user=Depends(require_staff),
):
    # -----------------------------------------------------
    # Validate user ID
    # -----------------------------------------------------

    try:
        user_object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    # -----------------------------------------------------
    # Find user
    # -----------------------------------------------------

    user = await users_collection.find_one(
        {"_id": user_object_id}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # -----------------------------------------------------
    # Only volunteers have service-hour records
    # -----------------------------------------------------

    if user["role"] != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service hours are only tracked for volunteers",
        )

    # -----------------------------------------------------
    # Get history
    # -----------------------------------------------------

    history = []

    cursor = service_hour_history_collection.find(
        {
            "user_id": user_object_id,
        }
    ).sort(
        "recorded_at",
        -1,
    )

    async for record in cursor:
        history.append(
            {
                "id": str(record["_id"]),
                "event_id": str(record["event_id"]),
                "event_title": record["event_title"],
                "hours": record["hours"],
                "action": record["action"],
                "reason": record["reason"],
                "recorded_at": record.get(
                    "recorded_at"
                ),
            }
        )

    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "roll_number": user["roll_number"],
        "service_hours": user.get(
            "service_hours",
            0,
        ),
        "total_records": len(history),
        "history": history,
    }
