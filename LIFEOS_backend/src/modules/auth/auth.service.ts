import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken, generateRefreshTokenValue } from "../../utils/jwt";
import { env } from "../../config/env";
import { sendMail } from "../../utils/mailer";

function toPublicUser(u: {
  id: string; name: string; email: string; avatar: string | null; level: number;
  xp: number; maxXp: number; rank: string; streak: number; createdAt: Date;
  timezone: string; theme: string; notifications: boolean; isEmailVerified: boolean;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? "",
    level: u.level,
    xp: u.xp,
    maxXp: u.maxXp,
    rank: u.rank,
    streak: u.streak,
    joinDate: u.createdAt.toISOString(),
    timezone: u.timezone,
    theme: u.theme,
    notifications: u.notifications,
    isEmailVerified: u.isEmailVerified,
  };
}

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshTokenValue = generateRefreshTokenValue();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(env.JWT_REFRESH_EXPIRES_IN_DAYS));

  await prisma.refreshToken.create({
    data: { token: refreshTokenValue, userId, expiresAt },
  });

  return { accessToken, refreshToken: refreshTokenValue };
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export const AuthService = {
  async register(input: { name: string; email: string; password: string; timezone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const emailVerifyToken = randomToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        timezone: input.timezone ?? "UTC",
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    await sendMail(user.email, "Verify your LifeOS account", `<p>Click to verify: <a href="${verifyLink}">${verifyLink}</a></p>`);

    return toPublicUser(user);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (!user || !user.passwordHash) throw ApiError.unauthorized("Invalid email or password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    const tokens = await issueTokens(user.id, user.email);
    return { user: toPublicUser(user), ...tokens };
  },

  /** Called after a successful Google OAuth handshake (user already resolved by passport). */
  async loginWithOAuthUser(user: { id: string; email: string }) {
    return issueTokens(user.id, user.email);
  },

  async refresh(refreshTokenValue: string) {
    const record = await prisma.refreshToken.findUnique({ where: { token: refreshTokenValue } });
    if (!record || record.revoked || record.expiresAt < new Date()) {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) throw ApiError.unauthorized("User no longer exists");

    await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
    const tokens = await issueTokens(user.id, user.email);

    return { user: toPublicUser(user), ...tokens };
  },

  async logout(refreshTokenValue: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue },
      data: { revoked: true },
    });
  },

  async me(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw ApiError.notFound("User not found");
    return toPublicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw ApiError.badRequest("This account has no password set (Google sign-in)");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  async deleteAccount(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
    await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    // Always respond success-shaped regardless of whether the user exists, to avoid email enumeration.
    if (!user) return;

    const resetPasswordToken = randomToken();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpires },
    });

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendMail(user.email, "Reset your LifeOS password", `<p>Click to reset: <a href="${resetLink}">${resetLink}</a></p>`);
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
    });
    if (!user) throw ApiError.badRequest("Invalid or expired reset token");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
    });

    await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token, emailVerifyExpires: { gt: new Date() } },
    });
    if (!user) throw ApiError.badRequest("Invalid or expired verification token");

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
    });
  },

  async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    if (user.isEmailVerified) throw ApiError.badRequest("Email is already verified");

    const emailVerifyToken = randomToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken, emailVerifyExpires } });

    const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    await sendMail(user.email, "Verify your LifeOS account", `<p>Click to verify: <a href="${verifyLink}">${verifyLink}</a></p>`);
  },
};
