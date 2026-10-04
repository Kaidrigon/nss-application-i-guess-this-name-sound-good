import { useEffect, useMemo, useState } from "react";

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
    AdminPanelSettings,
    LockReset,
    Person,
    Refresh,
    Search,
    SupervisorAccount,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import { useAuth } from "../../context/AuthContext";

import {
    getUsers,
} from "../../services/auth";

import api from "../../services/api";


function Users() {

    const { user } = useAuth();

    const theme = useTheme();

    const isMobile = useMediaQuery(
        theme.breakpoints.down("md")
    );

    // =========================================================
    // STATE
    // =========================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState("all");

    // =========================================================
    // ROLE DIALOG
    // =========================================================

    const [roleDialogOpen, setRoleDialogOpen] =
        useState(false);

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [selectedRole, setSelectedRole] =
        useState("");

    const [changingRole, setChangingRole] =
        useState(false);

    // =========================================================
    // PASSWORD RESET DIALOG
    // =========================================================

    const [passwordDialogOpen, setPasswordDialogOpen] =
        useState(false);

    const [resetPassword, setResetPassword] =
        useState("");

    const [resettingPassword, setResettingPassword] =
        useState(false);

    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getUsers();

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load users:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load users."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadUsers();

    }, []);

    // =========================================================
    // FILTER USERS
    // =========================================================

    const filteredUsers = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return users.filter((item) => {

            const matchesSearch =
                !searchValue ||
                item.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.roll_number
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.email
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesRole =
                roleFilter === "all" ||
                item.role === roleFilter;

            return (
                matchesSearch &&
                matchesRole
            );
        });

    }, [
        users,
        search,
        roleFilter,
    ]);

    // =========================================================
    // OPEN ROLE DIALOG
    // =========================================================

    const openRoleDialog = (selected) => {

        setSelectedUser(selected);

        setSelectedRole(selected.role);

        setRoleDialogOpen(true);

        setError("");

        setSuccess("");
    };

    // =========================================================
    // CLOSE ROLE DIALOG
    // =========================================================

    const closeRoleDialog = () => {

        if (changingRole) {
            return;
        }

        setRoleDialogOpen(false);

        setSelectedUser(null);

        setSelectedRole("");
    };

    // =========================================================
    // CHANGE ROLE
    // =========================================================

    const handleRoleChange = async () => {

        if (!selectedUser) {
            return;
        }

        if (!selectedRole) {
            return;
        }

        if (
            selectedUser.role ===
            selectedRole
        ) {

            closeRoleDialog();

            return;
        }

        try {

            setChangingRole(true);

            setError("");

            setSuccess("");

            await api.patch(
                `/auth/users/${selectedUser.id}/role`,
                {
                    role: selectedRole,
                }
            );

            setUsers((previousUsers) =>
                previousUsers.map((item) =>
                    item.id === selectedUser.id
                        ? {
                            ...item,
                            role: selectedRole,
                        }
                        : item
                )
            );

            setSuccess(
                `${selectedUser.name}'s role was updated successfully.`
            );

            closeRoleDialog();

        } catch (error) {

            console.error(
                "Failed to change user role:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to change user role."
            );

        } finally {

            setChangingRole(false);

        }
    };

    // =========================================================
    // OPEN PASSWORD RESET DIALOG
    // =========================================================

    const openPasswordDialog = (selected) => {

        setSelectedUser(selected);

        setResetPassword("");

        setPasswordDialogOpen(true);

        setError("");

        setSuccess("");
    };

    // =========================================================
    // CLOSE PASSWORD RESET DIALOG
    // =========================================================

    const closePasswordDialog = () => {

        if (resettingPassword) {
            return;
        }

        setPasswordDialogOpen(false);

        setSelectedUser(null);

        setResetPassword("");
    };

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    const handlePasswordReset = async () => {

        if (!selectedUser) {
            return;
        }

        if (!resetPassword.trim()) {

            setError(
                "Please enter a new password."
            );

            return;
        }

        if (resetPassword.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }

        try {

            setResettingPassword(true);

            setError("");

            setSuccess("");

            await api.post(
                "/auth/reset-password",
                {
                    login_id:
                        selectedUser.email ||
                        selectedUser.roll_number,
                    new_password:
                        resetPassword,
                }
            );

            setSuccess(
                `Password for ${selectedUser.name} was reset successfully.`
            );

            closePasswordDialog();

        } catch (error) {

            console.error(
                "Failed to reset password:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to reset password."
            );

        } finally {

            setResettingPassword(false);

        }
    };

    // =========================================================
    // ROLE ICON
    // =========================================================

    const getRoleIcon = (role) => {

        if (role === "admin") {
            return <AdminPanelSettings />;
        }

        if (role === "coordinator") {
            return <SupervisorAccount />;
        }

        return <Person />;
    };

    // =========================================================
    // ROLE LABEL
    // =========================================================

    const getRoleLabel = (role) => {

        if (role === "admin") {
            return "Administrator";
        }

        if (role === "coordinator") {
            return "Coordinator";
        }

        return "Volunteer";
    };

    // =========================================================
    // USER CARD FOR MOBILE
    // =========================================================

    const MobileUserCard = ({ item }) => {

        return (
            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 2,
                }}
            >
                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            gap: 2,
                        }}
                    >

                        <Box sx={{ minWidth: 0 }}>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                noWrap
                            >
                                {item.name}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.25 }}
                            >
                                {item.roll_number ||
                                    item.email ||
                                    "No login ID"}
                            </Typography>

                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems:
                                    "center",
                                color:
                                    "primary.main",
                            }}
                        >
                            {getRoleIcon(
                                item.role
                            )}
                        </Box>

                    </Box>

                    <Box sx={{ mt: 2 }}>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            Role
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {getRoleLabel(
                                item.role
                            )}
                        </Typography>

                    </Box>

                    <Box sx={{ mt: 1.5 }}>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            Class / Year
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {item.class_name ||
                                "—"}{" "}
                            {item.year
                                ? `• Year ${item.year}`
                                : ""}
                        </Typography>

                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            mt: 2.5,
                            flexWrap: "wrap",
                        }}
                    >

                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                                openRoleDialog(
                                    item
                                )
                            }
                        >
                            Change Role
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                                <LockReset />
                            }
                            onClick={() =>
                                openPasswordDialog(
                                    item
                                )
                            }
                        >
                            Reset Password
                        </Button>

                    </Box>

                </CardContent>
            </Card>
        );
    };

    // =========================================================
    // UI
    // =========================================================

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
                    User Management
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Manage volunteers, coordinators,
                    and administrators.
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
                    onClose={() =>
                        setError("")
                    }
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
                    onClose={() =>
                        setSuccess("")
                    }
                >
                    {success}
                </Alert>
            )}

            {/* =================================================
                CONTROLS
            ================================================== */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 3,
                }}
            >
                <CardContent>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "2fr 1fr auto",
                            },
                            gap: 2,
                            alignItems: "center",
                        }}
                    >

                        <TextField
                            fullWidth
                            label="Search users"
                            placeholder="Name, roll number, or email"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Search
                                            sx={{
                                                mr: 1,
                                                color:
                                                    "text.secondary",
                                            }}
                                        />
                                    ),
                                },
                            }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>
                                Role
                            </InputLabel>

                            <Select
                                value={roleFilter}
                                label="Role"
                                onChange={(event) =>
                                    setRoleFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="all">
                                    All roles
                                </MenuItem>

                                <MenuItem value="volunteer">
                                    Volunteers
                                </MenuItem>

                                <MenuItem value="coordinator">
                                    Coordinators
                                </MenuItem>

                                <MenuItem value="admin">
                                    Administrators
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={loadUsers}
                            disabled={loading}
                            sx={{
                                minHeight: 56,
                            }}
                        >
                            Refresh
                        </Button>

                    </Box>

                </CardContent>
            </Card>

            {/* =================================================
                USER COUNT
            ================================================== */}

            <Box sx={{ mb: 2 }}>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Showing{" "}
                    <strong>
                        {filteredUsers.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {users.length}
                    </strong>{" "}
                    users
                </Typography>

            </Box>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >
                    <CardContent
                        sx={{
                            minHeight: 220,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >

                        <Stack
                            spacing={1}
                            alignItems="center"
                        >

                            <CircularProgress />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Loading users...
                            </Typography>

                        </Stack>

                    </CardContent>
                </Card>

            ) : filteredUsers.length === 0 ? (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >
                    <CardContent
                        sx={{
                            minHeight: 220,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            textAlign: "center",
                        }}
                    >

                        <Box>

                            <Person
                                sx={{
                                    fontSize: 48,
                                    color:
                                        "text.secondary",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                No users found
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                Try changing your
                                search or filter.
                            </Typography>

                        </Box>

                    </CardContent>
                </Card>

            ) : isMobile ? (

                <Box>

                    {filteredUsers.map(
                        (item) => (
                            <MobileUserCard
                                key={item.id}
                                item={item}
                            />
                        )
                    )}

                </Box>

            ) : (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                        overflow: "hidden",
                    }}
                >

                    <TableContainer>

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        User
                                    </TableCell>

                                    <TableCell>
                                        Login ID
                                    </TableCell>

                                    <TableCell>
                                        Class / Year
                                    </TableCell>

                                    <TableCell>
                                        Role
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
                                        Actions
                                    </TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {filteredUsers.map(
                                    (item) => (

                                        <TableRow
                                            key={
                                                item.id
                                            }
                                            hover
                                        >

                                            <TableCell>

                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </Typography>

                                                {item.email && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            item.email
                                                        }
                                                    </Typography>
                                                )}

                                            </TableCell>

                                            <TableCell>

                                                {item.roll_number ||
                                                    item.email ||
                                                    "—"}

                                            </TableCell>

                                            <TableCell>

                                                {item.class_name ||
                                                    "—"}

                                                {item.year
                                                    ? ` • Year ${item.year}`
                                                    : ""}

                                            </TableCell>

                                            <TableCell>

                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 0.75,
                                                        color:
                                                            "primary.main",
                                                    }}
                                                >

                                                    {getRoleIcon(
                                                        item.role
                                                    )}

                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {getRoleLabel(
                                                            item.role
                                                        )}
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        openRoleDialog(
                                                            item
                                                        )
                                                    }
                                                    sx={{
                                                        mr: 1,
                                                    }}
                                                >
                                                    Change Role
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={
                                                        <LockReset />
                                                    }
                                                    onClick={() =>
                                                        openPasswordDialog(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Reset
                                                </Button>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                </Card>

            )}

            {/* =================================================
                CHANGE ROLE DIALOG
            ================================================== */}

            <Dialog
                open={roleDialogOpen}
                onClose={closeRoleDialog}
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle>
                    Change User Role
                </DialogTitle>

                <DialogContent>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Change the role assigned to{" "}
                        <strong>
                            {selectedUser?.name}
                        </strong>.
                    </Typography>

                    <FormControl
                        fullWidth
                        sx={{ mt: 1 }}
                    >

                        <InputLabel>
                            Role
                        </InputLabel>

                        <Select
                            value={selectedRole}
                            label="Role"
                            onChange={(event) =>
                                setSelectedRole(
                                    event.target.value
                                )
                            }
                        >

                            <MenuItem value="volunteer">
                                Volunteer
                            </MenuItem>

                            <MenuItem value="coordinator">
                                Coordinator
                            </MenuItem>

                            <MenuItem value="admin">
                                Administrator
                            </MenuItem>

                        </Select>

                    </FormControl>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={closeRoleDialog}
                        disabled={changingRole}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleRoleChange
                        }
                        disabled={
                            changingRole ||
                            !selectedRole
                        }
                    >
                        {changingRole
                            ? "Updating..."
                            : "Update Role"}
                    </Button>

                </DialogActions>

            </Dialog>

            {/* =================================================
                RESET PASSWORD DIALOG
            ================================================== */}

            <Dialog
                open={passwordDialogOpen}
                onClose={closePasswordDialog}
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle>
                    Reset Password
                </DialogTitle>

                <DialogContent>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Set a new password for{" "}
                        <strong>
                            {selectedUser?.name}
                        </strong>.
                    </Typography>

                    <TextField
                        fullWidth
                        autoFocus
                        type="password"
                        label="New password"
                        placeholder="Enter new password"
                        value={resetPassword}
                        onChange={(event) =>
                            setResetPassword(
                                event.target.value
                            )
                        }
                        helperText="Minimum 8 characters"
                        sx={{ mt: 1 }}
                    />

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={
                            closePasswordDialog
                        }
                        disabled={
                            resettingPassword
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handlePasswordReset
                        }
                        disabled={
                            resettingPassword ||
                            !resetPassword.trim()
                        }
                    >
                        {resettingPassword
                            ? "Resetting..."
                            : "Reset Password"}
                    </Button>

                </DialogActions>

            </Dialog>

        </AdminDashboardLayout>
    );
}

export default Users;