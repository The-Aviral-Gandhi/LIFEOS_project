import { z } from "zod";
import { prisma } from "../../config/database";
import { buildCrudRouter } from "../../utils/crudFactory";

const milestoneSchema = z.object({ title: z.string().min(1), completed: z.boolean().optional() });

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    category: z.string().max(50).optional(),
    deadline: z.string().datetime().optional(),
    rewardXP: z.number().int().min(0).max(1000).optional(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    notes: z.string().max(2000).optional(),
    color: z.string().optional(),
    milestones: z.array(milestoneSchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    category: z.string().max(50).optional(),
    deadline: z.string().datetime().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    rewardXP: z.number().int().min(0).max(1000).optional(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    notes: z.string().max(2000).optional(),
    color: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

const router = buildCrudRouter(() => prisma.goal as any, {
  modelName: "goal",
  softDelete: true,
  include: { milestones: true },
  createSchema,
  updateSchema,
  mapCreate: (userId, body) => ({
    userId,
    title: body.title,
    category: body.category ?? "General",
    deadline: body.deadline ? new Date(body.deadline) : undefined,
    rewardXP: body.rewardXP ?? 50,
    priority: body.priority ?? "Medium",
    notes: body.notes,
    color: body.color,
    milestones: body.milestones ? { create: body.milestones } : undefined,
  }),
  mapUpdate: (body) => ({
    ...body,
    deadline: body.deadline ? new Date(body.deadline) : undefined,
  }),
});

export default router;
