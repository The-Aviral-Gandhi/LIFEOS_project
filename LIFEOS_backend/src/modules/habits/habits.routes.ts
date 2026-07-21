import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";
import { HabitsService } from "./habits.service";

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    category: z.string().max(50).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    target: z.number().int().positive().optional(),
    unit: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateSchema = z.object({
  body: createSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

function uid(req: AuthedRequest) {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /habits:
 *   get:
 *     summary: List habits with recent logs
 *     tags: [Habits]
 *   post:
 *     summary: Create a habit
 *     tags: [Habits]
 */
router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { page, limit, skip } = getPagination(req);
    const { items, total } = await HabitsService.list(uid(req), skip, limit);
    return sendSuccess(res, items, 200, buildMeta(page, limit, total));
  })
);

router.get(
  "/stats",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const data = await HabitsService.stats(uid(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const habit = await HabitsService.getById(uid(req), req.params.id);
    return sendSuccess(res, habit);
  })
);

router.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const habit = await HabitsService.create(uid(req), req.body);
    return sendSuccess(res, habit, 201);
  })
);

router.put(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const habit = await HabitsService.update(uid(req), req.params.id, req.body);
    return sendSuccess(res, habit);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await HabitsService.remove(uid(req), req.params.id);
    return sendSuccess(res, { message: "Habit deleted" });
  })
);

/**
 * @openapi
 * /habits/{id}/complete:
 *   post:
 *     summary: Mark a habit complete for today and update streaks
 *     tags: [Habits]
 */
router.post(
  "/:id/complete",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const habit = await HabitsService.complete(uid(req), req.params.id);
    return sendSuccess(res, habit);
  })
);

export default router;
