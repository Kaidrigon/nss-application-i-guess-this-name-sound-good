#here are all the event related routes will be 
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.auth.dependencies import (
    get_current_user,
    require_staff,
)

from app.database import (
    event_templates_collection,
    events_collection,
)

from app.events.schemas import (
    EventCreate,
    EventUpdate,
    EventTemplateCreate,
    EventTemplateUpdate,
)


router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


# =========================================================
# EVENT TEMPLATES
# =========================================================


# ---------------------------------------------------------
# CREATE TEMPLATE
# ---------------------------------------------------------

@router.post(
    "/templates",
    status_code=status.HTTP_201_CREATED,
)
async def create_event_template(
    data: EventTemplateCreate,
    current_user=Depends(require_staff),
):
    existing_template = await event_templates_collection.find_one(
        {"title": data.title}
    )

    if existing_template:
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

    result = await event_templates_collection.insert_one(
        template
    )

    return {
        "message": "Event template created successfully",
        "template_id": str(result.inserted_id),
    }


# ---------------------------------------------------------
# GET TEMPLATES
# ---------------------------------------------------------

@router.get("/templates")
async def get_event_templates(
    current_user=Depends(get_current_user),
):
    templates = []

    cursor = event_templates_collection.find({})

    async for template in cursor:
        templates.append(
            {
                "id": str(template["_id"]),
                "title": template["title"],
                "description": template["description"],
                "event_type": template["event_type"],
                "default_hours": template["default_hours"],
                "default_capacity": template["default_capacity"],
                "default_venue": template["default_venue"],
            }
        )

    return templates


# ---------------------------------------------------------
# # UPDATE TEMPLATE
# # ---------------------------------------------------------

# @router.patch("/templates/{template_id}")
# async def update_event_template(
#     template_id: str,
#     data: EventTemplateUpdate,
#     current_user=Depends(require_staff),
# ):
#     try:
#         object_id = ObjectId(template_id)

#     except Exception:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid template ID",
#         )

#     template = await event_templates_collection.find_one(
#         {"_id": object_id}
#     )

#     if not template:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Event template not found",
#         )

#     update_data = data.model_dump(
#         exclude_unset=True,
#         exclude_none=True,
#     )

#     if "event_type" in update_data:
#         update_data["event_type"] = update_data[
#             "event_type"
#         ].value

#     if "title" in update_data:
#         existing_template = await event_templates_collection.find_one(
#             {
#                 "title": update_data["title"],
#                 "_id": {"$ne": object_id},
#             }
#         )

#         if existing_template:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="An event template with this title already exists",
#             )

#     if not update_data:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="No changes provided",
#         )

#     await event_templates_collection.update_one(
#         {"_id": object_id},
#         {"$set": update_data},
#     )

#     return {
#         "message": "Event template updated successfully"
#     }


# =========================================================
# EVENTS
# =========================================================


# ---------------------------------------------------------
# CREATE EVENT FROM TEMPLATE
# ---------------------------------------------------------

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

    title = data.title or template["title"]

    description = (
        data.description
        if data.description is not None
        else template["description"]
    )

    event_type = (
        data.event_type.value
        if data.event_type is not None
        else template["event_type"]
    )

    credited_hours = (
        data.credited_hours
        if data.credited_hours is not None
        else template["default_hours"]
    )

    max_volunteers = (
        data.max_volunteers
        if data.max_volunteers is not None
        else template["default_capacity"]
    )

    venue = (
        data.venue
        if data.venue is not None
        else template["default_venue"]
    )

    if not venue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Venue is required",
        )

    event = {
        "template_id": template["_id"],
        "title": title,
        "description": description,
        "event_type": event_type,

        # Store JSON-friendly values in MongoDB
        "date": data.date.isoformat(),
        "start_time": data.start_time.strftime("%H:%M"),
        "end_time": data.end_time.strftime("%H:%M"),

        "venue": venue,
        "credited_hours": credited_hours,
        "max_volunteers": max_volunteers,

        "status": "draft",

        "created_by": current_user["_id"],
    }

    result = await events_collection.insert_one(event)

    return {
        "message": "Event created successfully",
        "event_id": str(result.inserted_id),
    }


# ---------------------------------------------------------
# GET ALL EVENTS
# ---------------------------------------------------------

@router.get("")
async def get_events(
    current_user=Depends(get_current_user),
):
    events = []

    cursor = events_collection.find({}).sort(
        "date",
        1,
    )

    async for event in cursor:
        events.append(
            {
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
                "max_volunteers": event["max_volunteers"],
                "status": event["status"],
            }
        )

    return events


# ---------------------------------------------------------
# GET SINGLE EVENT
# ---------------------------------------------------------

@router.get("/{event_id}")
async def get_event(
    event_id: str,
    current_user=Depends(get_current_user),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return {
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
        "max_volunteers": event["max_volunteers"],
        "status": event["status"],
    }


# ---------------------------------------------------------
# UPDATE EVENT
# ---------------------------------------------------------

@router.patch("/{event_id}")
async def update_event(
    event_id: str,
    data: EventUpdate,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Completed and cancelled events are historical records.
    if event["status"] in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed or cancelled events cannot be edited",
        )

    update_data = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if "event_type" in update_data:
        update_data["event_type"] = update_data[
            "event_type"
        ].value

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes provided",
        )

    await events_collection.update_one(
        {"_id": object_id},
        {"$set": update_data},
    )

    return {
        "message": "Event updated successfully"
    }


# ---------------------------------------------------------
# DELETE EVENT
# ---------------------------------------------------------

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Only draft events can be permanently deleted.
    if event["status"] != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft events can be deleted",
        )

    await events_collection.delete_one(
        {"_id": object_id}
    )

    return {
        "message": "Event deleted successfully"
    }


# =========================================================
# PUBLISH EVENT
# =========================================================

@router.post("/{event_id}/publish")
async def publish_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event["status"] != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft events can be published",
        )

    await events_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "published"
            }
        },
    )

    return {
        "message": "Event published successfully"
    }


# =========================================================
# START EVENT
# =========================================================

@router.post("/{event_id}/start")
async def start_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event["status"] != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only published events can be started",
        )

    await events_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "ongoing"
            }
        },
    )

    return {
        "message": "Event started successfully"
    }


# =========================================================
# COMPLETE EVENT
# =========================================================

@router.post("/{event_id}/complete")
async def complete_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event["status"] != "ongoing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ongoing events can be completed",
        )

    await events_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "completed"
            }
        },
    )

    return {
        "message": "Event completed successfully"
    }


# =========================================================
# CANCEL EVENT
# =========================================================

@router.post("/{event_id}/cancel")
async def cancel_event(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Completed and already cancelled events cannot be cancelled.
    if event["status"] in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event cannot be cancelled",
        )

    await events_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "cancelled"
            }
        },
    )

    return {
        "message": "Event cancelled successfully"
    }
