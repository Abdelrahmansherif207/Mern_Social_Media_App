import React, { useState } from "react";
import { X, Send, Trash2, Heart, EyeOff } from "lucide-react";
import { Avatar, Button } from "@heroui/react";
import { timeAgo } from "../../utils/timeAgo";

export default function PostDetailsModal({
    isOpen,
    onClose,
    post,
    user,
    comments,
    newComment,
    setNewComment,
    handleAddComment,
}) {
    const [likedComments, setLikedComments] = useState({});
    const [hiddenComments, setHiddenComments] = useState({});
    const [deletedComments, setDeletedComments] = useState({});

    const toggleLike = (id) => {
        setLikedComments((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const deleteComment = (id) => {
        setDeletedComments((prev) => ({
            ...prev,
            [id]: true,
        }));
    };

    const hideComment = (id) => {
        setHiddenComments((prev) => ({
            ...prev,
            [id]: true,
        }));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-zinc-950 bg-opacity-40 /90 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-5 py-6">
                <div className="bg-gradient-to-tr from-black to-zinc-800 text-cream-200 rounded-xl shadow-xl overflow-hidden w-full max-w-xl mx-auto p-2">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800">
                        <h3 className="text-xl font-semibold text-cream-200">
                            Post Details
                        </h3>
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="p-2 hover:bg-zinc-800 rounded-full"
                        >
                            <X className="w-5 h-5 text-cream-200" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-4 p-4">
                        {/* Post Content */}
                        <div className="bg-transparent p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar size="sm" src={user?.profilePicture} />
                                <span className="font-medium text-cream-200">
                                    {user.username}
                                </span>
                            </div>
                            <p className="text-sm text-cream-200">
                                {post.content}
                            </p>
                        </div>

                        {/* Image Section */}
                        {post.image && (
                            <div className="w-full rounded-lg overflow-hidden max-h-64">
                                <img
                                    src={post.image}
                                    alt="Expanded post content"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-cream-200">
                                Comments ({comments.length})
                            </h4>
                            <div className="flex flex-col space-y-3 max-h-40 overflow-y-auto">
                                {comments.map((comment) => {
                                    const isDeleted =
                                        deletedComments[comment._id];
                                    const isHidden =
                                        hiddenComments[comment._id];
                                    if (isDeleted || isHidden) return null;

                                    return (
                                        <div
                                            key={comment._id}
                                            className="flex gap-2 items-center bg-zinc-900 bg-opacity-50 rounded-lg p-2"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar
                                                    size="sm"
                                                    src={
                                                        comment.user
                                                            .profilePicture
                                                    }
                                                />
                                                <span className="text-xs font-medium text-cream-400">
                                                    <strong>
                                                        {comment.user.username}
                                                    </strong>
                                                </span>
                                            </div>

                                            <div className="flex-1 bg-transparent p-2 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-md cream-300 bg-zinc-800 bg-opacity-50 rounded-full w-auto p-2 flex items-center">
                                                            <span>
                                                                {comment.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-center relative">
                                                        <div className="flex gap-2 items-center">
                                                            <Heart
                                                                className={`w-4 h-4 cursor-pointer transition-colors ${
                                                                    likedComments[
                                                                        comment
                                                                            ._id
                                                                    ]
                                                                        ? "text-red-500"
                                                                        : "text-zinc-400 hover:text-red-500"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleLike(
                                                                        comment._id
                                                                    )
                                                                }
                                                            />

                                                            {String(
                                                                comment.user._id
                                                            ) ===
                                                            String(user._id) ? (
                                                                <Trash2
                                                                    className="w-4 h-4 cursor-pointer text-zinc-400 hover:text-red-500 transition-colors"
                                                                    onClick={() =>
                                                                        deleteComment(
                                                                            comment._id
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <EyeOff
                                                                    className="w-4 h-4 cursor-pointer text-zinc-400 hover:text-zinc-500 transition-colors"
                                                                    onClick={() =>
                                                                        hideComment(
                                                                            comment._id
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-zinc-400">
                                                            {timeAgo(
                                                                comment.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-cream-200">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Comment */}
                        <div className="border-t border-zinc-800 pt-3">
                            <div className="flex items-center gap-2">
                                <div className="w-full flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-cream-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                    />
                                </div>
                                <Button
                                    onPress={handleAddComment}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
                                >
                                    <Send className="w-4 h-4 text-cream-200" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
