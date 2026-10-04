import { useEffect, useState } from "react";

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

const getEventTypeLabel = (type) => {

    return EVENT_TYPES[type] || type || "Other";
};


const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(`${date}T00:00:00`);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


// =========================================================
// COMPONENT
// =========================================================

function Reports() {

    // =====================================================
    // EVENTS
    // =====================================================

    const [events, setEvents] =
        useState([]);

    const [selectedEventId, setSelectedEventId] =
        useState("");


    // =====================================================
    // REPORT
    // =====================================================

    const [report, setReport] =
        useState(null);


    // =====================================================
    // LOADING
    // =====================================================

    const [loadingEvents, setLoadingEvents] =
        useState(true);

    const [loadingReport, setLoadingReport] =
        useState(false);

    const [exporting, setExporting] =
        useState(false);


    // =====================================================
    // ALERTS
    // =====================================================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // LOAD EVENTS
    // =====================================================

    const loadEvents = async () => {

        try {

            setLoadingEvents(true);

            setError("");

            const response =
                await api.get("/events");

            const eventData =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setEvents(eventData);

        } catch (error) {

            console.error(
                "Failed to load events:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load events."
            );

        } finally {

            setLoadingEvents(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadEvents();

    }, []);


    // =====================================================
    // GENERATE REPORT
    // =====================================================

    const handleGenerateReport = async () => {

        if (!selectedEventId) {

            setError(
                "Please select an event first."
            );

            return;
        }

        try {

            setLoadingReport(true);

            setError("");

            setSuccess("");

            const data =
                await getEventReport(
                    selectedEventId
                );

            setReport(data);

            setSuccess(
                "Report generated successfully."
            );

        } catch (error) {

            console.error(
                "Failed to generate report:",
                error
            );

            setReport(null);

            setError(
                error.response?.data?.detail ||
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

            setError(
                "Please select an event first."
            );

            return;
        }

        try {

            setExporting(true);

            setError("");

            setSuccess("");

            const blob =
                await exportEventReport(
                    selectedEventId
                );


            // -------------------------------------------------
            // CREATE DOWNLOAD
            // -------------------------------------------------

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `NSS_Event_Report_${selectedEventId}.xlsx`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );


            setSuccess(
                "Excel report exported successfully."
            );

        } catch (error) {

            console.error(
                "Failed to export report:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to export report."
            );

        } finally {

            setExporting(false);

        }
    };


    // =====================================================
    // SELECTED EVENT
    // =====================================================

    const selectedEvent =
        events.find(
            (event) =>
                String(event.id) ===
                String(selectedEventId)
        );


    // =====================================================
    // UI
    // =====================================================

    return (
        <AdminDashboardLayout>

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
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
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Generate NSS participation, attendance,
                        and service-hour reports.
                    </Typography>

                </Box>

            </Box>


            {/* =================================================
                ALERTS
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>

            )}


            {success && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setSuccess("")
                    }
                >
                    {success}
                </Alert>

            )}


            {/* =================================================
                REPORT SELECTOR
            ================================================== */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            mb: 0.5,
                        }}
                    >
                        Generate Event Report
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                        }}
                    >
                        Select an event to generate its
                        attendance and service-hour report.
                    </Typography>


                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                    >

                        <FormControl
                            fullWidth
                            disabled={
                                loadingEvents
                            }
                        >

                            <InputLabel>
                                Event
                            </InputLabel>

                            <Select
                                value={
                                    selectedEventId
                                }
                                label="Event"
                                onChange={(event) => {

                                    setSelectedEventId(
                                        event.target.value
                                    );

                                    setReport(null);

                                    setError("");

                                    setSuccess("");
                                }}
                            >

                                <MenuItem value="">
                                    Select an event
                                </MenuItem>

                                {events.map(
                                    (event) => (

                                        <MenuItem
                                            key={
                                                event.id
                                            }
                                            value={
                                                event.id
                                            }
                                        >
                                            {event.title}
                                        </MenuItem>

                                    )
                                )}

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
                            onClick={
                                handleGenerateReport
                            }
                            disabled={
                                !selectedEventId ||
                                loadingReport ||
                                exporting
                            }
                            sx={{
                                minHeight: 56,
                                minWidth: {
                                    xs: "100%",
                                    sm: 180,
                                },
                            }}
                        >
                            {loadingReport
                                ? "Generating..."
                                : "Generate Report"}
                        </Button>


                        <Button
                            variant="outlined"
                            startIcon={
                                exporting ? (
                                    <CircularProgress
                                        size={18}
                                    />
                                ) : (
                                    <Download />
                                )
                            }
                            onClick={
                                handleExportExcel
                            }
                            disabled={
                                !selectedEventId ||
                                exporting ||
                                loadingReport
                            }
                            sx={{
                                minHeight: 56,
                                minWidth: {
                                    xs: "100%",
                                    sm: 160,
                                },
                            }}
                        >
                            {exporting
                                ? "Exporting..."
                                : "Export Excel"}
                        </Button>


                        <Button
                            variant="outlined"
                            startIcon={
                                <Refresh />
                            }
                            onClick={
                                loadEvents
                            }
                            disabled={
                                loadingEvents ||
                                loadingReport ||
                                exporting
                            }
                            sx={{
                                minHeight: 56,
                                minWidth: {
                                    xs: "100%",
                                    sm: 120,
                                },
                            }}
                        >
                            Refresh
                        </Button>

                    </Stack>

                </CardContent>

            </Card>


            {/* =================================================
                NO REPORT
            ================================================== */}

            {!report && !loadingReport && (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent
                        sx={{
                            minHeight: 300,
                            display: "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            textAlign: "center",
                            px: 3,
                        }}
                    >

                        <Assessment
                            sx={{
                                fontSize: 58,
                                color:
                                    "text.secondary",
                                mb: 1,
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            No report generated
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                maxWidth: 500,
                            }}
                        >
                            Select an event above and click
                            "Generate Report" to view its
                            participation and attendance data.
                        </Typography>

                    </CardContent>

                </Card>

            )}


            {/* =================================================
                REPORT
            ================================================== */}

            {report && (

                <Stack spacing={3}>

                    {/* =================================================
                        EVENT INFORMATION
                    ================================================== */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {report.event_title}
                            </Typography>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={{
                                    xs: 0.5,
                                    sm: 3,
                                }}
                                sx={{
                                    mt: 1,
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Type:{" "}
                                    <strong>
                                        {
                                            getEventTypeLabel(
                                                report.event_type
                                            )
                                        }
                                    </strong>
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Date:{" "}
                                    <strong>
                                        {formatDate(
                                            report.date
                                        )}
                                    </strong>
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Time:{" "}
                                    <strong>
                                        {
                                            report.start_time
                                        }{" "}
                                        –{" "}
                                        {
                                            report.end_time
                                        }
                                    </strong>
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Venue:{" "}
                                    <strong>
                                        {
                                            report.venue ||
                                            "—"
                                        }
                                    </strong>
                                </Typography>

                            </Stack>

                            {report.description && (

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 2,
                                    }}
                                >
                                    {
                                        report.description
                                    }
                                </Typography>

                            )}

                        </CardContent>

                    </Card>


                    {/* =================================================
                        SUMMARY CARDS
                    ================================================== */}

                    <Grid
                        container
                        spacing={2}
                    >

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border:
                                        "1px solid rgba(75, 22, 76, 0.08)",
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Registered Volunteers
                                    </Typography>

                                    <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {
                                            report.registered_volunteers ??
                                            0
                                        }
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>


                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border:
                                        "1px solid rgba(75, 22, 76, 0.08)",
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Volunteers Attended
                                    </Typography>

                                    <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {
                                            report.attended_volunteers ??
                                            0
                                        }
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>


                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border:
                                        "1px solid rgba(75, 22, 76, 0.08)",
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Volunteers Absent
                                    </Typography>

                                    <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {
                                            report.absent_volunteers ??
                                            0
                                        }
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>


                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border:
                                        "1px solid rgba(75, 22, 76, 0.08)",
                                }}
                            >

                                <CardContent>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Attendance
                                    </Typography>

                                    <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {
                                            report.attendance_percentage ??
                                            0
                                        }%
                                    </Typography>

                                </CardContent>

                            </Card>

                        </Grid>

                    </Grid>


                    {/* =================================================
                        SERVICE HOURS
                    ================================================== */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Service Hours
                            </Typography>

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />

                            <Grid
                                container
                                spacing={3}
                            >

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Hours per Volunteer
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{
                                            mt: 0.5,
                                        }}
                                    >
                                        {
                                            report.credited_hours_per_volunteer ??
                                            0
                                        }
                                    </Typography>

                                </Grid>


                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Service Hours
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        sx={{
                                            mt: 0.5,
                                        }}
                                    >
                                        {
                                            report.total_service_hours ??
                                            0
                                        }
                                    </Typography>

                                </Grid>

                            </Grid>

                        </CardContent>

                    </Card>


                    {/* =================================================
                        YEAR BREAKDOWN
                    ================================================== */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Year Breakdown
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.25,
                                }}
                            >
                                Volunteer registration and attendance
                                by academic year.
                            </Typography>

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {!report.year_breakdown ||
                            report.year_breakdown.length ===
                                0 ? (

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No year-wise report data available.
                                </Typography>

                            ) : (

                                <Stack
                                    spacing={1}
                                >

                                    {report.year_breakdown.map(
                                        (item) => (

                                            <Box
                                                key={
                                                    item.year
                                                }
                                                sx={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                        {
                                                            xs:
                                                                "1fr",
                                                            sm:
                                                                "1fr 1fr 1fr 1fr",
                                                        },
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius:
                                                        2,
                                                    backgroundColor:
                                                        "rgba(75, 22, 76, 0.035)",
                                                }}
                                            >

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Year
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        Year{" "}
                                                        {
                                                            item.year
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Registered
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.registered_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Attended
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.attended_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Absent
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.absent_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                            </Box>

                                        )
                                    )}

                                </Stack>

                            )}

                        </CardContent>

                    </Card>


                    {/* =================================================
                        CLASS BREAKDOWN
                    ================================================== */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Class Breakdown
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.25,
                                }}
                            >
                                Volunteer registration and attendance
                                by class.
                            </Typography>

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {!report.class_breakdown ||
                            report.class_breakdown.length ===
                                0 ? (

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No class-wise report data available.
                                </Typography>

                            ) : (

                                <Stack
                                    spacing={1}
                                >

                                    {report.class_breakdown.map(
                                        (item) => (

                                            <Box
                                                key={
                                                    item.class_name
                                                }
                                                sx={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                        {
                                                            xs:
                                                                "1fr",
                                                            sm:
                                                                "1fr 1fr 1fr 1fr",
                                                        },
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius:
                                                        2,
                                                    backgroundColor:
                                                        "rgba(75, 22, 76, 0.035)",
                                                }}
                                            >

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Class
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.class_name
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Registered
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.registered_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Attended
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.attended_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                                <Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Absent
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {
                                                            item.absent_volunteers ??
                                                            0
                                                        }
                                                    </Typography>

                                                </Box>

                                            </Box>

                                        )
                                    )}

                                </Stack>

                            )}

                        </CardContent>

                    </Card>


                    {/* =================================================
                        EVIDENCE PHOTOS
                    ================================================== */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Evidence Photos
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.25,
                                }}
                            >
                                Photos attached to this event.
                            </Typography>

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {!report.evidence_photos ||
                            report.evidence_photos.length ===
                                0 ? (

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No evidence photos uploaded for
                                    this event.
                                </Typography>

                            ) : (

                                <Grid
                                    container
                                    spacing={2}
                                >

                                    {report.evidence_photos.map(
                                        (photo, index) => {

                                            const photoUrl =
                                                typeof photo ===
                                                "string"
                                                    ? photo
                                                    : photo.file_url ||
                                                        photo.url;

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
                                                        component="img"
                                                        src={
                                                            photoUrl
                                                        }
                                                        alt={
                                                            `Event evidence ${index + 1}`
                                                        }
                                                        sx={{
                                                            width:
                                                                "100%",
                                                            aspectRatio:
                                                                "4 / 3",
                                                            objectFit:
                                                                "cover",
                                                            borderRadius:
                                                                2,
                                                            display:
                                                                "block",
                                                        }}
                                                    />

                                                </Grid>

                                            );
                                        }
                                    )}

                                </Grid>

                            )}

                        </CardContent>

                    </Card>

                </Stack>

            )}

        </AdminDashboardLayout>
    );
}


export default Reports;