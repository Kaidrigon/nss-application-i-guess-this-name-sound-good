from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.auth.dependencies import get_current_user, require_staff
from app.database import (
    client,
    users_collection,
    events_collection,
    event_registrations_collection,
    event_attendance_collection,
    service_hour_history_collection,
)
from app.events.attendance_schemas import MarkAttendanceRequest


router = APIRouter(prefix="/events", tags=["Attendance"])


def parse_object_id(value: str, label: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {label} ID",
        )


async def lock_event_hours(event_id: ObjectId) -> dict:
    """
    Lock the event's credited hours before attendance is processed.
    """
    await events_collection.update_one(
        {
            "_id": event_id,
            "credited_hours_locked": {"$ne": True},
        },
        {
            "$set": {
                "credited_hours_locked": True,
                "credited_hours_locked_at": datetime.now(timezone.utc),
            }
        },
    )

    event = await events_collection.find_one({"_id": event_id})

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


async def record_service_hours(
    user_id: ObjectId,
    event: dict,
    hours: float,
    action: str,
    reason: str,
    session,
):
    """
    Update the volunteer's total and create its history entry.

    Both writes participate in the caller's MongoDB transaction.
    """
    result = await users_collection.update_one(
        {"_id": user_id},
        {"$inc": {"service_hours": hours}},
        session=session,
    )

    if result.matched_count != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found while updating service hours",
        )

    await service_hour_history_collection.insert_one(
        {
            "user_id": user_id,
            "event_id": event["_id"],
            "event_title": event["title"],
            "hours": hours,
            "action": action,
            "reason": reason,
            "recorded_at": datetime.now(timezone.utc),
        },
        session=session,
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
    event_object_id = parse_object_id(event_id, "event")
    user_object_id = parse_object_id(data.user_id, "user")
    attendance_status = data.status.value

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.get("status") not in ("ongoing", "completed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Attendance can only be marked for ongoing "
                "or completed events"
            ),
        )

    user = await users_collection.find_one(
        {"_id": user_object_id}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.get("role") != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance can only be marked for volunteers",
        )

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

    # Lock and reread the event's credited hours.
    event = await lock_event_hours(event_object_id)
    credited_hours = event.get("credited_hours", 0)

    now = datetime.now(timezone.utc)

    try:
        # One transaction for attendance, totals and history.
        async with client.start_session() as session:
            async with await session.start_transaction():

                existing = await event_attendance_collection.find_one(
                    {
                        "event_id": event_object_id,
                        "user_id": user_object_id,
                    },
                    session=session,
                )

                # -------------------------------------------------
                # Existing attendance
                # -------------------------------------------------

                if existing:
                    old_status = existing.get("status")

                    if old_status == attendance_status:
                        return {
                            "message": "Attendance is already marked",
                            "status": attendance_status,
                            "service_hours_changed": 0,
                        }

                    if (
                        old_status == "attended"
                        and attendance_status == "absent"
                    ):
                        hours_changed = -credited_hours

                        await record_service_hours(
                            user_id=user_object_id,
                            event=event,
                            hours=hours_changed,
                            action="reversed",
                            reason=(
                                "Attendance changed from attended "
                                "to absent"
                            ),
                            session=session,
                        )

                    elif (
                        old_status == "absent"
                        and attendance_status == "attended"
                    ):
                        hours_changed = credited_hours

                        await record_service_hours(
                            user_id=user_object_id,
                            event=event,
                            hours=hours_changed,
                            action="credited",
                            reason=(
                                "Attendance changed from absent "
                                "to attended"
                            ),
                            session=session,
                        )

                    else:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Unexpected existing attendance status",
                        )

                    # Only update the record if its status is still
                    # the status we originally read.
                    update_result = await event_attendance_collection.update_one(
                        {
                            "_id": existing["_id"],
                            "status": old_status,
                        },
                        {
                            "$set": {
                                "status": attendance_status,
                                "marked_by": current_user["_id"],
                                "marked_at": now,
                            }
                        },
                        session=session,
                    )

                    if update_result.matched_count != 1:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=(
                                "Attendance changed concurrently. "
                                "Refresh the attendance list and try again."
                            ),
                        )

                    return {
                        "message": "Attendance updated successfully",
                        "status": attendance_status,
                        "service_hours_changed": hours_changed,
                    }

                # -------------------------------------------------
                # First attendance record
                # -------------------------------------------------

                attendance = {
                    "event_id": event_object_id,
                    "user_id": user_object_id,
                    "status": attendance_status,
                    "marked_by": current_user["_id"],
                    "marked_at": now,
                }

                await event_attendance_collection.insert_one(
                    attendance,
                    session=session,
                )

                if attendance_status == "attended":
                    await record_service_hours(
                        user_id=user_object_id,
                        event=event,
                        hours=credited_hours,
                        action="credited",
                        reason="Event attendance",
                        session=session,
                    )

                    return {
                        "message": "Attendance marked successfully",
                        "status": "attended",
                        "service_hours_changed": credited_hours,
                    }

                return {
                    "message": "Attendance marked successfully",
                    "status": "absent",
                    "service_hours_changed": 0,
                }

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Attendance was already recorded by another request. "
                "Refresh the attendance list and try again if needed."
            ),
        )


# =========================================================
# GET EVENT ATTENDANCE
# =========================================================

@router.get("/{event_id}/attendance")
async def get_event_attendance(
    event_id: str,
    current_user=Depends(require_staff),
):
    event_object_id = parse_object_id(event_id, "event")

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    attendance_list = []

    registrations = event_registrations_collection.find(
        {
            "event_id": event_object_id,
            "status": "registered",
        }
    )

    async for registration in registrations:
        user_id = registration["user_id"]

        user = await users_collection.find_one(
            {"_id": user_id}
        )

        if not user:
            continue

        attendance = await event_attendance_collection.find_one(
            {
                "event_id": event_object_id,
                "user_id": user_id,
            }
        )

        attendance_list.append(
            {
                "registration_id": str(registration["_id"]),
                "attendance_id": (
                    str(attendance["_id"]) if attendance else None
                ),
                "user_id": str(user_id),
                "name": user.get("name", "Unknown"),
                "roll_number": user.get("roll_number"),
                "email": user.get("email"),
                "status": attendance.get("status") if attendance else None,
                "marked_at": (
                    attendance.get("marked_at") if attendance else None
                ),
            }
        )

    attended_count = sum(
        1 for item in attendance_list
        if item["status"] == "attended"
    )

    absent_count = sum(
        1 for item in attendance_list
        if item["status"] == "absent"
    )

    pending_count = sum(
        1 for item in attendance_list
        if item["status"] is None
    )

    return {
        "event_id": event_id,
        "event_title": event["title"],
        "event_status": event.get("status"),
        "credited_hours": event.get("credited_hours", 0),
        "credited_hours_locked": event.get(
            "credited_hours_locked", False
        ),
        "total_registered": len(attendance_list),
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
    event_object_id = parse_object_id(event_id, "event")

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
        "marked_at": attendance.get("marked_at"),
    }
