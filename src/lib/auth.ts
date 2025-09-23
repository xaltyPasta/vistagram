import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

/**
 * NextAuth configuration for Vistagram authentication.
 * Uses Google OAuth provider and Prisma adapter for database integration.
 */
export const authOptions: NextAuthOptions = {
    // Authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    // Prisma adapter for storing user data
    adapter: PrismaAdapter(prisma),

    // Use JWT strategy for session
    session: { strategy: "jwt" },

    // Custom sign-in page
    pages: { signIn: "/" },

    // Callbacks for controlling authentication flow
    callbacks: {
        /**
         * Sign-in callback: allows only users with email.
         * Prisma adapter auto-creates user if not already exists.
         */
        async signIn({ user }) {
            if (!user?.email) return false;

            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            return !!existingUser || true;
        },

        /**
         * JWT callback: attach user ID to token
         */
        async jwt({ token, user }) {
            if (user) token.userId = user.id;
            return token;
        },

        /**
         * Session callback: attach user ID from token to session
         */
        async session({ session, token }) {
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            return session;
        },
    },

    // Event listeners
    events: {
        /** Log newly created users */
        async createUser({ user }) {
            console.log("New user created:", user.email);
        },
    },

    // Enable debug mode in development
    debug: true,
};
