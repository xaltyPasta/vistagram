import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shortCode } = req.query as { shortCode: string };

  if (!shortCode) return res.redirect("/");

  try {
    const share = await prisma.share.findUnique({ where: { shortCode } });

    if (!share) return res.redirect("/");

    res.redirect(`/p/${share.postId}`);
  } catch (err) {
    console.error("Redirect error:", err);
    res.redirect("/");
  }
}
