import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    Badge,
    CalendarMonth,
    CloudUpload,
    Description,
    Email,
    Lock,
    Person,
    School,
    Visibility,
    VisibilityOff,
    WorkspacePremium,
    Edit,
    Save,
    Close,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import api from "../../services/api";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [serviceHours, setServiceHours] = useState(null);

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [uploadType, setUploadType] = useState("");

    const [error, setError] = useState("");
    const [uploadMessage, setUploadMessage] = useState("");

    // =========================================================
    // EDIT PROFILE STATE
    // =========================================================

    const [editingProfile, setEditingProfile] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: "",
        login_id: "",
        class_name: "",
        year: "",
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState("");
    const [profileSaveError, setProfileSaveError] = useState("");

    // =========================================================
    // PASSWORD STATE
    // =========================================================

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [passwordMessage, setPasswordMessage] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");

    // =========================================================
    // FILE INPUT REFS
    // =========================================================

    const certificateInputRef = useRef(null);
    const documentInputRef = useRef(null);

    // =========================================================
    // LOAD PROFILE + SERVICE HOURS
    // =========================================================

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                profileResponse,
                serviceHoursResponse,
            ] = await Promise.all([
                api.get("/auth/me"),
                api.get("/service-hours/me"),
            ]);

            const profileData = profileResponse.data;

            setProfile(profileData);

            setServiceHours(serviceHoursResponse.data);

            // -------------------------------------------------
            // Populate edit form
            // -------------------------------------------------

            setProfileForm({
                name: profileData.name || "",
                login_id:
                    profileData.email ||
                    profileData.roll_number ||
                    "",
                class_name: profileData.class_name || "",
                year: profileData.year || "",
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load profile information."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD MY FILES
    // =========================================================

    const loadFiles = async () => {
        try {
            setFilesLoading(true);

            const response = await api.get("/files/my");

            setFiles(response.data.files || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load your documents."
            );
        } finally {
            setFilesLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadProfile();
        loadFiles();
    }, []);

    // =========================================================
    // START EDITING
    // =========================================================

    const handleStartEditing = () => {
        setProfileSaveMessage("");
        setProfileSaveError("");

        setProfileForm({
            name: profile?.name || "",
            login_id:
                profile?.email ||
                profile?.roll_number ||
                "",
            class_name: profile?.class_name || "",
            year: profile?.year || "",
        });

        setEditingProfile(true);
    };

    // =========================================================
    // CANCEL EDITING
    // =========================================================

    const handleCancelEditing = () => {
        setProfileSaveError("");
        setProfileSaveMessage("");

        setProfileForm({
            name: profile?.name || "",
            login_id:
                profile?.email ||
                profile?.roll_number ||
                "",
            class_name: profile?.class_name || "",
            year: profile?.year || "",
        });

        setEditingProfile(false);
    };

    // =========================================================
    // PROFILE FORM CHANGE
    // =========================================================

    const handleProfileChange = (field) => (event) => {
        setProfileForm((previous) => ({
            ...previous,
            [field]: event.target.value,
        }));
    };

    // =========================================================
    // SAVE PROFILE
    // =========================================================

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        setProfileSaveError("");
        setProfileSaveMessage("");

        if (!profileForm.name.trim()) {
            setProfileSaveError(
                "Please enter your name."
            );
            return;
        }

        if (!profileForm.login_id.trim()) {
            setProfileSaveError(
                "Please enter your email or roll number."
            );
            return;
        }

        if (!profileForm.class_name.trim()) {
            setProfileSaveError(
                "Please enter your class."
            );
            return;
        }

        if (!profileForm.year) {
            setProfileSaveError(
                "Please select your academic year."
            );
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.patch(
                "/auth/me",
                {
                    name: profileForm.name.trim(),
                    login_id:
                        profileForm.login_id.trim(),
                    class_name:
                        profileForm.class_name.trim(),
                    year: Number(profileForm.year),
                }
            );

            const updatedProfile =
                response.data.user;

            setProfile(updatedProfile);

            setProfileForm({
                name: updatedProfile.name || "",
                login_id:
                    updatedProfile.email ||
                    updatedProfile.roll_number ||
                    "",
                class_name:
                    updatedProfile.class_name || "",
                year: updatedProfile.year || "",
            });

            setEditingProfile(false);

            setProfileSaveMessage(
                "Profile updated successfully."
            );
        } catch (err) {
            console.error(err);

            setProfileSaveError(
                err.response?.data?.detail ||
                    "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // =========================================================
    // FILE PICKERS
    // =========================================================

    const openCertificatePicker = () => {
        setUploadMessage("");
        setError("");

        certificateInputRef.current?.click();
    };

    const openDocumentPicker = () => {
        setUploadMessage("");
        setError("");

        documentInputRef.current?.click();
    };

    // =========================================================
    // HANDLE FILE SELECTION
    // =========================================================

    const handleFileSelected = async (
        event,
        fileType
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        event.target.value = "";

        setError("");
        setUploadMessage("");

        // -----------------------------------------------------
        // FILE SIZE
        // -----------------------------------------------------

        const maxFileSize = 10 * 1024 * 1024;

        if (file.size > maxFileSize) {
            setError(
                "File is too large. Maximum size is 10 MB."
            );

            return;
        }

        // -----------------------------------------------------
        // FILE TYPE
        // -----------------------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only JPG, PNG, WEBP images and PDF files are allowed."
            );

            return;
        }

        try {
            setUploading(true);
            setUploadType(fileType);

            // -------------------------------------------------
            // GET IMAGEKIT AUTH
            // -------------------------------------------------

            const authResponse =
                await api.get("/imagekit/auth");

            const {
                token,
                expire,
                signature,
                publicKey,
            } = authResponse.data;

            // -------------------------------------------------
            // IMAGEKIT FORM DATA
            // -------------------------------------------------

            const formData = new FormData();

            formData.append("file", file);
            formData.append("fileName", file.name);
            formData.append("publicKey", publicKey);
            formData.append("signature", signature);
            formData.append("expire", expire);
            formData.append("token", token);

            // -------------------------------------------------
            // UPLOAD TO IMAGEKIT
            // -------------------------------------------------

            const imageKitResponse = await fetch(
                "https://upload.imagekit.io/api/v1/files/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const imageKitData =
                await imageKitResponse.json();

            if (!imageKitResponse.ok) {
                throw new Error(
                    imageKitData.message ||
                        "Image upload failed."
                );
            }

            // -------------------------------------------------
            // SAVE FILE METADATA
            // -------------------------------------------------

            await api.post("/files/my", {
                file_type: fileType,
                file_url: imageKitData.url,
                imagekit_file_id:
                    imageKitData.fileId,
                file_name: file.name,
            });

            // -------------------------------------------------
            // REFRESH FILES
            // -------------------------------------------------

            await loadFiles();

            setUploadMessage(
                fileType === "certificate"
                    ? "Certificate uploaded successfully."
                    : "Document uploaded successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                    err.message ||
                    "File upload failed."
            );
        } finally {
            setUploading(false);
            setUploadType("");
        }
    };

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setPasswordError("");
        setPasswordMessage("");

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setPasswordError(
                "Please fill in all password fields."
            );

            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New password and confirm password do not match."
            );

            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "Password must be at least 8 characters long."
            );

            return;
        }

        try {
            setChangingPassword(true);

            await api.post(
                "/auth/change-password",
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                }
            );

            setPasswordMessage(
                "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);

            setPasswordError(
                err.response?.data?.detail ||
                    "Unable to change password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <DashboardLayout>
                <Box
                    sx={{
                        minHeight: "60vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && !profile) {
        return (
            <DashboardLayout>
                <Box sx={{ py: 5 }}>
                    <Alert severity="error">
                        {error}
                    </Alert>
                </Box>
            </DashboardLayout>
        );
    }

    const totalHours =
        serviceHours?.service_hours ?? 0;

    const requiredHours =
        serviceHours?.required_hours ?? 240;

    const completionPercentage =
        serviceHours?.completion_percentage ?? 0;

    // =========================================================
    // PROFILE UI
    // =========================================================

    return (
        <DashboardLayout>
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                >
                    Dashboard
                </Button>

                <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                        fontSize: {
                            xs: "1.8rem",
                            sm: "2.2rem",
                        },
                    }}
                >
                    My Profile
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Manage your NSS account,
                    documents and security.
                </Typography>
            </Box>

            {/* =================================================
                PROFILE HEADER CARD
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    overflow: "hidden",
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    boxShadow:
                        "0 16px 45px rgba(75, 22, 76, 0.08)",
                    background:
                        "linear-gradient(135deg, rgba(255,235,238,0.95), rgba(255,248,250,0.95))",
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
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    "linear-gradient(135deg, #7B1E3A, #B23A48)",
                                color: "white",
                                boxShadow:
                                    "0 10px 25px rgba(178,58,72,0.25)",
                            }}
                        >
                            <Person sx={{ fontSize: 38 }} />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="h5"
                                fontWeight={800}
                                sx={{
                                    wordBreak:
                                        "break-word",
                                }}
                            >
                                {profile?.name ||
                                    "Volunteer"}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{ mt: 0.3 }}
                            >
                                NSS Volunteer
                            </Typography>

                            <Chip
                                label={
                                    profile?.role ||
                                    "volunteer"
                                }
                                size="small"
                                sx={{
                                    mt: 1,
                                    textTransform:
                                        "capitalize",
                                    backgroundColor:
                                        "rgba(123,30,58,0.1)",
                                    color: "#7B1E3A",
                                    fontWeight: 700,
                                }}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    border:
                        "1px solid rgba(75,22,76,0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75,22,76,0.06)",
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
                    {/* SECTION HEADER */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: {
                                xs: "flex-start",
                                sm: "center",
                            },
                            justifyContent:
                                "space-between",
                            gap: 2,
                            mb: 3,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    backgroundColor:
                                        "rgba(178,58,72,0.09)",
                                    color: "#B23A48",
                                }}
                            >
                                <Badge />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                >
                                    Personal Information
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Your registered NSS
                                    account information.
                                </Typography>
                            </Box>
                        </Box>

                        {!editingProfile && (
                            <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={
                                    handleStartEditing
                                }
                                sx={{
                                    borderRadius: 2,
                                }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Box>

                    {/* =================================================
                        EDIT MODE
                    ================================================= */}

                    {editingProfile ? (
                        <Box
                            component="form"
                            onSubmit={
                                handleSaveProfile
                            }
                        >
                            <Grid
                                container
                                spacing={2}
                            >
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={
                                            profileForm.name
                                        }
                                        onChange={handleProfileChange(
                                            "name"
                                        )}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <TextField
                                        fullWidth
                                        label="Email or Roll Number"
                                        value={
                                            profileForm.login_id
                                        }
                                        onChange={handleProfileChange(
                                            "login_id"
                                        )}
                                        helperText="Use your email or roll number to log in."
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <TextField
                                        fullWidth
                                        label="Class"
                                        value={
                                            profileForm.class_name
                                        }
                                        onChange={handleProfileChange(
                                            "class_name"
                                        )}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <TextField
                                        select
                                        fullWidth
                                        label="Academic Year"
                                        value={
                                            profileForm.year
                                        }
                                        onChange={handleProfileChange(
                                            "year"
                                        )}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="">
                                            Select year
                                        </option>

                                        <option value={1}>
                                            Year 1
                                        </option>

                                        <option value={2}>
                                            Year 2
                                        </option>

                                        <option value={3}>
                                            Year 3
                                        </option>

                                        <option value={4}>
                                            Year 4
                                        </option>
                                    </TextField>
                                </Grid>
                            </Grid>

                            {profileSaveError && (
                                <Alert
                                    severity="error"
                                    sx={{ mt: 2 }}
                                >
                                    {profileSaveError}
                                </Alert>
                            )}

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1.5}
                                sx={{ mt: 3 }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Save />}
                                    disabled={
                                        savingProfile
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        background:
                                            "linear-gradient(135deg, #7B1E3A, #B23A48)",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(135deg, #68182F, #9F3140)",
                                        },
                                    }}
                                >
                                    {savingProfile
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outlined"
                                    startIcon={<Close />}
                                    onClick={
                                        handleCancelEditing
                                    }
                                    disabled={
                                        savingProfile
                                    }
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        <>
                            {/* =================================================
                                VIEW MODE
                            ================================================= */}

                            <Grid
                                container
                                spacing={2}
                            >
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={<Person />}
                                        label="Full Name"
                                        value={
                                            profile?.name ||
                                            "Not available"
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={<Badge />}
                                        label="Roll Number"
                                        value={
                                            profile?.roll_number ||
                                            "Not provided"
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={<Email />}
                                        label="Email"
                                        value={
                                            profile?.email ||
                                            "Not provided"
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={<School />}
                                        label="Class"
                                        value={
                                            profile?.class_name ||
                                            "Not available"
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={
                                            <CalendarMonth />
                                        }
                                        label="Academic Year"
                                        value={
                                            profile?.year
                                                ? `Year ${profile.year}`
                                                : "Not available"
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                >
                                    <InfoItem
                                        icon={
                                            <WorkspacePremium />
                                        }
                                        label="Account Role"
                                        value={
                                            profile?.role ||
                                            "Volunteer"
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {profileSaveMessage && (
                        <Alert
                            severity="success"
                            sx={{ mt: 2 }}
                        >
                            {profileSaveMessage}
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* =================================================
                SERVICE HOURS
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    border:
                        "1px solid rgba(75,22,76,0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75,22,76,0.06)",
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
                    <Typography
                        variant="h6"
                        fontWeight={800}
                    >
                        NSS Service Progress
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 3,
                        }}
                    >
                        Your progress toward the
                        240-hour NSS requirement.
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "flex-end",
                            mb: 1,
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={800}
                        >
                            {totalHours}

                            <Typography
                                component="span"
                                color="text.secondary"
                                fontWeight={500}
                            >
                                {" "}
                                / {requiredHours} hrs
                            </Typography>
                        </Typography>

                        <Typography
                            fontWeight={800}
                            sx={{
                                color: "#B23A48",
                            }}
                        >
                            {completionPercentage}%
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={Math.min(
                            completionPercentage,
                            100
                        )}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor:
                                "rgba(178,58,72,0.1)",

                            "& .MuiLinearProgress-bar":
                                {
                                    borderRadius: 5,
                                    background:
                                        "linear-gradient(90deg, #7B1E3A, #D45D6D)",
                                },
                        }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() =>
                            navigate(
                                "/service-hours"
                            )
                        }
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                        }}
                    >
                        View Service Hours
                    </Button>
                </CardContent>
            </Card>

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    border:
                        "1px solid rgba(75,22,76,0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75,22,76,0.06)",
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
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                backgroundColor:
                                    "rgba(123,30,58,0.09)",
                                color: "#7B1E3A",
                            }}
                        >
                            <Description />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                My Documents
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Upload certificates and
                                important NSS documents.
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1.5,
                            mt: 3,
                        }}
                    >
                        <input
                            ref={certificateInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            style={{
                                display: "none",
                            }}
                            onChange={(event) =>
                                handleFileSelected(
                                    event,
                                    "certificate"
                                )
                            }
                        />

                        <input
                            ref={documentInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            style={{
                                display: "none",
                            }}
                            onChange={(event) =>
                                handleFileSelected(
                                    event,
                                    "document"
                                )
                            }
                        />

                        <Button
                            variant="contained"
                            startIcon={<CloudUpload />}
                            onClick={
                                openCertificatePicker
                            }
                            disabled={uploading}
                            sx={{
                                borderRadius: 2,
                                background:
                                    "linear-gradient(135deg, #7B1E3A, #B23A48)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #68182F, #9F3140)",
                                },
                            }}
                        >
                            {uploading &&
                            uploadType ===
                                "certificate"
                                ? "Uploading..."
                                : "Upload Certificate"}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={
                                openDocumentPicker
                            }
                            disabled={uploading}
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            {uploading &&
                            uploadType ===
                                "document"
                                ? "Uploading..."
                                : "Upload Document"}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            mt: 1.5,
                        }}
                    >
                        JPG, PNG, WEBP or PDF ·
                        Maximum size: 10 MB
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {uploadMessage && (
                        <Alert
                            severity="success"
                            sx={{ mt: 2 }}
                        >
                            {uploadMessage}
                        </Alert>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {filesLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                py: 3,
                            }}
                        >
                            <CircularProgress
                                size={28}
                            />
                        </Box>
                    ) : files.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 4,
                                px: 2,
                                borderRadius: 3,
                                backgroundColor:
                                    "rgba(255,235,238,0.45)",
                            }}
                        >
                            <Description
                                sx={{
                                    fontSize: 42,
                                    color:
                                        "text.disabled",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                fontWeight={600}
                            >
                                No documents yet
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                Your uploaded certificates
                                and documents will appear
                                here.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {files.map((file) => (
                                <Box
                                    key={file.id}
                                    sx={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        border:
                                            "1px solid rgba(75,22,76,0.08)",
                                        backgroundColor:
                                            "rgba(255,248,250,0.7)",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 1.5,
                                            minWidth: 0,
                                        }}
                                    >
                                        <Description
                                            sx={{
                                                color:
                                                    "#B23A48",
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                fontWeight={
                                                    700
                                                }
                                                sx={{
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {
                                                    file.file_name
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    textTransform:
                                                        "capitalize",
                                                }}
                                            >
                                                {file.file_type.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        href={
                                            file.file_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            flexShrink: 0,
                                        }}
                                    >
                                        View
                                    </Button>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    border:
                        "1px solid rgba(75,22,76,0.08)",
                    boxShadow:
                        "0 12px 40px rgba(75,22,76,0.06)",
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
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                backgroundColor:
                                    "rgba(75,22,76,0.08)",
                                color: "primary.main",
                            }}
                        >
                            <Lock />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                Change Password
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Keep your NSS account secure.
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        component="form"
                        onSubmit={
                            handleChangePassword
                        }
                    >
                        <Stack spacing={2}>
                            <PasswordField
                                label="Current Password"
                                value={
                                    currentPassword
                                }
                                onChange={(event) =>
                                    setCurrentPassword(
                                        event.target
                                            .value
                                    )
                                }
                                show={
                                    showCurrentPassword
                                }
                                setShow={
                                    setShowCurrentPassword
                                }
                                autoComplete="current-password"
                            />

                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(
                                        event.target
                                            .value
                                    )
                                }
                                show={showNewPassword}
                                setShow={
                                    setShowNewPassword
                                }
                                autoComplete="new-password"
                            />

                            <PasswordField
                                label="Confirm New Password"
                                value={
                                    confirmPassword
                                }
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target
                                            .value
                                    )
                                }
                                show={
                                    showConfirmPassword
                                }
                                setShow={
                                    setShowConfirmPassword
                                }
                                autoComplete="new-password"
                            />
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: "block",
                                mt: 1.5,
                            }}
                        >
                            Password must be at least 8
                            characters and contain an
                            uppercase letter, lowercase
                            letter, number and special
                            character.
                        </Typography>

                        {passwordError && (
                            <Alert
                                severity="error"
                                sx={{ mt: 2 }}
                            >
                                {passwordError}
                            </Alert>
                        )}

                        {passwordMessage && (
                            <Alert
                                severity="success"
                                sx={{ mt: 2 }}
                            >
                                {passwordMessage}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                changingPassword
                            }
                            sx={{
                                mt: 3,
                                borderRadius: 2,
                                background:
                                    "linear-gradient(135deg, #4B164C, #7B1E3A)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #3A103B, #68182F)",
                                },
                            }}
                        >
                            {changingPassword
                                ? "Changing Password..."
                                : "Change Password"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
    icon,
    label,
    value,
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                backgroundColor:
                    "rgba(255,248,250,0.8)",
                border:
                    "1px solid rgba(75,22,76,0.06)",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                    flexShrink: 0,
                    backgroundColor:
                        "rgba(178,58,72,0.08)",
                    color: "#B23A48",
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                >
                    {label}
                </Typography>

                <Typography
                    fontWeight={700}
                    sx={{
                        mt: 0.2,
                        wordBreak:
                            "break-word",
                        textTransform:
                            label ===
                            "Account Role"
                                ? "capitalize"
                                : "none",
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

// =========================================================
// PASSWORD FIELD
// =========================================================

function PasswordField({
    label,
    value,
    onChange,
    show,
    setShow,
    autoComplete,
}) {
    return (
        <TextField
            fullWidth
            label={label}
            type={
                show
                    ? "text"
                    : "password"
            }
            value={value}
            onChange={onChange}
            autoComplete={
                autoComplete
            }
            InputProps={{
                endAdornment: (
                    <IconButton
                        onClick={() =>
                            setShow(!show)
                        }
                        edge="end"
                    >
                        {show ? (
                            <VisibilityOff />
                        ) : (
                            <Visibility />
                        )}
                    </IconButton>
                ),
            }}
        />
    );
}

export default Profile;