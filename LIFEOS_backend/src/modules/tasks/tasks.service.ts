import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { emitToUser } from "../../socket";

export const TasksService = {
  async list(userId: string, skip: number, limit: number, filters: { completed?: boolean; category?: string; priority?: string; search?: string }) {
    const where = {
      userId,
      deletedAt: null,
      ...(filters.completed !== undefined ? { completed: filters.completed } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.search ? { title: { contains: filters.search, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { subtasks: true } }),
      prisma.task.count({ where }),
    ]);

    return { items, total };
  },

  async getById(userId: string, id: string) {
    const task = await prisma.task.findFirst({ where: { id, userId, deletedAt: null }, include: { subtasks: true } });
    if (!task) throw ApiError.notFound("Task not found");
    return task;
  },

  async create(userId: string, data: { title: string; category?: string; deadline?: string; priority?: string; xp?: number; tags?: string[]; notes?: string }) {
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        category: data.category ?? "General",
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        priority: data.priority ?? "Medium",
        xp: data.xp ?? 10,
        tags: data.tags ?? [],
        notes: data.notes,
      },
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    await this.getById(userId, id);

    const { deadline, completed, ...rest } = data as { deadline?: string; completed?: boolean; [k: string]: unknown };

    const wasCompleting = completed === true;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(completed !== undefined ? { completed, completedAt: wasCompleting ? new Date() : null } : {}),
      },
    });

    // Award XP when a task transitions to completed
    if (wasCompleting) {
      const updatedUser = await prisma.user.update({ where: { id: userId }, data: { xp: { increment: task.xp } } });
      emitToUser(userId, "task:completed", { task });
      emitToUser(userId, "xp:updated", { xp: updatedUser.xp, level: updatedUser.level });
    } else {
      emitToUser(userId, "task:updated", { task });
    }

    return task;
  },

  async remove(userId: string, id: string) {
    await this.getById(userId, id);
    await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async stats(userId: string) {
    const [total, completed, byPriority] = await Promise.all([
      prisma.task.count({ where: { userId, deletedAt: null } }),
      prisma.task.count({ where: { userId, deletedAt: null, completed: true } }),
      prisma.task.groupBy({ by: ["priority"], where: { userId, deletedAt: null }, _count: true }),
    ]);

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      byPriority: byPriority.reduce((acc, r) => ({ ...acc, [r.priority]: r._count }), {} as Record<string, number>),
    };
  },
};
