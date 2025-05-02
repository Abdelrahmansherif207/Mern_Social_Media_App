import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRef } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Context
const PostContext = createContext();

// auth Provider Component
const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();

    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    // Fetch posts data when token changes

    const [_, forceRender] = useState(0);

    const fetchPosts = useCallback(
        async (pageToLoad = 1) => {
            if (!token || !user) {
                setPosts([]);
                return;
            }

            try {
                setIsLoading(true);

                const response = await fetch(
                    `${BASE_URL}/posts/feed?page=${pageToLoad}&limit=5`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch posts");
                }

                if (!data.success || !data.data) {
                    throw new Error("Invalid posts data format");
                }

                if (pageToLoad === 1) {
                    setPosts(data.data);
                } else {
                    setPosts((prev) => [...prev, ...data.data]);
                }

                if (data.data.length < 5) {
                    hasMoreRef.current = false;
                }

                setError(null);
                forceRender((prev) => prev + 1); // to update consumers
                return data.data;
            } catch (err) {
                console.error("Failed to fetch posts", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        },
        [token, user]
    );

    useEffect(() => {
        pageRef.current = 1;
        hasMoreRef.current = true;
        fetchPosts(1);
    }, [fetchPosts]);

    const loadMorePosts = () => {
        if (!hasMoreRef.current || isLoading) return;
        pageRef.current += 1;
        fetchPosts(pageRef.current);
    };

    const createPost = async (postData) => {
        if (!token) {
            setError("No token provided");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to create post");
            }

            setPosts((prevPosts) => [data, ...prevPosts]);
            console.log("Post created successfully:", data);
            setError(null);
            setIsLoading(false);

            return {
                status: response.status,
                data: data,
            };
        } catch (err) {
            console.error("Failed to create post", err);
            setError(err.message);
        }
    };

    const deletePost = async (postId) => {
        if (!token) {
            setError("No token provided");
            return;
        }
        let previousPosts = [];
        setPosts((current) => {
            previousPosts = current;
            return current.filter((post) => post._id !== postId);
        });
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to delete post");
            setPosts((current) =>
                current.filter((post) => post._id !== postId)
            );
            return { status: res.status, data };
        } catch (err) {
            console.error("Delete error", err);
            setError(err.message);
            setPosts(previousPosts);
            return { status: err.status || 500, data: null };
        } finally {
            setIsLoading(false);
        }
    };

    const updatePost = async (postId, postData) => {
        if (!token) {
            setError("No token provided");
            return;
        }
        let previousPosts = [];
        setPosts((current) => {
            previousPosts = current;
            return current.map((post) => {
                if (post._id !== postId && post.id !== postId) return post;
                return {
                    ...post,
                    ...postData,
                };
            });
        });
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to update post");
            setPosts((current) =>
                current.map((post) =>
                    post._id === postId || post.id === postId
                        ? { ...post, ...data }
                        : post
                )
            );
            return { status: res.status, data };
        } catch (err) {
            console.error("Update error", err);
            setError(err.message);
            setPosts(previousPosts);
            return { status: err.status || 500, data: null };
        } finally {
            setIsLoading(false);
        }
    };

    const reactToPost = async (postId, emoji) => {
        if (!token) {
            setError("No token provided");
            return;
        }
        let previousPosts = [];
        setPosts((current) => {
            previousPosts = current;
            return current.map((post) => {
                if (post._id !== postId && post.id !== postId) return post;
                const hasSame = post.reactions.some(
                    (r) => r.user._id === user._id && r.emoji === emoji
                );
                const withoutUser = post.reactions.filter(
                    (r) => r.user._id !== user._id
                );
                return {
                    ...post,
                    reactions: hasSame
                        ? withoutUser
                        : [
                              ...withoutUser,
                              {
                                  emoji,
                                  user: {
                                      _id: user._id,
                                      username: user.username,
                                  },
                              },
                          ],
                };
            });
        });
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/posts/${postId}/react`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ emoji }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to react");
            setPosts((current) =>
                current.map((post) =>
                    post._id === postId || post.id === postId
                        ? { ...post, reactions: data.reactions }
                        : post
                )
            );
            return { status: res.status, data };
        } catch (err) {
            console.error("React error", err);
            setError(err.message);
            setPosts(previousPosts);
            return { status: err.status || 500, data: null };
        } finally {
            setIsLoading(false);
        }
    };

    const commentOnPost = async (postId, comment) => {
        if (!token) {
            setError("No token provided");
            return;
        }
        let previousPosts = [];
        setPosts((current) => {
            previousPosts = current;
            return current.map((post) => {
                if (post._id !== postId && post.id !== postId) return post;
                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        {
                            user: { _id: user._id, username: user.username },
                            content: comment,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                };
            });
        });
        setError(null);
        setIsLoading(true);
        try {
            console.log("Commenting on post", postId, comment);
            const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: comment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to comment");
            setPosts((current) =>
                current.map((post) =>
                    post._id === postId || post.id === postId
                        ? { ...post, comments: data.comments }
                        : post
                )
            );
            return { status: res.status, data };
        } catch (err) {
            console.error("Comment error", err);
            setError(err.message);
            setPosts(previousPosts);
            return { status: err.status || 500, data: null };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteComment = async (postId, commentId) => {
        if (!token) {
            setError("No Token Provided!");
        }

        let previousPosts = [];
        setPosts((curr) => {
            previousPosts = curr;
            return curr.map((post) => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [
                            post.comments.filter((c) => c._id !== commentId),
                        ],
                    };
                }
            });
        });

        try {
            setError(null);
            setIsLoading(true);
            const response = await fetch(
                `${BASE_URL}/posts/${postId}/comments/${commentId}`
            );
            const data = await response.json();
            if (!response.ok) {
                console.log("Error fetching api", data.message);
            }
            setPosts((curr) => {
                return curr.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: [
                                post.comments.filter(
                                    (c) => c._id !== commentId
                                ),
                            ],
                        };
                    }
                });
            });
        } catch (err) {
            setError(err.message);
            setPosts(previousPosts);
        } finally {
            //
            setIsLoading(true);
        }
    };
    return (
        <PostContext.Provider
            value={{
                posts,
                isLoading,
                error,
                createPost,
                deletePost,
                updatePost,
                reactToPost,
                commentOnPost,
                deleteComment,
                loadMorePosts,
            }}
        >
            {children}
        </PostContext.Provider>
    );
};

export { PostContext, PostProvider };
