import { useContext } from "react";
import { PostContext } from "../contexts/postContext";

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) {
        console.warn("⚠️ useAuth() must be used inside an AuthProvider");
    }
    return context;
};
