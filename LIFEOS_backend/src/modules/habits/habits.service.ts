import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { emitToUser } from "../../socket";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const HabitsService = {
  async list(userId: string, skip: number, limit: number) {
    const where = { userId, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.habit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { logs: { orderBy: { date: "desc" }, take: 90 } },
      }),
      prisma.habit.count({ where }),
    ]);
    return { items, total };
  },

  async getById(userId: string, id: string) {
    const habit = await prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: { logs: { orderBy: { date: "desc" }, take: 90 } },
    });
    if (!habit) throw ApiError.notFound("Habit not found");
    return habit;
  },

  async create(userId: string, data: { name: string; category?: string; icon?: string; color?: string; target?: number; unit?: string }) {
    return prisma.habit.create({
      data: {
        userId,
        name: data.name,
        category: data.category ?? "General",
        icon: data.icon ?? "circle",
        color: data.color ?? "#6366f1",
        target: data.target,
        unit: data.unit,
      },
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    await this.getById(userId, id);
    return prisma.habit.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    await this.getById(userId, id);
    await prisma.habit.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  /** Marks the habit complete for today, recalculates current/best streak. */
  async complete(userId: string, id: string) {
    const habit = await this.getById(userId, id);
    const today = startOfDay();

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: today } },
    });
    if (existing) throw ApiError.conflict("Habit already completed today");

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLog = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: yesterday } },
    });

    const newStreak = yesterdayLog?.completed ? habit.streak + 1 : 1;
    const newBest = Math.max(habit.bestStreak, newStreak);

    await prisma.habitLog.create({ data: { habitId: id, userId, date: today, completed: true } });

    const updated = await prisma.habit.update({
      where: { id },
      data: { streak: newStreak, bestStreak: newBest },
      include: { logs: { orderBy: { date: "desc" }, take: 90 } },
    });

    emitToUser(userId, "habit:completed", { habit: updated });

    return updated;
  },

  async stats(userId: string) {
    const habits = await prisma.habit.findMany({ where: { userId, deletedAt: null } });
    const totalHabits = habits.length;
    const activeStreaks = habits.filter((h) => h.streak > 0).length;
    const bestStreakOverall = habits.reduce((m, h) => Math.max(m, h.bestStreak), 0);

    const today = startOfDay();
    const completedToday = await prisma.habitLog.count({
      where: { userId, date: today, completed: true },
    });

    return { totalHabits, activeStreaks, bestStreakOverall, completedToday };
  },
};
