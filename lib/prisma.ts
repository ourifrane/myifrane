import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient();
}

// Prevents multiple Prisma instances during Next.js hot-reload in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
