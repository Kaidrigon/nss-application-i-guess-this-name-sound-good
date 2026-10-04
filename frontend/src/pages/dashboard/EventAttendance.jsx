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
    ArrowBack,
    CheckCircle,
    Event as EventIcon,
    Person,
    Warning,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
    getEventAttendance,
    markAttendance,
} from "../../services/events";


function EventAttendance() {

    const navigate = useNavigate();
    const { eventId } = useParams();

    const [data, setData] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState({});


    // =======================================================
    // LOAD ATTENDANCE
    // =======================================================

    const loadAttendance = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getEventAttendance(eventId);

            setData(response);

        } catch (err) {

            console.error(
                "Failed to load attendance:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load event attendance."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadAttendance();

    }, [eventId]);


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

            await markAttendance(
                eventId,
                userId,
                attendanceStatus
            );

            await loadAttendance();

        } catch (err) {

            console.error(
                "Failed to mark attendance:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to mark attendance."
            );

        } finally {

            setActionLoading((previous) => ({
                ...previous,
                [userId]: false,
            }));
        }
    };


    // =======================================================
    // LOADING
    // =======================================================

    if (loading && !data) {

        return (
            <DashboardLayout>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
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
                    onClick={() =>
                        navigate(-1)
                    }
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                >
                    Back
                </Button>


                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >

                    <EventIcon
                        color="primary"
                    />

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Event Attendance
                    </Typography>

                </Box>


                {data && (

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {data.event_title}
                    </Typography>
                )}

            </Box>


            {/* ERROR */}

            {error && (

                <Alert
                    severity="error"
                    onClose={() =>
                        setError("")
                    }
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {error}
                </Alert>
            )}


            {data && (

                <>

                    {/* SUMMARY */}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(4, 1fr)",
                            },
                            gap: 2,
                            mb: 3,
                        }}
                    >

                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid rgba(75, 22, 76, 0.08)",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Registered
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                >
                                    {
                                        data.total_registered
                                    }
                                </Typography>

                            </CardContent>
                        </Card>


                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid rgba(75, 22, 76, 0.08)",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Attended
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                    color="success.main"
                                >
                                    {data.attended}
                                </Typography>

                            </CardContent>
                        </Card>


                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid rgba(75, 22, 76, 0.08)",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Absent
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                    color="error.main"
                                >
                                    {data.absent}
                                </Typography>

                            </CardContent>
                        </Card>


                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid rgba(75, 22, 76, 0.08)",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Pending
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                    color="warning.main"
                                >
                                    {data.pending}
                                </Typography>

                            </CardContent>
                        </Card>

                    </Box>


                    {/* SERVICE HOURS */}

                    <Alert
                        severity="info"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                        }}
                    >
                        Volunteers marked as attended will
                        receive{" "}
                        <strong>
                            {data.credited_hours}{" "}
                            service{" "}
                            {data.credited_hours === 1
                                ? "hour"
                                : "hours"}
                        </strong>.
                    </Alert>


                    {/* VOLUNTEERS */}

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                            borderRadius: 3,
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ mb: 2 }}
                            >
                                Registered Volunteers
                            </Typography>


                            <Divider
                                sx={{ mb: 2 }}
                            />


                            {data.attendance.length ===
                            0 ? (

                                <Box
                                    sx={{
                                        textAlign:
                                            "center",
                                        py: 6,
                                    }}
                                >

                                    <Person
                                        sx={{
                                            fontSize: 48,
                                            color:
                                                "text.secondary",
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        No registered
                                        volunteers
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                    >
                                        No volunteers
                                        registered for
                                        this event.
                                    </Typography>

                                </Box>

                            ) : (

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap: 2,
                                    }}
                                >

                                    {data.attendance.map(
                                        (volunteer) => {

                                            const isLoading =
                                                actionLoading[
                                                    volunteer.user_id
                                                ] === true;

                                            const isAttended =
                                                volunteer.status ===
                                                "attended";

                                            const isAbsent =
                                                volunteer.status ===
                                                "absent";


                                            return (

                                                <Box
                                                    key={
                                                        volunteer.user_id
                                                    }
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            {
                                                                xs: "column",
                                                                md: "row",
                                                            },
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            {
                                                                xs: "flex-start",
                                                                md: "center",
                                                            },
                                                        gap: 2,
                                                        p: 2,
                                                        border:
                                                            "1px solid rgba(75, 22, 76, 0.08)",
                                                        borderRadius: 2,
                                                    }}
                                                >

                                                    {/* USER INFO */}

                                                    <Box
                                                        sx={{
                                                            minWidth: 0,
                                                        }}
                                                    >

                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={
                                                                700
                                                            }
                                                        >
                                                            {
                                                                volunteer.name
                                                            }
                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Roll No:{" "}
                                                            {
                                                                volunteer.roll_number ||
                                                                "N/A"
                                                            }
                                                        </Typography>


                                                        {volunteer.email && (

                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    volunteer.email
                                                                }
                                                            </Typography>
                                                        )}

                                                    </Box>


                                                    {/* STATUS + ACTIONS */}

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            flexWrap:
                                                                "wrap",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >

                                                        {isAttended && (

                                                            <Chip
                                                                icon={
                                                                    <CheckCircle />
                                                                }
                                                                label="Attended"
                                                                color="success"
                                                            />
                                                        )}


                                                        {isAbsent && (

                                                            <Chip
                                                                icon={
                                                                    <Warning />
                                                                }
                                                                label="Absent"
                                                                color="error"
                                                            />
                                                        )}


                                                        {!volunteer.status && (

                                                            <Chip
                                                                label="Pending"
                                                                color="warning"
                                                                variant="outlined"
                                                            />
                                                        )}


                                                        <Button
                                                            variant={
                                                                isAttended
                                                                    ? "contained"
                                                                    : "outlined"
                                                            }
                                                            color="success"
                                                            size="small"
                                                            disabled={
                                                                isLoading
                                                            }
                                                            onClick={() =>
                                                                handleAttendance(
                                                                    volunteer.user_id,
                                                                    "attended"
                                                                )
                                                            }
                                                        >
                                                            {isLoading
                                                                ? "Saving..."
                                                                : "Attended"}
                                                        </Button>


                                                        <Button
                                                            variant={
                                                                isAbsent
                                                                    ? "contained"
                                                                    : "outlined"
                                                            }
                                                            color="error"
                                                            size="small"
                                                            disabled={
                                                                isLoading
                                                            }
                                                            onClick={() =>
                                                                handleAttendance(
                                                                    volunteer.user_id,
                                                                    "absent"
                                                                )
                                                            }
                                                        >
                                                            Absent
                                                        </Button>

                                                    </Box>

                                                </Box>
                                            );
                                        }
                                    )}

                                </Box>
                            )}

                        </CardContent>

                    </Card>

                </>
            )}

        </DashboardLayout>
    );
}


export default EventAttendance;