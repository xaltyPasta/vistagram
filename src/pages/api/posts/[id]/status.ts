import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API Route: /api/posts/[id]/status
 * Returns the current status of a post:
 *  - like_count: total number of likes
 *  - share_count: total number of shares
 *  - is_liked: whether the authenticated user has liked the post
 * Method: GET
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get authenticated user session
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    const { id: postId } = req.query as { id: string };

    try {
        // Fetch post by ID
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Determine if user has liked the post
        let is_liked = false;
        if (userId) {
            const like = await prisma.like.findUnique({
                where: { userId_postId: { userId, postId } },
            });
            is_liked = !!like;
        }

        // Return like count, share count, and user like status
        res.status(200).json({
            like_count: post.like_count,
            share_count: post.share_count,
            is_liked,
        });
    } catch (err) {
        console.error("Error fetching post status:", err);
        res.status(500).json({ error: "Failed to fetch post status" });
    }
}
