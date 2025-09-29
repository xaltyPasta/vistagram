import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, image, bio } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Name is required" });
    }

    if (bio && bio.length > 150) {
        return res.status(400).json({ error: "Bio cannot exceed 150 characters" });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                image,
                bio,
            },
        });

        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Profile update failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
