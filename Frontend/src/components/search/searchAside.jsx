import React, { useEffect, useState } from "react";
import Search from "./search";
import SearchResult from "./searchResult";
import { Avatar, Button, Spinner } from "@heroui/react";
import { useAuth } from "../../hooks/useAuth";

function SearchAside() {
    const { user, followUser, unfollowUser } = useAuth();
    const [loadingStates, setLoadingStates] = useState({});
    const [localFollowing, setLocalFollowing] = useState(user?.following || []);
    const [suggestedUsers, setSuggestedUsers] = useState([]);

    const getsuggestedUsers = () => {
        let result = [];
        const userFollowing = user?.following;

        userFollowing?.forEach((obj) => {
            result = [...result, ...obj.following];
        });

        const randomUsers = [];
        while (randomUsers.length < 3 && result.length > 0) {
            const randomIndex = Math.floor(Math.random() * result.length);
            const randomUser = result[randomIndex];

            if (!randomUsers.includes(randomUser)) {
                randomUsers.push(randomUser);
            }

            result.splice(randomIndex, 1);
        }

        setSuggestedUsers(randomUsers);
    };

    useEffect(() => {
        getsuggestedUsers();
    }, [user?.following]);

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

    return (
        <div className="w-1/4 flex flex-col gap-4 border-l border-zinc-800 p-5">
            <Search />
            <SearchResult />

            <div className="border border-zinc-800 rounded-lg flex flex-col gap-5 p-4">
                <h2 className="font-semibold text-xl">Recommended</h2>

                {suggestedUsers.map((user) => {
                    const isFollowing = localFollowing.some(
                        (followedUser) => followedUser._id === user._id
                    );
                    const isLoading = loadingStates[user._id];

                    return (
                        <div
                            key={user._id}
                            className="flex justify-around items-center"
                        >
                            <Avatar
                                color="primary"
                                size="md"
                                src={user.profilePicture}
                            />
                            <div className="flex flex-col gap-0">
                                <p className="font-semibold">{user.username}</p>
                                <small className="text-zinc-500">
                                    @{user.username}
                                </small>
                            </div>
                            <Button
                                className={`bg-slate-200 text-black h-10 font-semibold ${
                                    isFollowing
                                        ? "!bg-zinc-800 !text-white"
                                        : ""
                                }`}
                                radius="full"
                                onPress={() =>
                                    handleFollow(user._id, isFollowing)
                                }
                                isDisabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner size="sm" color="current" />
                                ) : isFollowing ? (
                                    "Following"
                                ) : (
                                    "Follow"
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SearchAside;
