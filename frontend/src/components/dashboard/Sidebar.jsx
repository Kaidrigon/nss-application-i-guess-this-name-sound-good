    import {
    Dashboard,
    Event,
    History,
    Logout,
    Person,
    } from "@mui/icons-material";

    import {
    Box,
    Button,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    } from "@mui/material";

    import nssLogo from "../../assets/nss-logo.png";

    import { useNavigate, useLocation } from "react-router-dom";

    function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
        label: "Dashboard",
        icon: <Dashboard />,
        path: "/dashboard",
        },
        {
        label: "Events",
        icon: <Event />,
        path: "/events",
        },
        {
        label: "Service Hours",
        icon: <History />,
        path: "/service-hours",
        },
        {
        label: "Profile",
        icon: <Person />,
        path: "/profile",
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <Box
        sx={{
            width: 250,
            minHeight: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            borderRight: "1px solid rgba(75, 22, 76, 0.08)",
            zIndex: 1200,
        }}
        >
        {/* LOGO */}
        <Box
            sx={{
            px: 3,
            py: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            }}
        >
            <Box
            component="img"
            src={nssLogo}
            alt="NSS Logo"
            sx={{
                width: 42,
                height: 42,
                objectFit: "contain",
            }}
            />

            <Box>
            <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                color: "primary.main",
                lineHeight: 1.2,
                }}
            >
                NSS
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
            >
                Community Engagement
            </Typography>
            </Box>
        </Box>

        <Divider />

        {/* NAVIGATION */}
        <List
            sx={{
            px: 1.5,
            py: 2,
            flexGrow: 1,
            }}
        >
            {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
                <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: active
                    ? "primary.main"
                    : "text.secondary",
                    backgroundColor: active
                    ? "rgba(75, 22, 76, 0.08)"
                    : "transparent",

                    "&:hover": {
                    backgroundColor:
                        "rgba(75, 22, 76, 0.06)",
                    },
                }}
                >
                <ListItemIcon
                    sx={{
                    minWidth: 40,
                    color: "inherit",
                    }}
                >
                    {item.icon}
                </ListItemIcon>

                <ListItemText
    primary={item.label}
    slotProps={{
        primary: {
        sx: {
            fontWeight: active ? 600 : 400,
        },
        },
    }}
/>
                </ListItemButton>
            );
            })}
        </List>

        {/* LOGOUT */}
        <Box sx={{ p: 2 }}>
            <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            >
            Sign out
            </Button>
        </Box>
        </Box>
    );
    }

    export default Sidebar;