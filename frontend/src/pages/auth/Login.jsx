
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
    } from "@mui/material";

    import { Visibility, VisibilityOff } from "@mui/icons-material";

    import { useAuth } from "../../context/AuthContext";

    function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!loginId.trim() || !password) {
        setError("Please enter your login ID and password.");
        return;
        }

        try {
        setLoading(true);

        const currentUser = await login(loginId.trim(), password);

        if (currentUser.role === "admin") {
            navigate("/admin", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
        } catch (err) {
        console.error("Login failed:", err);

        setError(
            err.response?.data?.detail ||
            "Login failed. Please check your credentials and try again."
        );
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
            px: 2,
            py: 4,
            background:
            "linear-gradient(135deg, #fff4ed 0%, #f8e5e9 48%, #f0e5f5 100%)",
        }}
        >
        <Card
            elevation={0}
            sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 4,
            border: "1px solid rgba(75, 22, 76, 0.10)",
            boxShadow: "0 20px 60px rgba(75, 22, 76, 0.10)",
            overflow: "visible",
            }}
        >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center">
                <Box
                component="img"
                src="/nss-logo.png"
                alt="NSS logo"
                sx={{
                    width: 88,
                    height: 88,
                    objectFit: "contain",
                }}
                onError={(event) => {
                    event.currentTarget.style.display = "none";
                }}
                />

                <Box textAlign="center">
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={800}
                    sx={{ color: "#4b164c", letterSpacing: "-0.04em" }}
                >
                    Welcome back
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    Sign in to your NSS community account.
                </Typography>
                </Box>

                {error && (
                <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
                    {error}
                </Alert>
                )}

                <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
                >
                <Stack spacing={2.25}>
                    <TextField
                    fullWidth
                    required
                    label="Roll number, email or phone number"
                    placeholder="Enter your login ID"
                    autoComplete="username"
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    disabled={loading}
                    />

                    <TextField
                    fullWidth
                    required
                    label="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    slotProps={{
                        input: {
                        endAdornment: (
                            <InputAdornment position="end">
                            <IconButton
                                aria-label={
                                showPassword ? "Hide password" : "Show password"
                                }
                                onClick={() =>
                                setShowPassword((previous) => !previous)
                                }
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                disabled={loading}
                                size="small"
                            >
                                {showPassword ? (
                                <VisibilityOff fontSize="small" />
                                ) : (
                                <Visibility fontSize="small" />
                                )}
                            </IconButton>
                            </InputAdornment>
                        ),
                        },
                    }}
                    />

                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                        minHeight: 50,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "1rem",
                        bgcolor: "#4b164c",
                        "&:hover": { bgcolor: "#351037" },
                    }}
                    >
                    {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </Stack>
                </Box>

                <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                >
                Don't have a volunteer account?{" "}
                <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    sx={{ color: "#4b164c", fontWeight: 700 }}
                >
                    Register
                </Link>
                </Typography>
            </Stack>
            </CardContent>
        </Card>
        </Box>
    );
    }

    export default Login;
