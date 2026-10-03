    import { useState } from "react";

    import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    InputAdornment,
    TextField,
    Typography,
    } from "@mui/material";

    import {
    Lock,
    Login as LoginIcon,
    Person,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";
    import { useAuth } from "../../context/AuthContext";

    import nssLogo from "../../assets/nss-logo.png";

    function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");


    if (!loginId.trim()) {
    setError("Please enter your roll number or email.");
    return;
    }

    if (!password) {
    setError("Please enter your password.");
    return;
    }

    try {
    setLoading(true);

    const user = await login(
        loginId.trim(),
        password
    );

    if (
        user.role === "admin" ||
        user.role === "coordinator"
    ) {
        navigate("/staff/dashboard");
    } else {
        navigate("/dashboard");
    }
    } catch (error) {
    const message =
        error.response?.data?.detail ||
        "Unable to login. Please check your credentials.";

    setError(message);
    } finally {
    setLoading(false);
    }


    };

    return (
    <Box
    sx={{
    minHeight: "100dvh",
    display: "flex",
    alignItems: {
    xs: "flex-start",
    sm: "center",
    },
    justifyContent: "center",


        background:
        "radial-gradient(circle at top left, #E8B6C7 0%, transparent 35%), #FBF7F2",

        px: {
        xs: 1.5,
        sm: 2,
        },

        py: {
        xs: 3,
        sm: 5,
        },

        boxSizing: "border-box",
    }}
    >
    <Container
        maxWidth="xs"
        disableGutters
        sx={{
        width: "100%",
        }}
    >
        <Card
        elevation={0}
        sx={{
            width: "100%",
            borderRadius: {
            xs: 3,
            sm: 4,
            },

            border:
            "1px solid rgba(75, 22, 76, 0.08)",

            boxShadow:
            "0 20px 60px rgba(75, 22, 76, 0.12)",

            overflow: "hidden",
        }}
        >
        <CardContent
            sx={{
            p: {
                xs: 2.5,
                sm: 4,
            },
            }}
        >
            {/* LOGO + HEADER */}

            <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                mb: {
                xs: 3,
                sm: 4,
                },
            }}
            >
            <Box
                component="img"
                src={nssLogo}
                alt="NSS Logo"
                sx={{
                width: {
                    xs: 76,
                    sm: 92,
                },

                height: {
                    xs: 76,
                    sm: 92,
                },

                objectFit: "contain",
                mb: 2,
                }}
            />

            <Box
                sx={{
                width: 48,
                height: 48,
                borderRadius: "16px",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                mb: 1.5,
                }}
            >
                <LoginIcon />
            </Box>

            <Typography
                variant="h4"
                component="h1"
                sx={{
                fontSize: {
                    xs: "1.75rem",
                    sm: "2.125rem",
                },

                fontWeight: 700,
                }}
            >
                Welcome back
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                mt: 0.75,
                px: 1,
                }}
            >
                Sign in to your NSS account
            </Typography>
            </Box>

            {/* ERROR */}

            {error && (
            <Alert
                severity="error"
                sx={{
                mb: 2,
                borderRadius: 2,
                }}
                onClose={() => setError("")}
            >
                {error}
            </Alert>
            )}

            {/* LOGIN FORM */}

            <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            >
            <TextField
                fullWidth
                label="Roll number or email"
                placeholder="Enter your roll number or email"
                value={loginId}
                onChange={(event) =>
                setLoginId(event.target.value)
                }
                autoComplete="username"
                margin="normal"
                slotProps={{
                input: {
                    startAdornment: (
                    <InputAdornment position="start">
                        <Person />
                    </InputAdornment>
                    ),
                },
                }}
                sx={{
                "& .MuiInputBase-root": {
                    minHeight: 56,
                },
                }}
            />

            <TextField
                fullWidth
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                setPassword(event.target.value)
                }
                autoComplete="current-password"
                margin="normal"
                slotProps={{
                input: {
                    startAdornment: (
                    <InputAdornment position="start">
                        <Lock />
                    </InputAdornment>
                    ),
                },
                }}
                sx={{
                "& .MuiInputBase-root": {
                    minHeight: 56,
                },
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                mt: 2.5,
                minHeight: 54,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: {
                    xs: "0.95rem",
                    sm: "1rem",
                },
                }}
            >
                {loading
                ? "Signing in..."
                : "Sign in"}
            </Button>
            </Box>

            {/* REGISTER LINK */}

            <Box
            sx={{
                mt: 3,
                pt: 2.5,
                borderTop:
                "1px solid rgba(75, 22, 76, 0.08)",
                textAlign: "center",
            }}
            >
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
            >
                Don't have an account?
            </Typography>

            <Button
                variant="text"
                onClick={() => navigate("/register")}
                sx={{
                minHeight: 44,
                fontWeight: 600,
                }}
            >
                Create an account
            </Button>
            </Box>
        </CardContent>
        </Card>

        {/* BRANDING */}

        <Typography
        variant="caption"
        color="text.secondary"
        sx={{
            display: "block",
            textAlign: "center",
            mt: 2,
            px: 2,
        }}
        >
        NSS Management & Community Engagement System
        made with ❤️ by the Code craft club of S.D. College, Ambala cantt 
        (this project is currently managed by Keshav/Kaidrigon)
        </Typography>
    </Container>
    </Box>


    );
    }

    export default Login;
