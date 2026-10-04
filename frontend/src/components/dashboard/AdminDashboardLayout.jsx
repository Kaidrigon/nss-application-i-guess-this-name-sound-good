import { useState } from "react";

import {
    AppBar,
    Avatar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import {
    AccessTime,
    Dashboard as DashboardIcon,
    Description,
    Event,
    Group,
    History,
    Logout,
    Menu as MenuIcon,
    Person,
    Assessment,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import nssLogo from "../../assets/nss-logo.png";

const drawerWidth = 250;

function AdminDashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, logout } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [mobileOpen, setMobileOpen] = useState(false);

    // ---------------------------------------------------------
    // CLOSE MOBILE DRAWER
    // ---------------------------------------------------------

    const closeMobileDrawer = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setMobileOpen(false);
    };

    // ---------------------------------------------------------
    // DRAWER TOGGLE
    // ---------------------------------------------------------

    const handleDrawerToggle = () => {
        setMobileOpen((previous) => !previous);
    };

    // ---------------------------------------------------------
    // NAVIGATION
    // ---------------------------------------------------------

    const handleNavigation = (path) => {
        if (isMobile) {
            closeMobileDrawer();
        }

        navigate(path);
    };

    // ---------------------------------------------------------
    // LOGOUT
    // ---------------------------------------------------------

    const handleLogout = () => {
        if (isMobile) {
            closeMobileDrawer();
        }

        logout();
        navigate("/login");
    };

    // ---------------------------------------------------------
    // SIDEBAR CONTENT
    // ---------------------------------------------------------

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* LOGO */}

            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minHeight: 74,
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
                        flexShrink: 0,
                    }}
                />

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                            lineHeight: 1.2,
                        }}
                    >
                        NSS
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Admin Portal
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* ADMIN NAVIGATION */}

            <List
                sx={{
                    px: 1.5,
                    py: 2,
                }}
            >
                {/* DASHBOARD */}

                <ListItemButton
                    selected={location.pathname === "/admin"}
                    onClick={() => handleNavigation("/admin")}
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>

                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                {/* USERS */}

                <ListItemButton
                    selected={location.pathname.startsWith("/admin/users")}
                    onClick={() => handleNavigation("/admin/users")}
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Group />
                    </ListItemIcon>

                    <ListItemText primary="Users" />
                </ListItemButton>

                {/* EVENTS */}

                <ListItemButton
                    selected={location.pathname.startsWith("/admin/events")}
                    onClick={() => handleNavigation("/admin/events")}
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Event />
                    </ListItemIcon>

                    <ListItemText primary="Events" />
                </ListItemButton>

                {/* SERVICE HOURS */}

                <ListItemButton
                    selected={location.pathname.startsWith(
                        "/admin/service-hours"
                    )}
                    onClick={() =>
                        handleNavigation("/admin/service-hours")
                    }
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <AccessTime />
                    </ListItemIcon>

                    <ListItemText primary="Service Hours" />
                </ListItemButton>

                {/* DOCUMENTS */}

                <ListItemButton
                    selected={location.pathname.startsWith(
                        "/admin/documents"
                    )}
                    onClick={() =>
                        handleNavigation("/admin/documents")
                    }
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Description />
                    </ListItemIcon>

                    <ListItemText primary="Documents" />
                </ListItemButton>

                {/* REPORTS */}

                <ListItemButton
                    selected={location.pathname.startsWith(
                        "/admin/reports"
                    )}
                    onClick={() =>
                        handleNavigation("/admin/reports")
                    }
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Assessment />
                    </ListItemIcon>

                    <ListItemText primary="Reports" />
                </ListItemButton>

                {/* HISTORY */}

                <ListItemButton
                    selected={location.pathname.startsWith(
                        "/admin/history"
                    )}
                    onClick={() =>
                        handleNavigation("/admin/history")
                    }
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <History />
                    </ListItemIcon>

                    <ListItemText primary="History" />
                </ListItemButton>

                {/* PROFILE */}

                <ListItemButton
                    selected={location.pathname.startsWith(
                        "/admin/profile"
                    )}
                    onClick={() =>
                        handleNavigation("/admin/profile")
                    }
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>

                    <ListItemText primary="Profile" />
                </ListItemButton>
            </List>

            {/* LOGOUT */}

            <Box
                sx={{
                    mt: "auto",
                    p: 1.5,
                }}
            >
                <Divider sx={{ mb: 1 }} />

                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        minHeight: 48,
                    }}
                >
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>

                    <ListItemText primary="Sign out" />
                </ListItemButton>
            </Box>
        </Box>
    );

    // ---------------------------------------------------------
    // LAYOUT
    // ---------------------------------------------------------

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#FBF7F2",
                overflowX: "hidden",
            }}
        >
            {/* =================================================
                TOP BAR
            ================================================== */}

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },

                    ml: {
                        xs: 0,
                        md: `${drawerWidth}px`,
                    },

                    backgroundColor: "#FBF7F2",
                    color: "text.primary",

                    borderBottom:
                        "1px solid rgba(75, 22, 76, 0.08)",

                    zIndex: (theme) =>
                        theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 60,
                            sm: 68,
                        },

                        px: {
                            xs: 1.5,
                            sm: 2,
                            md: 3,
                        },
                    }}
                >
                    {/* MOBILE MENU */}

                    {isMobile && (
                        <IconButton
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                mr: 1,
                                width: 44,
                                height: 44,
                            }}
                            aria-label={
                                mobileOpen
                                    ? "close navigation menu"
                                    : "open navigation menu"
                            }
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* PAGE TITLE */}

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            flexGrow: 1,
                            fontSize: {
                                xs: "1rem",
                                sm: "1.15rem",
                                md: "1.25rem",
                            },

                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        NSS Admin Dashboard
                    </Typography>

                    {/* ADMIN USER */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexShrink: 0,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: {
                                    xs: 36,
                                    sm: 38,
                                },

                                height: {
                                    xs: 36,
                                    sm: 38,
                                },

                                bgcolor: "primary.main",

                                fontSize: {
                                    xs: "0.95rem",
                                    sm: "1rem",
                                },
                            }}
                        >
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}
                        </Avatar>

                        {!isMobile && (
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    noWrap
                                >
                                    {user?.name || "Administrator"}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                >
                                    {user?.role || "admin"}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* =================================================
                DESKTOP DRAWER
            ================================================== */}

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,

                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",

                            borderRight:
                                "1px solid rgba(75, 22, 76, 0.08)",

                            backgroundColor: "#FFFFFF",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* =================================================
                MOBILE DRAWER
            ================================================== */}

            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={closeMobileDrawer}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    PaperProps={{
                        sx: {
                            width: {
                                xs: "82vw",
                                sm: drawerWidth,
                            },

                            maxWidth: drawerWidth,

                            boxSizing: "border-box",

                            backgroundColor: "#FFFFFF",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,

                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },

                    minWidth: 0,

                    overflowX: "hidden",
                }}
            >
                {/* APP BAR SPACER */}

                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 60,
                            sm: 68,
                        },
                    }}
                />

                {/* CONTENT */}

                <Box
                    sx={{
                        width: "100%",

                        px: {
                            xs: 1.5,
                            sm: 3,
                            md: 4,
                        },

                        py: {
                            xs: 2.5,
                            sm: 3,
                            md: 4,
                        },

                        maxWidth: 1400,

                        mx: "auto",

                        boxSizing: "border-box",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export default AdminDashboardLayout;