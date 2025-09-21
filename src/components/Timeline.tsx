import { useState, useEffect } from "react";
import { Post } from "@/types";
import PostCard from "./PostCard";

export default function Timeline() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (pageNum = 1, append = false) => {
        try {
            const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            const newPosts = await res.json();
            if (append) setPosts(prev => [...prev, ...newPosts]);
            else setPosts(newPosts);
            setHasMore(newPosts.length === 10);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPosts(next, true);
    };

    const handlePostUpdate = (updatedPost: Post) => {
        setPosts(prev =>
            prev.map(post => (post.id === updatedPost.id ? updatedPost : post))
        );
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center font-instagram font-extrabold text-4xl">
                Explore Timeline
            </h2>
            {loading && <div className="text-center py-5">Loading posts...</div>}

            {!loading && posts.length === 0 && (
                <div className="text-center py-5">
                    <h3>No posts yet</h3>
                    <p>Be the first to share a moment!</p>
                </div>
            )}

            <div className="d-grid gap-4">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLikeChange={handlePostUpdate}
                    />
                ))}
            </div>

            {hasMore && !loading && (
                <div className="text-center mt-3">
                    <button className="btn btn-outline-secondary" onClick={loadMore}>
                        Load More Posts
                    </button>
                </div>
            )}
        </div>
    );
}
