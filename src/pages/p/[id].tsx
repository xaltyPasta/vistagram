import { GetServerSideProps } from "next";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { Post } from "@/types";

interface Props {
  post: Post | null;
}

export default function PostPage({ post }: Props) {
  if (!post) return <p className="text-center mt-5">Post not found</p>;

  return (
    <div className="container my-5">
      <PostCard post={post} />
    </div>
  );
}

// Add proper type for context
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    return { props: { post: null } };
  }

  return {
    props: {
      post: {
        id: post.id,
        caption: post.caption,
        imageUrl:post.imageUrl,
        like_count: post.like_count,
        share_count: post.share_count,
        createdAt: post.createdAt.toISOString(),
      },
    },
  };
}
