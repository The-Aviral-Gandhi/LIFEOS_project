import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

// @ts-expect-error - prisma event typing
prisma.$on("error", (e) => logger.error(e, "Prisma error"));
// @ts-expect-error - prisma event typing
prisma.$on("warn", (e) => logger.warn(e, "Prisma warning"));

export async function connectDatabase() {
  await prisma.$connect();
  logger.info("✅ Database connected");
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
