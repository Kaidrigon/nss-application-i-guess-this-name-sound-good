#this file is like the blueprints for the events yk 
from enum import Enum
from datetime import date as DateType
from datetime import time as TimeType

from pydantic import BaseModel, Field, model_validator


# =========================================================
# ENUMS
# =========================================================

class EventType(str, Enum):
    CLEANLINESS = "cleanliness"
    BLOOD_DONATION = "blood_donation"
    PLANTATION = "plantation"
    HEALTH_CAMP = "health_camp"
    AWARENESS = "awareness"
    EDUCATION = "education"
    OTHER = "other"


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# =========================================================
# EVENT TEMPLATE
# =========================================================

class EventTemplateCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )

    description: str = Field(
        ...,
        min_length=10,
        max_length=1000,
    )

    event_type: EventType

    default_hours: float = Field(
        ...,
        gt=0,
        le=24,
    )

    default_capacity: int | None = Field(
        default=None,
        gt=0,
        le=10000,
    )

    default_venue: str | None = Field(
        default=None,
        max_length=200,
    )


class EventTemplateUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
        max_length=1000,
    )

    event_type: EventType | None = None

    default_hours: float | None = Field(
        default=None,
        gt=0,
        le=24,
    )

    default_capacity: int | None = Field(
        default=None,
        gt=0,
        le=10000,
    )

    default_venue: str | None = Field(
        default=None,
        max_length=200,
    )


# =========================================================
# CREATE EVENT
# =========================================================

class EventCreate(BaseModel):
    template_id: str

    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
        max_length=1000,
    )

    event_type: EventType | None = None

    date: DateType

    start_time: TimeType

    end_time: TimeType

    venue: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    credited_hours: float | None = Field(
        default=None,
        gt=0,
        le=24,
    )

    max_volunteers: int | None = Field(
        default=None,
        gt=0,
        le=10000,
    )

    @model_validator(mode="after")
    def validate_time(self):
        if self.end_time <= self.start_time:
            raise ValueError(
                "End time must be after start time"
            )

        return self


# =========================================================
# UPDATE EVENT
# =========================================================

class EventUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
        max_length=1000,
    )

    event_type: EventType | None = None

    date: DateType | None = None

    start_time: TimeType | None = None

    end_time: TimeType | None = None

    venue: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    credited_hours: float | None = Field(
        default=None,
        gt=0,
        le=24,
    )

    max_volunteers: int | None = Field(
        default=None,
        gt=0,
        le=10000,
    )

    @model_validator(mode="after")
    def validate_time(self):
        if (
            self.start_time is not None
            and self.end_time is not None
            and self.end_time <= self.start_time
        ):
            raise ValueError(
                "End time must be after start time"
            )

        return self
