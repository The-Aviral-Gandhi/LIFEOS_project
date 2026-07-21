import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimit";
import { passport, configurePassport } from "./config/passport";

import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/tasks.routes";
import goalRoutes from "./modules/goals/goals.routes";
import habitRoutes from "./modules/habits/habits.routes";
import financeRoutes from "./modules/finance/finance.routes";
import healthRoutes from "./modules/health/health.routes";
import journalRoutes from "./modules/journal/journal.routes";
import projectRoutes from "./modules/projects/projects.routes";
import aiRoutes from "./modules/ai/ai.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));
  app.use(generalLimiter);

  configurePassport();
  app.use(passport.initialize());

  app.get("/health", (_req, res) => res.json({ success: true, status: "ok", uptime: process.uptime() }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const v1 = express.Router();
  v1.use("/auth", authRoutes);
  v1.use("/tasks", taskRoutes);
  v1.use("/goals", goalRoutes);
  v1.use("/habits", habitRoutes);
  v1.use("/finance", financeRoutes);
  v1.use("/health", healthRoutes);
  v1.use("/journal", journalRoutes);
  v1.use("/projects", projectRoutes);
  v1.use("/ai", aiRoutes);

  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
