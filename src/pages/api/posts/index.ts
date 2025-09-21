import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Post } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { page = "1", limit = "10" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const session = await getServerSession(req, res, authOptions);
      const userId = session?.user?.id;

      const posts = await prisma.post.findMany({
        take: limitNum,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          likes: userId ? { where: { userId } } : undefined,
        },
      });

      const formattedPosts = posts.map((post: Post) => ({
        id: post.id,
        userId: post.userId ?? null,
        imageUrl: post.imageUrl,
        caption: post.caption ?? null,
        createdAt: post.createdAt,
        like_count: post.like_count || 0,
        share_count: post.share_count || 0,
        is_liked: post.is_liked ?? false,
        is_shared: post.is_shared ?? false, // optional, if you want
        user: post.user
          ? {
            id: post.user.id,
            name: post.user.name,
            email: post.user.email,
            image: post.user.image,
          }
          : null, // keep null instead of undefined to match Post type
      }));

      res.status(200).json(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  } else if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { imageUrl, caption } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const post = await prisma.post.create({
        data: {
          userId: session.user.id,
          imageUrl: imageUrl,
          caption,
        },
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
