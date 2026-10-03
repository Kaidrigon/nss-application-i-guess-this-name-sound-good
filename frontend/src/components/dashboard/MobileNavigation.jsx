    import {
    Dashboard,
    Event,
    History,
    Person,
    } from "@mui/icons-material";

    import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    } from "@mui/material";

    import { useLocation, useNavigate } from "react-router-dom";

    function MobileNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
        label: "Home",
        icon: <Dashboard />,
        path: "/dashboard",
        },
        {
        label: "Events",
        icon: <Event />,
        path: "/events",
        },
        {
        label: "Hours",
        icon: <History />,
        path: "/service-hours",
        },
        {
        label: "Profile",
        icon: <Person />,
        path: "/profile",
        },
    ];

    const currentPath =
        menuItems.find((item) =>
        location.pathname.startsWith(item.path)
        )?.path || "/dashboard";

    return (
        <Paper
        elevation={8}
        sx={{
            display: {
            xs: "block",
            md: "none",
            },

            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,

            zIndex: 1200,

            borderTop:
            "1px solid rgba(75, 22, 76, 0.08)",
        }}
        >
        <BottomNavigation
            value={currentPath}
            onChange={(event, newValue) => {
            navigate(newValue);
            }}
            showLabels
        >
            {menuItems.map((item) => (
            <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
            />
            ))}
        </BottomNavigation>
        </Paper>
    );
    }

    export default MobileNavigation;