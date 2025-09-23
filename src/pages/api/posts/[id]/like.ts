import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API Route: /api/posts/[id]/like
 * Handles liking and unliking a post for the authenticated user.
 * Supports POST to like and DELETE to unlike.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get session and authenticated user
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  const { id: postId } = req.query as { id: string };

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Check if user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    // Like the post
    if (req.method === "POST") {
      if (existingLike) return res.status(400).json({ error: "Post already liked" });

      const [_, post] = await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        prisma.post.update({
          where: { id: postId },
          data: { like_count: { increment: 1 } },
        }),
      ]);

      return res.status(200).json({ like_count: post.like_count, is_liked: true });
    }

    // Unlike the post
    if (req.method === "DELETE") {
      if (!existingLike) return res.status(400).json({ error: "Post not liked yet" });

      const [_, post] = await prisma.$transaction([
        prisma.like.delete({ where: { userId_postId: { userId, postId } } }),
        prisma.post.update({
          where: { id: postId },
          data: { like_count: { decrement: 1 } },
        }),
      ]);

      return res.status(200).json({ like_count: post.like_count, is_liked: false });
    }

    // Method not allowed
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update like" });
  }
}
