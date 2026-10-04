    import { useEffect, useState } from "react";

    import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Typography,
    Button,
    } from "@mui/material";

    import {
    AccessTime,
    ArrowBack,
    Event,
    History as HistoryIcon,
    TrendingDown,
    TrendingUp,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";

    import DashboardLayout from "../../components/dashboard/DashboardLayout";

    import { getMyServiceHourHistory } from "../../services/serviceHours";


    function History() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // LOAD HISTORY
    // =========================================================

    useEffect(() => {
        const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyServiceHourHistory();

            setData(response);
        } catch (err) {
            console.error(
            "Failed to load service-hour history:",
            err
            );

            setError(
            "Unable to load your service-hour history."
            );
        } finally {
            setLoading(false);
        }
        };

        loadHistory();
    }, []);


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateString) => {
        if (!dateString) {
        return "Unknown date";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
        return "Unknown date";
        }

        return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        });
    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (dateString) => {
        if (!dateString) {
        return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
        return "";
        }

        return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        });
    };


    // =========================================================
    // GET ACTION LABEL
    // =========================================================

    const getActionLabel = (action) => {
        if (action === "credited") {
        return "Hours credited";
        }

        if (action === "reversed") {
        return "Hours reversed";
        }

        return action || "Service-hour update";
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <DashboardLayout>

        {/* =====================================================
            HEADER
        ====================================================== */}

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

            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
            }}
            >

            <Box
                sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                    "rgba(75, 22, 76, 0.08)",
                color: "primary.main",
                flexShrink: 0,
                }}
            >
                <HistoryIcon />
            </Box>

            <Box>

                <Typography
                variant="h4"
                fontWeight={700}
                >
                Service History
                </Typography>

                <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.5 }}
                >
                View your NSS event participation
                and service-hour history.
                </Typography>

            </Box>

            </Box>

        </Box>


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
            <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                py: 8,
            }}
            >
            <CircularProgress />
            </Box>
        )}


        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
            <Card
            elevation={0}
            sx={{
                border:
                "1px solid rgba(211, 47, 47, 0.15)",
            }}
            >
            <CardContent>

                <Typography
                color="error"
                fontWeight={600}
                >
                {error}
                </Typography>

            </CardContent>
            </Card>
        )}


        {/* =====================================================
            EMPTY HISTORY
        ====================================================== */}

        {!loading &&
            !error &&
            data &&
            data.history?.length === 0 && (

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

                <HistoryIcon
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
                    No service history yet
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                    mt: 1,
                    maxWidth: 450,
                    mx: "auto",
                    }}
                >
                    Your service-hour history will appear
                    here after you attend NSS events.
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<Event />}
                    onClick={() => navigate("/events")}
                    sx={{
                    mt: 3,
                    borderRadius: 2,
                    }}
                >
                    Browse Events
                </Button>

                </CardContent>

            </Card>
            )}


        {/* =====================================================
            HISTORY
        ====================================================== */}

        {!loading &&
            !error &&
            data &&
            data.history?.length > 0 && (

            <>

                {/* SUMMARY */}

                <Card
                elevation={0}
                sx={{
                    border:
                    "1px solid rgba(75, 22, 76, 0.08)",
                    boxShadow:
                    "0 12px 40px rgba(75, 22, 76, 0.06)",
                    mb: 3,
                }}
                >

                <CardContent
                    sx={{
                    p: {
                        xs: 3,
                        sm: 4,
                    },
                    }}
                >

                    <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                    >

                    <Box
                        sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                            "rgba(75, 22, 76, 0.08)",
                        color: "primary.main",
                        }}
                    >
                        <AccessTime />
                    </Box>

                    <Box>

                        <Typography
                        variant="body2"
                        color="text.secondary"
                        >
                        Current Service Hours
                        </Typography>

                        <Typography
                        variant="h5"
                        fontWeight={700}
                        >
                        {data.service_hours ?? 0} hours
                        </Typography>

                    </Box>

                    </Box>

                </CardContent>

                </Card>


                {/* HISTORY LIST */}

                <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mb: 2 }}
                >
                Activity History
                </Typography>


                <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
                >

                {data.history.map((record) => {

                    const isCredited =
                    record.action === "credited";

                    return (
                    <Card
                        key={record.id}
                        elevation={0}
                        sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                        boxShadow:
                            "0 8px 28px rgba(75, 22, 76, 0.05)",
                        }}
                    >

                        <CardContent
                        sx={{
                            p: {
                            xs: 2.5,
                            sm: 3,
                            },
                        }}
                        >

                        <Box
                            sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: {
                                xs: "flex-start",
                                sm: "center",
                            },
                            gap: 2,
                            }}
                        >

                            {/* LEFT */}

                            <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                                minWidth: 0,
                                flex: 1,
                            }}
                            >

                            <Box
                                sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor:
                                    isCredited
                                    ? "rgba(46, 125, 50, 0.08)"
                                    : "rgba(211, 47, 47, 0.08)",
                                color:
                                    isCredited
                                    ? "success.main"
                                    : "error.main",
                                flexShrink: 0,
                                }}
                            >

                                {isCredited ? (
                                <TrendingUp />
                                ) : (
                                <TrendingDown />
                                )}

                            </Box>


                            <Box
                                sx={{
                                minWidth: 0,
                                }}
                            >

                                <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: {
                                    xs: "normal",
                                    sm: "nowrap",
                                    },
                                }}
                                >
                                {record.event_title}
                                </Typography>

                                <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                }}
                                >
                                {record.reason}
                                </Typography>

                                <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1.5,
                                }}
                                >

                                <Chip
                                    label={getActionLabel(
                                    record.action
                                    )}
                                    size="small"
                                    icon={
                                    isCredited ? (
                                        <TrendingUp />
                                    ) : (
                                        <TrendingDown />
                                    )
                                    }
                                    color={
                                    isCredited
                                        ? "success"
                                        : "error"
                                    }
                                    variant="outlined"
                                />

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {formatDate(
                                    record.recorded_at
                                    )}
                                    {" • "}
                                    {formatTime(
                                    record.recorded_at
                                    )}
                                </Typography>

                                </Box>

                            </Box>

                            </Box>


                            {/* HOURS */}

                            <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                                isCredited
                                ? "success.main"
                                : "error.main"
                            }
                            sx={{
                                whiteSpace: "nowrap",
                            }}
                            >
                            {record.hours > 0
                                ? `+${record.hours}`
                                : record.hours}{" "}
                            hrs
                            </Typography>

                        </Box>

                        </CardContent>

                    </Card>
                    );
                })}

                </Box>

            </>
            )}

        </DashboardLayout>
    );
    }

    export default History;