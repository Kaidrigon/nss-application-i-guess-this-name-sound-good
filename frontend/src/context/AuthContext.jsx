import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const restoreSession = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
        setLoading(false);
        return;
        }

        try {
        const currentUser = await getCurrentUser();

        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
        } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
        } finally {
        setLoading(false);
        }
    };

    restoreSession();
    }, []);

    const login = async (loginId, password) => {
    const data = await loginUser(loginId, password);

    localStorage.setItem("access_token", data.access_token);

    const currentUser = await getCurrentUser();

    localStorage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);

    return currentUser;
    };

    const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    };

    return (
    <AuthContext.Provider
        value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
        }}
    >
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}