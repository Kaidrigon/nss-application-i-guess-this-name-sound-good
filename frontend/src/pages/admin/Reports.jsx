
import { useCallback, useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import {
    Assessment,
    Download,
    Event as EventIcon,
    Refresh,
    Description,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";
import api from "../../services/api";

import {
    getEventReport,
    exportEventReport,
} from "../../services/reports";

// =========================================================
// EVENT TYPES
// =========================================================

const EVENT_TYPES = {
    cleanliness: "Cleanliness",
    blood_donation: "Blood Donation",
    plantation: "Plantation",
    health_camp: "Health Camp",
    awareness: "Awareness",
    education: "Education",
    other: "Other",
};

// =========================================================
// HELPERS
// =========================================================

const getEventTypeLabel = (type) =>
    EVENT_TYPES[type] || type || "Other";

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const displayValue = (value, fallback = "—") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : fallback;
    }

    return String(value);
};

const safeFilename = (value) =>
    String(value || "NSS_Event_Report")
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
        .trim() || "NSS_Event_Report";

// Trigger a browser download from a Blob.
const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke after the browser has had time to start the download.
    window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 1000);
};

// Reusable report information card.
function InfoCard({ label, value, color }) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                border: "1px solid rgba(75, 22, 76, 0.10)",
                borderRadius: 3,
                ...(color ? { borderTop: `3px solid ${color}` } : {}),
            }}
        >
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>

                <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1, overflowWrap: "anywhere" }}
                >
                    {value ?? 0}
                </Typography>
            </CardContent>
        </Card>
    );
}

// Reusable section heading.
function SectionHeading({ title, subtitle }) {
    return (
        <>
            <Typography variant="h6" fontWeight={700}>
                {title}
            </Typography>

            {subtitle && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    {subtitle}
                </Typography>
            )}

            <Divider sx={{ my: 2 }} />
        </>
    );
}

// Reusable breakdown row.
function BreakdownRow({ title, label, item }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: "1.4fr 1fr 1fr 1fr",
                },
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(75, 22, 76, 0.035)",
            }}
        >
            <Box>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography fontWeight={700}>{title}</Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">
                    Registered
                </Typography>
                <Typography fontWeight={700}>
                    {item.registered_volunteers ?? 0}
                </Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">
                    Attended
                </Typography>
                <Typography fontWeight={700}>
                    {item.attended_volunteers ?? 0}
                </Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">
                    Absent
                </Typography>
                <Typography fontWeight={700}>
                    {item.absent_volunteers ?? 0}
                </Typography>
            </Box>
        </Box>
    );
}

// =========================================================
// COMPONENT
// =========================================================

function Reports() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [report, setReport] = useState(null);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingWord, setExportingWord] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isBusy =
        loadingEvents ||
        loadingReport ||
        exportingExcel ||
        exportingWord;

    // =====================================================
    // LOAD EVENTS
    // =====================================================

    const loadEvents = useCallback(async () => {
        try {
            setLoadingEvents(true);
            setError("");

            const response = await api.get("/events");
            const eventData = Array.isArray(response.data)
                ? response.data
                : [];

            setEvents(eventData);

            // Preserve the current selection if it still exists.
            setSelectedEventId((currentId) => {
                if (
                    currentId &&
                    eventData.some(
                        (event) => String(event.id) === String(currentId)
                    )
                ) {
                    return currentId;
                }

                return "";
            });

            setReport(null);
        } catch (err) {
            console.error("Failed to load events:", err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load events."
            );
        } finally {
            setLoadingEvents(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // =====================================================
    // GENERATE REPORT PREVIEW
    // =====================================================

    const handleGenerateReport = async () => {
        if (!selectedEventId) {
            setError("Please select an event first.");
            return;
        }

        try {
            setLoadingReport(true);
            setError("");
            setSuccess("");

            const data = await getEventReport(selectedEventId);

            setReport(data);
            setSuccess("Report generated successfully.");
        } catch (err) {
            console.error("Failed to generate report:", err);

            setReport(null);
            setError(
                err.response?.data?.detail ||
                    "Unable to generate report."
            );
        } finally {
            setLoadingReport(false);
        }
    };

    // =====================================================
    // EXPORT EXCEL
    // =====================================================

    const handleExportExcel = async () => {
        if (!selectedEventId) {
            setError("Please select an event first.");
            return;
        }

        try {
            setExportingExcel(true);
            setError("");
            setSuccess("");

            const blob = await exportEventReport(selectedEventId);

            const title =
                report?.event_title ||
                events.find(
                    (event) =>
                        String(event.id) === String(selectedEventId)
                )?.title;

            downloadBlob(
                blob,
                `${safeFilename(title)}_NSS_Report.xlsx`
            );

            setSuccess("Excel report exported successfully.");
        } catch (err) {
            console.error("Failed to export Excel report:", err);

            setError(
                err.response?.data?.detail ||
                    "Unable to export the Excel report."
            );
        } finally {
            setExportingExcel(false);
        }
    };

    // =====================================================
    // EXPORT WORD
    // =====================================================

    const handleExportWord = async () => {
        if (!selectedEventId) {
            setError("Please select an event first.");
            return;
        }

        try {
            setExportingWord(true);
            setError("");
            setSuccess("");

            // This endpoint must exist in the FastAPI backend:
            // GET /reports/event/{event_id}/word
            const response = await api.get(
                `/reports/event/${encodeURIComponent(selectedEventId)}/word`,
                {
                    responseType: "blob",
                }
            );

            const blob = response.data;

            if (!(blob instanceof Blob) || blob.size === 0) {
                throw new Error("The server returned an empty Word file.");
            }

            const title =
                report?.event_title ||
                events.find(
                    (event) =>
                        String(event.id) === String(selectedEventId)
                )?.title;

            downloadBlob(
                blob,
                `${safeFilename(title)}_NSS_Report.docx`
            );

            setSuccess("Word report downloaded successfully.");
        } catch (err) {
            console.error("Failed to export Word report:", err);

            // Blob responses can contain a JSON error message.
            let message =
                "Unable to download the Word report. Check that the Word export endpoint is deployed.";

            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const details = JSON.parse(text);

                    message = details.detail || message;
                } catch {
                    // Keep the fallback message for non-JSON responses.
                }
            } else if (err.response?.data?.detail) {
                message = err.response.data.detail;
            } else if (err.message) {
                message = err.message;
            }

            setError(message);
        } finally {
            setExportingWord(false);
        }
    };

    // =====================================================
    // SELECTED EVENT
    // =====================================================

    const selectedEvent = events.find(
        (event) => String(event.id) === String(selectedEventId)
    );

    // =====================================================
    // UI
    // =====================================================

    return (
        <AdminDashboardLayout>
            {/* PAGE HEADER */}

            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1.75rem",
                                sm: "2rem",
                                md: "2.25rem",
                            },
                        }}
                    >
                        Reports
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Generate NSS participation, attendance, and
                        service-hour reports.
                    </Typography>
                </Box>
            </Box>

            {/* ALERTS */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>
            )}

            {/* EVENT SELECTOR AND ACTIONS */}

            <Card
                elevation={0}
                sx={{
                    border: "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 3,
                    borderRadius: 3,
                }}
            >
                <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                        Generate Event Report
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Select an event to view its report or download
                        it as an Excel spreadsheet or editable Word document.
                    </Typography>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems="stretch"
                    >
                        <FormControl
                            fullWidth
                            disabled={loadingEvents}
                        >
                            <InputLabel id="report-event-label">
                                Event
                            </InputLabel>

                            <Select
                                labelId="report-event-label"
                                value={selectedEventId}
                                label="Event"
                                onChange={(event) => {
                                    setSelectedEventId(event.target.value);
                                    setReport(null);
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                <MenuItem value="">
                                    Select an event
                                </MenuItem>

                                {events.map((event) => (
                                    <MenuItem
                                        key={event.id}
                                        value={event.id}
                                    >
                                        {event.title || "Untitled event"}
                                        {event.date
                                            ? ` — ${formatDate(event.date)}`
                                            : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={
                                loadingReport ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <Assessment />
                                )
                            }
                            onClick={handleGenerateReport}
                            disabled={!selectedEventId || isBusy}
                            sx={{
                                minHeight: 56,
                                minWidth: { xs: "100%", md: 180 },
                                flexShrink: 0,
                            }}
                        >
                            {loadingReport
                                ? "Generating..."
                                : "Generate Report"}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={
                                exportingExcel ? (
                                    <CircularProgress size={18} />
                                ) : (
                                    <Download />
                                )
                            }
                            onClick={handleExportExcel}
                            disabled={!selectedEventId || isBusy}
                            sx={{
                                minHeight: 56,
                                minWidth: { xs: "100%", md: 150 },
                                flexShrink: 0,
                            }}
                        >
                            {exportingExcel
                                ? "Exporting..."
                                : "Export Excel"}
                        </Button>

                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={
                                exportingWord ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <Description />
                                )
                            }
                            onClick={handleExportWord}
                            disabled={!selectedEventId || isBusy}
                            sx={{
                                minHeight: 56,
                                minWidth: { xs: "100%", md: 150 },
                                flexShrink: 0,
                            }}
                        >
                            {exportingWord
                                ? "Creating Word..."
                                : "Export Word"}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={loadEvents}
                            disabled={isBusy}
                            sx={{
                                minHeight: 56,
                                minWidth: { xs: "100%", md: 110 },
                                flexShrink: 0,
                            }}
                        >
                            Refresh
                        </Button>
                    </Stack>

                    {selectedEvent && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1.5 }}
                        >
                            Selected: {selectedEvent.title || "Untitled event"}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* LOADING STATE */}

            {loadingReport && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        py: 8,
                    }}
                >
                    <CircularProgress />
                    <Typography color="text.secondary">
                        Preparing report...
                    </Typography>
                </Box>
            )}

            {/* EMPTY STATE */}

            {!report && !loadingReport && (
                <Card
                    elevation={0}
                    sx={{
                        border: "1px solid rgba(75, 22, 76, 0.08)",
                        borderRadius: 3,
                    }}
                >
                    <CardContent
                        sx={{
                            minHeight: 280,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            px: 3,
                        }}
                    >
                        <EventIcon
                            sx={{
                                fontSize: 58,
                                color: "text.secondary",
                                mb: 1,
                            }}
                        />

                        <Typography variant="h6" fontWeight={700}>
                            No report generated
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, maxWidth: 500 }}
                        >
                            Select an event above and click Generate Report
                            to view its participation and attendance data.
                            You can also export the event directly to Excel
                            or Word.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* REPORT PREVIEW */}

            {report && !loadingReport && (
                <Stack spacing={3}>
                    {/* EVENT INFORMATION */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{ overflowWrap: "anywhere" }}
                            >
                                {displayValue(report.event_title, "Untitled Event")}
                            </Typography>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 0.5, sm: 3 }}
                                sx={{ mt: 1 }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Type:{" "}
                                    <strong>
                                        {getEventTypeLabel(report.event_type)}
                                    </strong>
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Date:{" "}
                                    <strong>{formatDate(report.date)}</strong>
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Time:{" "}
                                    <strong>
                                        {displayValue(report.start_time)} –{" "}
                                        {displayValue(report.end_time)}
                                    </strong>
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Venue:{" "}
                                    <strong>{displayValue(report.venue)}</strong>
                                </Typography>
                            </Stack>

                            {report.description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 2,
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {report.description}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* SUMMARY CARDS */}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Registered Volunteers"
                                value={report.registered_volunteers ?? 0}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Volunteers Attended"
                                value={report.attended_volunteers ?? 0}
                                color="#2e7d32"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Volunteers Absent"
                                value={report.absent_volunteers ?? 0}
                                color="#ed6c02"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Attendance"
                                value={`${Number(
                                    report.attendance_percentage ?? 0
                                ).toFixed(2)}%`}
                                color="#176b52"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Hours per Volunteer"
                                value={report.credited_hours_per_volunteer ?? 0}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Total Service Hours"
                                value={report.total_service_hours ?? 0}
                                color="#176b52"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Faculty Participants"
                                value={report.faculty_participants ?? "Not recorded"}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoCard
                                label="Beneficiaries"
                                value={report.beneficiaries ?? "Not recorded"}
                            />
                        </Grid>
                    </Grid>

                    {/* DOCUMENTATION DETAILS */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <SectionHeading
                                title="Event Documentation"
                                subtitle="Objectives, event summary, outcomes, and organizing details."
                            />

                            <Stack spacing={2}>
                                {[
                                    ["Introduction", report.introduction],
                                    ["Event Summary", report.event_summary],
                                    [
                                        "Objectives",
                                        report.objectives,
                                    ],
                                    ["Outcomes", report.outcomes],
                                    [
                                        "Faculty In Charge",
                                        report.faculty_in_charge,
                                    ],
                                    [
                                        "Organizing Team",
                                        report.organizing_team,
                                    ],
                                ].map(([label, value]) => (
                                    <Box key={label}>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={700}
                                        >
                                            {label}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                                whiteSpace: "pre-wrap",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {displayValue(value, "Not recorded")}
                                        </Typography>
                                    </Box>
                                ))}

                                <Divider />

                                <Typography variant="subtitle2" fontWeight={700}>
                                    Attendee Gender Breakdown
                                </Typography>

                                {report.male_attendees == null &&
                                report.female_attendees == null &&
                                report.other_gender_attendees == null ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Gender information has not been recorded
                                        for this report.
                                    </Typography>
                                ) : (
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Male
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {report.male_attendees ?? "Not recorded"}
                                            </Typography>
                                        </Grid>

                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Female
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {report.female_attendees ?? "Not recorded"}
                                            </Typography>
                                        </Grid>

                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Other recorded genders
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {report.other_gender_attendees ?? "Not recorded"}
                                            </Typography>
                                        </Grid>

                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Gender unrecorded
                                            </Typography>
                                            <Typography fontWeight={700}>
                                                {report.unrecorded_gender_attendees ?? "Not recorded"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* YEAR BREAKDOWN */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <SectionHeading
                                title="Year Breakdown"
                                subtitle="Volunteer registration and attendance by academic year."
                            />

                            {!report.year_breakdown?.length ? (
                                <Typography variant="body2" color="text.secondary">
                                    No year-wise report data available.
                                </Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {report.year_breakdown.map((item) => (
                                        <BreakdownRow
                                            key={item.year}
                                            title={`Year ${item.year}`}
                                            label="Academic Year"
                                            item={item}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                    {/* CLASS BREAKDOWN */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <SectionHeading
                                title="Class Breakdown"
                                subtitle="Volunteer registration and attendance by class."
                            />

                            {!report.class_breakdown?.length ? (
                                <Typography variant="body2" color="text.secondary">
                                    No class-wise report data available.
                                </Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {report.class_breakdown.map((item) => (
                                        <BreakdownRow
                                            key={item.class_name}
                                            title={item.class_name}
                                            label="Class"
                                            item={item}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                    {/* EVIDENCE PHOTOS */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <SectionHeading
                                title="Evidence Photos"
                                subtitle="Photos attached to this event."
                            />

                            {!report.evidence_photos?.length ? (
                                <Typography variant="body2" color="text.secondary">
                                    No evidence photos uploaded for this event.
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {report.evidence_photos.map((photo, index) => {
                                        const photoUrl =
                                            typeof photo === "string"
                                                ? photo
                                                : photo.file_url || photo.url;

                                        if (!photoUrl) return null;

                                        return (
                                            <Grid
                                                key={
                                                    photo.id ||
                                                    photo.imagekit_file_id ||
                                                    index
                                                }
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                    md: 4,
                                                    lg: 3,
                                                }}
                                            >
                                                <Box
                                                    component="a"
                                                    href={photoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    sx={{
                                                        display: "block",
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={photoUrl}
                                                        alt={`Event evidence ${index + 1}`}
                                                        loading="lazy"
                                                        sx={{
                                                            width: "100%",
                                                            aspectRatio: "4 / 3",
                                                            objectFit: "cover",
                                                            borderRadius: 2,
                                                            display: "block",
                                                            backgroundColor: "action.hover",
                                                        }}
                                                    />
                                                </Box>

                                                {photo.file_name && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: "block",
                                                            mt: 0.5,
                                                            overflowWrap: "anywhere",
                                                        }}
                                                    >
                                                        {photo.file_name}
                                                    </Typography>
                                                )}
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>

                    {/* DOWNLOAD ACTIONS AT THE BOTTOM TOO */}

                    <Card
                        elevation={0}
                        sx={{
                            border: "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={700}>
                                Download This Report
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5, mb: 2 }}
                            >
                                Download the report for editing, sharing,
                                or maintaining your college's event records.
                            </Typography>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        exportingExcel ? (
                                            <CircularProgress size={18} />
                                        ) : (
                                            <Download />
                                        )
                                    }
                                    onClick={handleExportExcel}
                                    disabled={isBusy}
                                    fullWidth
                                >
                                    {exportingExcel
                                        ? "Exporting Excel..."
                                        : "Download Excel"}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={
                                        exportingWord ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Description />
                                        )
                                    }
                                    onClick={handleExportWord}
                                    disabled={isBusy}
                                    fullWidth
                                >
                                    {exportingWord
                                        ? "Creating Word Document..."
                                        : "Download Word Document"}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}
        </AdminDashboardLayout>
    );
}

export default Reports;
