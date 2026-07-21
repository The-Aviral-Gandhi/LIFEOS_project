import { useMemo } from "react";
import { BarChart3, TrendingUp, Target, Activity, Zap, Clock, CheckSquare } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile, Task, Goal, Habit, FocusSession, Transaction, HealthLog } from "../../types";
import { Card } from "../ui/Card";
import { ProgressBar, ProgressRing } from "../ui/Progress";

interface AnalyticsViewProps {
  profile: UserProfile;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  focusSessions: FocusSession[];
  transactions: Transaction[];
  healthLog: HealthLog;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsView({ profile, tasks, goals, habits, focusSessions, transactions, healthLog }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    // Weekly tasks
    const weeklyTasks = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split("T")[0];
      const dayTasks = tasks.filter(t => t.completedAt?.startsWith(ds));
      return { day: WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1], count: dayTasks.length };
    });

    // Focus by category
    const focusByCategory: Record<string, number> = {};
    focusSessions.forEach(s => {
      focusByCategory[s.category] = (focusByCategory[s.category] || 0) + s.durationMinutes;
    });

    // Habit completion this week
    const today = new Date();
    const weeklyHabitData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const ds = d.toISOString().split("T")[0];
      const done = habits.filter(h => h.history[ds]).length;
      return { day: WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1], done, total: habits.length };
    });

    // Financial summary
    const income = transactions.filter(t => t.type === "Income").reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter(t => t.type === "Expense").reduce((a, t) => a + t.amount, 0);

    return { weeklyTasks, focusByCategory, weeklyHabitData, income, expense };
  }, [tasks, focusSessions, habits, transactions]);

  const totalFocusHours = Math.round(focusSessions.reduce((a, s) => a + s.durationMinutes, 0) / 60 * 10) / 10;
  const maxTaskCount = Math.max(...stats.weeklyTasks.map(d => d.count), 1);
  const maxHabitCount = Math.max(...stats.weeklyHabitData.map(d => d.done), 1);
  const focusCategoryEntries = Object.entries(stats.focusByCategory).sort(([, a], [, b]) => b - a);
  const maxFocusMins = focusCategoryEntries[0]?.[1] || 1;

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Analytics Engine</h2>
        <p className="text-xs text-slate-500 mt-1">Performance metrics & growth insights — quantified self</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, sub: `${tasks.filter(t => t.completed).length} completed`, icon: <CheckSquare className="h-4 w-4" />, color: "text-indigo-400" },
          { label: "Focus Hours", value: `${totalFocusHours}h`, sub: `${focusSessions.length} sessions`, icon: <Clock className="h-4 w-4" />, color: "text-cyan-400" },
          { label: "Active Goals", value: goals.filter(g => g.progress < 100).length, sub: `${goals.filter(g => g.progress === 100).length} completed`, icon: <Target className="h-4 w-4" />, color: "text-emerald-400" },
          { label: "Habit Streaks", value: `${habits.reduce((a, h) => a + h.streak, 0)}d`, sub: `across ${habits.length} habits`, icon: <Activity className="h-4 w-4" />, color: "text-amber-400" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card padding="sm" glow="indigo">
              <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
              <div className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-0.5">{kpi.label}</div>
              <div className="text-[10px] text-slate-600 mt-1">{kpi.sub}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Tasks Bar Chart */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-indigo-400" />
            Weekly Task Completions
          </h3>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyTasks.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxTaskCount) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
                  style={{ minHeight: d.count > 0 ? "8px" : "2px" }}
                />
                <span className="text-[9px] font-mono text-slate-600">{d.day}</span>
                <span className="text-[9px] font-mono text-indigo-400 font-bold">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Habit Consistency */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Weekly Habit Consistency
          </h3>
          <div className="space-y-3">
            {stats.weeklyHabitData.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">{d.day}</span>
                  <span className="text-amber-400">{d.done}/{d.total}</span>
                </div>
                <ProgressBar
                  value={d.total > 0 ? Math.round((d.done / d.total) * 100) : 0}
                  color="from-amber-500 to-orange-500"
                  height={5}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Focus by Category */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Focus Distribution
          </h3>
          {focusCategoryEntries.length === 0 ? (
            <p className="text-slate-600 text-sm">No focus sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {focusCategoryEntries.map(([cat, mins], i) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-cyan-400">{Math.round(mins / 60 * 10) / 10}h</span>
                  </div>
                  <ProgressBar
                    value={Math.round((mins / maxFocusMins) * 100)}
                    color="from-cyan-500 to-blue-500"
                    height={5}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Goals Progress */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />
            Goals Progress
          </h3>
          {goals.length === 0 ? (
            <p className="text-slate-600 text-sm">No goals created yet.</p>
          ) : (
            <div className="space-y-3.5">
              {goals.slice(0, 5).map(g => (
                <div key={g.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{g.title}</span>
                    <span className="text-[10px] font-mono ml-2" style={{ color: g.color || "#6366f1" }}>{g.progress}%</span>
                  </div>
                  <ProgressBar
                    value={g.progress}
                    color="from-indigo-500 to-purple-500"
                    height={5}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Financial Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <ProgressRing
              value={stats.income > 0 ? Math.min(100, Math.round(((stats.income - stats.expense) / stats.income) * 100)) : 0}
              size={100}
              color="#10b981"
              label={`${stats.income > 0 ? Math.round(((stats.income - stats.expense) / stats.income) * 100) : 0}%`}
              sublabel="SAVINGS"
            />
            <p className="text-xs font-mono text-slate-500 mt-2">Savings Rate</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">INCOME</div>
              <div className="text-xl font-black text-emerald-400 font-mono">₹{stats.income.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">EXPENSES</div>
              <div className="text-xl font-black text-red-400 font-mono">₹{stats.expense.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[10px] font-mono text-slate-600 mb-1">NET BALANCE</div>
            <div className={`text-2xl font-black font-mono ${stats.income - stats.expense >= 0 ? "text-indigo-400" : "text-red-400"}`}>
              ₹{(stats.income - stats.expense).toLocaleString("en-IN")}
            </div>
            <ProgressBar
              value={stats.income > 0 ? Math.min(100, Math.round((stats.income / (stats.income + stats.expense)) * 100)) : 50}
              color="from-indigo-500 to-emerald-500"
              height={6}
              className="mt-3"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
