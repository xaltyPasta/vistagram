import { authOptions } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, authOptions);
    const { type } = req.query as { type?: string };

    let posts;


    if (type === "popular") {
        posts = await prisma.post.findMany({
            orderBy: { like_count: "desc" },
            include: {
                user: true
            },
        })
    } else if (type === "mine") {
        if (!session?.user?.id) return res.status(401).json({
            error: "Unauthorized"
        });

        posts = await prisma.post.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: true
            },
        })



    }

    return res.status(200).json(posts);
}