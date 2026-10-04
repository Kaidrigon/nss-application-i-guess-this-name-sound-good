import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    } from "@mui/material";

    import {
    AdminPanelSettings,
    Groups,
    Person,
    SupervisorAccount,
    } from "@mui/icons-material";

    import DashboardLayout from "../../components/dashboard/DashboardLayout";

    import { useAuth } from "../../context/AuthContext";

    import { getUsers } from "../../services/auth";

    function AdminDashboard() {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] =
        useState(true);
    const [error, setError] = useState("");

    // ---------------------------------------------------------
    // LOAD USERS
    // ---------------------------------------------------------

    useEffect(() => {
        const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            setError("");

            const data = await getUsers();

            setUsers(
            Array.isArray(data)
                ? data
                : []
            );
        } catch (error) {
            console.error(
            "Failed to load users:",
            error
            );

            setError(
            "Unable to load user statistics. Please try again."
            );
        } finally {
            setLoadingUsers(false);
        }
        };

        loadUsers();
    }, []);

    // ---------------------------------------------------------
    // STATISTICS
    // ---------------------------------------------------------

    const statistics = useMemo(() => {
        return {
        total: users.length,

        volunteers: users.filter(
            (item) => item.role === "volunteer"
        ).length,

        coordinators: users.filter(
            (item) => item.role === "coordinator"
        ).length,

        admins: users.filter(
            (item) => item.role === "admin"
        ).length,
        };
    }, [users]);

    // ---------------------------------------------------------
    // STAT CARD
    // ---------------------------------------------------------

    const StatCard = ({
        icon,
        label,
        value,
        description,
    }) => {
        return (
        <Card
            elevation={0}
            sx={{
            height: "100%",

            border:
                "1px solid rgba(75, 22, 76, 0.08)",

            boxShadow:
                "0 12px 40px rgba(75, 22, 76, 0.06)",
            }}
        >
            <CardContent sx={{ p: 3 }}>
            <Box
                sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                }}
            >
                <Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                >
                    {label}
                </Typography>

                {loadingUsers ? (
                    <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                    }}
                    >
                    <CircularProgress size={28} />
                    </Box>
                ) : (
                    <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 0.5 }}
                    >
                    {value}
                    </Typography>
                )}

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                    display: "block",
                    mt: 0.5,
                    }}
                >
                    {description}
                </Typography>
                </Box>

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

                    flexShrink: 0,
                }}
                >
                {icon}
                </Box>
            </Box>
            </CardContent>
        </Card>
        );
    };

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <DashboardLayout>
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
            {user?.name?.split(" ")[0] ||
                "Administrator"}{" "}
            👋
            </Typography>

            <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
            >
            Here's what's happening with your NSS
            community.
            </Typography>
        </Box>

        {/* ERROR */}

        {error && (
            <Alert
            severity="error"
            sx={{
                mb: 3,
                borderRadius: 2,
            }}
            onClose={() => setError("")}
            >
            {error}
            </Alert>
        )}

        {/* USER STATISTICS */}

        <Box
            sx={{
            display: "grid",

            gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
            },

            gap: 2,
            }}
        >
            <StatCard
            icon={<Groups />}
            label="Total Users"
            value={statistics.total}
            description="All registered accounts"
            />

            <StatCard
            icon={<Person />}
            label="Volunteers"
            value={statistics.volunteers}
            description="Active NSS volunteers"
            />

            <StatCard
            icon={<SupervisorAccount />}
            label="Coordinators"
            value={statistics.coordinators}
            description="NSS coordinators"
            />

            <StatCard
            icon={<AdminPanelSettings />}
            label="Administrators"
            value={statistics.admins}
            description="System administrators"
            />
        </Box>

        {/* ADMINISTRATION */}

        <Box sx={{ mt: 4 }}>
            <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mb: 2 }}
            >
            Administration
            </Typography>

            <Card
            elevation={0}
            sx={{
                border:
                "1px solid rgba(75, 22, 76, 0.08)",
            }}
            >
            <CardContent sx={{ p: 3 }}>
                <Typography
                variant="body1"
                fontWeight={600}
                >
                Admin dashboard is ready.
                </Typography>

                <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
                >
                User management, event management,
                attendance verification, and reports
                will be added to the administration
                sections.
                </Typography>
            </CardContent>
            </Card>
        </Box>
        </DashboardLayout>
    );
    }

    export default AdminDashboard;