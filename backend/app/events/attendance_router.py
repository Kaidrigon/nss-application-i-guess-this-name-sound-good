from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.auth.dependencies import (
    get_current_user,
    require_staff,
)

from app.database import (
    users_collection,
    events_collection,
    event_registrations_collection,
    event_attendance_collection,
    service_hour_history_collection,
)


router = APIRouter(
    prefix="/events",
    tags=["Attendance"],
)

# MARK ATTENDANCE

@router.post("/{event_id}/attendance")
async def mark_attendance(
    event_id: str,
    user_id: str,
    attendance_status: str,
    current_user=Depends(require_staff),
):
    # Validate event ID

    try:
        event_object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )


    # Validate user ID


    try:
        user_object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    # Validate attendance status

    if attendance_status not in ["attended", "absent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance status must be 'attended' or 'absent'",
        )

    # Find event
    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Attendance can only be marked for ongoing
    # or completed events.

    if event["status"] not in ["ongoing", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance can only be marked for ongoing or completed events",
        )

    # Find volunteer

    user = await users_collection.find_one(
        {"_id": user_object_id}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # -----------------------------------------------------
    # Only volunteers can have attendance
    # -----------------------------------------------------

    if user["role"] != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance can only be marked for volunteers",
        )

    # -----------------------------------------------------
    # Check registration
    # -----------------------------------------------------

    registration = await event_registrations_collection.find_one(
        {
            "event_id": event_object_id,
            "user_id": user_object_id,
            "status": "registered",
        }
    )

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer is not registered for this event",
        )

    # -----------------------------------------------------
    # Find existing attendance record
    # -----------------------------------------------------

    existing_attendance = (
        await event_attendance_collection.find_one(
            {
                "event_id": event_object_id,
                "user_id": user_object_id,
            }
        )
    )

    # =====================================================
    # EXISTING ATTENDANCE
    # =====================================================

    if existing_attendance:

        old_status = existing_attendance["status"]

        # -------------------------------------------------
        # Nothing changed
        # -------------------------------------------------

        if old_status == attendance_status:
            return {
                "message": "Attendance is already marked",
                "status": attendance_status,
                "service_hours_credited": False,
            }

        credited_hours = event["credited_hours"]

        # -------------------------------------------------
        # attended → absent
        #
        # Remove previously credited hours.
        # -------------------------------------------------

        if (
            old_status == "attended"
            and attendance_status == "absent"
        ):

            await users_collection.update_one(
                {"_id": user_object_id},
                {
                    "$inc": {
                        "service_hours": -credited_hours
                    }
                },
            )

            # Record the reversal in history
            await service_hour_history_collection.insert_one(
                {
                    "user_id": user_object_id,
                    "event_id": event_object_id,
                    "event_title": event["title"],
                    "hours": -credited_hours,
                    "action": "reversed",
                    "reason": "Attendance changed from attended to absent",
                    "recorded_at": datetime.now(timezone.utc),
                }
            )

        # -------------------------------------------------
        # absent → attended
        #
        # Add hours.
        # -------------------------------------------------

        elif (
            old_status == "absent"
            and attendance_status == "attended"
        ):

            await users_collection.update_one(
                {"_id": user_object_id},
                {
                    "$inc": {
                        "service_hours": credited_hours
                    }
                },
            )

            # Record the new credit in history
            await service_hour_history_collection.insert_one(
                {
                    "user_id": user_object_id,
                    "event_id": event_object_id,
                    "event_title": event["title"],
                    "hours": credited_hours,
                    "action": "credited",
                    "reason": "Attendance changed from absent to attended",
                    "recorded_at": datetime.now(timezone.utc),
                }
            )

        # -------------------------------------------------
        # Update attendance record
        # -------------------------------------------------

        await event_attendance_collection.update_one(
            {"_id": existing_attendance["_id"]},
            {
                "$set": {
                    "status": attendance_status,
                    "marked_by": current_user["_id"],
                    "marked_at": datetime.now(timezone.utc),
                }
            },
        )

        return {
            "message": "Attendance updated successfully",
            "status": attendance_status,
            "service_hours_credited": (
                attendance_status == "attended"
            ),
            "hours_changed": (
                credited_hours
                if attendance_status == "attended"
                else -credited_hours
            ),
        }

    # =====================================================
    # NEW ATTENDANCE RECORD
    # =====================================================

    attendance = {
        "event_id": event_object_id,
        "user_id": user_object_id,
        "status": attendance_status,
        "marked_by": current_user["_id"],
        "marked_at": datetime.now(timezone.utc),
    }

    await event_attendance_collection.insert_one(
        attendance
    )

    # -----------------------------------------------------
    # Credit hours only if attended
    # -----------------------------------------------------

    if attendance_status == "attended":

        credited_hours = event["credited_hours"]

        # Add service hours to user
        await users_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {
                    "service_hours": credited_hours
                }
            },
        )

        # Add service-hour history
        await service_hour_history_collection.insert_one(
            {
                "user_id": user_object_id,
                "event_id": event_object_id,
                "event_title": event["title"],
                "hours": credited_hours,
                "action": "credited",
                "reason": "Event attendance",
                "recorded_at": datetime.now(timezone.utc),
            }
        )

        return {
            "message": "Attendance marked successfully",
            "status": "attended",
            "service_hours_credited": True,
            "hours_added": credited_hours,
        }

    # -----------------------------------------------------
    # Absent
    # -----------------------------------------------------

    return {
        "message": "Attendance marked successfully",
        "status": "absent",
        "service_hours_credited": False,
        "hours_added": 0,
    }


# =========================================================
# GET EVENT ATTENDANCE
# =========================================================

@router.get("/{event_id}/attendance")
async def get_event_attendance(
    event_id: str,
    current_user=Depends(require_staff),
):
    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        event_object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    # -----------------------------------------------------
    # Check event
    # -----------------------------------------------------

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    attendance_list = []

    cursor = event_attendance_collection.find(
        {
            "event_id": event_object_id,
        }
    )

    async for attendance in cursor:

        user = await users_collection.find_one(
            {
                "_id": attendance["user_id"]
            }
        )

        attendance_list.append(
            {
                "attendance_id": str(
                    attendance["_id"]
                ),
                "user_id": str(
                    attendance["user_id"]
                ),
                "name": (
                    user["name"]
                    if user
                    else "Unknown"
                ),
                "roll_number": (
                    user["roll_number"]
                    if user
                    else "Unknown"
                ),
                "status": attendance["status"],
                "marked_at": attendance.get(
                    "marked_at"
                ),
            }
        )

    return {
        "event_id": event_id,
        "event_title": event["title"],
        "attendance": attendance_list,
    }


# =========================================================
# GET MY ATTENDANCE
# =========================================================

@router.get("/{event_id}/attendance/me")
async def get_my_attendance(
    event_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------------------------
    # Validate event ID
    # -----------------------------------------------------

    try:
        event_object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    attendance = await event_attendance_collection.find_one(
        {
            "event_id": event_object_id,
            "user_id": current_user["_id"],
        }
    )

    if not attendance:
        return {
            "marked": False,
            "status": None,
        }

    return {
        "marked": True,
        "status": attendance["status"],
        "marked_at": attendance.get(
            "marked_at"
        ),
    }