import nodemailer from "nodemailer";
import { env, isMailConfigured } from "../config/env";
import { logger } from "../config/logger";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!isMailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      secure: Number(env.SMTP_PORT ?? 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends a real email if SMTP_* env vars are configured. If not configured,
 * logs the link/content instead of failing — this keeps register/forgot-password
 * flows fully functional in local dev without requiring mail credentials,
 * while sending real mail in any environment that has them set.
 */
export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransporter();
  if (!t) {
    logger.warn({ to, subject, html }, "✉️  SMTP not configured — logging email instead of sending");
    return { delivered: false };
  }
  await t.sendMail({ from: env.MAIL_FROM, to, subject, html });
  return { delivered: true };
}
