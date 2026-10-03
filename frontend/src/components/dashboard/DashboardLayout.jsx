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
    Event,
    History,
    Logout,
    Menu as MenuIcon,
    Person,
    } from "@mui/icons-material";

    import { useNavigate, useLocation } from "react-router-dom";

    import { useAuth } from "../../context/AuthContext";

    import nssLogo from "../../assets/nss-logo.png";

    const drawerWidth = 250;

    function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, logout } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
    setMobileOpen((previous) => !previous);
    };

    const handleNavigation = (path) => {
    if (isMobile) {
    setMobileOpen(false);
    }


    navigate(path);


    };

    const handleLogout = () => {
    if (isMobile) {
    setMobileOpen(false);
    }


    logout();
    navigate("/login");


    };

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
            sx={{ lineHeight: 1.2 }}
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

    <List sx={{ px: 1.5, py: 2 }}>
        <ListItemButton
        selected={location.pathname === "/dashboard"}
        onClick={() => handleNavigation("/dashboard")}
        sx={{
            borderRadius: 2,
            mb: 0.5,
        }}
        >
        <ListItemIcon>
            <DashboardIcon />
        </ListItemIcon>

        <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton
        selected={location.pathname.startsWith("/events")}
        onClick={() => handleNavigation("/events")}
        sx={{
            borderRadius: 2,
            mb: 0.5,
        }}
        >
        <ListItemIcon>
            <Event />
        </ListItemIcon>

        <ListItemText primary="Events" />
        </ListItemButton>

        <ListItemButton
        selected={location.pathname.startsWith("/service-hours")}
        onClick={() => handleNavigation("/service-hours")}
        sx={{
            borderRadius: 2,
            mb: 0.5,
        }}
        >
        <ListItemIcon>
            <AccessTime />
        </ListItemIcon>

        <ListItemText primary="Service Hours" />
        </ListItemButton>

        <ListItemButton
        selected={location.pathname.startsWith("/history")}
        onClick={() => handleNavigation("/history")}
        sx={{
            borderRadius: 2,
            mb: 0.5,
        }}
        >
        <ListItemIcon>
            <History />
        </ListItemIcon>

        <ListItemText primary="History" />
        </ListItemButton>

        <ListItemButton
        selected={location.pathname.startsWith("/profile")}
        onClick={() => handleNavigation("/profile")}
        sx={{
            borderRadius: 2,
            mb: 0.5,
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

    return (
    <Box
    sx={{
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#FBF7F2",
    }}
    >
    {/* TOP BAR */}


    <AppBar
        position="fixed"
        elevation={0}
        sx={{
        width: {
            md: `calc(100% - ${drawerWidth}px)`,
        },

        ml: {
            md: `${drawerWidth}px`,
        },

        backgroundColor: "#FBF7F2",

        color: "text.primary",

        borderBottom:
            "1px solid rgba(75, 22, 76, 0.08)",
        }}
    >
        <Toolbar
        sx={{
            minHeight: {
            xs: 64,
            sm: 70,
            },
        }}
        >
        {isMobile && (
            <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1 }}
            aria-label="open navigation menu"
            >
            <MenuIcon />
            </IconButton>
        )}

        <Typography
            variant="h6"
            fontWeight={700}
            sx={{
            flexGrow: 1,
            }}
        >
            NSS Dashboard
        </Typography>

        <Box
            sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            }}
        >
            <Avatar
            sx={{
                width: 38,
                height: 38,
                bgcolor: "primary.main",
            }}
            >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>

            {!isMobile && (
            <Box>
                <Typography
                variant="body2"
                fontWeight={600}
                >
                {user?.name || "Volunteer"}
                </Typography>

                <Typography
                variant="caption"
                color="text.secondary"
                >
                {user?.role || "Volunteer"}
                </Typography>
            </Box>
            )}
        </Box>
        </Toolbar>
    </AppBar>

    {/* DESKTOP DRAWER */}

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

    {/* MOBILE DRAWER */}

    {isMobile && (
        <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
            keepMounted: true,
        }}
        sx={{
            "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            },
        }}
        >
        {drawerContent}
        </Drawer>
    )}

    {/* MAIN CONTENT */}

    <Box
        component="main"
        sx={{
        flexGrow: 1,

        width: {
            md: `calc(100% - ${drawerWidth}px)`,
        },

        minWidth: 0,
        }}
    >
        <Toolbar
        sx={{
            minHeight: {
            xs: 64,
            sm: 70,
            },
        }}
        />

        <Box
        sx={{
            px: {
            xs: 2,
            sm: 3,
            md: 4,
            },

            py: {
            xs: 3,
            md: 4,
            },

            maxWidth: 1400,
            mx: "auto",
        }}
        >
        {children}
        </Box>
    </Box>
    </Box>


    );
    }

    export default DashboardLayout;
