    import { useEffect, useState } from "react";

    import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    LinearProgress,
    Typography,
    } from "@mui/material";

    import {
    AccessTime,
    Event,
    History,
    Person,
    VolunteerActivism,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";

    import DashboardLayout from "../../components/dashboard/DashboardLayout";

    import { useAuth } from "../../context/AuthContext";

    import { getMyServiceHours } from "../../services/serviceHours";

    function VolunteerDashboard() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [serviceHours, setServiceHours] = useState(null);
    const [loadingHours, setLoadingHours] = useState(true);
    const [hoursError, setHoursError] = useState("");

    useEffect(() => {
    const loadServiceHours = async () => {
    try {
    setLoadingHours(true);
    setHoursError("");


        const data = await getMyServiceHours();

        setServiceHours(data);
    } catch (error) {
        console.error(
        "Failed to load service hours:",
        error
        );

        setHoursError(
        "Unable to load your service-hour information."
        );
    } finally {
        setLoadingHours(false);
    }
    };

    loadServiceHours();


    }, []);

    const totalHours =
    serviceHours?.service_hours ?? 0;

    const requiredHours =
    serviceHours?.required_hours ?? 240;

    const remainingHours =
    serviceHours?.remaining_hours ??
    Math.max(requiredHours - totalHours, 0);

    const completionPercentage =
    serviceHours?.completion_percentage ?? 0;

    return ( <DashboardLayout>
    {/* WELCOME */}


    <Box sx={{ mb: 4 }}>
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
        Welcome back,{" "}
        {user?.name?.split(" ")[0] || "Volunteer"} 👋
        </Typography>

        <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 0.5 }}
        >
        Here's what's happening with your NSS journey.
        </Typography>
    </Box>

    {/* SERVICE HOURS */}

    <Card
        elevation={0}
        sx={{
        border:
            "1px solid rgba(75, 22, 76, 0.08)",

        boxShadow:
            "0 12px 40px rgba(75, 22, 76, 0.08)",
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
            justifyContent: "space-between",
            alignItems: {
                xs: "flex-start",
                sm: "center",
            },
            flexDirection: {
                xs: "column",
                sm: "row",
            },
            gap: 3,
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
                width: 52,
                height: 52,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                    "rgba(75, 22, 76, 0.08)",
                color: "primary.main",
                }}
            >
                <VolunteerActivism />
            </Box>

            <Box>
                <Typography
                variant="subtitle2"
                color="text.secondary"
                >
                NSS Service Hours
                </Typography>

                {loadingHours ? (
                <Box
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                    }}
                >
                    <CircularProgress size={20} />

                    <Typography
                    variant="body2"
                    color="text.secondary"
                    >
                    Loading...
                    </Typography>
                </Box>
                ) : (
                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    {totalHours} / {requiredHours} hours
                </Typography>
                )}
            </Box>
            </Box>

            {!loadingHours && (
            <Typography
                variant="h5"
                fontWeight={700}
                color="primary.main"
            >
                {completionPercentage}%
            </Typography>
            )}
        </Box>

        {!loadingHours && (
            <>
            <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                mt: 3,
                height: 10,
                borderRadius: 5,
                }}
            />

            <Box
                sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                }}
            >
                <Typography
                variant="caption"
                color="text.secondary"
                >
                {totalHours} hours completed
                </Typography>

                <Typography
                variant="caption"
                color="text.secondary"
                >
                {remainingHours} hours remaining
                </Typography>
            </Box>
            </>
        )}

        {hoursError && (
            <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2 }}
            >
            {hoursError}
            </Typography>
        )}

        <Button
            variant="outlined"
            startIcon={<AccessTime />}
            onClick={() =>
            navigate("/service-hours")
            }
            sx={{
            mt: 3,
            borderRadius: 2,
            }}
        >
            View service hours
        </Button>
        </CardContent>
    </Card>

    {/* QUICK ACTIONS */}

    <Box sx={{ mt: 4 }}>
        <Typography
        variant="h5"
        fontWeight={700}
        sx={{ mb: 2 }}
        >
        Quick Actions
        </Typography>

        <Box
        sx={{
            display: "grid",
            gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
            },
            gap: 2,
        }}
        >
        <Card
            elevation={0}
            sx={{
            border:
                "1px solid rgba(75, 22, 76, 0.08)",
            }}
        >
            <CardContent>
            <Event color="primary" />

            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 1 }}
            >
                Events
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                Browse and register for NSS events.
            </Typography>

            <Button
                onClick={() => navigate("/events")}
                variant="outlined"
                size="small"
            >
                Browse Events
            </Button>
            </CardContent>
        </Card>

        <Card
            elevation={0}
            sx={{
            border:
                "1px solid rgba(75, 22, 76, 0.08)",
            }}
        >
            <CardContent>
            <History color="primary" />

            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 1 }}
            >
                History
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                View your service-hour history.
            </Typography>

            <Button
                onClick={() => navigate("/history")}
                variant="outlined"
                size="small"
            >
                View History
            </Button>
            </CardContent>
        </Card>

        <Card
            elevation={0}
            sx={{
            border:
                "1px solid rgba(75, 22, 76, 0.08)",
            }}
        >
            <CardContent>
            <Person color="primary" />

            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 1 }}
            >
                Profile
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                View your NSS account information.
            </Typography>

            <Button
                onClick={() => navigate("/profile")}
                variant="outlined"
                size="small"
            >
                View Profile
            </Button>
            </CardContent>
        </Card>
        </Box>
    </Box>
    </DashboardLayout>


    );
    }

    export default VolunteerDashboard;
