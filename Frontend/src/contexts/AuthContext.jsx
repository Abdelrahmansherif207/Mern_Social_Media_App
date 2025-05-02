import { createContext, useState, useEffect, useCallback } from "react";
import { auth, provider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Context
const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);

    // Fetch user data when token changes
    const fetchUser = useCallback(async () => {
        if (!token) {
            setUser(null);
            setIsInitialized(true);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch user data");
            }

            if (!data.success || !data.data.user) {
                throw new Error("Invalid user data format");
            }

            setUser(data.data.user);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch user", err);
            setError(err.message);
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, [token]);

    // Initialize auth state on mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Login function
    const login = async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Add these lines to automatically login after registration
            if (data.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setUser(data.user);
            }

            return data;
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete account function
    const deleteAccount = async () => {
        if (!user) {
            throw new Error("No user to delete");
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${BASE_URL}/users/${user._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to delete account");
            }
            // On successful deletion, logout user
            logout();
            return data;
        } catch (err) {
            console.error("Delete account error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getUserProfile = async (userId) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/users/${userId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Faild to get profile");
            }

            console.log("user profile", data);
            setUserProfile(data);
            return data;
        } catch (err) {
            console.error("Update profile error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Update user profile
    const updateUserProfile = async (userData) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${BASE_URL}/users/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            console.log("updated user", data);
            setUser(data);
            return data;
        } catch (err) {
            console.error("Update profile error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Follow user
    const followUser = async (userId) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("Making the fetch request...");
            const response = await fetch(`${BASE_URL}/users/${userId}/follow`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(response.status);

            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.message || "Failed to follow user");
            }

            console.log("Followed user", data);
            return data;
        } catch (err) {
            console.error("Follow user error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Unfollow user
    const unfollowUser = async (userId) => {
        console.log("unfollow user called!");
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `${BASE_URL}/users/${userId}/unfollow`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to unfollow user");
            }

            console.log("Unfollowed user", data);
            return data;
        } catch (err) {
            console.error("Unfollow user error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setIsLoading(true);

            const result = await signInWithPopup(auth, provider);
            const user = {
                username: result.user.displayName,
                email: result.user.email,
                profilePicture: result.user.photoURL,
                _id: result.user.uid,
                provider: result.providerId,
            };

            setGoogleUser(user);
            return { success: true };
        } catch (err) {
            console.error("Google Sign‑In error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user is authenticated
    const isAuthenticated = !!token;
    const clearError = () => setError(null);
    // Context value
    const value = {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        isInitialized,
        login,
        logout,
        register,
        fetchUser,
        updateUserProfile,
        followUser,
        unfollowUser,
        clearError,
        deleteAccount,
        getUserProfile,
        userProfile,
        signInWithGoogle,
        googleUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
