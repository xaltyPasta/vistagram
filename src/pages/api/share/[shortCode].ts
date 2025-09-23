import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API Route: /api/share/[shortCode]
 * Redirects a short share link to the corresponding post page
 *
 * Query Params:
 *  - shortCode: string (required) – the unique share code for a post
 *
 * Behavior:
 *  - If shortCode is invalid or not found, redirects to home page "/"
 *  - Otherwise, redirects to the post page "/p/[postId]"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shortCode } = req.query as { shortCode: string };

  if (!shortCode) {
    // Redirect to home if no shortCode provided
    return res.redirect("/");
  }

  try {
    // Look up share by shortCode
    const share = await prisma.share.findUnique({ where: { shortCode } });

    if (!share) {
      // Redirect to home if share not found
      return res.redirect("/");
    }

    // Redirect to the post page corresponding to the share
    res.redirect(`/p/${share.postId}`);
  } catch (err) {
    console.error("Redirect error:", err);
    res.redirect("/"); // Fallback to home on error
  }
}
