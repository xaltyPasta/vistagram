import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth API route for authentication.
 * Uses configured authOptions with Google provider and Prisma adapter.
 * Handles sign-in, session, and JWT callbacks.
 */
export default NextAuth(authOptions);
