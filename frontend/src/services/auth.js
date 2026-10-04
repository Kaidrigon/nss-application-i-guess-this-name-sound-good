import api from "./api";


// =========================================================
// LOGIN
// =========================================================

export const loginUser = async (loginId, password) => {

    const response = await api.post(
        "/auth/login",
        {
            login_id: loginId,
            password,
        }
    );

    return response.data;
};


// =========================================================
// CURRENT USER
// =========================================================

export const getCurrentUser = async () => {

    const response = await api.get(
        "/auth/me"
    );

    return response.data;
};


// =========================================================
// REGISTER VOLUNTEER
// =========================================================

export const registerVolunteer = async (data) => {

    const response = await api.post(
        "/auth/register",
        data
    );

    return response.data;
};


// =========================================================
// REGISTER FIRST ADMIN
// =========================================================

export const registerFirstAdmin = async (
    data,
    setupKey
) => {

    try {

        const response = await api.post(
            "/auth/register-admin",

            data,

            {
                headers: {
                    // IMPORTANT:
                    // FastAPI Header("setup_key")
                    // expects HTTP header "setup-key"
                    "setup-key": setupKey,
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "First admin registration failed:",
            error.response?.data || error
        );

        throw error;
    }
};


// =========================================================
// GET ADMIN NAMES
// =========================================================

export const getAdmins = async () => {

    const response = await api.get(
        "/auth/admins"
    );

    return response.data;
};