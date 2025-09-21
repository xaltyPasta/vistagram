import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: { signIn: "/" },
    callbacks: {
        async signIn({ user, account }) {
            if (!user?.email) return false;

            // Check if user exists using Prisma schema naming
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            return !!existingUser || true; // Allow sign in, Prisma adapter will create user if not exists
        },
        async jwt({ token, user }) {
            if (user) token.userId = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            console.log("New user created:", user.email);
        },
    },
    debug: true,
};
