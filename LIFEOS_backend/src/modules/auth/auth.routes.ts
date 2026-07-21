import { Router, Request, Response, NextFunction } from "express";
import * as ctrl from "./auth.controller";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimit";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from "./auth.validators";
import { passport } from "../../config/passport";
import { isGoogleOAuthConfigured } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", authLimiter, validate(registerSchema), ctrl.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 */
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 */
router.post("/refresh", validate(refreshSchema), ctrl.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 */
router.post("/logout", ctrl.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", requireAuth, ctrl.me);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/change-password", requireAuth, validate(changePasswordSchema), ctrl.changePassword);

/**
 * @openapi
 * /auth/account:
 *   delete:
 *     summary: Soft-delete the current user's account
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/account", requireAuth, ctrl.deleteAccount);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 */
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 */
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verify email using a verification token
 *     tags: [Auth]
 */
router.post("/verify-email", validate(verifyEmailSchema), ctrl.verifyEmail);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     summary: Resend the email verification link
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/resend-verification", requireAuth, ctrl.resendVerification);

/** Guards Google routes with a clear 501 when OAuth credentials aren't configured, instead of crashing. */
function requireGoogleConfigured(_req: Request, _res: Response, next: NextFunction) {
  if (!isGoogleOAuthConfigured) {
    return next(ApiError.internal("Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."));
  }
  next();
}

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags: [Auth]
 */
router.get("/google", requireGoogleConfigured, passport.authenticate("google", { scope: ["profile", "email"], session: false }));

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback — redirects to FRONTEND_URL/auth/callback with tokens
 *     tags: [Auth]
 */
router.get(
  "/google/callback",
  requireGoogleConfigured,
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failed" }),
  ctrl.googleCallback
);

router.get("/google/failed", (_req, res) => {
  res.status(401).json({ success: false, message: "Google authentication failed" });
});

export default router;
