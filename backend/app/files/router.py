from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import (
    get_current_user,
    require_staff,
)

from app.database import (
    users_collection,
    events_collection,
    files_collection,
)

from app.files.schemas import (
    FileCreate,
)


router = APIRouter(
    prefix="/files",
    tags=["Files"],
)


# =========================================================
# SAVE EVENT PHOTO
# =========================================================

@router.post(
    "/event/{event_id}",
    status_code=status.HTTP_201_CREATED,
)
async def save_event_photo(
    event_id: str,
    data: FileCreate,
    current_user=Depends(require_staff),
):

    # -----------------------------------------------------
    # Only event photos are allowed here
    # -----------------------------------------------------

    if data.file_type != "event_photo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint is only for event photos",
        )

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
    # Make sure event exists
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
    # Create event photo metadata
    # -----------------------------------------------------

    file_document = {
        "file_type": data.file_type,
        "file_url": data.file_url,
        "imagekit_file_id": data.imagekit_file_id,
        "file_name": data.file_name,
        "uploaded_by": current_user["_id"],
        "event_id": event_object_id,
        "uploaded_at": datetime.now(timezone.utc),
    }

    # -----------------------------------------------------
    # Save metadata
    # -----------------------------------------------------

    result = await files_collection.insert_one(
        file_document
    )

    return {
        "message": "Event photo saved successfully",
        "file_id": str(result.inserted_id),
        "event_id": event_id,
    }


# =========================================================
# SAVE MY CERTIFICATE / DOCUMENT
# =========================================================

@router.post(
    "/my",
    status_code=status.HTTP_201_CREATED,
)
async def save_my_file(
    data: FileCreate,
    current_user=Depends(get_current_user),
):

    # -----------------------------------------------------
    # Only certificates/documents are allowed here
    # -----------------------------------------------------

    if data.file_type not in [
        "certificate",
        "document",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only certificates and documents can be uploaded here",
        )

    # -----------------------------------------------------
    # Create personal file metadata
    # -----------------------------------------------------

    file_document = {
        "file_type": data.file_type,
        "file_url": data.file_url,
        "imagekit_file_id": data.imagekit_file_id,
        "file_name": data.file_name,
        "uploaded_by": current_user["_id"],
        "user_id": current_user["_id"],
        "uploaded_at": datetime.now(timezone.utc),
    }

    # -----------------------------------------------------
    # Save metadata
    # -----------------------------------------------------

    result = await files_collection.insert_one(
        file_document
    )

    return {
        "message": "File saved successfully",
        "file_id": str(result.inserted_id),
        "user_id": str(current_user["_id"]),
    }


# =========================================================
# SAVE FILE FOR A USER
# ADMIN / COORDINATOR
# =========================================================

# @router.post(
#     "/user/{user_id}",
#     status_code=status.HTTP_201_CREATED,
# )
# async def save_user_file(
#     user_id: str,
#     data: FileCreate,
#     current_user=Depends(require_staff),
# ):

#     # -----------------------------------------------------
#     # Event photos must use the event endpoint
#     # -----------------------------------------------------

#     if data.file_type == "event_photo":
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Event photos must be uploaded using the event endpoint",
#         )

#     # -----------------------------------------------------
#     # Only certificates/documents allowed
#     # -----------------------------------------------------

#     if data.file_type not in [
#         "certificate",
#         "document",
#     ]:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Only certificates and documents are allowed",
#         )

#     # -----------------------------------------------------
#     # Validate user ID
#     # -----------------------------------------------------

#     try:
#         user_object_id = ObjectId(user_id)
#     except Exception:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid user ID",
#         )

#     # -----------------------------------------------------
#     # Make sure user exists
#     # -----------------------------------------------------

#     user = await users_collection.find_one(
#         {"_id": user_object_id}
#     )

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found",
#         )

#     # -----------------------------------------------------
#     # Create file metadata
#     # -----------------------------------------------------

#     file_document = {
#         "file_type": data.file_type,
#         "file_url": data.file_url,
#         "imagekit_file_id": data.imagekit_file_id,
#         "file_name": data.file_name,
#         "uploaded_by": current_user["_id"],
#         "user_id": user_object_id,
#         "uploaded_at": datetime.now(timezone.utc),
#     }

#     # -----------------------------------------------------
#     # Save metadata
#     # -----------------------------------------------------

#     result = await files_collection.insert_one(
#         file_document
#     )

#     return {
#         "message": "User file saved successfully",
#         "file_id": str(result.inserted_id),
#         "user_id": user_id,
#     }


# =========================================================
# GET EVENT PHOTOS
# =========================================================

@router.get("/event/{event_id}")
async def get_event_photos(
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
    # Make sure event exists
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
    # Find event photos
    # -----------------------------------------------------

    cursor = files_collection.find(
        {
            "event_id": event_object_id,
            "file_type": "event_photo",
        }
    ).sort(
        "uploaded_at",
        1,
    )

    photos = []

    async for file in cursor:

        photos.append(
            {
                "id": str(file["_id"]),
                "file_name": file["file_name"],
                "file_url": file["file_url"],
                "imagekit_file_id": file["imagekit_file_id"],
                "uploaded_by": str(file["uploaded_by"]),
                "uploaded_at": file["uploaded_at"],
            }
        )

    return {
        "event_id": event_id,
        "photos": photos,
        "total_photos": len(photos),
    }


# =========================================================
# GET MY FILES
# =========================================================

@router.get("/my")
async def get_my_files(
    current_user=Depends(get_current_user),
):

    cursor = files_collection.find(
        {
            "user_id": current_user["_id"],
        }
    ).sort(
        "uploaded_at",
        -1,
    )

    files = []

    async for file in cursor:

        files.append(
            {
                "id": str(file["_id"]),
                "file_type": file["file_type"],
                "file_name": file["file_name"],
                "file_url": file["file_url"],
                "imagekit_file_id": file["imagekit_file_id"],
                "uploaded_at": file["uploaded_at"],
            }
        )

    return {
        "files": files,
        "total_files": len(files),
    }


# =========================================================
# GET USER FILES
# ADMIN / COORDINATOR
# =========================================================

@router.get("/user/{user_id}")
async def get_user_files(
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
    # Make sure user exists
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
    # Get files
    # -----------------------------------------------------

    cursor = files_collection.find(
        {
            "user_id": user_object_id,
        }
    ).sort(
        "uploaded_at",
        -1,
    )

    files = []

    async for file in cursor:

        files.append(
            {
                "id": str(file["_id"]),
                "file_type": file["file_type"],
                "file_name": file["file_name"],
                "file_url": file["file_url"],
                "imagekit_file_id": file["imagekit_file_id"],
                "uploaded_at": file["uploaded_at"],
            }
        )

    return {
        "user_id": user_id,
        "files": files,
        "total_files": len(files),
    }
