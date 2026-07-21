import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

function startOfDay(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const HealthService = {
  async list(userId: string, skip: number, limit: number) {
    const where = { userId };
    const [items, total] = await Promise.all([
      prisma.healthLog.findMany({ where, skip, take: limit, orderBy: { date: "desc" }, include: { workouts: true } }),
      prisma.healthLog.count({ where }),
    ]);
    return { items, total };
  },

  /** Upserts today's (or given date's) health log — matches "one log per day" model. */
  async create(userId: string, data: any) {
    const date = startOfDay(data.date);
    const { workouts, ...rest } = data;

    return prisma.healthLog.upsert({
      where: { userId_date: { userId, date } },
      update: { ...rest, date },
      create: {
        userId,
        date,
        sleepQuality: rest.sleepQuality ?? 0,
        sleepHours: rest.sleepHours ?? 0,
        waterIntakeLiters: rest.waterIntakeLiters ?? 0,
        steps: rest.steps ?? 0,
        caloriesBurned: rest.caloriesBurned ?? 0,
        weight: rest.weight,
        heartRate: rest.heartRate,
        mood: rest.mood,
        workouts: workouts?.length
          ? { create: workouts.map((w: any) => ({ ...w, userId })) }
          : undefined,
      },
      include: { workouts: true },
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const existing = await prisma.healthLog.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound("Health log not found");
    return prisma.healthLog.update({ where: { id }, data, include: { workouts: true } });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.healthLog.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound("Health log not found");
    await prisma.healthLog.delete({ where: { id } });
  },

  async stats(userId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const logs = await prisma.healthLog.findMany({ where: { userId, date: { gte: since } } });

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

    return {
      avgSleepHours: Number(avg(logs.map((l) => l.sleepHours)).toFixed(1)),
      avgSleepQuality: Math.round(avg(logs.map((l) => l.sleepQuality))),
      avgSteps: Math.round(avg(logs.map((l) => l.steps))),
      avgWaterIntakeLiters: Number(avg(logs.map((l) => l.waterIntakeLiters)).toFixed(1)),
      totalCaloriesBurned: logs.reduce((sum, l) => sum + l.caloriesBurned, 0),
      daysLogged: logs.length,
    };
  },
};
