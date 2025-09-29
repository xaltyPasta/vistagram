export interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    emailVerified?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: string;
    userId?: string | null;
    imageUrl: string;
    caption?: string | null;
    createdAt: Date;
    like_count: number;
    share_count: number;
    user?: User | null;
    is_liked?: boolean;
    is_shared?: boolean;
}

export interface Like {
    id: string;
    userId?: string | null;
    postId?: string | null;
    createdAt: Date;
    like_count: number;
}

export interface Share {
    id: string;
    userId?: string | null;
    postId?: string | null;
    shortCode: string;
    createdAt: Date;
    shareCount: number;
}

export interface TimeLineProps {
    filter?: "popular"| "mine" | "default";
}
