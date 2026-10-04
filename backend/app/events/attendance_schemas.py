from enum import Enum

from pydantic import BaseModel


# =========================================================
# ATTENDANCE STATUS
# =========================================================

class AttendanceStatus(str, Enum):
    ATTENDED = "attended"
    ABSENT = "absent"


# =========================================================
# MARK ATTENDANCE REQUEST
# =========================================================

class MarkAttendanceRequest(BaseModel):
    user_id: str
    status: AttendanceStatus