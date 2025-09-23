import { useState, useEffect } from "react";
import { Post } from "@/types";
import PostCard from "./PostCard";

/**
 * Timeline component fetches and displays a paginated list of posts.
 * Handles loading state, infinite scrolling via "Load More", and post updates.
 */
export default function Timeline() {
    const [posts, setPosts] = useState<Post[]>([]); // List of posts
    const [loading, setLoading] = useState(true); // Loading state
    const [page, setPage] = useState(1); // Current page for pagination
    const [hasMore, setHasMore] = useState(true); // Flag for more posts

    /**
     * Fetch posts from API
     * @param pageNum Page number to fetch (default: 1)
     * @param append Whether to append posts to existing list (default: false)
     */
    const fetchPosts = async (pageNum = 1, append = false) => {
        try {
            const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            const newPosts = await res.json();
            if (append) setPosts(prev => [...prev, ...newPosts]);
            else setPosts(newPosts);
            setHasMore(newPosts.length === 10); // Check if more posts available
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    /** Load next page of posts */
    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPosts(next, true);
    };

    /** Update a post when its state changes (like/share) */
    const handlePostUpdate = (updatedPost: Post) => {
        setPosts(prev =>
            prev.map(post => (post.id === updatedPost.id ? updatedPost : post))
        );
    };

    return (
        <div className="container py-5">
            {/* Section Title */}
            <h2 className="mb-4 text-center font-instagram font-extrabold text-4xl">
                Explore Timeline
            </h2>

            {/* Loading State */}
            {loading && <div className="text-center py-5">Loading posts...</div>}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
                <div className="text-center py-5">
                    <h3>No posts yet</h3>
                    <p>Be the first to share a moment!</p>
                </div>
            )}

            {/* Posts Grid */}
            <div className="d-grid gap-4">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLikeChange={handlePostUpdate}
                    />
                ))}
            </div>

            {/* Load More Button */}
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
