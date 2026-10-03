    import api from "./api";

    export const loginUser = async (loginId, password) => {
    const response = await api.post("/auth/login", {
        login_id: loginId,
        password,
    });

    return response.data;
    };

    export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");

    return response.data;
    };

    export const registerVolunteer = async (data) => {
    const response = await api.post("/auth/register", data);

    return response.data;
    };

    export const registerFirstAdmin = async (data, setupKey) => {
    const response = await api.post(
        "/auth/register-admin",
        data,
        {
        headers: {
            setup_key: setupKey,
        },
        }
    );

    return response.data;
    };
