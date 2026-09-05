// backend/lib/prisma.js
// Prisma Client singleton — prevents multiple instances in development/serverless

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/** @type {PrismaClient} */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
