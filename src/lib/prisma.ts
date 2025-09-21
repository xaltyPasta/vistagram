import { PrismaClient } from "@prisma/client";

declare global {
    // Prevent multiple instances in development
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
    global.prisma ||
    new PrismaClient({
        log: ["query", "info", "warn", "error"], // optional for debugging
    });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
