import { GetServerSideProps } from "next";
import Head from "next/head";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { Post } from "@/types";

interface Props {
  /** The post object fetched from the database, or null if not found */
  post: Post | null;
}

/**
 * PostPage Component
 *
 * Renders a single post using PostCard. Includes dynamic page title based on user's name
 * and a default favicon.
 *
 * @param post - Post object or null if not found
 * @returns JSX.Element
 */
export default function PostPage({ post }: Props) {
  if (!post) return <p className="text-center mt-5">Post not found</p>;

  const pageTitle = post.user?.name
    ? `${post.user.name}'s Post`
    : "User's Post";

  return (
    <>
      <Head>
        {/* Page title dynamically includes user's name if available */}
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Check out this post on Vistagram"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Default favicon */}
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="container my-5">
        <PostCard post={post} />
      </div>
    </>
  );
}

/**
 * Server-side data fetching for PostPage
 *
 * Retrieves the post by ID from Prisma database, including the user who created it.
 * Returns post props to the page.
 *
 * @param context - Next.js context containing route params
 * @returns props: { post: Post | null }
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: true }, // include user info
    });

    if (!post) return { props: { post: null } };

    // Format post data for client
    return {
      props: {
        post: {
          id: post.id,
          caption: post.caption,
          imageUrl: post.imageUrl,
          like_count: post.like_count,
          share_count: post.share_count,
          createdAt: post.createdAt.toISOString(),
          user: post.user
            ? {
              id: post.user.id,
              name: post.user.name,
              email: post.user.email,
              image: post.user.image,
            }
            : null,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { props: { post: null } }; // fallback on error
  }
};
