import { useContext } from "react";
import { FollowContext } from "../contexts/followingContext";

export const useFollow = () => {
    const context = useContext(FollowContext);
    if (!context) {
        console.warn("⚠️ useAuth() must be used inside an AuthProvider");
    }
    return context;
};
