import React, { useState, useEffect, useRef } from "react";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    EyeOff,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Avatar,
} from "@heroui/react";
import PostDetailsModal from "./postDetail";
import PostEditModal from "./postEditModal";
import { usePosts } from "../../hooks/usePosts";
import { useAuth } from "../../hooks/useAuth";

export default function PostCard({ post }) {
    const { user } = useAuth();
    const { reactToPost, commentOnPost, deletePost, toggleHidePost } =
        usePosts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const likeCount = post.reactions.filter((r) => r.emoji === "❤️").length;
    const commentCount = comments.length;

    const handleLike = () => reactToPost(post._id || post.id, "❤️");
    const handleAddComment = async () => {
        if (!newComment.trim())
            return setCommentError("Comment cannot be empty.");
        setCommentError(null);
        const tempComment = {
            _id: `temp-${comments.length + 1}`,
            text: newComment,
            user: {
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
            },
            createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, tempComment]);
        setNewComment("");
        const res = await commentOnPost(post._id || post.id, newComment);
        if (res.status === 200 && res.data) setComments(res.data.comments);
        else {
            setComments((prev) =>
                prev.filter((c) => c._id !== tempComment._id)
            );
            setCommentError(res.data?.message || "Failed to post comment.");
        }
    };

    const handleShareClick = () => {
        navigator.clipboard
            .writeText(`${window.location.href}posts/${post._id}`)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(console.error);
    };

    const [editModalOpen, setEditModalOpen] = useState(false);
    const handleEditClick = () => {
        setIsMenuOpen(false);
        setEditModalOpen(true);
    };
    const handleToggleHide = async () => {
        await toggleHidePost(post._id, !post.hidden);
        setIsMenuOpen(false);
    };

    if (!post) return null;

    return (
        <>
            <Card className="bg-transparent text-cream-200 border border-zinc-800 shadow-md-4 w-full max-w-2xl mx-auto p-4 mt-5 mb-5">
                <CardHeader className="flex justify-between items-start gap-3 relative">
                    <div className="flex gap-3">
                        <Avatar
                            color="primary"
                            size="md"
                            src={post.user?.profilePicture}
                        />
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">
                                {post.user.username}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {new Date(post.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        </div>
                    </div>

                    {user && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen((p) => !p)}
                                className="text-zinc-400 hover:text-cream-200 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-zinc-800 text-cream-200 rounded-lg shadow-lg py-1 z-50 border border-zinc-700">
                                    {post.user &&
                                        user._id === post.user._id && (
                                            <>
                                                <button
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-zinc-700 transition"
                                                    onClick={handleEditClick}
                                                >
                                                    <Edit className="w-4 h-4" />{" "}
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-zinc-700 transition"
                                                    onClick={handleToggleHide}
                                                >
                                                    {post.hidden ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                    {post.hidden
                                                        ? " Unhide"
                                                        : " Hide"}
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-zinc-700 text-red-400 hover:text-red-300 transition"
                                                    onClick={() => {
                                                        deletePost(post._id);
                                                        setIsMenuOpen(false);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />{" "}
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    {post.user &&
                                        user._id !== post.user._id && (
                                            <>
                                                <button
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-zinc-700 transition"
                                                    onClick={handleToggleHide}
                                                >
                                                    {post.hidden ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                    {post.hidden
                                                        ? " Unhide"
                                                        : " Hide"}
                                                </button>
                                            </>
                                        )}
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>

                <Divider />

                <CardBody className="space-y-4">
                    {!post.hidden ? (
                        <p>{post.content}</p>
                    ) : (
                        <p className="text-center text-gray-500 italic">
                            This post is hidden.
                        </p>
                    )}
                    {post.image && !post.hidden && (
                        <div
                            className="relative w-full h-80 rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img
                                src={post.image}
                                alt="Post content"
                                className="w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </CardBody>

                <Divider />

                <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 transition-colors ${
                                likeCount > 0
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                            }`}
                        >
                            <Heart className="w-5 h-5" />{" "}
                            <span className="text-sm font-medium">
                                {likeCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={`flex items-center gap-1 transition-colors ${
                                commentCount > 0
                                    ? "text-blue-500"
                                    : "text-gray-400 hover:text-blue-400"
                            }`}
                        >
                            <MessageCircle className="w-5 h-5" />{" "}
                            <span className="text-sm">{commentCount}</span>
                        </button>
                        <button
                            className="flex items-center gap-1 text-gray-400 hover:text-green-600 transition-colors"
                            onClick={handleShareClick}
                        >
                            <Share2 className="w-5 h-5" />{" "}
                            <span className="text-sm">
                                {copied ? "Copied!" : "Share"}
                            </span>
                        </button>
                    </div>
                    <small className="text-sm text-zinc-500 hover:text-cream-300 cursor-pointer transition-all">
                        {new Date(post.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </small>
                </CardFooter>
            </Card>

            <PostDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={post}
                user={user}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                commentError={commentError}
            />
            <PostEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                post={post}
                user={user}
            />
        </>
    );
}
