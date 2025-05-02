import React, { useEffect, useState, useRef } from "react";
import {
    Input,
    Textarea,
    Button,
    Spinner,
    Card,
    CardBody,
    Avatar,
} from "@heroui/react";
import { Save, Camera, Lock, Trash2 } from "lucide-react";
import Aside from "../components/aside";
import SearchAside from "../components/search/searchAside";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Settings() {
    const IMGBB_API_KEY = "b60c97880ba68426244c0130c1d72def";
    const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

    const { user, isLoading, updateUserProfile, deleteAccount } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        bio: user?.bio || "",
        location: user?.location || "",
        website: user?.website || "",
    });
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [picFile, setPicFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [picUrl, setPicUrl] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [message, setMessage] = useState("");
    const coverInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
                location: user.location || "",
                website: user.website || "",
            });
        }
    }, [user]);
    const navigate = useNavigate();
    const uploadImagetoImgBB = async (file) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("key", IMGBB_API_KEY);

            const response = await fetch(IMGBB_UPLOAD_URL, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Image upload failed");
            }

            return data.data.url;
        } catch (err) {
            console.error("Error uploading image:", err);
            setErrors((prev) => ({ ...prev, image: err.message }));
            return null;
        } finally {
            setLoading(false);
        }
    };
    const handlePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            return setErrors((prev) => ({
                ...prev,
                image: "Please select a valid image file.",
            }));
        }

        setErrors((prev) => ({ ...prev, image: null }));
        setPicFile(file);

        // Upload image and set the URL
        const uploadedUrl = await uploadImagetoImgBB(file);
        if (uploadedUrl) {
            setPicUrl(uploadedUrl);
        }
        console.log("Image URL:", uploadedUrl);
    };
    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        console.log(file);
        if (!file || !file.type.startsWith("image/")) {
            return setErrors((prev) => ({
                ...prev,
                image: "Please select a valid image file.",
            }));
        }

        setErrors((prev) => ({ ...prev, image: null }));
        setCoverFile(file);

        // Upload image and set the URL
        const uploadedUrl = await uploadImagetoImgBB(file);
        if (uploadedUrl) {
            setCoverUrl(uploadedUrl);
        }
        console.log("Image URL:", uploadedUrl);
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });
    const handlePwdChange = (e) =>
        setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const triggerCoverInput = () => coverInputRef.current?.click();

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const updates = { ...form };
        if (picFile) updates.profilePicture = picUrl;
        if (coverFile) updates.coverPicture = coverUrl;
        try {
            await updateUserProfile(updates);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setMessage(err.message || "Failed to update profile");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwords.current || passwords.new !== passwords.confirm) {
            setMessage("Passwords do not match or are empty");
            return;
        }
        try {
            await updateUserProfile({
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            setMessage("Password changed successfully!");
        } catch (err) {
            setMessage(err.message || "Failed to change password");
        }
    };

    const handleDelete = async () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAccount();
            navigate("/login");
        } catch (err) {
            console.error(err);
            setMessage(err.message || "Failed to delete account");
        } finally {
            setShowDeleteModal(false);
        }
    };

    if (!user || isLoading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner variant="wave" />
            </div>
        );

    return (
        <div className="flex justify-between z-50 min-h-screen bg-transparent backdrop-blur-sm shadow-lg text-white">
            <div className="w-1/4">
                <Aside />
            </div>
            <main className="w-1/2 flex flex-col items-start p-8 space-y-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                <Card className="w-full bg-transparent border border-zinc-700 shadow-2xl">
                    <CardBody>
                        {/* Tabs */}
                        <div className="flex border-b border-zinc-700 mb-4">
                            <button
                                onClick={() => {
                                    setActiveTab("profile");
                                    setMessage("");
                                }}
                                className={`px-4 py-2 -mb-px ${
                                    activeTab === "profile"
                                        ? "border-b-2 border-blue-500 text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("password");
                                    setMessage("");
                                }}
                                className={`px-4 py-2 -mb-px ${
                                    activeTab === "password"
                                        ? "border-b-2 border-blue-500 text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Password
                            </button>
                        </div>

                        {activeTab === "profile" && (
                            <form
                                onSubmit={handleProfileSubmit}
                                className="space-y-6"
                            >
                                {/* Cover & Profile Picture */}
                                <div className="flex flex-col space-y-4">
                                    <div className="relative group w-full h-32 bg-zinc-800 rounded overflow-hidden shadow-inner">
                                        <img
                                            src={
                                                coverFile
                                                    ? URL.createObjectURL(
                                                          coverFile
                                                      )
                                                    : user?.coverPicture || null
                                            }
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex justify-center items-center opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                type="button"
                                                onClick={triggerCoverInput}
                                                className="bg-zinc-900/70 text-white rounded-lg px-3 py-2 flex items-center gap-2"
                                            >
                                                <Camera className="w-5 h-5" />{" "}
                                                Change Cover
                                            </button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={coverInputRef}
                                                onChange={async (e) => {
                                                    setLoading(true);
                                                    await handleCoverChange(e);
                                                    setLoading(false);
                                                }}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            src={
                                                picFile
                                                    ? URL.createObjectURL(
                                                          picFile
                                                      )
                                                    : user?.profilePicture
                                            }
                                            size="lg"
                                            className="bg-zinc-800 shadow-inner"
                                        />
                                        <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                                            <Camera className="w-5 h-5" />
                                            <span>Change Picture</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    setLoading(true);
                                                    await handlePicChange(e);
                                                    setLoading(false);
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Text Fields */}
                                {[
                                    {
                                        label: "Username",
                                        name: "username",
                                        type: "text",
                                    },
                                    {
                                        label: "Email",
                                        name: "email",
                                        type: "email",
                                    },
                                    {
                                        label: "Bio",
                                        name: "bio",
                                        type: "textarea",
                                    },
                                    {
                                        label: "Location",
                                        name: "location",
                                        type: "text",
                                    },
                                    {
                                        label: "Website",
                                        name: "website",
                                        type: "text",
                                    },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block mb-1 text-sm font-medium text-gray-300">
                                            {field.label}
                                        </label>
                                        {field.type === "textarea" ? (
                                            <textarea
                                                className="bg-zinc-900 w-full p-2 text-white border-b border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                                placeholder="Tell us something about you!"
                                                name={field.name}
                                                value={form[field.name]}
                                                onChange={handleChange}
                                                rows={2}
                                            />
                                        ) : (
                                            <div className="w-full flex flex-col gap-2">
                                                <input
                                                    placeholder={field.label}
                                                    name={field.name}
                                                    type={field.type}
                                                    value={form[field.name]}
                                                    onChange={handleChange}
                                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {message && (
                                    <p className="text-sm text-gray-400">
                                        {message}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    radius="full"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Profile
                                </Button>
                            </form>
                        )}

                        {activeTab === "password" && (
                            <form
                                onSubmit={handlePasswordSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-300">
                                        Current Password
                                    </label>
                                    <div className="w-full flex flex-col gap-2">
                                        <input
                                            type="password"
                                            name="current"
                                            value={passwords.current}
                                            onChange={handlePwdChange}
                                            placeholder="Current Password"
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-300">
                                        New Password
                                    </label>

                                    <div className="w-full flex flex-col gap-2">
                                        <input
                                            type="password"
                                            name="new"
                                            value={passwords.new}
                                            onChange={handlePwdChange}
                                            placeholder="New Password"
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-300">
                                        Confirm New Password
                                    </label>
                                    <div className="w-full flex flex-col gap-2">
                                        <input
                                            type="password"
                                            name="confirm"
                                            value={passwords.confirm}
                                            onChange={handlePwdChange}
                                            placeholder="Confirm New Password"
                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <p className="text-sm text-gray-400">
                                        {message}
                                    </p>
                                )}
                                <div className="flex items-center space-x-4">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        radius="full"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Change Password
                                    </Button>
                                    <Button
                                        onPress={handleDelete}
                                        variant="destructive"
                                        className="flex items-center bg-red-600 text-white hover:bg-red-700"
                                        radius="full"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Account
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardBody>
                </Card>
            </main>
            <SearchAside />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-zinc-900 rounded-lg p-6 shadow-xl w-80">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete your account? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <Button
                                onPress={() => setShowDeleteModal(false)}
                                variant="outline"
                                className="text-white border-gray-600"
                                radius="full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={confirmDelete}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                radius="full"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
