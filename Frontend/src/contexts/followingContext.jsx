// contexts/followingContext.js
import { createContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Import useAuth instead of user

const FollowContext = createContext();

const FollowProvider = ({ children }) => {
    const { user } = useAuth();
    const [followingState, setFollowingState] = useState([]);

    // Sync with auth user's following state
    useEffect(() => {
        if (user?.following) {
            setFollowingState(user.following);
        }
    }, [user?.following]);

    const handleFollow = (userId) => {
        setFollowingState((prev) => [...prev, { _id: userId }]);
    };

    const handleUnfollow = (userId) => {
        setFollowingState((prev) => prev.filter((u) => u._id !== userId));
    };

    const isFollowing = (userId) => {
        return followingState.some((u) => u._id === userId);
    };
    return (
        <FollowContext.Provider
            value={{
                followingState,
                handleFollow,
                handleUnfollow,
                isFollowing,
            }}
        >
            {children}
        </FollowContext.Provider>
    );
};

export { FollowProvider, FollowContext };
