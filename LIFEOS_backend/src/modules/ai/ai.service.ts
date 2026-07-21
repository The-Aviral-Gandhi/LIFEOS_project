import { prisma } from "../../config/database";
import { runAICompletion } from "./providers";

const COACH_SYSTEM_PROMPT =
  "You are the AI coach inside LifeOS, a personal productivity operating system. " +
  "You help the user with tasks, goals, habits, finances, health, and journaling. " +
  "Be concise, specific, and encouraging. Avoid generic filler advice.";

export const AIService = {
  async chat(userId: string, prompt: string) {
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.aIConversation.create({ data: { userId, title: "AI Coach" } });
    }

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "user", content: prompt },
    });

    const { text, provider } = await runAICompletion(COACH_SYSTEM_PROMPT, prompt);

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: text },
    });
    await prisma.aIConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    return { reply: text, provider, conversationId: conversation.id };
  },

  async summarizeJournal(content: string) {
    const { text, provider } = await runAICompletion(
      "You summarize personal journal entries into 2-3 sentences, identifying the core theme and one actionable insight. Be warm but direct.",
      content
    );
    return { summary: text, provider };
  },

  /** Builds real productivity insights from the user's actual data — not canned text. */
  async productivityInsights(userId: string) {
    const [taskStats, habitStats, goals] = await Promise.all([
      prisma.task.aggregate({ where: { userId, deletedAt: null }, _count: true }),
      prisma.habit.findMany({ where: { userId, deletedAt: null } }),
      prisma.goal.findMany({ where: { userId, deletedAt: null } }),
    ]);

    const completedTasks = await prisma.task.count({ where: { userId, deletedAt: null, completed: true } });
    const avgGoalProgress = goals.length
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
      : 0;

    const dataSummary =
      `Tasks: ${completedTasks}/${taskStats._count} completed. ` +
      `Habits: ${habitStats.length} tracked, longest active streak ${Math.max(0, ...habitStats.map((h) => h.streak), 0)}. ` +
      `Goals: ${goals.length} active, average progress ${avgGoalProgress}%.`;

    const { text, provider } = await runAICompletion(
      "You are a productivity analyst. Given a short data summary about a user's tasks, habits, and goals, " +
        "produce 2-4 bullet-point insights and one concrete recommendation. Be specific, reference the numbers given.",
      dataSummary
    );

    return { dataSummary, insight: text, provider };
  },

  async dailyPlan(userId: string) {
    const [tasks, habits] = await Promise.all([
      prisma.task.findMany({ where: { userId, deletedAt: null, completed: false }, orderBy: { deadline: "asc" }, take: 10 }),
      prisma.habit.findMany({ where: { userId, deletedAt: null } }),
    ]);

    const context =
      `Open tasks: ${tasks.map((t) => `${t.title} (${t.priority})`).join("; ") || "none"}. ` +
      `Habits to maintain: ${habits.map((h) => h.name).join(", ") || "none"}.`;

    const { text, provider } = await runAICompletion(
      "You are a daily planning assistant. Given the user's open tasks and habits, produce a realistic, " +
        "prioritized plan for today as a short numbered list (max 6 items).",
      context
    );

    return { context, plan: text, provider };
  },
};
