import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export const FinanceService = {
  async listTransactions(userId: string, skip: number, limit: number, type?: string, category?: string) {
    const where = {
      userId,
      deletedAt: null,
      ...(type ? { type } : {}),
      ...(category ? { category } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({ where, skip, take: limit, orderBy: { date: "desc" } }),
      prisma.transaction.count({ where }),
    ]);
    return { items, total };
  },

  async createTransaction(userId: string, data: any) {
    return prisma.transaction.create({
      data: {
        userId,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category ?? "General",
        date: data.date ? new Date(data.date) : undefined,
        notes: data.notes,
        recurring: data.recurring ?? false,
        tags: data.tags ?? [],
      },
    });
  },

  async updateTransaction(userId: string, id: string, data: any) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw ApiError.notFound("Transaction not found");
    return prisma.transaction.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    });
  },

  async deleteTransaction(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw ApiError.notFound("Transaction not found");
    await prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async listBudgets(userId: string) {
    return prisma.budget.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async createBudget(userId: string, data: { category: string; limit: number; period?: string }) {
    return prisma.budget.create({
      data: { userId, category: data.category, limit: data.limit, period: data.period ?? "monthly" },
    });
  },

  async stats(userId: string) {
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, deletedAt: null, type: "Income" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, deletedAt: null, type: "Expense" },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount ?? 0;
    const totalExpense = expenseAgg._sum.amount ?? 0;

    const byCategory = await prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, deletedAt: null, type: "Expense" },
      _sum: { amount: true },
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expenseByCategory: byCategory.map((c) => ({ category: c.category, amount: c._sum.amount ?? 0 })),
    };
  },

  /** Last 6 months of income vs expense, grouped by month. */
  async trends(userId: string) {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: { userId, deletedAt: null, date: { gte: since } },
      select: { amount: true, type: true, date: true },
    });

    const buckets: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] ??= { income: 0, expense: 0 };
      if (t.type === "Income") buckets[key].income += t.amount;
      else buckets[key].expense += t.amount;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, v]) => ({ month, ...v }));
  },
};
