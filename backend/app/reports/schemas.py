from pydantic import BaseModel, Field


class YearBreakdown(BaseModel):
    year: int
    registered_volunteers: int
    attended_volunteers: int
    absent_volunteers: int


class ClassBreakdown(BaseModel):
    class_name: str
    registered_volunteers: int
    attended_volunteers: int
    absent_volunteers: int


class EventEvidencePhoto(BaseModel):
    id: str
    file_name: str
    file_url: str
    imagekit_file_id: str = ""
    uploaded_by: str = ""
    uploaded_at: str = ""


class EventReportResponse(BaseModel):
    # Existing event information
    event_id: str
    event_title: str
    event_type: str
    description: str
    date: str
    start_time: str
    end_time: str
    venue: str
    status: str

    # Existing participation metrics
    registered_volunteers: int
    attended_volunteers: int
    absent_volunteers: int
    attendance_percentage: float
    credited_hours_per_volunteer: float
    total_service_hours: float

    # Existing breakdowns
    year_breakdown: list[YearBreakdown]
    class_breakdown: list[ClassBreakdown]
    evidence_photos: list[EventEvidencePhoto]

    # Optional report documentation
    introduction: str = ""
    objectives: list[str] = Field(default_factory=list)
    event_summary: str = ""
    outcomes: list[str] = Field(default_factory=list)

    faculty_in_charge: list[str] = Field(default_factory=list)
    organizing_team: list[str] = Field(default_factory=list)

    male_attendees: int | None = None
    female_attendees: int | None = None
    other_gender_attendees: int | None = None
    unrecorded_gender_attendees: int | None = None

    faculty_participants: int | None = None
    beneficiaries: int | None = None