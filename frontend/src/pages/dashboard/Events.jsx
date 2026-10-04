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
    Typography,
    } from "@mui/material";

    import {
    AccessTime,
    ArrowBack,
    CalendarMonth,
    Cancel,
    CheckCircle,
    Event as EventIcon,
    LocationOn,
    People,
    VolunteerActivism,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";

    import DashboardLayout from "../../components/dashboard/DashboardLayout";

    import {
    getEvents,
    getMyRegistration,
    getMyAttendance,
    registerForEvent,
    cancelRegistration,
    } from "../../services/events";

    function Events() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState({});
    const [attendance, setAttendance] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState({});

    // =======================================================
    // LOAD EVENTS
    // =======================================================

    useEffect(() => {
        const loadEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getEvents();

            // Volunteers only need published events.
            const publishedEvents = data.filter(
            (event) => event.status === "published"
            );

            setEvents(publishedEvents);

            // -------------------------------------------------
            // Load registration + attendance for each event
            // -------------------------------------------------

            const registrationResults = {};
            const attendanceResults = {};

            await Promise.all(
            publishedEvents.map(async (event) => {
                try {
                const registration =
                    await getMyRegistration(event.id);

                registrationResults[event.id] = registration;
                } catch (err) {
                console.error(
                    `Failed to load registration for ${event.id}`,
                    err
                );
                }

                try {
                const attendance =
                    await getMyAttendance(event.id);

                attendanceResults[event.id] = attendance;
                } catch (err) {
                console.error(
                    `Failed to load attendance for ${event.id}`,
                    err
                );
                }
            })
            );

            setRegistrations(registrationResults);
            setAttendance(attendanceResults);
        } catch (err) {
            console.error("Failed to load events:", err);

            setError(
            "Unable to load events right now. Please try again."
            );
        } finally {
            setLoading(false);
        }
        };

        loadEvents();
    }, []);

    // =======================================================
    // REGISTER
    // =======================================================

    const handleRegister = async (eventId) => {
        try {
        setActionLoading((previous) => ({
            ...previous,
            [eventId]: true,
        }));

        await registerForEvent(eventId);

        const registration =
            await getMyRegistration(eventId);

        setRegistrations((previous) => ({
            ...previous,
            [eventId]: registration,
        }));
        } catch (err) {
        console.error(
            "Failed to register for event:",
            err
        );

        const message =
            err.response?.data?.detail ||
            "Unable to register for this event.";

        setError(message);
        } finally {
        setActionLoading((previous) => ({
            ...previous,
            [eventId]: false,
        }));
        }
    };

    // =======================================================
    // CANCEL REGISTRATION
    // =======================================================

    const handleCancelRegistration = async (eventId) => {
        try {
        setActionLoading((previous) => ({
            ...previous,
            [eventId]: true,
        }));

        await cancelRegistration(eventId);

        const registration =
            await getMyRegistration(eventId);

        setRegistrations((previous) => ({
            ...previous,
            [eventId]: registration,
        }));
        } catch (err) {
        console.error(
            "Failed to cancel registration:",
            err
        );

        const message =
            err.response?.data?.detail ||
            "Unable to cancel your registration.";

        setError(message);
        } finally {
        setActionLoading((previous) => ({
            ...previous,
            [eventId]: false,
        }));
        }
    };

    // =======================================================
    // FORMAT DATE
    // =======================================================

    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";

        const date = new Date(`${dateString}T00:00:00`);

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
        if (!timeString) return "";

        const [hours, minutes] = timeString
        .split(":")
        .map(Number);

        const date = new Date();

        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        });
    };

    // =======================================================
    // EVENT TYPE LABEL
    // =======================================================

    const formatEventType = (type) => {
        if (!type) return "NSS Event";

        return type
        .split("_")
        .map(
            (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
    };

    // =======================================================
    // LOADING
    // =======================================================

    if (loading) {
        return (
        <DashboardLayout>
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
        </DashboardLayout>
        );
    }

    // =======================================================
    // PAGE
    // =======================================================

    return (
        <DashboardLayout>
        {/* HEADER */}

        <Box sx={{ mb: 4 }}>
            <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard")}
            sx={{
                mb: 2,
                borderRadius: 2,
            }}
            >
            Dashboard
            </Button>

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
            NSS Events
            </Typography>

            <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
            >
            Discover upcoming NSS activities and register
            to participate.
            </Typography>
        </Box>

        {/* ERROR */}

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

        {/* NO EVENTS */}

        {events.length === 0 && (
            <Card
            elevation={0}
            sx={{
                border:
                "1px solid rgba(75, 22, 76, 0.08)",
                boxShadow:
                "0 12px 40px rgba(75, 22, 76, 0.06)",
            }}
            >
            <CardContent
                sx={{
                py: 8,
                textAlign: "center",
                }}
            >
                <EventIcon
                sx={{
                    fontSize: 56,
                    color: "text.secondary",
                    mb: 2,
                }}
                />

                <Typography
                variant="h6"
                fontWeight={700}
                >
                No events available
                </Typography>

                <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
                >
                There are no published NSS events at the
                moment. Check back later.
                </Typography>
            </CardContent>
            </Card>
        )}

        {/* EVENTS */}

        {events.length > 0 && (
            <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                },
                gap: 3,
            }}
            >
            {events.map((event) => {
                const registration =
                registrations[event.id];

                const eventAttendance =
                attendance[event.id];

                const isRegistered =
                registration?.registered === true;

                const isAttended =
                eventAttendance?.status === "attended";

                const isAbsent =
                eventAttendance?.status === "absent";

                const isActionLoading =
                actionLoading[event.id] === true;

                return (
                <Card
                    key={event.id}
                    elevation={0}
                    sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75, 22, 76, 0.06)",
                    borderRadius: 3,
                    }}
                >
                    <CardContent
                    sx={{
                        p: {
                        xs: 2.5,
                        sm: 3,
                        },
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}
                    >
                    {/* TITLE */}

                    <Box
                        sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                        <Chip
                            label={formatEventType(
                            event.event_type
                            )}
                            size="small"
                            sx={{
                            mb: 1.5,
                            borderRadius: 1.5,
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                            wordBreak: "break-word",
                            }}
                        >
                            {event.title}
                        </Typography>
                        </Box>

                        <EventIcon
                        color="primary"
                        sx={{
                            flexShrink: 0,
                            mt: 0.5,
                        }}
                        />
                    </Box>

                    {/* DESCRIPTION */}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                        mt: 1.5,
                        lineHeight: 1.6,
                        }}
                    >
                        {event.description}
                    </Typography>

                    <Divider sx={{ my: 2.5 }} />

                    {/* EVENT DETAILS */}

                    <Box
                        sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        }}
                    >
                        <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                        }}
                        >
                        <CalendarMonth
                            fontSize="small"
                            color="primary"
                        />

                        <Typography variant="body2">
                            {formatDate(event.date)}
                        </Typography>
                        </Box>

                        <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                        }}
                        >
                        <AccessTime
                            fontSize="small"
                            color="primary"
                        />

                        <Typography variant="body2">
                            {formatTime(event.start_time)} –{" "}
                            {formatTime(event.end_time)}
                        </Typography>
                        </Box>

                        <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                        }}
                        >
                        <LocationOn
                            fontSize="small"
                            color="primary"
                        />

                        <Typography
                            variant="body2"
                            sx={{
                            wordBreak: "break-word",
                            }}
                        >
                            {event.venue}
                        </Typography>
                        </Box>

                        <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                        }}
                        >
                        <VolunteerActivism
                            fontSize="small"
                            color="primary"
                        />

                        <Typography variant="body2">
                            {event.credited_hours} service{" "}
                            {event.credited_hours === 1
                            ? "hour"
                            : "hours"}
                        </Typography>
                        </Box>

                        {event.max_volunteers !== null &&
                        event.max_volunteers !==
                            undefined && (
                            <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.2,
                            }}
                            >
                            <People
                                fontSize="small"
                                color="primary"
                            />

                            <Typography variant="body2">
                                Capacity:{" "}
                                {event.max_volunteers}{" "}
                                volunteers
                            </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* ATTENDANCE STATUS */}

                    {isAttended && (
                        <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{
                            mt: 2.5,
                            borderRadius: 2,
                        }}
                        >
                        Attendance marked —{" "}
                        {event.credited_hours} service{" "}
                        {event.credited_hours === 1
                            ? "hour"
                            : "hours"}{" "}
                        credited.
                        </Alert>
                    )}

                    {isAbsent && (
                        <Alert
                        severity="warning"
                        sx={{
                            mt: 2.5,
                            borderRadius: 2,
                        }}
                        >
                        You were marked absent for this
                        event.
                        </Alert>
                    )}

                    {/* ACTION */}

                    <Box sx={{ mt: "auto", pt: 3 }}>
                        {isRegistered ? (
                        <Box
                            sx={{
                            display: "flex",
                            flexDirection: {
                                xs: "column",
                                sm: "row",
                            },
                            gap: 1.5,
                            }}
                        >
                            <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            disabled
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                minHeight: 44,
                            }}
                            >
                            Registered
                            </Button>

                            <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() =>
                                handleCancelRegistration(
                                event.id
                                )
                            }
                            disabled={isActionLoading}
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                minHeight: 44,
                            }}
                            >
                            {isActionLoading
                                ? "Cancelling..."
                                : "Cancel"}
                            </Button>
                        </Box>
                        ) : (
                        <Button
                            variant="contained"
                            startIcon={<VolunteerActivism />}
                            onClick={() =>
                            handleRegister(event.id)
                            }
                            disabled={isActionLoading}
                            fullWidth
                            sx={{
                            borderRadius: 2,
                            minHeight: 46,
                            }}
                        >
                            {isActionLoading
                            ? "Registering..."
                            : "Register for Event"}
                        </Button>
                        )}
                    </Box>
                    </CardContent>
                </Card>
                );
            })}
            </Box>
        )}
        </DashboardLayout>
    );
    }

    export default Events;