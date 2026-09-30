from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.auth.dependencies import (
    get_current_user,
    require_staff,
)

from app.database import (
    events_collection,
    event_registrations_collection,
)


router = APIRouter(
    prefix="/events",
    tags=["Event Registrations"],
)


# =========================================================
# REGISTER FOR EVENT
# =========================================================

@router.post(
    "/{event_id}/register",
    status_code=status.HTTP_201_CREATED,
)
async def register_for_event(
    event_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------------------------
    # Only volunteers can register
    # -----------------------------------------------------

    if current_user["role"] != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can register for events",
        )

    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    # -----------------------------------------------------
    # Find event
    # -----------------------------------------------------

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # -----------------------------------------------------
    # Event must be published
    # -----------------------------------------------------

    if event["status"] != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is only available for published events",
        )

    # -----------------------------------------------------
    # Check if already registered
    # -----------------------------------------------------

    existing_registration = (
        await event_registrations_collection.find_one(
            {
                "event_id": object_id,
                "user_id": current_user["_id"],
                "status": "registered",
            }
        )
    )

    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event",
        )

    # -----------------------------------------------------
    # Check capacity
    # -----------------------------------------------------

    if event.get("max_volunteers") is not None:

        registered_count = (
            await event_registrations_collection.count_documents(
                {
                    "event_id": object_id,
                    "status": "registered",
                }
            )
        )

        if registered_count >= event["max_volunteers"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This event is already full",
            )

    # -----------------------------------------------------
    # Create registration
    # -----------------------------------------------------

    registration = {
        "event_id": object_id,
        "user_id": current_user["_id"],
        "status": "registered",
        "registered_at": datetime.now(timezone.utc),
    }

    result = await event_registrations_collection.insert_one(
        registration
    )

    return {
        "message": "Successfully registered for the event",
        "registration_id": str(result.inserted_id),
    }


# =========================================================
# CANCEL MY REGISTRATION
# =========================================================

@router.delete("/{event_id}/register")
async def cancel_registration(
    event_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------------------------
    # Only volunteers can cancel their registration
    # -----------------------------------------------------

    if current_user["role"] != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can cancel event registrations",
        )

    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    # -----------------------------------------------------
    # Find registration
    # -----------------------------------------------------

    registration = (
        await event_registrations_collection.find_one(
            {
                "event_id": object_id,
                "user_id": current_user["_id"],
                "status": "registered",
            }
        )
    )

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not registered for this event",
        )

    # -----------------------------------------------------
    # Cancel registration
    # -----------------------------------------------------

    await event_registrations_collection.update_one(
        {"_id": registration["_id"]},
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "Event registration cancelled successfully"
    }


# =========================================================
# GET MY REGISTRATION
# =========================================================

@router.get("/{event_id}/my-registration")
async def get_my_registration(
    event_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    registration = (
        await event_registrations_collection.find_one(
            {
                "event_id": object_id,
                "user_id": current_user["_id"],
            }
        )
    )

    if not registration:
        return {
            "registered": False,
        }

    return {
        "registered": registration["status"] == "registered",
        "status": registration["status"],
        "registration_id": str(registration["_id"]),
        "registered_at": registration.get("registered_at"),
    }


# =========================================================
# GET EVENT REGISTRATIONS
# =========================================================

@router.get("/{event_id}/registrations")
async def get_event_registrations(
    event_id: str,
    current_user=Depends(require_staff),
):
    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    # -----------------------------------------------------
    # Check event exists
    # -----------------------------------------------------

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # -----------------------------------------------------
    # Get registrations
    # -----------------------------------------------------

    registrations = []

    cursor = event_registrations_collection.find(
        {
            "event_id": object_id,
        }
    )

    async for registration in cursor:

        user = await get_user_for_registration(
            registration["user_id"]
        )

        registrations.append(
            {
                "registration_id": str(
                    registration["_id"]
                ),
                "user_id": str(
                    registration["user_id"]
                ),
                "name": user["name"] if user else "Unknown",
                "roll_number": (
                    user["roll_number"]
                    if user
                    else "Unknown"
                ),
                "status": registration["status"],
                "registered_at": registration.get(
                    "registered_at"
                ),
            }
        )

    return {
        "event_id": event_id,
        "event_title": event["title"],
        "registrations": registrations,
    }


# =========================================================
# HELPER
# =========================================================

async def get_user_for_registration(user_id):
    from app.database import users_collection

    return await users_collection.find_one(
        {"_id": user_id}
    )