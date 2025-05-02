import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        console.warn("⚠️ useAuth() must be used inside an AuthProvider");
    }
    return context;
};
