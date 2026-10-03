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
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
            "radial-gradient(circle at top left, #E8B6C7 0%, transparent 35%), #FBF7F2",
            px: 2,
            py: 4,
        }}
        >
        <Container
            maxWidth="xs"
            sx={{
            display: "flex",
            justifyContent: "center",
            }}
        >
            <Card
            elevation={0}
            sx={{
                width: "100%",
                border: "1px solid rgba(75, 22, 76, 0.08)",
                boxShadow:
                "0 20px 60px rgba(75, 22, 76, 0.12)",
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
                {/* Login heading */}
                <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 4,
                }}
                >
                <Box
                    sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "20px",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    color: "white",
                    }}
                >
                    <LoginIcon fontSize="large" />
                </Box>

                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                >
                    Welcome back
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    Sign in to your NSS account
                </Typography>
                </Box>

                {/* Error message */}
                {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
                )}

                {/* Login form */}
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
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                    mt: 3,
                    py: 1.5,
                    }}
                >
                    {loading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>
                </Box>
            </CardContent>
            </Card>
        </Container>
        </Box>
    );
    }

    export default Login;
