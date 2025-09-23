import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API Route: /api/posts/[id]/share
 * Handles sharing a post for the authenticated user.
 * Generates a unique short code and increments post's share count.
 * Method: POST
 */

/** Generate a random alphanumeric short code */
function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get session and authenticated user
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  const { id: postId } = req.query as { id: string };

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Check if user already shared this post
    const existingShare = await prisma.share.findUnique({
      where: { userId_postId: { userId, postId } }, // requires composite unique key
    });

    if (existingShare) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      return res.status(200).json({
        share_count: post?.share_count || 0,
        is_shared: true,
        shortCode: existingShare.shortCode,
      });
    }

    // Generate a unique short code with retries
    let shortCode = generateShortCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.share.findUnique({ where: { shortCode } });
      if (!existing) break;
      shortCode = generateShortCode();
      attempts++;
    }
    if (attempts === 10) return res.status(500).json({ error: "Failed to generate unique share code" });

    // Create share and increment post share_count atomically
    const updatedPost = await prisma.$transaction(async (tx) => {
      await tx.share.create({ data: { userId, postId, shortCode } });
      const post = await tx.post.update({
        where: { id: postId },
        data: { share_count: { increment: 1 } },
      });
      return post;
    });

    res.status(200).json({
      share_count: updatedPost.share_count,
      is_shared: true,
      shortCode,
    });
  } catch (error) {
    console.error("Error creating share:", error);
    res.status(500).json({ error: "Failed to create share" });
  }
}
