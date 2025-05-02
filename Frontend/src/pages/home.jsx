import React, { useRef, useEffect, useCallback } from "react";
import Aside from "../components/aside";
import PostForm from "../components/posts/postForm";
import SearchAside from "../components/search/searchAside";
import PostCard from "../components/posts/postCard";
import { useAuth } from "../hooks/useAuth";
import { usePosts } from "../hooks/usePosts";
import { Spinner } from "@heroui/react";

export default function Home() {
    const { user } = useAuth();
    const { posts, isLoading, loadMorePosts } = usePosts();
    const loadMoreRef = useRef();

    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && !isLoading) {
                loadMorePosts();
            }
        },
        [isLoading, loadMorePosts]
    );

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 1.0,
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => {
            if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
        };
    }, [handleObserver]);

    if (!user || (isLoading && posts.length === 0)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                />
            </div>
        );
    }

    return (
        <div className="flex justify-between z-50">
            <div className="w-1/4">
                <Aside />
            </div>
            <main className="w-1/2 min-h-screen flex flex-col items-center">
                <PostForm />
                {posts.length === 0 && !isLoading && (
                    <div className="text-gray-500 text-lg font-semibold mt-10">
                        No posts available. Follow some users to see their
                        posts.
                    </div>
                )}
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} user={user} />
                ))}
                <div ref={loadMoreRef} className="h-10" />
                {isLoading && (
                    <div className="mt-4">
                        <Spinner
                            classNames={{ label: "text-foreground" }}
                            variant="wave"
                        />
                    </div>
                )}
            </main>
            <SearchAside />
        </div>
    );
}
