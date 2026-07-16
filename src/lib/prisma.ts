import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env";
import "server-only";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Parse URL for the MariaDB adapter
const dbUrl = new URL(env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: adapter as any,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
