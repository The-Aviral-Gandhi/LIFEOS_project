import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";
import { AuthedRequest } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);
  return sendSuccess(res, { user }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  return sendSuccess(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await AuthService.refresh(refreshToken);
  return sendSuccess(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await AuthService.logout(refreshToken);
  return sendSuccess(res, { message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const user = await AuthService.me(req.userId);
  return sendSuccess(res, { user });
});

export const changePassword = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  await AuthService.changePassword(req.userId, req.body.currentPassword, req.body.newPassword);
  return sendSuccess(res, { message: "Password changed" });
});

export const deleteAccount = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  await AuthService.deleteAccount(req.userId);
  return sendSuccess(res, { message: "Account deleted" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body.email);
  // Always the same response, whether or not the email exists (prevents enumeration).
  return sendSuccess(res, { message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body.token, req.body.newPassword);
  return sendSuccess(res, { message: "Password has been reset. Please log in again." });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.body.token);
  return sendSuccess(res, { message: "Email verified" });
});

export const resendVerification = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  await AuthService.resendVerification(req.userId);
  return sendSuccess(res, { message: "Verification email sent" });
});

/** Handles the Google OAuth callback: passport has already attached `req.user`. */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id: string; email: string } | undefined;
  if (!user) throw ApiError.unauthorized("Google authentication failed");

  const tokens = await AuthService.loginWithOAuthUser(user);
  const redirectUrl = new URL("/auth/callback", env.FRONTEND_URL);
  redirectUrl.searchParams.set("accessToken", tokens.accessToken);
  redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);
  return res.redirect(redirectUrl.toString());
});
