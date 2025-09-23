import Image from "next/image";
import { useState, useEffect } from "react";
import { Post } from "@/types";
import { FaShare } from "react-icons/fa";
import { motion } from "framer-motion";

interface PostCardProps {
    /** Post data to display */
    post: Post;
    /** Optional callback when post like/share state changes */
    onLikeChange?: (updatedPost: Post) => void;
}

/**
 * PostCard component renders a single post with image, caption, likes, and share functionality.
 * Handles fetching latest post status, like/unlike, and share actions.
 *
 * @param post Post object containing user, image, likes, shares, caption, and timestamps
 * @param onLikeChange Callback invoked when post status changes
 */
export default function PostCard({ post, onLikeChange }: PostCardProps) {
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [shareCount, setShareCount] = useState(post.share_count);
    const [isLiked, setIsLiked] = useState(post.is_liked);

    // Fetch latest post status on mount
    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const res = await fetch(`/api/posts/${post.id}/status`);
                if (!res.ok) throw new Error("Failed to fetch post status");
                const data = await res.json();
                setLikeCount(data.like_count);
                setShareCount(data.share_count);
                setIsLiked(data.is_liked);
                if (onLikeChange) onLikeChange({ ...post, ...data });
            } catch (err) {
                console.error("Error fetching post data:", err);
            }
        };
        fetchPostData();
    }, [post.id]);

    /** Handles liking/unliking the post */
    const handleLike = async () => {
        try {
            const method = isLiked ? "DELETE" : "POST";
            setIsLiked(!isLiked);
            setLikeCount(prev => (isLiked ? Math.max(prev - 1, 0) : prev + 1));

            const res = await fetch(`/api/posts/${post.id}/like`, { method });
            if (!res.ok) throw new Error("Failed to update like");
            const data = await res.json();
            setLikeCount(data.like_count);
            setIsLiked(data.is_liked);
            if (onLikeChange) onLikeChange({ ...post, ...data });
        } catch (err) {
            console.error("Error liking/unliking post:", err);
            // Revert optimistic UI
            setIsLiked(isLiked);
            setLikeCount(prev => (isLiked ? prev + 1 : Math.max(prev - 1, 0)));
        }
    };

    /** Handles sharing the post and copying share link */
    const handleShare = async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}/share`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to share post");

            const data = await res.json();
            setShareCount(data.share_count);

            if (data.shortCode) {
                const shareLink = `${window.location.origin}/api/share/${data.shortCode}`;
                navigator.clipboard.writeText(shareLink);
                alert(`Share link copied to clipboard:\n${shareLink}`);
            }

            if (onLikeChange) onLikeChange({ ...post, share_count: data.share_count });
        } catch (err) {
            console.error("Error sharing post:", err);
        }
    };

    /** Formats date and time in a readable format */
    const formatDate = (dateInput: string | Date) => {
        const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        const day = date.getDate();
        const daySuffix =
            day % 10 === 1 && day !== 11
                ? "st"
                : day % 10 === 2 && day !== 12
                    ? "nd"
                    : day % 10 === 3 && day !== 13
                        ? "rd"
                        : "th";
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = date.getHours() >= 12 ? "PM" : "AM";
        return { date: `${day}${daySuffix} ${month} ${year}`, time: `${hours}:${minutes} ${ampm}` };
    };

    const { date, time } = formatDate(post.createdAt);

    return (
        <div
            className="card mb-4 border-0 shadow-lg position-relative"
            style={{ borderRadius: "15px", width: "100%", maxWidth: "500px", margin: "auto" }}
        >
            {/* Post Header with user info and Share button */}
            <div className="d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center">
                    {post.user?.image && (
                        <Image
                            src={post.user.image}
                            alt={post.user.name || "User"}
                            width={50}
                            height={50}
                            className="rounded-circle me-3"
                        />
                    )}
                    <div className="d-flex flex-column">
                        <strong>{post.user?.name || post.user?.email}</strong>
                        <small className="text-muted">{date} at {time}</small>
                    </div>
                </div>

                {/* Share button with Framer Motion animation */}
                <motion.button
                    onClick={handleShare}
                    className="btn d-flex align-items-center p-2"
                    style={{
                        fontSize: "1.2rem",
                        backgroundColor: "transparent",
                        color: shareCount > 0 ? "#1DA1F2" : "#000",
                        border: "2px solid #1DA1F2",
                        borderRadius: "50px",
                        cursor: "pointer",
                        outline: "none",
                    }}
                    whileTap={{ scale: 1.3 }}
                    animate={{
                        backgroundColor: shareCount > 0 ? "#1DA1F2" : "transparent",
                        color: shareCount > 0 ? "white" : "#000",
                    }}
                >
                    <FaShare className="me-2" size={20} />
                    {shareCount}
                </motion.button>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
                <div className="position-relative" style={{ width: "100%", paddingTop: "100%" }}>
                    <Image src={post.imageUrl} alt="Post image" fill className="object-fit-cover rounded" />
                </div>
            )}

            {/* Post Actions: Like button and caption */}
            <div className="d-flex flex-column align-items-center px-3 py-3">
                <motion.button
                    onClick={handleLike}
                    className="btn p-0 d-flex align-items-center justify-content-center"
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "2rem" }}
                    whileTap={{ scale: 1.4 }}
                    animate={{ scale: isLiked ? 1.3 : 1 }}
                >
                    <motion.span
                        style={{ color: isLiked ? "#e0245e" : "#222" }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.3 }}
                    >
                        ❤️
                    </motion.span>
                    <span className="ms-2 fw-bold" style={{ fontSize: "1.2rem" }}>{likeCount}</span>
                </motion.button>

                {post.caption && (
                    <p
                        className="mt-2 mb-0 text-center"
                        style={{ fontWeight: 700, lineHeight: 1.4, fontSize: "1.2rem", color: "#222" }}
                    >
                        {post.caption}
                    </p>
                )}
            </div>
        </div>
    );
}
