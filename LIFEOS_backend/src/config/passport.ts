import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env, isGoogleOAuthConfigured } from "./env";
import { prisma } from "./database";
import { logger } from "./logger";

/**
 * Registers the Google OAuth strategy only if credentials are present.
 * If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set, the /auth/google
 * routes return a clear 501 instead of crashing the server on boot.
 */
export function configurePassport() {
  if (!isGoogleOAuthConfigured) {
    logger.warn("Google OAuth not configured — GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing. /auth/google routes will return 501.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"));

          let user = await prisma.user.findFirst({ where: { OR: [{ googleId: profile.id }, { email }] } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                name: profile.displayName || email.split("@")[0],
                email,
                avatar: profile.photos?.[0]?.value,
                isEmailVerified: true,
              },
            });
          } else if (!user.googleId) {
            user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id, isEmailVerified: true } });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export { passport };
