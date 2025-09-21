import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    const { id: postId } = req.query as { id: string };

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Likes: user-specific
        let is_liked = false;
        if (userId) {
            const like = await prisma.like.findUnique({
                where: { userId_postId: { userId, postId } },
            });
            is_liked = !!like;
        }

        // Shares: total count only, not user-specific
        const share_count = post.share_count;

        res.status(200).json({
            like_count: post.like_count,
            share_count,
            is_liked,
        });
    } catch (err) {
        console.error("Error fetching post status:", err);
        res.status(500).json({ error: "Failed to fetch post status" });
    }
}
