from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter


# =========================================================
# GENERATE EVENT EXCEL REPORT
# =========================================================

def generate_event_excel(report_data: dict) -> BytesIO:

    workbook = Workbook()

    # =====================================================
    # COMMON STYLES
    # =====================================================

    title_font = Font(
        bold=True,
        size=16,
    )

    section_font = Font(
        bold=True,
        size=12,
    )

    header_font = Font(
        bold=True,
    )

    normal_alignment = Alignment(
        vertical="center",
        wrap_text=True,
    )

    center_alignment = Alignment(
        horizontal="center",
        vertical="center",
        wrap_text=True,
    )

    thin_border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )

    # =====================================================
    # SHEET 1 — EVENT SUMMARY
    # =====================================================

    sheet = workbook.active
    sheet.title = "Event Summary"

    sheet.merge_cells("A1:D1")
    sheet["A1"] = "NSS EVENT REPORT"
    sheet["A1"].font = title_font
    sheet["A1"].alignment = center_alignment

    sheet.merge_cells("A2:D2")
    sheet["A2"] = "NAAC-Style Event Documentation"
    sheet["A2"].alignment = center_alignment

    summary_data = [
        ("Event Title", report_data.get("event_title", "")),
        ("Event Type", report_data.get("event_type", "")),
        ("Description", report_data.get("description", "")),
        ("Date", report_data.get("date", "")),
        ("Start Time", report_data.get("start_time", "")),
        ("End Time", report_data.get("end_time", "")),
        ("Venue", report_data.get("venue", "")),
        ("Status", report_data.get("status", "")),
    ]

    row = 4

    for label, value in summary_data:

        sheet.cell(
            row=row,
            column=1,
            value=label,
        )

        sheet.cell(
            row=row,
            column=2,
            value=value,
        )

        sheet.cell(
            row=row,
            column=1,
        ).font = header_font

        sheet.cell(
            row=row,
            column=1,
        ).border = thin_border

        sheet.cell(
            row=row,
            column=2,
        ).border = thin_border

        sheet.cell(
            row=row,
            column=1,
        ).alignment = normal_alignment

        sheet.cell(
            row=row,
            column=2,
        ).alignment = normal_alignment

        # Give the value area more room
        sheet.merge_cells(
            start_row=row,
            start_column=2,
            end_row=row,
            end_column=4,
        )

        row += 1

    # =====================================================
    # PARTICIPATION SUMMARY
    # =====================================================

    row += 1

    sheet.merge_cells(
        start_row=row,
        start_column=1,
        end_row=row,
        end_column=4,
    )

    sheet.cell(
        row=row,
        column=1,
        value="Participation & Service Hours",
    )

    sheet.cell(
        row=row,
        column=1,
    ).font = section_font

    row += 1

    participation_headers = [
        "Registered Volunteers",
        "Attended Volunteers",
        "Absent Volunteers",
        "Attendance %",
    ]

    participation_values = [
        report_data.get("registered_volunteers", 0),
        report_data.get("attended_volunteers", 0),
        report_data.get("absent_volunteers", 0),
        report_data.get("attendance_percentage", 0),
    ]

    for column, value in enumerate(
        participation_headers,
        start=1,
    ):
        cell = sheet.cell(
            row=row,
            column=column,
            value=value,
        )

        cell.font = header_font
        cell.border = thin_border
        cell.alignment = center_alignment

    row += 1

    for column, value in enumerate(
        participation_values,
        start=1,
    ):
        cell = sheet.cell(
            row=row,
            column=column,
            value=value,
        )

        cell.border = thin_border
        cell.alignment = center_alignment

    row += 2

    service_headers = [
        "Service Hours / Volunteer",
        "Total Service Hours",
    ]

    service_values = [
        report_data.get(
            "credited_hours_per_volunteer",
            0,
        ),
        report_data.get(
            "total_service_hours",
            0,
        ),
    ]

    for column, value in enumerate(
        service_headers,
        start=1,
    ):
        cell = sheet.cell(
            row=row,
            column=column,
            value=value,
        )

        cell.font = header_font
        cell.border = thin_border
        cell.alignment = center_alignment

    row += 1

    for column, value in enumerate(
        service_values,
        start=1,
    ):
        cell = sheet.cell(
            row=row,
            column=column,
            value=value,
        )

        cell.border = thin_border
        cell.alignment = center_alignment

    # =====================================================
    # COLUMN WIDTHS
    # =====================================================

    sheet.column_dimensions["A"].width = 28
    sheet.column_dimensions["B"].width = 28
    sheet.column_dimensions["C"].width = 25
    sheet.column_dimensions["D"].width = 25

    # =====================================================
    # SHEET 2 — YEAR BREAKDOWN
    # =====================================================

    year_sheet = workbook.create_sheet(
        "Year Breakdown"
    )

    year_sheet.merge_cells("A1:D1")
    year_sheet["A1"] = "YEAR-WISE VOLUNTEER PARTICIPATION"
    year_sheet["A1"].font = title_font
    year_sheet["A1"].alignment = center_alignment

    year_headers = [
        "Year",
        "Registered Volunteers",
        "Attended Volunteers",
        "Absent Volunteers",
    ]

    for column, header in enumerate(
        year_headers,
        start=1,
    ):
        cell = year_sheet.cell(
            row=3,
            column=column,
            value=header,
        )

        cell.font = header_font
        cell.border = thin_border
        cell.alignment = center_alignment

    row = 4

    for item in report_data.get(
        "year_breakdown",
        [],
    ):

        values = [
            item.get("year"),
            item.get(
                "registered_volunteers",
                0,
            ),
            item.get(
                "attended_volunteers",
                0,
            ),
            item.get(
                "absent_volunteers",
                0,
            ),
        ]

        for column, value in enumerate(
            values,
            start=1,
        ):
            cell = year_sheet.cell(
                row=row,
                column=column,
                value=value,
            )

            cell.border = thin_border
            cell.alignment = center_alignment

        row += 1

    for column in range(1, 5):
        year_sheet.column_dimensions[
            get_column_letter(column)
        ].width = 25

    # =====================================================
    # SHEET 3 — CLASS BREAKDOWN
    # =====================================================

    class_sheet = workbook.create_sheet(
        "Class Breakdown"
    )

    class_sheet.merge_cells("A1:D1")
    class_sheet["A1"] = "CLASS-WISE VOLUNTEER PARTICIPATION"
    class_sheet["A1"].font = title_font
    class_sheet["A1"].alignment = center_alignment

    class_headers = [
        "Class",
        "Registered Volunteers",
        "Attended Volunteers",
        "Absent Volunteers",
    ]

    for column, header in enumerate(
        class_headers,
        start=1,
    ):
        cell = class_sheet.cell(
            row=3,
            column=column,
            value=header,
        )

        cell.font = header_font
        cell.border = thin_border
        cell.alignment = center_alignment

    row = 4

    for item in report_data.get(
        "class_breakdown",
        [],
    ):

        values = [
            item.get("class_name", ""),
            item.get(
                "registered_volunteers",
                0,
            ),
            item.get(
                "attended_volunteers",
                0,
            ),
            item.get(
                "absent_volunteers",
                0,
            ),
        ]

        for column, value in enumerate(
            values,
            start=1,
        ):
            cell = class_sheet.cell(
                row=row,
                column=column,
                value=value,
            )

            cell.border = thin_border
            cell.alignment = center_alignment

        row += 1

    for column in range(1, 5):
        class_sheet.column_dimensions[
            get_column_letter(column)
        ].width = 28

    # =====================================================
    # SHEET 4 — EVIDENCE
    # =====================================================

    evidence_sheet = workbook.create_sheet(
        "Evidence"
    )

    evidence_sheet.merge_cells("A1:E1")
    evidence_sheet["A1"] = "EVENT EVIDENCE / PHOTOS"
    evidence_sheet["A1"].font = title_font
    evidence_sheet["A1"].alignment = center_alignment

    evidence_headers = [
        "File Name",
        "File URL",
        "ImageKit File ID",
        "Uploaded By",
        "Uploaded At",
    ]

    for column, header in enumerate(
        evidence_headers,
        start=1,
    ):
        cell = evidence_sheet.cell(
            row=3,
            column=column,
            value=header,
        )

        cell.font = header_font
        cell.border = thin_border
        cell.alignment = center_alignment

    row = 4

    for photo in report_data.get(
        "evidence_photos",
        [],
    ):

        values = [
            photo.get("file_name", ""),
            photo.get("file_url", ""),
            photo.get(
                "imagekit_file_id",
                "",
            ),
            photo.get(
                "uploaded_by",
                "",
            ),
            photo.get(
                "uploaded_at",
                "",
            ),
        ]

        for column, value in enumerate(
            values,
            start=1,
        ):
            cell = evidence_sheet.cell(
                row=row,
                column=column,
                value=value,
            )

            cell.border = thin_border
            cell.alignment = normal_alignment

        row += 1

    evidence_widths = [
        30,
        60,
        30,
        25,
        30,
    ]

    for column, width in enumerate(
        evidence_widths,
        start=1,
    ):
        evidence_sheet.column_dimensions[
            get_column_letter(column)
        ].width = width

    # =====================================================
    # FREEZE PANES
    # =====================================================

    year_sheet.freeze_panes = "A4"
    class_sheet.freeze_panes = "A4"
    evidence_sheet.freeze_panes = "A4"

    # =====================================================
    # SAVE TO MEMORY
    # =====================================================

    output = BytesIO()

    workbook.save(output)

    output.seek(0)

    return output