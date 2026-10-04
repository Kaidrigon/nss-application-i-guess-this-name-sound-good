import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    CheckCircle,
    Event,
    Person,
    Schedule,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import {
    getEvent,
    getEventRegistrations,
    getEventAttendance,
    markAttendance,
} from "../../services/events";

function EventAttendance() {
    const navigate = useNavigate();
    const { eventId } = useParams();

    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =======================================================
    // LOAD EVENT + REGISTRATIONS + ATTENDANCE
    // =======================================================

    const loadAttendanceData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                eventData,
                registrationData,
                attendanceData,
            ] = await Promise.all([
                getEvent(eventId),
                getEventRegistrations(eventId),
                getEventAttendance(eventId),
            ]);

            setEvent(eventData);

            setRegistrations(
                registrationData.registrations || []
            );

            setAttendance(
                attendanceData.attendance || []
            );
        } catch (err) {
            console.error(
                "Failed to load attendance:",
                err
            );

            const message =
                err.response?.data?.detail ||
                "Unable to load attendance information.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendanceData();
    }, [eventId]);

    // =======================================================
    // FIND ATTENDANCE FOR VOLUNTEER
    // =======================================================

    const getVolunteerAttendance = (userId) => {
        return attendance.find(
            (record) => record.user_id === userId
        );
    };

    // =======================================================
    // MARK ATTENDANCE
    // =======================================================

    const handleAttendance = async (
        userId,
        attendanceStatus
    ) => {
        try {
            setActionLoading((previous) => ({
                ...previous,
                [userId]: true,
            }));

            setError("");
            setSuccess("");

            const result = await markAttendance(
                eventId,
                userId,
                attendanceStatus
            );

            setSuccess(
                result.message ||
                    "Attendance updated successfully."
            );

            // Reload attendance so the UI always reflects
            // the database state.
            const attendanceData =
                await getEventAttendance(eventId);

            setAttendance(
                attendanceData.attendance || []
            );
        } catch (err) {
            console.error(
                "Failed to mark attendance:",
                err
            );

            const message =
                err.response?.data?.detail ||
                "Unable to update attendance.";

            setError(message);
        } finally {
            setActionLoading((previous) => ({
                ...previous,
                [userId]: false,
            }));
        }
    };

    // =======================================================
    // FORMAT DATE
    // =======================================================

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Date not available";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // =======================================================
    // FORMAT TIME
    // =======================================================

    const formatTime = (timeString) => {
        if (!timeString) {
            return "";
        }

        const [hours, minutes] =
            timeString.split(":").map(Number);

        const date = new Date();

        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // =======================================================
    // LOADING
    // =======================================================

    if (loading) {
        return (
            <AdminDashboardLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 10,
                    }}
                >
                    <CircularProgress />
                </Box>
            </AdminDashboardLayout>
        );
    }

    // =======================================================
    // PAGE
    // =======================================================

    return (
        <AdminDashboardLayout>
            {/* =================================================
                HEADER
            ================================================== */}

            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() =>
                        navigate("/admin/events")
                    }
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                >
                    Back to Events
                </Button>

                <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                        fontSize: {
                            xs: "1.75rem",
                            sm: "2rem",
                            md: "2.25rem",
                        },
                    }}
                >
                    Event Attendance
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Manage volunteer attendance and
                    service-hour credits.
                </Typography>
            </Box>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError("")}
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* =================================================
                SUCCESS
            ================================================== */}

            {success && (
                <Alert
                    severity="success"
                    onClose={() => setSuccess("")}
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {success}
                </Alert>
            )}

            {/* =================================================
                EVENT INFORMATION
            ================================================== */}

            {event && (
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                        boxShadow:
                            "0 12px 40px rgba(75, 22, 76, 0.06)",
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    {event.title}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    {event.description}
                                </Typography>
                            </Box>

                            <Chip
                                label={event.status}
                                color={
                                    event.status ===
                                    "completed"
                                        ? "success"
                                        : "primary"
                                }
                                sx={{
                                    textTransform:
                                        "capitalize",
                                }}
                            />
                        </Box>

                        <Divider sx={{ my: 2.5 }} />

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            flexWrap="wrap"
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                }}
                            >
                                <Event
                                    fontSize="small"
                                    color="primary"
                                />

                                <Typography variant="body2">
                                    {formatDate(
                                        event.date
                                    )}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                }}
                            >
                                <Schedule
                                    fontSize="small"
                                    color="primary"
                                />

                                <Typography variant="body2">
                                    {formatTime(
                                        event.start_time
                                    )}{" "}
                                    –{" "}
                                    {formatTime(
                                        event.end_time
                                    )}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                }}
                            >
                                <Person
                                    fontSize="small"
                                    color="primary"
                                />

                                <Typography variant="body2">
                                    {registrations.length}{" "}
                                    registered
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* =================================================
                ATTENDANCE LIST
            ================================================== */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75, 22, 76, 0.06)",
                    borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {/* HEADER */}

                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Registered Volunteers
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Mark each registered volunteer
                            as attended or absent.
                        </Typography>
                    </Box>

                    <Divider />

                    {/* NO REGISTRATIONS */}

                    {registrations.length === 0 && (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 8,
                                px: 3,
                            }}
                        >
                            <Person
                                sx={{
                                    fontSize: 52,
                                    color: "text.secondary",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                No registered volunteers
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Nobody registered for this
                                event.
                            </Typography>
                        </Box>
                    )}

                    {/* VOLUNTEERS */}

                    {registrations.map(
                        (registration, index) => {
                            const existingAttendance =
                                getVolunteerAttendance(
                                    registration.user_id
                                );

                            const currentStatus =
                                existingAttendance?.status ||
                                null;

                            const isLoading =
                                actionLoading[
                                    registration.user_id
                                ] === true;

                            return (
                                <Box
                                    key={
                                        registration.registration_id
                                    }
                                    sx={{
                                        p: 3,
                                        borderBottom:
                                            index <
                                            registrations.length -
                                                1
                                                ? "1px solid rgba(75, 22, 76, 0.08)"
                                                : "none",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            gap: 2,
                                            flexWrap:
                                                "wrap",
                                        }}
                                    >
                                        {/* VOLUNTEER INFO */}

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                                flexGrow: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={700}
                                            >
                                                {
                                                    registration.name
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.3,
                                                }}
                                            >
                                                Roll No:{" "}
                                                {registration.roll_number ||
                                                    "Not available"}
                                            </Typography>

                                            {registration.email && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        registration.email
                                                    }
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* CURRENT STATUS */}

                                        <Box>
                                            {!currentStatus && (
                                                <Chip
                                                    label="Not marked"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}

                                            {currentStatus ===
                                                "attended" && (
                                                <Chip
                                                    label="Attended"
                                                    color="success"
                                                    icon={
                                                        <CheckCircle />
                                                    }
                                                    size="small"
                                                />
                                            )}

                                            {currentStatus ===
                                                "absent" && (
                                                <Chip
                                                    label="Absent"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* ACTION BUTTONS */}

                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1.5,
                                            mt: 2,
                                            flexWrap:
                                                "wrap",
                                        }}
                                    >
                                        <Button
                                            variant={
                                                currentStatus ===
                                                "attended"
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            color="success"
                                            startIcon={
                                                <CheckCircle />
                                            }
                                            onClick={() =>
                                                handleAttendance(
                                                    registration.user_id,
                                                    "attended"
                                                )
                                            }
                                            disabled={
                                                isLoading
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                minWidth: 150,
                                            }}
                                        >
                                            {isLoading
                                                ? "Updating..."
                                                : "Mark Attended"}
                                        </Button>

                                        <Button
                                            variant={
                                                currentStatus ===
                                                "absent"
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            color="warning"
                                            onClick={() =>
                                                handleAttendance(
                                                    registration.user_id,
                                                    "absent"
                                                )
                                            }
                                            disabled={
                                                isLoading
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                minWidth: 150,
                                            }}
                                        >
                                            {isLoading
                                                ? "Updating..."
                                                : "Mark Absent"}
                                        </Button>
                                    </Box>
                                </Box>
                            );
                        }
                    )}
                </CardContent>
            </Card>
        </AdminDashboardLayout>
    );
}

export default EventAttendance;