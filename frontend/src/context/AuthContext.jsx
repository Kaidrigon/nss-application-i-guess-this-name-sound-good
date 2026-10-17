import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            if (isMounted) {
            setLoading(false);
            }
            return;
        }

        try {
            const currentUser = await getCurrentUser();

            if (isMounted) {
            localStorage.setItem("user", JSON.stringify(currentUser));
            setUser(currentUser);
            }
        } catch (error) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            if (isMounted) {
            setUser(null);
            }
        } finally {
            if (isMounted) {
            setLoading(false);
            }
        }
        };

        restoreSession();

        return () => {
        isMounted = false;
        };
    }, []);

    const login = async (loginId, password) => {
        const normalizedLoginId = loginId.trim();

        if (!normalizedLoginId || !password) {
        throw new Error("Please enter your login ID and password.");
        }

        const data = await loginUser(normalizedLoginId, password);

        if (!data?.access_token) {
        throw new Error("The server did not return an access token.");
        }

        localStorage.setItem("access_token", data.access_token);

        try {
        const currentUser = await getCurrentUser();

        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);

        return currentUser;
        } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
        throw error;
        }
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
