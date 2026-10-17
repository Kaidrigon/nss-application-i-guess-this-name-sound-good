import api from "./api";

// LOGIN
    export const loginUser = async (loginId, password) => {
    const response = await api.post("/auth/login", {
        login_id: loginId.trim(),
        password,
    });

    return response.data;
    };

    // CURRENT USER
    export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
    };

    // REGISTER VOLUNTEER
    export const registerVolunteer = async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
    };

    // REGISTER FIRST ADMIN
    export const registerFirstAdmin = async (data, setupKey) => {
    const response = await api.post("/auth/register-admin", data, {
        headers: {
        "setup-key": setupKey,
        },
    });

    return response.data;
    };

    // CREATE STAFF ACCOUNT (ADMIN ONLY)
    export const createStaffAccount = async (data) => {
    const response = await api.post("/auth/create-staff", data);
    return response.data;
    };

    // GET ADMIN NAMES
    export const getAdmins = async () => {
    const response = await api.get("/auth/admins");
    return response.data;
    };

    // GET ALL USERS
    export const getUsers = async () => {
    const response = await api.get("/auth/users");
    return response.data;
    };

    // UPDATE STAFF CONTACT DETAILS
    export const updateStaffContactDetails = async (data) => {
    const response = await api.patch("/auth/me/contact-details", data);
    return response.data;
    };

    // CHANGE PASSWORD
    export const changePassword = async (data) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
    };

    // RESET USER PASSWORD (STAFF)
    export const resetUserPassword = async (data) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
    };

    // UPDATE USER ROLE (ADMIN ONLY)
    export const updateUserRole = async (userId, role) => {
    const response = await api.patch(`/auth/users/${userId}/role`, {
        role,
    });

    return response.data;
    };
