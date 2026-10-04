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
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    Lock,
    Save,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";


function Profile() {

    const {
        user,
    } = useAuth();


    // =====================================================
    // PROFILE FORM
    // =====================================================

    const [form, setForm] = useState({
        name: "",
        login_id: "",
        class_name: "",
        year: "",
    });


    // =====================================================
    // PASSWORD FORM
    // =====================================================

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });


    // =====================================================
    // STATE
    // =====================================================

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [savingPassword, setSavingPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // LOAD USER DATA
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        setForm({
            name: user.name || "",

            login_id:
                user.email ||
                user.roll_number ||
                "",

            class_name:
                user.class_name || "",

            year:
                user.year || "",
        });

    }, [user]);


    // =====================================================
    // PROFILE FIELD CHANGE
    // =====================================================

    const handleProfileChange = (
        field,
        value
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    };


    // =====================================================
    // PASSWORD FIELD CHANGE
    // =====================================================

    const handlePasswordChange = (
        field,
        value
    ) => {

        setPasswordForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSaveProfile = async () => {

        setError("");
        setSuccess("");


        if (!form.name.trim()) {

            setError("Name is required.");

            return;
        }


        if (!form.login_id.trim()) {

            setError(
                "Roll number or email is required."
            );

            return;
        }


        if (!form.class_name.trim()) {

            setError("Class is required.");

            return;
        }


        if (!form.year) {

            setError("Please select your year.");

            return;
        }


        try {

            setSavingProfile(true);


            const response = await api.patch(
                "/auth/profile",
                {
                    name: form.name.trim(),

                    login_id:
                        form.login_id.trim(),

                    class_name:
                        form.class_name.trim(),

                    year:
                        Number(form.year),
                }
            );


            const updatedUser =
                response.data.user;


            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );


            setSuccess(
                "Profile updated successfully."
            );


            // Reload so AuthContext gets the latest
            // profile from the backend.

            window.location.reload();

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to update profile."
            );

        } finally {

            setSavingProfile(false);

        }

    };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async () => {

        setError("");
        setSuccess("");


        if (
            !passwordForm.current_password
        ) {

            setError(
                "Current password is required."
            );

            return;
        }


        if (
            !passwordForm.new_password
        ) {

            setError(
                "New password is required."
            );

            return;
        }


        if (
            passwordForm.new_password !==
            passwordForm.confirm_password
        ) {

            setError(
                "New passwords do not match."
            );

            return;
        }


        try {

            setSavingPassword(true);


            await api.post(
                "/auth/change-password",
                {
                    current_password:
                        passwordForm.current_password,

                    new_password:
                        passwordForm.new_password,
                }
            );


            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });


            setSuccess(
                "Password changed successfully."
            );

        } catch (error) {

            console.error(
                "Failed to change password:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to change password."
            );

        } finally {

            setSavingPassword(false);

        }

    };


    // =====================================================
    // INITIAL LOADING
    // =====================================================

    if (!user) {

        return (
            <AdminDashboardLayout>

                <Box
                    sx={{
                        minHeight: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >

                    <CircularProgress />

                </Box>

            </AdminDashboardLayout>
        );

    }


    // =====================================================
    // AVATAR INITIAL
    // =====================================================

    const avatarLetter =
        user.name
            ?.charAt(0)
            ?.toUpperCase() || "A";


    // =====================================================
    // UI
    // =====================================================

    return (
        <AdminDashboardLayout>

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <Box sx={{ mb: 4 }}>

                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    sx={{
                        fontSize: {
                            xs: "1.75rem",
                            sm: "2rem",
                            md: "2.25rem",
                        },
                    }}
                >
                    My Profile
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Manage your administrator account details
                    and password.
                </Typography>

            </Box>


            {/* =================================================
                ALERTS
            ================================================== */}

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


            {success && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>

            )}


            <Grid
                container
                spacing={3}
            >

                {/* =================================================
                    PROFILE INFORMATION
                ================================================== */}

                <Grid
                    size={{
                        xs: 12,
                        md: 8,
                    }}
                >

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent sx={{ p: 3 }}>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 3,
                                }}
                            >

                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor:
                                            "primary.main",
                                        fontSize:
                                            "1.5rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {avatarLetter}
                                </Avatar>

                                <Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        Personal Information
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Update the details
                                        associated with your
                                        administrator account.
                                    </Typography>

                                </Box>

                            </Box>


                            <Divider sx={{ mb: 3 }} />


                            <Stack spacing={2.5}>

                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={form.name}
                                    onChange={(event) =>
                                        handleProfileChange(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                />


                                <TextField
                                    fullWidth
                                    label="Roll Number or Email"
                                    value={form.login_id}
                                    onChange={(event) =>
                                        handleProfileChange(
                                            "login_id",
                                            event.target.value
                                        )
                                    }
                                    helperText={
                                        "You can use either your roll number or email as your login ID."
                                    }
                                />


                                <TextField
                                    fullWidth
                                    label="Class"
                                    value={
                                        form.class_name
                                    }
                                    onChange={(event) =>
                                        handleProfileChange(
                                            "class_name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. BCA A"
                                />


                                <FormControl fullWidth>

                                    <InputLabel>
                                        Year
                                    </InputLabel>

                                    <Select
                                        value={
                                            form.year
                                        }
                                        label="Year"
                                        onChange={(event) =>
                                            handleProfileChange(
                                                "year",
                                                event.target.value
                                            )
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


                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: {
                                            xs: "stretch",
                                            sm: "flex-end",
                                        },
                                        pt: 1,
                                    }}
                                >

                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={
                                            handleSaveProfile
                                        }
                                        disabled={
                                            savingProfile
                                        }
                                        fullWidth
                                        sx={{
                                            width: {
                                                xs: "100%",
                                                sm: "auto",
                                            },
                                        }}
                                    >

                                        {savingProfile
                                            ? "Saving..."
                                            : "Save Changes"}

                                    </Button>

                                </Box>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <Grid
                    size={{
                        xs: 12,
                        md: 4,
                    }}
                >

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent sx={{ p: 3 }}>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ mb: 2 }}
                            >
                                Account Information
                            </Typography>

                            <Stack spacing={2}>

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Role
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                    >
                                        Administrator
                                    </Typography>

                                </Box>


                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Service Hours
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                    >
                                        {user.service_hours ?? 0}
                                    </Typography>

                                </Box>


                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Account ID
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            wordBreak:
                                                "break-all",
                                        }}
                                    >
                                        {user.id}
                                    </Typography>

                                </Box>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>


                {/* =================================================
                    CHANGE PASSWORD
                ================================================== */}

                <Grid
                    size={12}
                >

                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <CardContent sx={{ p: 3 }}>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    mb: 2,
                                }}
                            >

                                <Lock color="primary" />

                                <Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        Change Password
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Keep your administrator
                                        account secure.
                                    </Typography>

                                </Box>

                            </Box>


                            <Divider sx={{ mb: 3 }} />


                            <Grid
                                container
                                spacing={2}
                            >

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4,
                                    }}
                                >

                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Current Password"
                                        value={
                                            passwordForm.current_password
                                        }
                                        onChange={(event) =>
                                            handlePasswordChange(
                                                "current_password",
                                                event.target.value
                                            )
                                        }
                                    />

                                </Grid>


                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4,
                                    }}
                                >

                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="New Password"
                                        value={
                                            passwordForm.new_password
                                        }
                                        onChange={(event) =>
                                            handlePasswordChange(
                                                "new_password",
                                                event.target.value
                                            )
                                        }
                                        helperText={
                                            "8+ chars, uppercase, lowercase, number and special character."
                                        }
                                    />

                                </Grid>


                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4,
                                    }}
                                >

                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Confirm New Password"
                                        value={
                                            passwordForm.confirm_password
                                        }
                                        onChange={(event) =>
                                            handlePasswordChange(
                                                "confirm_password",
                                                event.target.value
                                            )
                                        }
                                    />

                                </Grid>

                            </Grid>


                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: {
                                        xs: "stretch",
                                        sm: "flex-end",
                                    },
                                    mt: 2,
                                }}
                            >

                                <Button
                                    variant="outlined"
                                    startIcon={<Lock />}
                                    onClick={
                                        handleChangePassword
                                    }
                                    disabled={
                                        savingPassword
                                    }
                                    fullWidth
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "auto",
                                        },
                                    }}
                                >

                                    {savingPassword
                                        ? "Changing..."
                                        : "Change Password"}

                                </Button>

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </AdminDashboardLayout>
    );
}


export default Profile;