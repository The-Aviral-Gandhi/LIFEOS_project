import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import { AIService } from "./ai.service";

function uid(req: AuthedRequest) {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}

const chatSchema = z.object({
  body: z.object({ prompt: z.string().min(1).max(4000) }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const summarizeSchema = z.object({
  body: z.object({ content: z.string().min(1).max(8000) }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /ai/chat:
 *   post:
 *     summary: Chat with the AI coach (uses the configured AI_PROVIDER)
 *     tags: [AI]
 */
router.post(
  "/chat",
  validate(chatSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await AIService.chat(uid(req), req.body.prompt);
    return sendSuccess(res, result);
  })
);

/**
 * @openapi
 * /ai/summarize:
 *   post:
 *     summary: Summarize a journal entry
 *     tags: [AI]
 */
router.post(
  "/summarize",
  validate(summarizeSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await AIService.summarizeJournal(req.body.content);
    return sendSuccess(res, result);
  })
);

/**
 * @openapi
 * /ai/insights:
 *   get:
 *     summary: Get productivity insights derived from real user data
 *     tags: [AI]
 */
router.get(
  "/insights",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await AIService.productivityInsights(uid(req));
    return sendSuccess(res, result);
  })
);

/**
 * @openapi
 * /ai/daily-plan:
 *   get:
 *     summary: Get an AI-generated daily plan from open tasks and habits
 *     tags: [AI]
 */
router.get(
  "/daily-plan",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await AIService.dailyPlan(uid(req));
    return sendSuccess(res, result);
  })
);

export default router;
