import { z } from "zod";
import { prisma } from "../../config/database";
import { buildCrudRouter } from "../../utils/crudFactory";

const column = z.enum(["Backlog", "In_Progress", "Review", "Completed"]);
const priority = z.enum(["High", "Medium", "Low"]);

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    column: column.optional(),
    progress: z.number().int().min(0).max(100).optional(),
    dueDate: z.string().datetime().optional(),
    tag: z.string().optional(),
    priority: priority.optional(),
    description: z.string().max(2000).optional(),
    assignee: z.string().optional(),
    color: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateSchema = z.object({
  body: createSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

const router = buildCrudRouter(() => prisma.project as any, {
  modelName: "project",
  softDelete: true,
  createSchema,
  updateSchema,
  mapCreate: (userId, body) => ({
    userId,
    title: body.title,
    column: body.column ?? "Backlog",
    progress: body.progress ?? 0,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    tag: body.tag,
    priority: body.priority ?? "Medium",
    description: body.description,
    assignee: body.assignee,
    color: body.color,
  }),
  mapUpdate: (body) => ({
    ...body,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
  }),
});

export default router;
