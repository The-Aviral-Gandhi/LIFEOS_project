import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { initSocket } from "./socket";

async function main() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(Number(env.PORT), () => {
    logger.info(`🚀 LifeOS backend listening on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
    logger.info(`🔌 Socket.IO ready on the same port`);
  });

  initSocket(server);

  const shutdown = async () => {
    logger.info("Shutting down gracefully...");
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});
