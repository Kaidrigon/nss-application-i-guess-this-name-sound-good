from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from fastapi.responses import StreamingResponse

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

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


# =========================================================
# GENERATE EVENT REPORT
# =========================================================

@router.get(
    "/event/{event_id}",
    response_model=EventReportResponse,
)
async def generate_event_report(
    event_id: str,
    current_user=Depends(require_staff),
):

    # =====================================================
    # VALIDATE EVENT ID
    # =====================================================

    try:
        event_object_id = ObjectId(event_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID",
        )

    # =====================================================
    # FIND EVENT
    # =====================================================

    event = await events_collection.find_one(
        {"_id": event_object_id}
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # =====================================================
    # GET REGISTERED VOLUNTEERS
    # =====================================================

    registered_cursor = event_registrations_collection.find(
        {
            "event_id": event_object_id,
            "status": "registered",
        }
    )

    registered_users = []

    async for registration in registered_cursor:

        user = await users_collection.find_one(
            {
                "_id": registration["user_id"]
            }
        )

        if user:
            registered_users.append(user)

    registered_count = len(registered_users)

    # =====================================================
    # GET ALL ATTENDANCE RECORDS FOR THIS EVENT
    # =====================================================

    attendance_cursor = event_attendance_collection.find(
        {
            "event_id": event_object_id,
        }
    )

    attendance_by_user = {}

    async for attendance in attendance_cursor:

        user_id = attendance.get("user_id")

        if user_id:
            attendance_by_user[user_id] = attendance.get(
                "status",
                ""
            )

    # =====================================================
    # ATTENDANCE COUNTS
    # =====================================================

    attended_count = sum(
        1
        for user_id in attendance_by_user
        if attendance_by_user[user_id] == "attended"
    )

    absent_count = sum(
        1
        for user_id in attendance_by_user
        if attendance_by_user[user_id] == "absent"
    )

    # =====================================================
    # ATTENDANCE PERCENTAGE
    # =====================================================

    if registered_count > 0:

        attendance_percentage = (
            attended_count / registered_count
        ) * 100

    else:

        attendance_percentage = 0.0

    # =====================================================
    # SERVICE HOURS
    # =====================================================

    credited_hours = float(
        event.get(
            "credited_hours",
            0,
        )
    )

    total_service_hours = (
        attended_count * credited_hours
    )

    # =====================================================
    # YEAR BREAKDOWN
    # =====================================================

    year_data = {}

    for user in registered_users:

        year = user.get("year")

        if year is None:
            continue

        if year not in year_data:

            year_data[year] = {
                "registered_volunteers": 0,
                "attended_volunteers": 0,
                "absent_volunteers": 0,
            }

        year_data[year]["registered_volunteers"] += 1

        attendance_status = attendance_by_user.get(
            user["_id"]
        )

        if attendance_status == "attended":

            year_data[year]["attended_volunteers"] += 1

        elif attendance_status == "absent":

            year_data[year]["absent_volunteers"] += 1

    year_breakdown = []

    for year in sorted(year_data.keys()):

        year_breakdown.append(
            {
                "year": year,

                "registered_volunteers": year_data[year][
                    "registered_volunteers"
                ],

                "attended_volunteers": year_data[year][
                    "attended_volunteers"
                ],

                "absent_volunteers": year_data[year][
                    "absent_volunteers"
                ],
            }
        )

    # =====================================================
    # CLASS BREAKDOWN
    # =====================================================

    class_data = {}

    for user in registered_users:

        class_name = user.get("class_name")

        if not class_name:
            class_name = "Unknown"

        if class_name not in class_data:

            class_data[class_name] = {
                "registered_volunteers": 0,
                "attended_volunteers": 0,
                "absent_volunteers": 0,
            }

        class_data[class_name]["registered_volunteers"] += 1

        attendance_status = attendance_by_user.get(
            user["_id"]
        )

        if attendance_status == "attended":

            class_data[class_name][
                "attended_volunteers"
            ] += 1

        elif attendance_status == "absent":

            class_data[class_name][
                "absent_volunteers"
            ] += 1

    class_breakdown = []

    for class_name in sorted(class_data.keys()):

        class_breakdown.append(
            {
                "class_name": class_name,

                "registered_volunteers": class_data[
                    class_name
                ][
                    "registered_volunteers"
                ],

                "attended_volunteers": class_data[
                    class_name
                ][
                    "attended_volunteers"
                ],

                "absent_volunteers": class_data[
                    class_name
                ][
                    "absent_volunteers"
                ],
            }
        )

    # =====================================================
    # GET EVENT EVIDENCE PHOTOS
    # =====================================================

    evidence_cursor = files_collection.find(
        {
            "event_id": event_object_id,
            "file_type": "event_photo",
        }
    ).sort(
        "uploaded_at",
        1,
    )

    evidence_photos = []

    async for file in evidence_cursor:

        uploaded_at = file.get("uploaded_at")

        if uploaded_at:

            uploaded_at = uploaded_at.isoformat()

        else:

            uploaded_at = ""

        evidence_photos.append(
            {
                "id": str(file["_id"]),

                "file_name": file.get(
                    "file_name",
                    "",
                ),

                "file_url": file.get(
                    "file_url",
                    "",
                ),

                "imagekit_file_id": file.get(
                    "imagekit_file_id",
                    "",
                ),

                "uploaded_by": str(
                    file.get(
                        "uploaded_by"
                    )
                ),

                "uploaded_at": uploaded_at,
            }
        )

    # =====================================================
    # RETURN COMPLETE REPORT
    # =====================================================

    return {

        "event_id": str(
            event["_id"]
        ),

        "event_title": event.get(
            "title",
            "",
        ),

        "event_type": event.get(
            "event_type",
            "",
        ),

        "description": event.get(
            "description",
            "",
        ),

        "date": str(
            event.get(
                "date",
                "",
            )
        ),

        "start_time": str(
            event.get(
                "start_time",
                "",
            )
        ),

        "end_time": str(
            event.get(
                "end_time",
                "",
            )
        ),

        "venue": event.get(
            "venue",
            "",
        ),

        "status": event.get(
            "status",
            "",
        ),

        "registered_volunteers": registered_count,

        "attended_volunteers": attended_count,

        "absent_volunteers": absent_count,

        "attendance_percentage": round(
            attendance_percentage,
            2,
        ),

        "credited_hours_per_volunteer": credited_hours,

        "total_service_hours": total_service_hours,

        "year_breakdown": year_breakdown,

        "class_breakdown": class_breakdown,

        "evidence_photos": evidence_photos,
    }

# =========================================================
# GENERATE EVENT EXCEL REPORT
# =========================================================

@router.get("/event/{event_id}/excel")
async def generate_event_excel_report(
    event_id: str,
    current_user=Depends(require_staff),
):

    # -----------------------------------------------------
    # Generate the existing event report data
    # -----------------------------------------------------

    report_data = await generate_event_report(
        event_id,
        current_user,
    )

    # -----------------------------------------------------
    # Convert report data into Excel
    # -----------------------------------------------------

    excel_file = generate_event_excel(
        report_data
    )

    # -----------------------------------------------------
    # Create safe filename
    # -----------------------------------------------------

    event_title = report_data.get(
        "event_title",
        "NSS_Event_Report",
    )

    safe_title = "".join(
        character
        if character.isalnum() or character in " _-"
        else "_"
        for character in event_title
    )

    filename = (
        f"{safe_title}_NSS_Report.xlsx"
    )

    # -----------------------------------------------------
    # Return Excel file
    # -----------------------------------------------------

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )