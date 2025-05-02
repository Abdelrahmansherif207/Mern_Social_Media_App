import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    CardBody,
    Divider,
    Spinner,
} from "@heroui/react";
import { MapPin, Calendar, Link as LinkIcon, Edit, Camera } from "lucide-react";
import Aside from "../components/aside";
import SearchAside from "../components/search/searchAside";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams, Navigate } from "react-router-dom";

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loadingStates, setLoadingStates] = useState({});
    const [localFollowing, setLocalFollowing] = useState([]);

    const {
        isAuthenticated,
        user, // the logged‑in user
        loading, // overall auth/profile loading flag
        getUserProfile, // function to fetch arbitrary user profile
        userProfile, // the fetched profile for `id`
        followUser,
        unfollowUser,
    } = useAuth();

    // Fetch the profile for this id whenever it changes
    useEffect(() => {
        if (id) {
            getUserProfile(id);
        }
    }, [id]);

    // Determine which data to render:
    // if id matches logged‑in user, show your own `user`, otherwise show `userProfile`
    const profile = id === user?._id ? user : userProfile;

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (loading || !profile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    label="Loading..."
                    variant="wave"
                />
            </div>
        );
    }

    const isFollowing = localFollowing.some(
        (followedUser) => followedUser._id === profile._id
    );
    const isLoading = loadingStates[profile._id];

    return (
        <div className="flex justify-between z-50">
            <div className="w-1/4">
                <Aside />
            </div>

            <main className="w-1/2 min-h-screen flex flex-col items-start p-5">
                {/* Cover Photo and Profile Header */}
                <div className="relative w-full">
                    <div className="group h-64 w-full rounded-t-xl overflow-hidden relative">
                        <img
                            src={
                                profile.coverPicture ||
                                "https://images.unsplash.com/photo-1519681393784-d120267933ba"
                            }
                            alt="Cover"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1519681393784-d120267933ba";
                            }}
                        />
                        <div
                            onClick={() => navigate("/settings")}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 hover:cursor-pointer transition-opacity duration-300 flex items-start justify-end p-3"
                        >
                            <button
                                className="opacity-0 group-hover:opacity-100 bg-zinc-900/70 text-white rounded-lg px-3 py-1.5 text-xs hover:bg-zinc-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-all duration-300 transform group-hover:scale-100 scale-95 flex items-center gap-1.5"
                                title="Edit cover photo"
                                aria-label="Edit cover photo"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Edit Cover</span>
                            </button>
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="absolute -bottom-16 left-8">
                        <div className="group relative w-32 h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-hidden shadow-lg">
                            <Avatar
                                color="primary"
                                size="lg"
                                className="w-32 h-32 rounded-full bg-zinc-800 shadow-lg object-contain"
                                src={profile.profilePicture}
                            />
                            <div
                                onClick={() => navigate("/settings")}
                                className="absolute inset-0 w-32 h-32 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center rounded-full hover:cursor-pointer"
                            >
                                <button
                                    className="opacity-0 group-hover:opacity-100 absolute bg-zinc-900/70 text-white rounded-full p-2 hover:bg-zinc-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white transition-all duration-300 transform group-hover:scale-100 scale-90"
                                    onClick={() => navigate("/settings")}
                                    title="Edit profile picture"
                                    aria-label="Edit profile picture"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="mt-20 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {profile.username}
                            </h1>
                            <p className="text-gray-400">@{profile.username}</p>
                        </div>
                        {id === user?._id ? (
                            <Button
                                variant="bordered"
                                radius="full"
                                className="border-zinc-800 text-cream-200 hover:bg-gray-800"
                                onPress={() => navigate("/settings")}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <Button
                                className={`bg-slate-200 text-black h-10 font-semibold ${
                                    isFollowing
                                        ? "!bg-zinc-800 !text-white"
                                        : ""
                                }`}
                                radius="full"
                                onPress={() => handleFollow(profile)}
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

                    <p className="mt-4 text-gray-300 max-w-2xl">
                        {profile.bio ||
                            "Full-stack developer | Open source enthusiast | Building the future of web development"}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-4 text-gray-400">
                        {profile.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.website && (
                            <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                <a
                                    href={profile.website}
                                    className="hover:text-white transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {profile.website}
                                </a>
                            </div>
                        )}
                        {profile.createdAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    Joined{" "}
                                    {new Date(
                                        profile.createdAt
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                                {profile.following?.length || 0}
                            </span>
                            <span className="text-gray-400">Following</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                                {profile.followers?.length || 0}
                            </span>
                            <span className="text-gray-400">Followers</span>
                        </div>
                    </div>
                </div>

                <Divider className="my-8 w-full" />

                {/* Recent Activity */}
                <div className="w-full">
                    <h2 className="text-xl font-bold text-white mb-6">
                        Recent Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <Card
                                key={item}
                                className="bg-zinc-900 border border-zinc-800"
                            >
                                <CardBody>
                                    <div className="flex items-start gap-4">
                                        <Avatar
                                            size="sm"
                                            src={
                                                profile.profilePicture ||
                                                "https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                            }
                                        />
                                        <div>
                                            <p className="text-white font-medium">
                                                Posted a new article
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Building scalable web
                                                applications with React
                                            </p>
                                            <p className="text-gray-500 text-xs mt-2">
                                                2 hours ago
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            <SearchAside />
        </div>
    );
}
