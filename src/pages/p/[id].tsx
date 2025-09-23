import { GetServerSideProps } from "next";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { Post } from "@/types";

interface Props {
  post: Post | null;
}

/**
 * PostPage Component
 * Renders a single post using the PostCard component
 *
 * Props:
 *  - post: Post object or null if not found
 *
 * Behavior:
 *  - If post is null, shows "Post not found" message
 *  - Otherwise, renders PostCard with post data
 */
export default function PostPage({ post }: Props) {
  if (!post) return <p className="text-center mt-5">Post not found</p>;

  return (
    <div className="container my-5">
      <PostCard post={post} />
    </div>
  );
}

/**
 * Server-side data fetching for PostPage
 *
 * Retrieves the post by ID from Prisma database.
 * Returns post props to the page.
 *
 * @param context - Next.js context containing route params
 * @returns props: { post: Post | null }
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      // Return null if post not found
      return { props: { post: null } };
    }

    // Format post data for client
    return {
      props: {
        post: {
          id: post.id,
          caption: post.caption,
          imageUrl: post.imageUrl,
          like_count: post.like_count,
          share_count: post.share_count,
          createdAt: post.createdAt.toISOString(), // serialize date
        },
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { props: { post: null } }; // fallback on error
  }
};
