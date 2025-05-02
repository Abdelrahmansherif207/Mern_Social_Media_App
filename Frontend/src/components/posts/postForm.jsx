import React, { useState, useRef } from "react";
import { Image as ImageIcon, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Avatar, Button } from "@heroui/react";
import { useAuth } from "../../hooks/useAuth";
import { usePosts } from "../../hooks/usePosts";

export default function PostForm() {
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isCreated, setIsCreated] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const IMGBB_API_KEY = "b60c97880ba68426244c0130c1d72def";
    const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

    const { createPost } = usePosts();
    const { user } = useAuth();

    const uploadImagetoImgBB = async (file) => {
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
            setErrors((prev) => ({ ...prev, image: err.message }));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            return setErrors((prev) => ({
                ...prev,
                image: "Please select a valid image file.",
            }));
        }

        setErrors((prev) => ({ ...prev, image: null }));
        setImageFile(file);

        // Upload image and set the URL
        const uploadedUrl = await uploadImagetoImgBB(file);
        if (uploadedUrl) {
            setImageUrl(uploadedUrl);
        }
        console.log("Image URL:", uploadedUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setErrors((prev) => ({ ...prev, content: "Content is required." }));
            return;
        }

        const data_to_submit = {
            content: content,
            image: imageUrl || "",
        };

        try {
            setIsLoading(true);
            const response = await createPost(data_to_submit);
            console.log("Post response:", response);

            if (response && response.status === 201) {
                setContent("");
                setImageFile(null);
                setImageUrl("");
                setErrors({});
                setIsCreated(true);

                setTimeout(() => setIsCreated(false), 3000);
                return response.data;
            } else {
                setErrors({
                    server: "Post created but unexpected response format",
                });
            }
        } catch (error) {
            console.error("Error creating post:", error);
            setErrors({
                server:
                    error.message ||
                    "An error occurred while creating the post.",
            });
        } finally {
            setIsLoading(false);
            setShowEmojiPicker(false);
        }
    };

    const onEmojiClick = (emojiData) => {
        setContent((prevContent) => prevContent + emojiData.emoji);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 ">
            <form
                onSubmit={handleSubmit}
                className="dark rounded-lg shadow-md p-4 border border-zinc-800"
            >
                <div className="flex gap-4">
                    <Avatar
                        color="primary"
                        size="md"
                        src={user?.profilePicture}
                    />
                    <textarea
                        className="bg-transparent w-full p-2 text-white border-b border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                            <ImageIcon className="w-5 h-5" />
                            <span>Add Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                            disabled={isLoading}
                        >
                            <Smile className="w-5 h-5" />
                            <span>Add Emoji</span>
                        </button>
                    </div>

                    <Button
                        className="bg-gradient-to-tr from-blue-800 to-blue-900 text-white shadow-lg"
                        radius="full"
                        type="submit"
                        isLoading={isLoading}
                    >
                        Post
                    </Button>
                </div>

                {showEmojiPicker && (
                    <div className="absolute z-10 mt-2" ref={emojiPickerRef}>
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme="dark"
                            width={300}
                            height={400}
                        />
                    </div>
                )}

                {imageFile && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-400">
                            Selected image: {imageFile.name}
                        </p>
                        {imageUrl && (
                            <p className="text-sm text-green-400">
                                Image uploaded successfully!
                            </p>
                        )}
                    </div>
                )}

                {errors.image && (
                    <p className="mt-2 text-sm text-red-500">{errors.image}</p>
                )}
                {errors.content && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.content}
                    </p>
                )}
                {errors.server && (
                    <p className="mt-2 text-sm text-red-500">{errors.server}</p>
                )}
            </form>
        </div>
    );
}
