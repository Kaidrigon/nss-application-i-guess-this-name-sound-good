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

from app.events.attendance_schemas import (
    MarkAttendanceRequest,
)


router = APIRouter(
    prefix="/events",
    tags=["Attendance"],
)


# =========================================================
# MARK / UPDATE ATTENDANCE
# =========================================================

@router.post("/{event_id}/attendance")
async def mark_attendance(
    event_id: str,
    data: MarkAttendanceRequest,
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
    # Validate user ID
    # -----------------------------------------------------

    try:
        user_object_id = ObjectId(data.user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID",
        )

    attendance_status = data.status.value

    # -----------------------------------------------------
    # Find event
    # -----------------------------------------------------

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # -----------------------------------------------------
    # Attendance can be marked while event is ongoing
    # or after it has been completed.
    # -----------------------------------------------------

    if event.get("status") not in [
        "ongoing",
        "completed",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Attendance can only be marked for "
                "ongoing or completed events"
            ),
        )

    # -----------------------------------------------------
    # Find volunteer
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
    # Only volunteers can have attendance
    # -----------------------------------------------------

    if user.get("role") != "volunteer":
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
    # Event credited hours
    # -----------------------------------------------------

    credited_hours = event.get("credited_hours", 0)

    # -----------------------------------------------------
    # Check existing attendance
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

        old_status = existing_attendance.get("status")

        # -------------------------------------------------
        # Nothing changed
        # -------------------------------------------------

        if old_status == attendance_status:

            return {
                "message": "Attendance is already marked",
                "status": attendance_status,
                "service_hours_changed": 0,
            }

        # -------------------------------------------------
        # ATTENDED → ABSENT
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

            await service_hour_history_collection.insert_one(
                {
                    "user_id": user_object_id,
                    "event_id": event_object_id,
                    "event_title": event["title"],
                    "hours": -credited_hours,
                    "action": "reversed",
                    "reason": (
                        "Attendance changed from "
                        "attended to absent"
                    ),
                    "recorded_at": datetime.now(timezone.utc),
                }
            )

            hours_changed = -credited_hours

        # -------------------------------------------------
        # ABSENT → ATTENDED
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

            await service_hour_history_collection.insert_one(
                {
                    "user_id": user_object_id,
                    "event_id": event_object_id,
                    "event_title": event["title"],
                    "hours": credited_hours,
                    "action": "credited",
                    "reason": (
                        "Attendance changed from "
                        "absent to attended"
                    ),
                    "recorded_at": datetime.now(timezone.utc),
                }
            )

            hours_changed = credited_hours

        else:
            hours_changed = 0

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
            "service_hours_changed": hours_changed,
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

        await users_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {
                    "service_hours": credited_hours
                }
            },
        )

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
            "service_hours_changed": credited_hours,
        }

    # -----------------------------------------------------
    # Absent
    # -----------------------------------------------------

    return {
        "message": "Attendance marked successfully",
        "status": "absent",
        "service_hours_changed": 0,
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

    # -----------------------------------------------------
    # Get ALL registered volunteers
    #
    # This is important:
    # Volunteers without an attendance record yet
    # must still appear in the admin attendance screen.
    # -----------------------------------------------------

    registrations_cursor = event_registrations_collection.find(
        {
            "event_id": event_object_id,
            "status": "registered",
        }
    )

    attendance_list = []

    async for registration in registrations_cursor:

        user_id = registration["user_id"]

        user = await users_collection.find_one(
            {
                "_id": user_id
            }
        )

        if not user:
            continue

        attendance = await event_attendance_collection.find_one(
            {
                "event_id": event_object_id,
                "user_id": user_id,
            }
        )

        attendance_status = (
            attendance.get("status")
            if attendance
            else None
        )

        attendance_list.append(
            {
                "registration_id": str(
                    registration["_id"]
                ),

                "attendance_id": (
                    str(attendance["_id"])
                    if attendance
                    else None
                ),

                "user_id": str(user_id),

                "name": user.get(
                    "name",
                    "Unknown",
                ),

                "roll_number": user.get(
                    "roll_number"
                ),

                "email": user.get(
                    "email"
                ),

                "status": attendance_status,

                "marked_at": (
                    attendance.get("marked_at")
                    if attendance
                    else None
                ),
            }
        )

    # -----------------------------------------------------
    # Attendance statistics
    # -----------------------------------------------------

    total_registered = len(attendance_list)

    attended_count = sum(
        1
        for item in attendance_list
        if item["status"] == "attended"
    )

    absent_count = sum(
        1
        for item in attendance_list
        if item["status"] == "absent"
    )

    pending_count = sum(
        1
        for item in attendance_list
        if item["status"] is None
    )

    return {
        "event_id": event_id,
        "event_title": event["title"],
        "event_status": event.get("status"),
        "credited_hours": event.get(
            "credited_hours",
            0,
        ),
        "total_registered": total_registered,
        "attended": attended_count,
        "absent": absent_count,
        "pending": pending_count,
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

    # -----------------------------------------------------
    # Find attendance
    # -----------------------------------------------------

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
            "marked_at": None,
        }

    return {
        "marked": True,
        "status": attendance["status"],
        "marked_at": attendance.get(
            "marked_at"
        ),
    }