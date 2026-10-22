#here are all the event related routes will be 

from datetime import time

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user, require_staff
from app.database import (
    event_attendance_collection,
    event_templates_collection,
    events_collection,
)
from app.events.schemas import (
    EventCreate,
    EventUpdate,
    EventTemplateCreate,
)


router = APIRouter(prefix="/events", tags=["Events"])


def parse_event_id(event_id: str) -> ObjectId:
    try:
        return ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )


def serialize_event(event: dict) -> dict:
    result = {
        "id": str(event["_id"]),
        "template_id": str(event["template_id"]),
        "title": event["title"],
        "description": event["description"],
        "event_type": event["event_type"],
        "date": event["date"],
        "start_time": event["start_time"],
        "end_time": event["end_time"],
        "venue": event["venue"],
        "credited_hours": event["credited_hours"],
        "max_volunteers": event.get("max_volunteers"),
        "status": event["status"],
        "credited_hours_locked": event.get(
            "credited_hours_locked", False
        ),
    }

    # Include report fields when they exist.
    for field in (
        "introduction",
        "objectives",
        "event_summary",
        "outcomes",
        "faculty_in_charge",
        "organizing_team",
        "faculty_participants",
        "beneficiaries",
    ):
        if field in event:
            result[field] = event[field]

    return result


# =========================================================
# EVENT TEMPLATES
# =========================================================

@router.post(
    "/templates",
    status_code=status.HTTP_201_CREATED,
)
async def create_event_template(
    data: EventTemplateCreate,
    current_user=Depends(require_staff),
):
    existing = await event_templates_collection.find_one(
        {"title": data.title}
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An event template with this title already exists",
        )

    template = {
        "title": data.title,
        "description": data.description,
        "event_type": data.event_type.value,
        "default_hours": data.default_hours,
        "default_capacity": data.default_capacity,
        "default_venue": data.default_venue,
        "created_by": current_user["_id"],
    }

    result = await event_templates_collection.insert_one(template)

    return {
        "message": "Event template created successfully",
        "template_id": str(result.inserted_id),
    }


@router.get("/templates")
async def get_event_templates(
    current_user=Depends(get_current_user),
):
    templates = []

    async for template in event_templates_collection.find({}):
        templates.append({
            "id": str(template["_id"]),
            "title": template["title"],
            "description": template["description"],
            "event_type": template["event_type"],
            "default_hours": template["default_hours"],
            "default_capacity": template["default_capacity"],
            "default_venue": template["default_venue"],
        })

    return templates


# =========================================================
# EVENTS
# =========================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_event(
    data: EventCreate,
    current_user=Depends(require_staff),
):
    try:
        template_id = ObjectId(data.template_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid template ID",
        )

    template = await event_templates_collection.find_one(
        {"_id": template_id}
    )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event template not found",
        )

    venue = (
        data.venue
        if data.venue is not None
        else template.get("default_venue")
    )

    if not venue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Venue is required",
        )

    event = {
        "template_id": template["_id"],
        "title": data.title or template["title"],
        "description": (
            data.description
            if data.description is not None
            else template["description"]
        ),
        "event_type": (
            data.event_type.value
            if data.event_type is not None
            else template["event_type"]
        ),
        "date": data.date.isoformat(),
        "start_time": data.start_time.strftime("%H:%M"),
        "end_time": data.end_time.strftime("%H:%M"),
        "venue": venue,
        "credited_hours": (
            data.credited_hours
            if data.credited_hours is not None
            else template["default_hours"]
        ),
        "max_volunteers": (
            data.max_volunteers
            if data.max_volunteers is not None
            else template.get("default_capacity")
        ),
        "credited_hours_locked": False,
        "status": "draft",
        "created_by": current_user["_id"],
    }

    result = await events_collection.insert_one(event)

    return {
        "message": "Event created successfully",
        "event_id": str(result.inserted_id),
        "credited_hours_locked": False,
    }


@router.get("")
async def get_events(
    current_user=Depends(get_current_user),
):
    events = []

    async for event in events_collection.find({}).sort("date", 1):
        events.append(serialize_event(event))

    return events


@router.get("/{event_id}")
async def get_event(
    event_id: str,
    current_user=Depends(get_current_user),
):
    event = await events_collection.find_one({
        "_id": parse_event_id(event_id)
    })

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return serialize_event(event)


@router.patch("/{event_id}")
async def update_event(
    event_id: str,
    data: EventUpdate,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)

    event = await events_collection.find_one({"_id": object_id})

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.get("status") in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed or cancelled events cannot be edited",
        )

    update_data = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes provided",
        )

    # Validate the merged times, not just the fields in this PATCH.
    start_value = update_data.get(
        "start_time", event.get("start_time")
    )
    end_value = update_data.get(
        "end_time", event.get("end_time")
    )

    try:
        start_time = (
            start_value
            if isinstance(start_value, time)
            else time.fromisoformat(start_value)
        )
        end_time = (
            end_value
            if isinstance(end_value, time)
            else time.fromisoformat(end_value)
        )
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event start or end time",
        )

    if end_time <= start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event end time must be after start time",
        )

    if "start_time" in update_data:
        update_data["start_time"] = start_time.strftime("%H:%M")

    if "end_time" in update_data:
        update_data["end_time"] = end_time.strftime("%H:%M")

    if "event_type" in update_data:
        update_data["event_type"] = update_data["event_type"].value

    changing_hours = (
        "credited_hours" in update_data
        and update_data["credited_hours"] != event.get("credited_hours")
    )

    if changing_hours and event.get("credited_hours_locked", False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Credited hours are locked because attendance has "
                "already been recorded. Use the authorized correction "
                "process if the original hours were incorrect."
            ),
        )

    # If this update changes hours, make the lock check atomic.
    # This helps prevent a simultaneous attendance request from
    # racing with an hours edit.
    query = {"_id": object_id}

    if changing_hours:
        query["credited_hours_locked"] = {"$ne": True}

    result = await events_collection.update_one(
        query,
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Credited hours have been locked. "
                "Refresh the event before making further changes."
            ),
        )

    return {"message": "Event updated successfully"}


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)
    event = await events_collection.find_one({"_id": object_id})

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.get("status") != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft events can be deleted",
        )

    await events_collection.delete_one({"_id": object_id})

    return {"message": "Event deleted successfully"}


# =========================================================
# PUBLISH EVENT
# =========================================================

@router.post("/{event_id}/publish")
async def publish_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)
    event = await events_collection.find_one({"_id": object_id})

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.get("status") != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft events can be published",
        )

    await events_collection.update_one(
        {"_id": object_id, "status": "draft"},
        {"$set": {"status": "published"}},
    )

    return {
        "message": "Event published successfully",
        "notice": (
            "Review the event details before publishing. "
            "Credited hours will lock when attendance is first recorded."
        ),
    }


# =========================================================
# START EVENT
# =========================================================

@router.post("/{event_id}/start")
async def start_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)
    result = await events_collection.update_one(
        {"_id": object_id, "status": "published"},
        {"$set": {"status": "ongoing"}},
    )

    if result.matched_count == 0:
        event = await events_collection.find_one({"_id": object_id})

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only published events can be started",
        )

    return {"message": "Event started successfully"}


# =========================================================
# COMPLETE EVENT
# =========================================================

@router.post("/{event_id}/complete")
async def complete_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)
    result = await events_collection.update_one(
        {"_id": object_id, "status": "ongoing"},
        {"$set": {"status": "completed"}},
    )

    if result.matched_count == 0:
        event = await events_collection.find_one({"_id": object_id})

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ongoing events can be completed",
        )

    return {"message": "Event completed successfully"}


# =========================================================
# CANCEL EVENT
# =========================================================

@router.post("/{event_id}/cancel")
async def cancel_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    object_id = parse_event_id(event_id)
    event = await events_collection.find_one({"_id": object_id})

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.get("status") in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event cannot be cancelled",
        )

    # Do not cancel an event after attendance has started being recorded.
    attendance_exists = await event_attendance_collection.find_one({
        "event_id": object_id
    })

    if attendance_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This event already has attendance records. "
                "Resolve its attendance and service-hour records before "
                "cancelling it."
            ),
        )

    result = await events_collection.update_one(
        {
            "_id": object_id,
            "status": {"$in": ["draft", "published"]},
        },
        {"$set": {"status": "cancelled"}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The event status changed. Refresh and try again.",
        )

    return {"message": "Event cancelled successfully"}
