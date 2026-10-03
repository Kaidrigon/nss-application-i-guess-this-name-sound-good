    import { useMemo, useState } from "react";

    import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography,
    } from "@mui/material";

    import {
    AdminPanelSettings,
    Lock,
    Person,
    School,
    } from "@mui/icons-material";

    import { useNavigate } from "react-router-dom";

    import {
    registerFirstAdmin,
    registerVolunteer,
    } from "../../services/auth";

    function Register() {
    const navigate = useNavigate();

    const [mode, setMode] = useState("volunteer");

    const [name, setName] = useState("");
    const [loginId, setLoginId] = useState("");
    const [className, setClassName] = useState("");
    const [year, setYear] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [setupKey, setSetupKey] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordChecks = useMemo(
        () => ({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        }),
        [password]
    );

    const passwordIsValid =
        passwordChecks.length &&
        passwordChecks.uppercase &&
        passwordChecks.lowercase &&
        passwordChecks.number &&
        passwordChecks.special;

    const passwordsMatch =
        password.length > 0 &&
        password === confirmPassword;

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const handleModeChange = (event) => {
        setMode(event.target.value);
        resetMessages();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        resetMessages();

        if (!name.trim()) {
        setError("Please enter your name.");
        return;
        }

        if (!loginId.trim()) {
        setError(
            "Please enter your roll number or email."
        );
        return;
        }

        if (!className.trim()) {
        setError("Please enter your class.");
        return;
        }

        if (!year) {
        setError("Please select your year.");
        return;
        }

        if (!passwordIsValid) {
        setError(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
        return;
        }

        if (!passwordsMatch) {
        setError("Passwords do not match.");
        return;
        }

        if (mode === "admin" && !setupKey.trim()) {
        setError("Please enter the admin setup key.");
        return;
        }

        try {
        setLoading(true);

        const registrationData = {
            name: name.trim(),
            login_id: loginId.trim(),
            class_name: className.trim(),
            year: Number(year),
            password,
        };

        if (mode === "admin") {
            await registerFirstAdmin(
            registrationData,
            setupKey.trim()
            );

            setSuccess(
            "Admin account created successfully. You can now sign in."
            );
        } else {
            await registerVolunteer(registrationData);

            setSuccess(
            "Volunteer account created successfully. You can now sign in."
            );
        }

        setName("");
        setLoginId("");
        setClassName("");
        setYear("");
        setPassword("");
        setConfirmPassword("");
        setSetupKey("");
        } catch (error) {
        const message =
            error.response?.data?.detail ||
            "Registration failed. Please try again.";

        setError(message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <Box
        sx={{
            minHeight: "100vh",
            background:
            "radial-gradient(circle at top right, #E8B6C7 0%, transparent 35%), #FBF7F2",
            py: {
            xs: 3,
            sm: 5,
            },
            px: 2,
        }}
        >
        <Container maxWidth="sm">
            <Card
            elevation={0}
            sx={{
                border:
                "1px solid rgba(75, 22, 76, 0.08)",
                boxShadow:
                "0 20px 60px rgba(75, 22, 76, 0.12)",
            }}
            >
            <CardContent
                sx={{
                p: {
                    xs: 3,
                    sm: 5,
                },
                }}
            >
                <Box
                sx={{
                    textAlign: "center",
                    mb: 4,
                }}
                >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                >
                    Create your account
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Join the NSS community
                </Typography>
                </Box>

                <FormControl sx={{ width: "100%", mb: 3 }}>
                <RadioGroup
                    row
                    value={mode}
                    onChange={handleModeChange}
                    sx={{
                    justifyContent: "center",
                    gap: {
                        xs: 0,
                        sm: 2,
                    },
                    }}
                >
                    <FormControlLabel
                    value="volunteer"
                    control={<Radio />}
                    label="Volunteer"
                    />

                    <FormControlLabel
                    value="admin"
                    control={
                        <Radio
                        icon={<AdminPanelSettings />}
                        checkedIcon={
                            <AdminPanelSettings />
                        }
                        />
                    }
                    label="First Admin"
                    />
                </RadioGroup>
                </FormControl>

                {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
                )}

                {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => navigate("/login")}
                    >
                        Sign in
                    </Button>
                    }
                >
                    {success}
                </Alert>
                )}

                <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                >
                <TextField
                    fullWidth
                    label="Full name"
                    value={name}
                    onChange={(event) =>
                    setName(event.target.value)
                    }
                    margin="normal"
                    autoComplete="name"
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
                    label="Roll number or email"
                    value={loginId}
                    onChange={(event) =>
                    setLoginId(event.target.value)
                    }
                    margin="normal"
                    autoComplete="username"
                    helperText={
                    "You can use either your roll number or email."
                    }
                    slotProps={{
                    input: {
                        startAdornment: (
                        <InputAdornment position="start">
                            <School />
                        </InputAdornment>
                        ),
                    },
                    }}
                />

                <TextField
                    fullWidth
                    label="Class"
                    value={className}
                    onChange={(event) =>
                    setClassName(event.target.value)
                    }
                    margin="normal"
                    placeholder="e.g. BCA 2nd Year"
                />

                <FormControl
                    fullWidth
                    margin="normal"
                >
                    <InputLabel id="year-label">
                    Year
                    </InputLabel>

                    <Select
                    labelId="year-label"
                    label="Year"
                    value={year}
                    onChange={(event) =>
                        setYear(event.target.value)
                    }
                    >
                    <MenuItem value={1}>
                        1st Year
                    </MenuItem>

                    <MenuItem value={2}>
                        2nd Year
                    </MenuItem>

                    <MenuItem value={3}>
                        3rd Year
                    </MenuItem>

                    <MenuItem value={4}>
                        4th Year
                    </MenuItem>
                    </Select>
                </FormControl>

                {mode === "admin" && (
                    <TextField
                    fullWidth
                    label="Admin setup key"
                    type="password"
                    value={setupKey}
                    onChange={(event) =>
                        setSetupKey(event.target.value)
                    }
                    margin="normal"
                    helperText="Enter the setup key configured in your backend environment."
                    slotProps={{
                        input: {
                        startAdornment: (
                            <InputAdornment position="start">
                            <AdminPanelSettings />
                            </InputAdornment>
                        ),
                        },
                    }}
                    />
                )}

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                    setPassword(event.target.value)
                    }
                    margin="normal"
                    autoComplete="new-password"
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

                <Box
                    sx={{
                    mt: 1,
                    mb: 1,
                    px: 1,
                    }}
                >
                    <Typography
                    variant="caption"
                    color={
                        passwordChecks.length
                        ? "success.main"
                        : "text.secondary"
                    }
                    >
                    {passwordChecks.length
                        ? "✓"
                        : "•"}{" "}
                    At least 8 characters
                    </Typography>

                    <Typography
                    variant="caption"
                    display="block"
                    color={
                        passwordChecks.uppercase
                        ? "success.main"
                        : "text.secondary"
                    }
                    >
                    {passwordChecks.uppercase
                        ? "✓"
                        : "•"}{" "}
                    One uppercase letter
                    </Typography>

                    <Typography
                    variant="caption"
                    display="block"
                    color={
                        passwordChecks.lowercase
                        ? "success.main"
                        : "text.secondary"
                    }
                    >
                    {passwordChecks.lowercase
                        ? "✓"
                        : "•"}{" "}
                    One lowercase letter
                    </Typography>

                    <Typography
                    variant="caption"
                    display="block"
                    color={
                        passwordChecks.number
                        ? "success.main"
                        : "text.secondary"
                    }
                    >
                    {passwordChecks.number
                        ? "✓"
                        : "•"}{" "}
                    One number
                    </Typography>

                    <Typography
                    variant="caption"
                    display="block"
                    color={
                        passwordChecks.special
                        ? "success.main"
                        : "text.secondary"
                    }
                    >
                    {passwordChecks.special
                        ? "✓"
                        : "•"}{" "}
                    One special character
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                    setConfirmPassword(
                        event.target.value
                    )
                    }
                    margin="normal"
                    autoComplete="new-password"
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
                    ? "Creating account..."
                    : mode === "admin"
                        ? "Create First Admin"
                        : "Create Volunteer Account"}
                </Button>

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate("/login")}
                    sx={{
                    mt: 1,
                    }}
                >
                    Already have an account? Sign in
                </Button>
                </Box>
            </CardContent>
            </Card>
        </Container>
        </Box>
    );
    }

    export default Register;
