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
    ArrowBack,
    CheckCircle,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";

    import DashboardLayout from "../../components/dashboard/DashboardLayout";

    import {
    getMyServiceHours,
    } from "../../services/serviceHours";

    function ServiceHours() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    const loadServiceHours = async () => {
    try {
    setLoading(true);
    setError("");


        const response =
        await getMyServiceHours();

        setData(response);
    } catch (err) {
        console.error(
        "Failed to load service hours:",
        err
        );

        setError(
        "Unable to load your service-hour information."
        );
    } finally {
        setLoading(false);
    }
    };

    loadServiceHours();


    }, []);

    return ( <DashboardLayout>
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
        fontWeight={700}
        >
        Service Hours
        </Typography>

        <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 0.5 }}
        >
        Track your progress toward the 240-hour
        NSS requirement.
        </Typography>
    </Box>

    {/* LOADING */}

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

    {/* ERROR */}

    {!loading && error && (
        <Card elevation={0}>
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

    {/* DATA */}

    {!loading && !error && data && (
        <>
        {/* MAIN PROGRESS CARD */}

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
                alignItems: "center",
                gap: 2,
                mb: 3,
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
                <AccessTime />
                </Box>

                <Box>
                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                >
                    Total Service Hours
                </Typography>

                <Typography
                    variant="h4"
                    fontWeight={700}
                >
                    {data.service_hours} /{" "}
                    {data.required_hours}
                </Typography>
                </Box>
            </Box>

            <LinearProgress
                variant="determinate"
                value={data.completion_percentage}
                sx={{
                height: 12,
                borderRadius: 6,
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
                variant="body2"
                color="text.secondary"
                >
                {data.completion_percentage}%
                completed
                </Typography>

                <Typography
                variant="body2"
                color="text.secondary"
                >
                {data.remaining_hours} hours
                remaining
                </Typography>
            </Box>
            </CardContent>
        </Card>

        {/* STAT CARDS */}

        <Box
            sx={{
            display: "grid",
            gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mt: 3,
            }}
        >
            <Card elevation={0}>
            <CardContent>
                <Typography
                variant="body2"
                color="text.secondary"
                >
                Completed
                </Typography>

                <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 0.5 }}
                >
                {data.service_hours}
                </Typography>

                <Typography
                variant="caption"
                color="text.secondary"
                >
                service hours
                </Typography>
            </CardContent>
            </Card>

            <Card elevation={0}>
            <CardContent>
                <Typography
                variant="body2"
                color="text.secondary"
                >
                Remaining
                </Typography>

                <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 0.5 }}
                >
                {data.remaining_hours}
                </Typography>

                <Typography
                variant="caption"
                color="text.secondary"
                >
                hours to complete
                </Typography>
            </CardContent>
            </Card>

            <Card elevation={0}>
            <CardContent>
                <Typography
                variant="body2"
                color="text.secondary"
                >
                NSS Requirement
                </Typography>

                <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 0.5 }}
                >
                {data.required_hours}
                </Typography>

                <Typography
                variant="caption"
                color="text.secondary"
                >
                total required hours
                </Typography>
            </CardContent>
            </Card>
        </Box>

        {/* COMPLETION MESSAGE */}

        {data.completion_percentage >= 100 && (
            <Card
            elevation={0}
            sx={{
                mt: 3,
                border:
                "1px solid rgba(46, 125, 50, 0.2)",
            }}
            >
            <CardContent
                sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                }}
            >
                <CheckCircle color="success" />

                <Box>
                <Typography
                    fontWeight={700}
                >
                    NSS service-hour requirement
                    completed!
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    You have completed the required
                    240 service hours.
                </Typography>
                </Box>
            </CardContent>
            </Card>
        )}
        </>
    )}
    </DashboardLayout>


    );
    }

    export default ServiceHours;
