import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

/**
 * Prisma Postgres hands out `prisma+postgres://` URLs, which are Accelerate
 * endpoints rather than a wire-protocol Postgres connection. A driver adapter
 * cannot open those, so the client is constructed with `accelerateUrl`
 * instead. Every other URL is a real Postgres server and goes through the
 * `pg` driver adapter.
 */
const ACCELERATE_URL_PREFIX = "prisma+postgres://";

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.startsWith(ACCELERATE_URL_PREFIX)) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

/**
 * `next dev` re-evaluates modules on every hot reload, so a module-local
 * instance would open a new connection pool per edit until the database
 * refused connections. The instance is cached on `globalThis`, which survives
 * a reload. Production builds evaluate the module once, so nothing is cached
 * there.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
