import React, { useState, useEffect, useRef } from "react";
import { X, Edit } from "lucide-react";
import { Button, Textarea } from "@heroui/react";
import { usePosts } from "../../hooks/usePosts";

// replace with your actual imgbb API key or use environment variable

const IMGBB_API_KEY = "b60c97880ba68426244c0130c1d72def";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export default function PostEditModal({ isOpen, onClose, post, onUpdate }) {
    const { updatePost } = usePosts();
    const [content, setContent] = useState(post.content || "");
    const [imageUrl, setImageUrl] = useState(post.image || "");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setContent(post.content || "");
            setImageUrl(post.image || "");
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, post.content, post.image]);

    const uploadImageToImgBB = async (file) => {
        setIsLoading(true);
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
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }
        setError(null);
        const uploadedUrl = await uploadImageToImgBB(file);
        if (uploadedUrl) setImageUrl(uploadedUrl);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            setError("Content cannot be empty.");
            return;
        }
        setError(null);
        const payload = { content, image: imageUrl };
        try {
            const res = await updatePost(post._id || post.id, payload);
            if (res.status === 200) {
                onUpdate?.(res.data);
                onClose();
            } else {
                setError(res.data?.message || "Failed to update post.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while updating.");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-zinc-950 bg-opacity-40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-5 py-6">
                <div
                    ref={modalRef}
                    className="bg-gradient-to-tr from-black to-zinc-800 text-cream-200 rounded-xl shadow-xl overflow-hidden w-full max-w-lg mx-auto p-4"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                        <h3 className="text-xl font-semibold">Edit Post</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-full"
                        >
                            <X className="w-5 h-5 text-cream-200" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="space-y-4">
                        {imageUrl && (
                            <div
                                className="relative group w-full h-auto rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Post preview"
                                    className="w-full h-full object-cover"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="w-8 h-8 text-cream-300" />
                                </div>
                            </div>
                        )}
                        {/* hidden file input to change image */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />

                        <input
                            type="tex"
                            placeholder="Add a comment..."
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                            }}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm w-full h-auto"
                        />

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        {isLoading && (
                            <p className="text-sm text-zinc-400">
                                Uploading image...
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-4">
                        <Button
                            variant="outline"
                            onPress={onClose}
                            className="px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={handleSave}
                            className="px-4"
                            disabled={isLoading}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
