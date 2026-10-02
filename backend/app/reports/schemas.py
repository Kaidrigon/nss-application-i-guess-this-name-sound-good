from pydantic import BaseModel


# =========================================================
# YEAR BREAKDOWN
# =========================================================

class YearBreakdown(BaseModel):
    year: int
    registered_volunteers: int
    attended_volunteers: int
    absent_volunteers: int


# =========================================================
# CLASS BREAKDOWN
# =========================================================

class ClassBreakdown(BaseModel):
    class_name: str
    registered_volunteers: int
    attended_volunteers: int
    absent_volunteers: int


# =========================================================
# EVENT REPORT RESPONSE
# =========================================================

class EventReportResponse(BaseModel):
    event_id: str

    event_title: str

    event_type: str

    description: str

    date: str

    start_time: str

    end_time: str

    venue: str

    status: str

    # -----------------------------------------------------
    # Participation
    # -----------------------------------------------------

    registered_volunteers: int

    attended_volunteers: int

    absent_volunteers: int

    attendance_percentage: float

    # -----------------------------------------------------
    # Service hours
    # -----------------------------------------------------

    credited_hours_per_volunteer: float

    total_service_hours: float

    # -----------------------------------------------------
    # Academic breakdown
    # -----------------------------------------------------

    year_breakdown: list[YearBreakdown]

    class_breakdown: list[ClassBreakdown]
