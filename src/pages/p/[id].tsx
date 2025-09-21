import { useRouter } from "next/router";
import PostCard from "@/components/PostCard";
import { useEffect, useState } from "react";
import { Post } from "@/types";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!post) return <p className="text-center mt-5">Post not found</p>;

  return (
    <div className="container my-5">
      <PostCard post={post} />
    </div>
  );
}
