import React, { useState, useEffect } from "react";
import { Avatar, Button, Spinner } from "@heroui/react";
import { useSearch } from "../../hooks/useSearch";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export default function SearchResult() {
    const { searchResult, loading, error } = useSearch();
    const { user, followUser, unfollowUser } = useAuth();
    const [loadingStates, setLoadingStates] = useState({});
    const [localFollowing, setLocalFollowing] = useState([]);

    useEffect(() => {
        console.log("Current user.following:", user?.following);
        setLocalFollowing(user?.following || []);
    }, [user?.following]);

    const handleFollow = async (usr) => {
        if (!user) return;

        const wasFollowing = localFollowing.some((u) => u._id === usr._id);
        // Optimistic update
        setLocalFollowing((prev) =>
            wasFollowing
                ? prev.filter((u) => u._id !== usr._id)
                : [...prev, usr]
        );

        setLoadingStates((prev) => ({ ...prev, [usr._id]: true }));

        try {
            if (wasFollowing) {
                await unfollowUser(usr._id);
            } else {
                await followUser(usr._id);
            }
        } catch (error) {
            console.log(error);
            setLocalFollowing((prev) =>
                wasFollowing
                    ? [...prev, usr]
                    : prev.filter((u) => u._id !== usr._id)
            );
        } finally {
            setLoadingStates((prev) => ({ ...prev, [usr._id]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <Spinner variant="wave" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error: {error.message || "Something went wrong."}
            </div>
        );
    }

    const results = Array.isArray(searchResult) ? searchResult : [];
    if (!results.length) return null;

    return (
        <div className="border border-zinc-800 rounded-lg flex flex-col gap-5 p-4">
            {results.map((usr) => {
                const isFollowing = localFollowing.some(
                    (followedUser) => followedUser._id === usr._id
                );
                const isLoading = loadingStates[usr._id];
                const isCurrentUser = usr._id === user?._id;

                return (
                    <div
                        key={usr._id}
                        className="flex justify-around items-center"
                    >
                        <Avatar
                            color="primary"
                            size="md"
                            src={usr.profilePicture}
                        />
                        <div className="flex flex-col gap-0">
                            <Link to={`/profile/${usr._id}`}>
                                <p className="font-semibold hover:underline cursor-pointer">
                                    {usr.username}
                                </p>
                            </Link>
                            <small className="text-zinc-500">
                                @{usr.username}
                            </small>
                        </div>
                        {!isCurrentUser && (
                            <Button
                                className={`bg-slate-200 text-black h-10 font-semibold ${
                                    isFollowing
                                        ? "!bg-zinc-800 !text-white"
                                        : ""
                                }`}
                                radius="full"
                                onPress={() => handleFollow(usr)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : isFollowing ? (
                                    "Following"
                                ) : (
                                    "Follow"
                                )}
                            </Button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
