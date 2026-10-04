import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
} from "@mui/material";

import {
    Event,
    Group,
    AccessTime,
    AdminPanelSettings,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
    const { user } = useAuth();

    return (
        <AdminDashboardLayout>
            {/* =================================================
                WELCOME
            ================================================== */}

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
                    unit.
                </Typography>
            </Box>

            {/* =================================================
                OVERVIEW
            ================================================== */}

            <Grid
                container
                spacing={2}
            >
                {/* USERS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
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
                        <CardContent>
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
                                    mb: 2,
                                }}
                            >
                                <Group />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Total Users
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ mt: 0.5 }}
                            >
                                —
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Volunteers & staff
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* EVENTS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
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
                        <CardContent>
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
                                    mb: 2,
                                }}
                            >
                                <Event />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Events
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ mt: 0.5 }}
                            >
                                —
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                NSS events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* SERVICE HOURS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
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
                        <CardContent>
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
                                    mb: 2,
                                }}
                            >
                                <AccessTime />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Service Hours
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ mt: 0.5 }}
                            >
                                —
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Total recorded hours
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ADMIN */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
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
                        <CardContent>
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
                                    mb: 2,
                                }}
                            >
                                <AdminPanelSettings />
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Your Role
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{
                                    mt: 0.5,
                                    textTransform:
                                        "capitalize",
                                }}
                            >
                                {user?.role || "admin"}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Current access level
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* =================================================
                COMING NEXT
            ================================================== */}

            <Box sx={{ mt: 4 }}>
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
                            Admin Overview
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Your admin controls will appear
                            here as we connect the existing
                            NSS backend features.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </AdminDashboardLayout>
    );
}

export default AdminDashboard;