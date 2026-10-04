import { useEffect, useMemo, useState } from "react";

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
    getAdmins,
    registerFirstAdmin,
    registerVolunteer,
} from "../../services/auth";

import nssLogo from "../../assets/nss-logo.png";


function Register() {

    const navigate = useNavigate();

    const [mode, setMode] = useState("volunteer");

    const [admins, setAdmins] = useState([]);

    const [loadingAdmins, setLoadingAdmins] = useState(true);

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


    // =====================================================
    // LOAD ADMINS
    // =====================================================

    useEffect(() => {

        const loadAdmins = async () => {

            try {

                setLoadingAdmins(true);

                const data = await getAdmins();

                setAdmins(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load administrators:",
                    error
                );

                setAdmins([]);

            } finally {

                setLoadingAdmins(false);
            }
        };

        loadAdmins();

    }, []);


    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    const passwordChecks = useMemo(
        () => ({
            length:
                password.length >= 8,

            uppercase:
                /[A-Z]/.test(password),

            lowercase:
                /[a-z]/.test(password),

            number:
                /\d/.test(password),

            special:
                /[^A-Za-z0-9]/.test(password),
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


    const adminExists =
        admins.length > 0;


    // =====================================================
    // CHANGE MODE
    // =====================================================

    const handleModeChange = (event) => {

        setMode(
            event.target.value
        );

        setError("");

        setSuccess("");
    };


    // =====================================================
    // FORMAT BACKEND ERRORS
    // =====================================================

    const getBackendErrorMessage = (error) => {

        const detail =
            error.response?.data?.detail;

        // Normal FastAPI string error
        if (typeof detail === "string") {
            return detail;
        }

        // FastAPI validation error array
        if (Array.isArray(detail)) {

            return detail
                .map((item) => {

                    const location =
                        Array.isArray(item.loc)
                            ? item.loc.join(".")
                            : "";

                    return location
                        ? `${location}: ${item.msg}`
                        : item.msg;

                })
                .join("\n");
        }

        return (
            "Registration failed. Please try again."
        );
    };


    // =====================================================
    // SUBMIT REGISTRATION
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");


        // -------------------------------------------------
        // COORDINATOR
        // -------------------------------------------------

        if (mode === "coordinator") {

            setError(
                "Coordinator accounts cannot be created through registration. Please register as a volunteer and contact an administrator."
            );

            return;
        }


        // -------------------------------------------------
        // ADMIN ALREADY EXISTS
        // -------------------------------------------------

        if (
            mode === "admin" &&
            adminExists
        ) {

            setError(
                "First-admin registration is no longer available. Please register as a volunteer and contact an administrator."
            );

            return;
        }


        // -------------------------------------------------
        // NAME
        // -------------------------------------------------

        if (!name.trim()) {

            setError(
                "Please enter your name."
            );

            return;
        }


        // -------------------------------------------------
        // LOGIN ID
        // -------------------------------------------------

        if (!loginId.trim()) {

            setError(
                "Please enter your roll number or email."
            );

            return;
        }


        // -------------------------------------------------
        // CLASS
        // -------------------------------------------------

        if (!className.trim()) {

            setError(
                "Please enter your class."
            );

            return;
        }


        // -------------------------------------------------
        // YEAR
        // -------------------------------------------------

        if (!year) {

            setError(
                "Please select your year."
            );

            return;
        }


        // -------------------------------------------------
        // PASSWORD
        // -------------------------------------------------

        if (!passwordIsValid) {

            setError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );

            return;
        }


        // -------------------------------------------------
        // CONFIRM PASSWORD
        // -------------------------------------------------

        if (!passwordsMatch) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        // -------------------------------------------------
        // ADMIN SETUP KEY
        // -------------------------------------------------

        if (
            mode === "admin" &&
            !setupKey.trim()
        ) {

            setError(
                "Please enter the admin setup key."
            );

            return;
        }


        // =================================================
        // SEND REQUEST
        // =================================================

        try {

            setLoading(true);


            const registrationData = {

                name:
                    name.trim(),

                login_id:
                    loginId.trim(),

                class_name:
                    className.trim(),

                year:
                    Number(year),

                password,
            };


            // ------------------------------------------------
            // FIRST ADMIN
            // ------------------------------------------------

            if (mode === "admin") {

                await registerFirstAdmin(
                    registrationData,
                    setupKey.trim()
                );

                setSuccess(
                    "Admin account created successfully. You can now sign in."
                );

            }

            // ------------------------------------------------
            // VOLUNTEER
            // ------------------------------------------------

            else {

                await registerVolunteer(
                    registrationData
                );

                setSuccess(
                    "Volunteer account created successfully. You can now sign in."
                );
            }


            // ------------------------------------------------
            // CLEAR FORM
            // ------------------------------------------------

            setName("");

            setLoginId("");

            setClassName("");

            setYear("");

            setPassword("");

            setConfirmPassword("");

            setSetupKey("");


            // ------------------------------------------------
            // REFRESH ADMINS
            // ------------------------------------------------

            if (mode === "admin") {

                const updatedAdmins =
                    await getAdmins();

                setAdmins(
                    Array.isArray(updatedAdmins)
                        ? updatedAdmins
                        : []
                );
            }

        } catch (error) {

            console.error(
                "Registration failed:",
                error
            );

            setError(
                getBackendErrorMessage(error)
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // ADMIN INFORMATION
    // =====================================================

    const AdminInformation = () => {

        if (loadingAdmins) {

            return (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    Checking administrator status...
                </Alert>
            );
        }


        if (!adminExists) {
            return null;
        }


        return (
            <Alert
                severity="info"
                icon={
                    <AdminPanelSettings />
                }
                sx={{
                    mb: 3,
                    alignItems: "flex-start",
                    borderRadius: 2,
                }}
            >

                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        mb: 0.5,
                    }}
                >
                    First-admin registration is unavailable
                </Typography>


                <Typography variant="body2">
                    This NSS system already has an administrator.
                    Please register as a volunteer and contact an
                    administrator to have your role changed.
                </Typography>


                <Box sx={{ mt: 1 }}>

                    <Typography
                        variant="body2"
                        fontWeight={600}
                    >
                        Current administrator
                        {admins.length > 1 ? "s" : ""}:
                    </Typography>


                    {admins.map(
                        (admin, index) => (
                            <Typography
                                key={`${admin.name}-${index}`}
                                variant="body2"
                            >
                                • {admin.name}
                            </Typography>
                        )
                    )}

                </Box>

            </Alert>
        );
    };


    // =====================================================
    // COORDINATOR INFORMATION
    // =====================================================

    const CoordinatorInformation = () => {

        return (
            <Alert
                severity="info"
                icon={
                    <AdminPanelSettings />
                }
                sx={{
                    mb: 3,
                    alignItems: "flex-start",
                    borderRadius: 2,
                }}
            >

                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        mb: 0.5,
                    }}
                >
                    Coordinator accounts cannot be self-created
                </Typography>


                <Typography variant="body2">
                    Please register as a volunteer and contact an
                    administrator to have your role changed to
                    coordinator.
                </Typography>


                {admins.length > 0 && (

                    <Box sx={{ mt: 1 }}>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            Current administrator
                            {admins.length > 1 ? "s" : ""}:
                        </Typography>


                        {admins.map(
                            (admin, index) => (
                                <Typography
                                    key={`${admin.name}-${index}`}
                                    variant="body2"
                                >
                                    • {admin.name}
                                </Typography>
                            )
                        )}

                    </Box>
                )}

            </Alert>
        );
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <Box
            sx={{
                minHeight: "100dvh",

                background:
                    "radial-gradient(circle at top right, #E8B6C7 0%, transparent 35%), #FBF7F2",

                px: {
                    xs: 1.5,
                    sm: 2,
                },

                py: {
                    xs: 2.5,
                    sm: 5,
                },

                boxSizing: "border-box",
            }}
        >

            <Container
                maxWidth="sm"
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
                                sm: 5,
                            },
                        }}
                    >

                        {/* LOGO */}

                        <Box
                            sx={{
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
                                    mb: 1.5,
                                }}
                            />


                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontSize: {
                                        xs: "1.7rem",
                                        sm: "2.125rem",
                                    },

                                    fontWeight: 700,
                                }}
                            >
                                Create your account
                            </Typography>


                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.75,
                                }}
                            >
                                Join the NSS community
                            </Typography>

                        </Box>


                        {/* REGISTRATION MODE */}

                        <FormControl
                            sx={{
                                width: "100%",
                                mb: 3,
                            }}
                        >

                            <RadioGroup
                                value={mode}
                                onChange={
                                    handleModeChange
                                }
                                sx={{
                                    display: "grid",

                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(3, 1fr)",
                                    },

                                    gap: 1,

                                    width: "100%",
                                }}
                            >

                                <FormControlLabel
                                    value="volunteer"
                                    control={<Radio />}
                                    label="Volunteer"
                                    sx={{
                                        m: 0,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 2,
                                        border:
                                            "1px solid rgba(75, 22, 76, 0.08)",
                                    }}
                                />


                                <FormControlLabel
                                    value="admin"
                                    control={<Radio />}
                                    label="First Admin"
                                    sx={{
                                        m: 0,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 2,
                                        border:
                                            "1px solid rgba(75, 22, 76, 0.08)",
                                    }}
                                />


                                <FormControlLabel
                                    value="coordinator"
                                    control={<Radio />}
                                    label="Coordinator"
                                    sx={{
                                        m: 0,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 2,
                                        border:
                                            "1px solid rgba(75, 22, 76, 0.08)",
                                    }}
                                />

                            </RadioGroup>

                        </FormControl>


                        {/* ADMIN INFORMATION */}

                        {mode === "admin" && (
                            <AdminInformation />
                        )}


                        {/* COORDINATOR INFORMATION */}

                        {mode === "coordinator" && (
                            <CoordinatorInformation />
                        )}


                        {/* ERROR */}

                        {error && (

                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    whiteSpace: "pre-line",
                                }}
                                onClose={() =>
                                    setError("")
                                }
                            >
                                {error}
                            </Alert>

                        )}


                        {/* SUCCESS */}

                        {success && (

                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                }}
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={() =>
                                            navigate(
                                                "/login"
                                            )
                                        }
                                    >
                                        Sign in
                                    </Button>
                                }
                            >
                                {success}
                            </Alert>

                        )}


                        {/* FORM */}

                        {mode !== "coordinator" &&
                            !(
                                mode === "admin" &&
                                adminExists
                            ) && (

                                <Box
                                    component="form"
                                    onSubmit={
                                        handleSubmit
                                    }
                                    noValidate
                                >

                                    {/* NAME */}

                                    <TextField
                                        fullWidth
                                        label="Full name"
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event.target.value
                                            )
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
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                minHeight: 56,
                                            },
                                        }}
                                    />


                                    {/* LOGIN ID */}

                                    <TextField
                                        fullWidth
                                        label="Roll number or email"
                                        value={loginId}
                                        onChange={(event) =>
                                            setLoginId(
                                                event.target.value
                                            )
                                        }
                                        margin="normal"
                                        autoComplete="username"
                                        helperText="You can use either your roll number or email."
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <School />
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


                                    {/* CLASS */}

                                    <TextField
                                        fullWidth
                                        label="Class"
                                        value={className}
                                        onChange={(event) =>
                                            setClassName(
                                                event.target.value
                                            )
                                        }
                                        margin="normal"
                                        placeholder="e.g. BCA 2nd Year"
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                minHeight: 56,
                                            },
                                        }}
                                    />


                                    {/* YEAR */}

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
                                                setYear(
                                                    event.target.value
                                                )
                                            }
                                            sx={{
                                                minHeight: 56,
                                            }}
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


                                    {/* ADMIN SETUP KEY */}

                                    {mode === "admin" && (

                                        <TextField
                                            fullWidth
                                            label="Admin setup key"
                                            type="password"
                                            value={setupKey}
                                            onChange={(event) =>
                                                setSetupKey(
                                                    event.target.value
                                                )
                                            }
                                            margin="normal"
                                            helperText="Enter the setup key configured in the backend."
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AdminPanelSettings />
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

                                    )}


                                    {/* PASSWORD */}

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
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
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                minHeight: 56,
                                            },
                                        }}
                                    />


                                    {/* PASSWORD RULES */}

                                    <Box
                                        sx={{
                                            mt: 1,
                                            mb: 1,
                                            px: 1,
                                        }}
                                    >

                                        <Typography
                                            variant="caption"
                                            display="block"
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


                                    {/* CONFIRM PASSWORD */}

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
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                minHeight: 56,
                                            },
                                        }}
                                    />


                                    {/* SUBMIT */}

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
                                        }}
                                    >
                                        {loading
                                            ? "Creating account..."
                                            : mode === "admin"
                                                ? "Create First Admin"
                                                : "Create Volunteer Account"}
                                    </Button>

                                </Box>
                            )}


                        {/* LOGIN LINK */}

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() =>
                                navigate("/login")
                            }
                            sx={{
                                mt: 1,
                                minHeight: 48,
                                fontWeight: 600,
                            }}
                        >
                            Already have an account? Sign in
                        </Button>

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
                    made with ❤️ by the Code craft club of S.D. College,
                    Ambala cantt (this project is currently managed by
                    Keshav/Kaidrigon)
                </Typography>

            </Container>

        </Box>
    );
}


export default Register;