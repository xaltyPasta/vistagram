import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance.
 * Ensures a single client instance in development to prevent multiple connections.
 * Logs queries and errors for debugging.
 */

declare global {
    // Prevent multiple PrismaClient instances in development
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Create or reuse Prisma client
export const prisma: PrismaClient =
    global.prisma ||
    new PrismaClient({
        log: ["query", "info", "warn", "error"], // optional logging for debugging
    });

// Attach Prisma client to global in development to avoid hot-reload issues
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
