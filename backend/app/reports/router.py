from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from bson import ObjectId

from app.auth.dependencies import require_staff
from app.database import (
    users_collection,
    events_collection,
    event_registrations_collection,
    event_attendance_collection,
    files_collection,
)
from app.reports.schemas import EventReportResponse
from app.reports.excel_generator import generate_event_excel
from app.reports.word_generator import generate_event_word


router = APIRouter(prefix="/reports", tags=["Reports"])


def to_text(value):
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return str(value)


def to_string_list(value):
    if value is None:
        return []
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if item is not None and str(item).strip()
        ]
    return []


@router.get(
    "/event/{event_id}",
    response_model=EventReportResponse,
)
async def generate_event_report(
    event_id: str,
    current_user=Depends(require_staff),
):
    try:
        event_object_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Get registered volunteers.
    registered_cursor = event_registrations_collection.find({
        "event_id": event_object_id,
        "status": "registered",
    })

    registered_users = []
    registered_ids = set()

    async for registration in registered_cursor:
        user_id = registration.get("user_id")
        if not user_id:
            continue

        user = await users_collection.find_one({"_id": user_id})
        if user and user_id not in registered_ids:
            registered_users.append(user)
            registered_ids.add(user_id)

    # Get attendance only for registered volunteers.
    attendance_cursor = event_attendance_collection.find({
        "event_id": event_object_id,
    })

    attendance_by_user = {}

    async for attendance in attendance_cursor:
        user_id = attendance.get("user_id")
        if user_id in registered_ids:
            attendance_by_user[user_id] = attendance.get("status", "")

    attended_count = sum(
        1 for user_id in registered_ids
        if attendance_by_user.get(user_id) == "attended"
    )
    absent_count = sum(
        1 for user_id in registered_ids
        if attendance_by_user.get(user_id) == "absent"
    )

    registered_count = len(registered_ids)
    attendance_percentage = (
        attended_count / registered_count * 100
        if registered_count else 0.0
    )

    credited_hours = float(event.get("credited_hours", 0) or 0)
    total_service_hours = attended_count * credited_hours

    # Year-wise breakdown.
    year_data = {}

    # Class-wise breakdown.
    class_data = {}

    for user in registered_users:
        user_id = user["_id"]
        attendance_status = attendance_by_user.get(user_id, "")
        year = user.get("year")
        class_name = user.get("class_name") or "Unknown"

        if year is not None:
            stats = year_data.setdefault(year, {
                "registered_volunteers": 0,
                "attended_volunteers": 0,
                "absent_volunteers": 0,
            })
            stats["registered_volunteers"] += 1

            if attendance_status == "attended":
                stats["attended_volunteers"] += 1
            elif attendance_status == "absent":
                stats["absent_volunteers"] += 1

        stats = class_data.setdefault(class_name, {
            "registered_volunteers": 0,
            "attended_volunteers": 0,
            "absent_volunteers": 0,
        })
        stats["registered_volunteers"] += 1

        if attendance_status == "attended":
            stats["attended_volunteers"] += 1
        elif attendance_status == "absent":
            stats["absent_volunteers"] += 1

    year_breakdown = [
        {"year": year, **year_data[year]}
        for year in sorted(year_data)
    ]

    class_breakdown = [
        {"class_name": name, **class_data[name]}
        for name in sorted(class_data)
    ]

    # Resolve evidence photos and uploader names.
    evidence_cursor = files_collection.find({
        "event_id": event_object_id,
        "file_type": "event_photo",
    }).sort("uploaded_at", 1)

    evidence_photos = []

    async for file in evidence_cursor:
        uploader_id = file.get("uploaded_by")
        uploader_name = ""

        if uploader_id:
            uploader = await users_collection.find_one(
                {"_id": uploader_id},
                {"name": 1},
            )
            uploader_name = (
                uploader.get("name", "")
                if uploader else str(uploader_id)
            )

        evidence_photos.append({
            "id": str(file["_id"]),
            "file_name": file.get("file_name", ""),
            "file_url": file.get("file_url", ""),
            "imagekit_file_id": file.get("imagekit_file_id", ""),
            "uploaded_by": uploader_name,
            "uploaded_at": to_text(file.get("uploaded_at")),
        })

    # Count recorded gender values among attendees only.
    # Missing or unrecognized values are not silently treated as zero.
    attended_users = [
        user for user in registered_users
        if attendance_by_user.get(user["_id"]) == "attended"
    ]

    gender_counts = {}
    for user in attended_users:
        gender = str(user.get("gender", "")).strip().lower()
        if gender:
            gender_counts[gender] = gender_counts.get(gender, 0) + 1

    known_gender_count = sum(gender_counts.values())
    has_gender_data = known_gender_count > 0

    # Accept either a list of names or a single name for team fields.
    faculty_in_charge = to_string_list(
        event.get("faculty_in_charge")
    )
    organizing_team = to_string_list(
        event.get("organizing_team")
    )
    objectives = to_string_list(event.get("objectives"))
    outcomes = to_string_list(event.get("outcomes"))

    return {
        "event_id": str(event["_id"]),
        "event_title": event.get("title", ""),
        "event_type": event.get("event_type", ""),
        "description": event.get("description", ""),
        "date": to_text(event.get("date")),
        "start_time": to_text(event.get("start_time")),
        "end_time": to_text(event.get("end_time")),
        "venue": event.get("venue", ""),
        "status": event.get("status", ""),

        "registered_volunteers": registered_count,
        "attended_volunteers": attended_count,
        "absent_volunteers": absent_count,
        "attendance_percentage": round(attendance_percentage, 2),
        "credited_hours_per_volunteer": credited_hours,
        "total_service_hours": total_service_hours,

        "year_breakdown": year_breakdown,
        "class_breakdown": class_breakdown,
        "evidence_photos": evidence_photos,

        "introduction": event.get("introduction", ""),
        "objectives": objectives,
        "event_summary": event.get("event_summary", ""),
        "outcomes": outcomes,

        "faculty_in_charge": faculty_in_charge,
        "organizing_team": organizing_team,

        "male_attendees": (
            gender_counts.get("male", 0) if has_gender_data else None
        ),
        "female_attendees": (
            gender_counts.get("female", 0) if has_gender_data else None
        ),
        "other_gender_attendees": (
            sum(
                count for gender, count in gender_counts.items()
                if gender not in {"male", "female"}
            ) if has_gender_data else None
        ),
        "unrecorded_gender_attendees": (
            attended_count - known_gender_count
            if has_gender_data else None
        ),

        # These remain unknown until the event records them.
        "faculty_participants": event.get("faculty_participants"),
        "beneficiaries": event.get("beneficiaries"),
    }


@router.get("/event/{event_id}/excel")
async def generate_event_excel_report(
    event_id: str,
    current_user=Depends(require_staff),
):
    report_data = await generate_event_report(event_id, current_user)

    excel_file = generate_event_excel(report_data)

    safe_title = "".join(
        char if char.isalnum() or char in " _-" else "_"
        for char in report_data.get("event_title", "NSS_Event_Report")
    ).strip()

    if not safe_title:
        safe_title = "NSS_Event_Report"

    filename = f"{safe_title}_NSS_Report.xlsx"

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )

@router.get("/event/{event_id}/word")
async def generate_event_word_report(
    event_id: str,
    current_user=Depends(require_staff),
):
    # Reuse the same report data as the Excel export.
    report_data = await generate_event_report(event_id, current_user)

    # Generate the Word document.
    word_file = generate_event_word(report_data)

    # Build a safe filename from the event title.
    safe_title = "".join(
        char if char.isalnum() or char in " _-" else "_"
        for char in report_data.get("event_title", "NSS_Event_Report")
    ).strip()

    if not safe_title:
        safe_title = "NSS_Event_Report"

    filename = f"{safe_title}_NSS_Report.docx"

    return StreamingResponse(
        word_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
