import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";
import { HealthService } from "./health.service";

function uid(req: AuthedRequest) {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}

const workoutSchema = z.object({
  type: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  intensity: z.enum(["High", "Medium", "Low"]).optional(),
  calories: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

const createSchema = z.object({
  body: z.object({
    date: z.string().datetime().optional(),
    sleepQuality: z.number().int().min(0).max(100).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    waterIntakeLiters: z.number().min(0).optional(),
    steps: z.number().int().min(0).optional(),
    caloriesBurned: z.number().int().min(0).optional(),
    weight: z.number().positive().optional(),
    heartRate: z.number().int().positive().optional(),
    mood: z.number().int().min(1).max(5).optional(),
    workouts: z.array(workoutSchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateSchema = z.object({
  body: createSchema.shape.body.omit({ workouts: true }).partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: List health logs
 *     tags: [Health]
 *   post:
 *     summary: Create or update today's health log (upsert by date)
 *     tags: [Health]
 */
router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { page, limit, skip } = getPagination(req);
    const { items, total } = await HealthService.list(uid(req), skip, limit);
    return sendSuccess(res, items, 200, buildMeta(page, limit, total));
  })
);

router.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const log = await HealthService.create(uid(req), req.body);
    return sendSuccess(res, log, 201);
  })
);

router.put(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const log = await HealthService.update(uid(req), req.params.id, req.body);
    return sendSuccess(res, log);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await HealthService.remove(uid(req), req.params.id);
    return sendSuccess(res, { message: "Health log deleted" });
  })
);

/**
 * @openapi
 * /health/stats:
 *   get:
 *     summary: 30-day health stats summary
 *     tags: [Health]
 */
router.get(
  "/stats",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const stats = await HealthService.stats(uid(req));
    return sendSuccess(res, stats);
  })
);

export default router;
