// /lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declaration
  // so TypeScript doesn't complain
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances in dev mode (Next.js hot reload)
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Optional, remove if you want
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
