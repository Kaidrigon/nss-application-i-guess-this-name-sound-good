
import { useEffect, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography,
    } from "@mui/material";

    import {
    Lock,
    Save,
    Visibility,
    VisibilityOff,
    } from "@mui/icons-material";

    import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";
    import { useAuth } from "../../context/AuthContext";
    import api from "../../services/api";

    const PASSWORD_RULES =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    function Profile() {
    const { user } = useAuth();

    const isStaff =
        user?.role === "admin" || user?.role === "coordinator";

    const [profile, setProfile] = useState({
        name: "",
        login_id: "",
        email: "",
        phone_number: "",
        class_name: "",
        year: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/auth/me");
            const currentUser = response.data;

            if (!active) return;

            setProfile({
            name: currentUser.name || "",
            login_id:
                currentUser.roll_number ||
                currentUser.email ||
                currentUser.phone_number ||
                "",
            email: currentUser.email || "",
            phone_number: currentUser.phone_number || "",
            class_name: currentUser.class_name || "",
            year: currentUser.year ? String(currentUser.year) : "",
            });

            localStorage.setItem("user", JSON.stringify(currentUser));
        } catch (err) {
            if (!active) return;

            console.error("Failed to load profile:", err);
            setError(
            err.response?.data?.detail || "Unable to load your profile."
            );
        } finally {
            if (active) setLoading(false);
        }
        };

        loadProfile();

        return () => {
        active = false;
        };
    }, []);

    const updateProfileField = (field, value) => {
        setProfile((previous) => ({
        ...previous,
        [field]: value,
        }));
    };

    const updatePasswordField = (field, value) => {
        setPasswordForm((previous) => ({
        ...previous,
        [field]: value,
        }));
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = profile.name.trim();

        if (!name) {
        setError("Please enter your name.");
        return;
        }

        if (isStaff) {
        const email = profile.email.trim().toLowerCase();
        const phoneNumber = profile.phone_number.trim();

        if (!email && !phoneNumber) {
            setError("Please provide at least an email address or phone number.");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (
            phoneNumber &&
            !/^[+\d][\d\s()-]{6,19}$/.test(phoneNumber)
        ) {
            setError("Please enter a valid phone number.");
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.patch("/auth/me/contact-details", {
            name,
            email: email || null,
            phone_number: phoneNumber || null,
            });

            const updatedUser = response.data?.user || response.data;

            localStorage.setItem("user", JSON.stringify(updatedUser));

            setProfile((previous) => ({
            ...previous,
            name: updatedUser.name ?? name,
            email: updatedUser.email || "",
            phone_number: updatedUser.phone_number || "",
            login_id:
                updatedUser.roll_number ||
                updatedUser.email ||
                updatedUser.phone_number ||
                "",
            }));

            setSuccess("Your profile was updated successfully.");
        } catch (err) {
            console.error("Failed to update staff profile:", err);
            setError(
            err.response?.data?.detail || "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }

        return;
        }

        const loginId = profile.login_id.trim();

        if (!loginId) {
        setError("Please enter your roll number or email address.");
        return;
        }

        if (!profile.class_name.trim()) {
        setError("Please enter your class.");
        return;
        }

        if (!profile.year) {
        setError("Please select your year.");
        return;
        }

        try {
        setSavingProfile(true);

        const response = await api.patch("/auth/profile", {
            name,
            login_id: loginId,
            class_name: profile.class_name.trim(),
            year: Number(profile.year),
        });

        const updatedUser = response.data?.user || response.data;

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfile((previous) => ({
            ...previous,
            name: updatedUser.name ?? name,
            login_id:
            updatedUser.roll_number ||
            updatedUser.email ||
            updatedUser.login_id ||
            loginId,
            class_name: updatedUser.class_name || "",
            year: updatedUser.year ? String(updatedUser.year) : "",
        }));

        setSuccess("Your profile was updated successfully.");
        } catch (err) {
        console.error("Failed to update volunteer profile:", err);
        setError(
            err.response?.data?.detail || "Unable to update your profile."
        );
        } finally {
        setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
        !passwordForm.current_password ||
        !passwordForm.new_password ||
        !passwordForm.confirm_password
        ) {
        setError("Please complete all password fields.");
        return;
        }

        if (!PASSWORD_RULES.test(passwordForm.new_password)) {
        setError(
            "Your new password must have at least 8 characters, uppercase and lowercase letters, a number, and a special character. Spaces are not allowed."
        );
        return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
        setError("The new password and confirmation do not match.");
        return;
        }

        if (passwordForm.current_password === passwordForm.new_password) {
        setError("Your new password must be different from your current password.");
        return;
        }

        try {
        setChangingPassword(true);

        await api.post("/auth/change-password", {
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
        });

        setPasswordForm({
            current_password: "",
            new_password: "",
            confirm_password: "",
        });

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        setSuccess("Your password was changed successfully.");
        } catch (err) {
        console.error("Failed to change password:", err);
        setError(
            err.response?.data?.detail || "Unable to change your password."
        );
        } finally {
        setChangingPassword(false);
        }
    };

    const passwordAdornment = (visible, toggle) => ({
        endAdornment: (
        <InputAdornment position="end">
            <IconButton
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={toggle}
            onMouseDown={(event) => event.preventDefault()}
            edge="end"
            size="small"
            >
            {visible ? (
                <VisibilityOff fontSize="small" />
            ) : (
                <Visibility fontSize="small" />
            )}
            </IconButton>
        </InputAdornment>
        ),
    });

    if (loading) {
        return (
        <AdminDashboardLayout>
            <Box
            sx={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography color="text.secondary">Loading profile...</Typography>
            </Stack>
            </Box>
        </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
        <Box sx={{ mb: 4 }}>
            <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{ fontSize: { xs: "1.75rem", sm: "2.1rem" } }}
            >
            My Profile
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your personal details and account security.
            </Typography>
        </Box>

        {error && (
            <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError("")}
            >
            {error}
            </Alert>
        )}

        {success && (
            <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setSuccess("")}
            >
            {success}
            </Alert>
        )}

        <Grid container spacing={3}>
            {/* PROFILE DETAILS */}
            <Grid size={{ xs: 12, lg: 7 }}>
            <Card
                elevation={0}
                sx={{
                height: "100%",
                border: "1px solid rgba(75, 22, 76, 0.08)",
                borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "primary.main",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                    }}
                    >
                    {(profile.name || user?.name || "U")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Personal Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isStaff ? "Staff account" : "Volunteer account"} ·{" "}
                        {user?.role || "user"}
                    </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleProfileSave}>
                    <Stack spacing={2.5}>
                    <TextField
                        fullWidth
                        required
                        label="Full name"
                        value={profile.name}
                        onChange={(event) =>
                        updateProfileField("name", event.target.value)
                        }
                        autoComplete="name"
                    />

                    {isStaff ? (
                        <>
                        <TextField
                            fullWidth
                            label="Email address"
                            type="email"
                            value={profile.email}
                            onChange={(event) =>
                            updateProfileField("email", event.target.value)
                            }
                            autoComplete="email"
                            helperText="Provide an email, phone number, or both."
                        />

                        <TextField
                            fullWidth
                            label="Phone number"
                            value={profile.phone_number}
                            onChange={(event) =>
                            updateProfileField("phone_number", event.target.value)
                            }
                            autoComplete="tel"
                        />
                        </>
                    ) : (
                        <>
                        <TextField
                            fullWidth
                            required
                            label="Roll number or email"
                            value={profile.login_id}
                            onChange={(event) =>
                            updateProfileField("login_id", event.target.value)
                            }
                        />

                        <TextField
                            fullWidth
                            required
                            label="Class"
                            value={profile.class_name}
                            onChange={(event) =>
                            updateProfileField("class_name", event.target.value)
                            }
                        />

                        <FormControl fullWidth required>
                            <TextField
                            select
                            label="Academic year"
                            value={profile.year}
                            onChange={(event) =>
                                updateProfileField("year", event.target.value)
                            }
                            >
                            <MenuItem value="1">Year 1</MenuItem>
                            <MenuItem value="2">Year 2</MenuItem>
                            <MenuItem value="3">Year 3</MenuItem>
                            <MenuItem value="4">Year 4</MenuItem>
                            </TextField>
                        </FormControl>
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={
                        savingProfile ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <Save />
                        )
                        }
                        disabled={savingProfile}
                        sx={{
                        minHeight: 46,
                        borderRadius: 2,
                        alignSelf: { xs: "stretch", sm: "flex-start" },
                        textTransform: "none",
                        fontWeight: 700,
                        }}
                    >
                        {savingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    </Stack>
                </Box>
                </CardContent>
            </Card>
            </Grid>

            {/* ACCOUNT INFORMATION */}
            <Grid size={{ xs: 12, lg: 5 }}>
            <Card
                elevation={0}
                sx={{
                height: "100%",
                border: "1px solid rgba(75, 22, 76, 0.08)",
                borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" fontWeight={700}>
                    Account Information
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Your account details and access level.
                </Typography>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={2}>
                    <Box>
                    <Typography variant="caption" color="text.secondary">
                        Account name
                    </Typography>
                    <Typography fontWeight={600}>
                        {profile.name || "—"}
                    </Typography>
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">
                        Account role
                    </Typography>
                    <Typography fontWeight={600}>
                        {user?.role === "admin"
                        ? "Administrator"
                        : user?.role === "coordinator"
                            ? "Coordinator"
                            : "Volunteer"}
                    </Typography>
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">
                        Login ID
                    </Typography>
                    <Typography sx={{ overflowWrap: "anywhere" }} fontWeight={600}>
                        {isStaff
                        ? profile.email || profile.phone_number || "Not provided"
                        : profile.login_id || "—"}
                    </Typography>
                    </Box>

                    {isStaff && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                        Phone number
                        </Typography>
                        <Typography fontWeight={600}>
                        {profile.phone_number || "Not provided"}
                        </Typography>
                    </Box>
                    )}

                    {!isStaff && (
                    <>
                        <Box>
                        <Typography variant="caption" color="text.secondary">
                            Class
                        </Typography>
                        <Typography fontWeight={600}>
                            {profile.class_name || "—"}
                        </Typography>
                        </Box>

                        <Box>
                        <Typography variant="caption" color="text.secondary">
                            Academic year
                        </Typography>
                        <Typography fontWeight={600}>
                            {profile.year ? `Year ${profile.year}` : "—"}
                        </Typography>
                        </Box>
                    </>
                    )}
                </Stack>
                </CardContent>
            </Card>
            </Grid>

            {/* CHANGE PASSWORD */}
            <Grid size={{ xs: 12 }}>
            <Card
                elevation={0}
                sx={{
                border: "1px solid rgba(75, 22, 76, 0.08)",
                borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Lock color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                    Change Password
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose a strong password and keep it private.
                </Typography>

                <Box component="form" onSubmit={handlePasswordChange}>
                    <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                        fullWidth
                        required
                        label="Current password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(event) =>
                            updatePasswordField("current_password", event.target.value)
                        }
                        autoComplete="current-password"
                        slotProps={{
                            input: passwordAdornment(
                            showCurrentPassword,
                            () => setShowCurrentPassword((value) => !value)
                            ),
                        }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                        fullWidth
                        required
                        label="New password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(event) =>
                            updatePasswordField("new_password", event.target.value)
                        }
                        autoComplete="new-password"
                        helperText="8+ characters with upper/lowercase, number and special character."
                        slotProps={{
                            input: passwordAdornment(
                            showNewPassword,
                            () => setShowNewPassword((value) => !value)
                            ),
                        }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                        fullWidth
                        required
                        label="Confirm new password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirm_password}
                        onChange={(event) =>
                            updatePasswordField("confirm_password", event.target.value)
                        }
                        autoComplete="new-password"
                        slotProps={{
                            input: passwordAdornment(
                            showConfirmPassword,
                            () => setShowConfirmPassword((value) => !value)
                            ),
                        }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Button
                        type="submit"
                        variant="contained"
                        disabled={changingPassword}
                        startIcon={
                            changingPassword ? (
                            <CircularProgress size={18} color="inherit" />
                            ) : (
                            <Lock />
                            )
                        }
                        sx={{
                            minHeight: 46,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                        >
                        {changingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </Grid>
                    </Grid>
                </Box>
                </CardContent>
            </Card>
            </Grid>
        </Grid>
        </AdminDashboardLayout>
    );
    }

    export default Profile;
