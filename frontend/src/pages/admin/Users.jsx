
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    } from "@mui/material";

    import {
    Add,
    AdminPanelSettings,
    ArrowBack,
    LockReset,
    Person,
    Refresh,
    Search,
    SupervisorAccount,
    } from "@mui/icons-material";

    import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";
    import { useAuth } from "../../context/AuthContext";

    import {
    createStaffAccount,
    getUsers,
    resetUserPassword,
    updateUserRole,
    } from "../../services/auth";

    const PASSWORD_RULES =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    const INITIAL_STAFF_FORM = {
    name: "",
    role: "coordinator",
    email: "",
    phone_number: "",
    password: "",
    };

    function Users() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Users and page status
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Role dialog
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [changingRole, setChangingRole] = useState(false);

    // Password reset dialog
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [resetPassword, setResetPassword] = useState("");
    const [resettingPassword, setResettingPassword] = useState(false);

    // Staff account dialog
    const [staffDialogOpen, setStaffDialogOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({ ...INITIAL_STAFF_FORM });
    const [creatingStaff, setCreatingStaff] = useState(false);

    const isAdmin = user?.role === "admin";

    // ---------------------------------------------------------
    // LOAD USERS
    // ---------------------------------------------------------

    const loadUsers = async () => {
        try {
        setLoading(true);
        setError("");

        const data = await getUsers();

        setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("Failed to load users:", err);

        setError(
            err.response?.data?.detail || "Unable to load users."
        );
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // ---------------------------------------------------------
    // SEARCH AND FILTER
    // ---------------------------------------------------------

    const filteredUsers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return users.filter((item) => {
        const searchableFields = [
            item.name,
            item.roll_number,
            item.email,
            item.phone_number,
            item.class_name,
            item.role,
        ];

        const matchesSearch =
            !searchValue ||
            searchableFields.some((field) =>
            String(field ?? "").toLowerCase().includes(searchValue)
            );

        const matchesRole =
            roleFilter === "all" || item.role === roleFilter;

        return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    const getUserId = (item) => item?.id ?? item?._id;

    const getLoginLabel = (item) =>
        item?.roll_number ||
        item?.email ||
        item?.phone_number ||
        "No login ID";

    const getRoleLabel = (role) => {
        if (role === "admin") return "Administrator";
        if (role === "coordinator") return "Coordinator";
        return "Volunteer";
    };

    const getRoleIcon = (role) => {
        if (role === "admin") return <AdminPanelSettings />;
        if (role === "coordinator") return <SupervisorAccount />;
        return <Person />;
    };

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    // ---------------------------------------------------------
    // CHANGE ROLE
    // ---------------------------------------------------------

    const openRoleDialog = (item) => {
        setSelectedUser(item);
        setSelectedRole(item.role);
        setRoleDialogOpen(true);
        clearMessages();
    };

    const closeRoleDialog = () => {
        if (changingRole) return;

        setRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRole("");
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !selectedRole) return;

        if (selectedUser.role === selectedRole) {
        closeRoleDialog();
        return;
        }

        const userId = getUserId(selectedUser);

        if (!userId) {
        setError("This user record does not contain a valid ID.");
        return;
        }

        try {
        setChangingRole(true);
        clearMessages();

        await updateUserRole(userId, selectedRole);

        const changedName = selectedUser.name || "User";

        setUsers((previous) =>
            previous.map((item) =>
            getUserId(item) === userId
                ? { ...item, role: selectedRole }
                : item
            )
        );

        setRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRole("");

        setSuccess(`${changedName}'s role was updated successfully.`);
        } catch (err) {
        console.error("Failed to change user role:", err);

        setError(
            err.response?.data?.detail || "Unable to change user role."
        );
        } finally {
        setChangingRole(false);
        }
    };

    // ---------------------------------------------------------
    // RESET PASSWORD
    // ---------------------------------------------------------

    const openPasswordDialog = (item) => {
        setSelectedUser(item);
        setResetPassword("");
        setPasswordDialogOpen(true);
        clearMessages();
    };

    const closePasswordDialog = () => {
        if (resettingPassword) return;

        setPasswordDialogOpen(false);
        setSelectedUser(null);
        setResetPassword("");
    };

    const handlePasswordReset = async () => {
        if (!selectedUser) return;

        if (!PASSWORD_RULES.test(resetPassword)) {
        setError(
            "Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character. Do not include spaces."
        );
        return;
        }

        const loginId = getLoginLabel(selectedUser);

        if (loginId === "No login ID") {
        setError(
            "This account has no roll number, email, or phone number to identify it."
        );
        return;
        }

        try {
        setResettingPassword(true);
        clearMessages();

        await resetUserPassword({
            login_id: loginId,
            new_password: resetPassword,
        });

        const changedName = selectedUser.name || "User";

        setPasswordDialogOpen(false);
        setSelectedUser(null);
        setResetPassword("");

        setSuccess(`Password for ${changedName} was reset successfully.`);
        } catch (err) {
        console.error("Failed to reset password:", err);

        setError(
            err.response?.data?.detail || "Unable to reset password."
        );
        } finally {
        setResettingPassword(false);
        }
    };

    // ---------------------------------------------------------
    // CREATE STAFF ACCOUNT
    // ---------------------------------------------------------

    const openStaffDialog = () => {
        setStaffForm({ ...INITIAL_STAFF_FORM });
        setStaffDialogOpen(true);
        clearMessages();
    };

    const closeStaffDialog = () => {
        if (creatingStaff) return;

        setStaffDialogOpen(false);
        setStaffForm({ ...INITIAL_STAFF_FORM });
    };

    const updateStaffField = (field, value) => {
        setStaffForm((previous) => ({
        ...previous,
        [field]: value,
        }));
    };

    const handleCreateStaff = async () => {
        if (!isAdmin) {
        setError("Only administrators can create staff accounts.");
        return;
        }

        const name = staffForm.name.trim();
        const email = staffForm.email.trim().toLowerCase();
        const phoneNumber = staffForm.phone_number.trim();
        const password = staffForm.password;

        if (!name) {
        setError("Enter the staff member's name.");
        return;
        }

        if (!email && !phoneNumber) {
        setError("Enter at least an email address or phone number.");
        return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Enter a valid email address.");
        return;
        }

        if (phoneNumber && !/^[+\d][\d\s()-]{6,19}$/.test(phoneNumber)) {
        setError("Enter a valid phone number.");
        return;
        }

        if (!PASSWORD_RULES.test(password)) {
        setError(
            "Password must be at least 8 characters, with uppercase and lowercase letters, a number, and a special character, without spaces."
        );
        return;
        }

        const payload = {
        name,
        role: staffForm.role,
        password,
        ...(email ? { email } : {}),
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        };

        try {
        setCreatingStaff(true);
        clearMessages();

        await createStaffAccount(payload);

        setStaffDialogOpen(false);
        setStaffForm({ ...INITIAL_STAFF_FORM });
        setSuccess(
            `${name} was created as ${getRoleLabel(payload.role).toLowerCase()}.`
        );

        await loadUsers();
        } catch (err) {
        console.error("Failed to create staff account:", err);

        setError(
            err.response?.data?.detail || "Unable to create staff account."
        );
        } finally {
        setCreatingStaff(false);
        }
    };

    // ---------------------------------------------------------
    // USER CARD FOR MOBILE
    // ---------------------------------------------------------

    const MobileUserCard = ({ item }) => (
        <Card
        elevation={0}
        sx={{
            border: "1px solid rgba(75, 22, 76, 0.08)",
            mb: 2,
        }}
        >
        <CardContent>
            <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
            }}
            >
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                {item.name || "Unnamed user"}
                </Typography>

                <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                >
                {getLoginLabel(item)}
                </Typography>

                {item.email && item.roll_number && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", overflowWrap: "anywhere" }}
                >
                    {item.email}
                </Typography>
                )}

                {item.phone_number && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                >
                    Phone: {item.phone_number}
                </Typography>
                )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
                {getRoleIcon(item.role)}
            </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>Role</Typography>
            <Typography variant="body2" color="text.secondary">
                {getRoleLabel(item.role)}
            </Typography>
            </Box>

            {(item.class_name || item.year) && (
            <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>Class / Year</Typography>
                <Typography variant="body2" color="text.secondary">
                {item.class_name || "—"}
                {item.year ? ` • Year ${item.year}` : ""}
                </Typography>
            </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 2.5, flexWrap: "wrap" }}>
            <Button
                size="small"
                variant="outlined"
                onClick={() => openRoleDialog(item)}
            >
                Change Role
            </Button>

            <Button
                size="small"
                variant="outlined"
                startIcon={<LockReset />}
                onClick={() => openPasswordDialog(item)}
            >
                Reset Password
            </Button>
            </Box>
        </CardContent>
        </Card>
    );

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------

    return (
        <AdminDashboardLayout>
        <Box
            sx={{
            mb: 4,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            }}
        >
            <Box>
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
                User Management
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage volunteers, coordinators, and administrators.
            </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {isAdmin && (
                <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openStaffDialog}
                sx={{ minHeight: 44, borderRadius: 2 }}
                >
                Create Staff
                </Button>
            )}

            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/admin")}
                sx={{ minHeight: 44, borderRadius: 2, whiteSpace: "nowrap" }}
            >
                {isMobile ? "Dashboard" : "Back to Dashboard"}
            </Button>
            </Stack>
        </Box>

        {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
            </Alert>
        )}

        {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>
            {success}
            </Alert>
        )}

        {/* Search and filters */}
        <Card
            elevation={0}
            sx={{ border: "1px solid rgba(75, 22, 76, 0.08)", mb: 3 }}
        >
            <CardContent>
            <Box
                sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto" },
                gap: 2,
                alignItems: "center",
                }}
            >
                <TextField
                fullWidth
                label="Search users"
                placeholder="Name, roll number, email, or phone"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                    input: {
                    startAdornment: (
                        <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    },
                }}
                />

                <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(event) => setRoleFilter(event.target.value)}
                >
                    <MenuItem value="all">All roles</MenuItem>
                    <MenuItem value="volunteer">Volunteers</MenuItem>
                    <MenuItem value="coordinator">Coordinators</MenuItem>
                    <MenuItem value="admin">Administrators</MenuItem>
                </Select>
                </FormControl>

                <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadUsers}
                disabled={loading}
                sx={{ minHeight: 56 }}
                >
                Refresh
                </Button>
            </Box>
            </CardContent>
        </Card>

        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
            </Typography>
        </Box>

        {loading ? (
            <Card elevation={0} sx={{ border: "1px solid rgba(75, 22, 76, 0.08)" }}>
            <CardContent
                sx={{
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <Stack spacing={1} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    Loading users...
                </Typography>
                </Stack>
            </CardContent>
            </Card>
        ) : filteredUsers.length === 0 ? (
            <Card elevation={0} sx={{ border: "1px solid rgba(75, 22, 76, 0.08)" }}>
            <CardContent
                sx={{
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                }}
            >
                <Box>
                <Person sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                <Typography variant="h6" fontWeight={700}>No users found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Try changing your search or filter.
                </Typography>
                </Box>
            </CardContent>
            </Card>
        ) : isMobile ? (
            <Box>
            {filteredUsers.map((item, index) => (
                <MobileUserCard
                key={getUserId(item) || `${item.name}-${index}`}
                item={item}
                />
            ))}
            </Box>
        ) : (
            <Card
            elevation={0}
            sx={{
                border: "1px solid rgba(75, 22, 76, 0.08)",
                overflow: "hidden",
            }}
            >
            <TableContainer>
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Login ID</TableCell>
                    <TableCell>Class / Year</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {filteredUsers.map((item, index) => (
                    <TableRow
                        key={getUserId(item) || `${item.name}-${index}`}
                        hover
                    >
                        <TableCell>
                        <Typography fontWeight={600}>
                            {item.name || "Unnamed user"}
                        </Typography>
                        {item.email && (
                            <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                            >
                            {item.email}
                            </Typography>
                        )}
                        {item.phone_number && (
                            <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                            >
                            {item.phone_number}
                            </Typography>
                        )}
                        </TableCell>

                        <TableCell>{getLoginLabel(item)}</TableCell>

                        <TableCell>
                        {item.class_name || "—"}
                        {item.year ? ` • Year ${item.year}` : ""}
                        </TableCell>

                        <TableCell>
                        <Box
                            sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            color: "primary.main",
                            }}
                        >
                            {getRoleIcon(item.role)}
                            <Typography variant="body2" fontWeight={600}>
                            {getRoleLabel(item.role)}
                            </Typography>
                        </Box>
                        </TableCell>

                        <TableCell align="right">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openRoleDialog(item)}
                            sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                        >
                            Change Role
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LockReset />}
                            onClick={() => openPasswordDialog(item)}
                        >
                            Reset
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            </Card>
        )}

        {/* CHANGE ROLE DIALOG */}
        <Dialog
            open={roleDialogOpen}
            onClose={closeRoleDialog}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>Change User Role</DialogTitle>

            <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Change the role assigned to{" "}
                <strong>{selectedUser?.name}</strong>.
            </Typography>

            <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Role</InputLabel>
                <Select
                value={selectedRole}
                label="Role"
                onChange={(event) => setSelectedRole(event.target.value)}
                >
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="coordinator">Coordinator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                </Select>
            </FormControl>
            </DialogContent>

            <DialogActions>
            <Button onClick={closeRoleDialog} disabled={changingRole}>
                Cancel
            </Button>
            <Button
                variant="contained"
                onClick={handleRoleChange}
                disabled={changingRole || !selectedRole}
            >
                {changingRole ? "Updating..." : "Update Role"}
            </Button>
            </DialogActions>
        </Dialog>

        {/* RESET PASSWORD DIALOG */}
        <Dialog
            open={passwordDialogOpen}
            onClose={closePasswordDialog}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Reset Password</DialogTitle>

            <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set a new password for <strong>{selectedUser?.name}</strong>.
            </Typography>

            <TextField
                fullWidth
                autoFocus
                type="password"
                label="New password"
                placeholder="Enter a strong password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                helperText="At least 8 characters, uppercase and lowercase letters, a number, and a special character. No spaces."
                sx={{ mt: 1 }}
            />
            </DialogContent>

            <DialogActions>
            <Button onClick={closePasswordDialog} disabled={resettingPassword}>
                Cancel
            </Button>
            <Button
                variant="contained"
                onClick={handlePasswordReset}
                disabled={resettingPassword || !resetPassword}
            >
                {resettingPassword ? "Resetting..." : "Reset Password"}
            </Button>
            </DialogActions>
        </Dialog>

        {/* CREATE STAFF DIALOG */}
        <Dialog
            open={staffDialogOpen}
            onClose={closeStaffDialog}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Create Staff Account</DialogTitle>

            <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a coordinator or another administrator. Staff accounts do
                not need a student roll number, class, or year.
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                fullWidth
                required
                label="Full name"
                value={staffForm.name}
                onChange={(event) => updateStaffField("name", event.target.value)}
                autoComplete="name"
                />

                <FormControl fullWidth>
                <InputLabel>Staff role</InputLabel>
                <Select
                    value={staffForm.role}
                    label="Staff role"
                    onChange={(event) => updateStaffField("role", event.target.value)}
                >
                    <MenuItem value="coordinator">Coordinator</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                </Select>
                </FormControl>

                <TextField
                fullWidth
                label="Email address"
                type="email"
                value={staffForm.email}
                onChange={(event) => updateStaffField("email", event.target.value)}
                autoComplete="email"
                helperText="Optional if a phone number is provided."
                />

                <TextField
                fullWidth
                label="Phone number"
                value={staffForm.phone_number}
                onChange={(event) =>
                    updateStaffField("phone_number", event.target.value)
                }
                autoComplete="tel"
                helperText="Optional if an email address is provided."
                />

                <TextField
                fullWidth
                required
                type="password"
                label="Temporary password"
                value={staffForm.password}
                onChange={(event) => updateStaffField("password", event.target.value)}
                autoComplete="new-password"
                helperText="At least 8 characters, uppercase and lowercase letters, a number, and a special character. No spaces."
                />
            </Stack>
            </DialogContent>

            <DialogActions>
            <Button onClick={closeStaffDialog} disabled={creatingStaff}>
                Cancel
            </Button>
            <Button
                variant="contained"
                onClick={handleCreateStaff}
                disabled={creatingStaff}
                startIcon={creatingStaff ? <CircularProgress size={16} /> : <Add />}
            >
                {creatingStaff ? "Creating..." : "Create Account"}
            </Button>
            </DialogActions>
        </Dialog>
        </AdminDashboardLayout>
    );
    }

    export default Users;
