import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shortCode } = req.query;

  try {
    const result = await pool.query(
      "SELECT post_id FROM shares WHERE short_code = $1",
      [shortCode]
    );

    if (result.rows.length === 0) return res.redirect("/");

    const postId = result.rows[0].post_id;
    // ✅ Redirect to single post page
    res.redirect(`/p/${postId}`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
}
