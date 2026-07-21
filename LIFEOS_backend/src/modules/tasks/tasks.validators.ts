import { z } from "zod";

const priority = z.enum(["High", "Medium", "Low"]);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    category: z.string().max(50).optional(),
    deadline: z.string().datetime().optional().or(z.literal("")).optional(),
    priority: priority.optional(),
    xp: z.number().int().min(0).max(1000).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    category: z.string().max(50).optional(),
    deadline: z.string().datetime().optional().or(z.literal("")).optional(),
    priority: priority.optional(),
    completed: z.boolean().optional(),
    xp: z.number().int().min(0).max(1000).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const idParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
