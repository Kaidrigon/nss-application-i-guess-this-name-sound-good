from enum import Enum

from pydantic import BaseModel, Field


# =========================================================
# FILE TYPES
# =========================================================

class FileType(str, Enum):
    EVENT_PHOTO = "event_photo"
    CERTIFICATE = "certificate"
    DOCUMENT = "document"


# =========================================================
# SAVE FILE METADATA
# =========================================================

class FileCreate(BaseModel):

    file_type: FileType

    file_url: str = Field(
        ...,
        min_length=1,
        max_length=1000,
    )

    imagekit_file_id: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    file_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )