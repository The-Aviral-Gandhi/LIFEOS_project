import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../config/logger";

let io: SocketIOServer | null = null;

interface AuthedSocket extends Socket {
  userId?: string;
}

export function initSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same JWT access token the REST API uses.
  io.use((socket: AuthedSocket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers.authorization?.toString().replace("Bearer ", ""));

    if (!token) return next(new Error("Unauthorized: no token provided"));

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    if (!socket.userId) return socket.disconnect(true);

    // Each user gets a private room so events only reach their own devices.
    socket.join(`user:${socket.userId}`);
    logger.debug(`Socket connected: user ${socket.userId} (${socket.id})`);

    socket.on("disconnect", () => {
      logger.debug(`Socket disconnected: user ${socket.userId} (${socket.id})`);
    });
  });

  return io;
}

/** Emits a real-time event to all of a user's connected devices. Safe no-op if sockets aren't initialized. */
export function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function getIO() {
  return io;
}
