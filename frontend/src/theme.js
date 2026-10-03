    import { createTheme } from "@mui/material/styles";

    const theme = createTheme({
    palette: {
        mode: "light",

        primary: {
        main: "#3D1744",
        contrastText: "#FFFFFF",
        },

        secondary: {
        main: "#D83A3A",
        contrastText: "#FFFFFF",
        },

        background: {
        default: "#FBF7F2",
        paper: "#FFFFFF",
        },

        text: {
        primary: "#211A24",
        secondary: "#6F6572",
        },
    },

    typography: {
        fontFamily:
        '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

        h1: {
        fontWeight: 800,
        letterSpacing: "-0.04em",
        },

        h2: {
        fontWeight: 800,
        letterSpacing: "-0.035em",
        },

        h3: {
        fontWeight: 750,
        letterSpacing: "-0.03em",
        },

        h4: {
        fontWeight: 750,
        letterSpacing: "-0.025em",
        },

        button: {
        textTransform: "none",
        fontWeight: 700,
        },
    },

    shape: {
        borderRadius: 18,
    },

    components: {
        MuiCard: {
        styleOverrides: {
            root: {
            borderRadius: 24,
            border:
                "1px solid rgba(61, 23, 68, 0.07)",
            },
        },
        },

        MuiButton: {
        styleOverrides: {
            root: {
            borderRadius: 14,
            paddingTop: 11,
            paddingBottom: 11,
            },
        },
        },

        MuiTextField: {
        defaultProps: {
            variant: "outlined",
        },
        },
    },
    });

    export default theme;
