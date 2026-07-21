import { z } from "zod";
import { prisma } from "../../config/database";
import { buildCrudRouter } from "../../utils/crudFactory";

const createSchema = z.object({
  body: z.object({
    date: z.string().datetime().optional(),
    wins: z.string().max(5000).optional(),
    mistakes: z.string().max(5000).optional(),
    lessons: z.string().max(5000).optional(),
    gratitude: z.string().max(5000).optional(),
    tomorrowPlan: z.string().max(5000).optional(),
    reflectionScore: z.number().int().min(1).max(10).optional(),
    mood: z.string().optional(),
    tags: z.array(z.string()).optional(),
    private: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateSchema = z.object({
  body: createSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

const router = buildCrudRouter(() => prisma.journal as any, {
  modelName: "journal",
  softDelete: true,
  createSchema,
  updateSchema,
  mapCreate: (userId, body) => ({
    userId,
    date: body.date ? new Date(body.date) : undefined,
    wins: body.wins,
    mistakes: body.mistakes,
    lessons: body.lessons,
    gratitude: body.gratitude,
    tomorrowPlan: body.tomorrowPlan,
    reflectionScore: body.reflectionScore ?? 5,
    mood: body.mood,
    tags: body.tags ?? [],
    private: body.private ?? true,
  }),
  mapUpdate: (body) => ({
    ...body,
    date: body.date ? new Date(body.date) : undefined,
  }),
});

export default router;
