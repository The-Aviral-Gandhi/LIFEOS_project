import { useState } from "react";
import { Repeat, Flame, Plus, Check, Trash, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Habit } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { Badge } from "../ui/Badge";

interface HabitsViewProps {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  toggleHabitDay: (habitId: string, dateString: string) => void;
  deleteHabit: (id: string) => void;
}

const CATEGORIES = [
  { value: "Discipline", label: "Discipline" },
  { value: "Health", label: "Health" },
  { value: "Growth", label: "Personal Growth" },
  { value: "Studies", label: "Academic" },
  { value: "Mind", label: "Mindfulness" },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#f97316"];

const getPast60Days = (): string[] => {
  const list: string[] = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    list.push(d.toISOString().split("T")[0]);
  }
  return list;
};

const past60Days = getPast60Days();

const catColors: Record<string, string> = {
  Discipline: "indigo", Health: "emerald", Growth: "purple", Studies: "cyan", Mind: "amber"
};

export default function HabitsView({ habits, addHabit, toggleHabitDay, deleteHabit }: HabitsViewProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Discipline");
  const [color, setColor] = useState(COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({
      id: "habit-" + Date.now(),
      name: name.trim(),
      streak: 0,
      bestStreak: 0,
      category,
      icon: "repeat",
      color,
      history: {},
      createdAt: new Date().toISOString(),
    });
    setName(""); setShowForm(false);
  };

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const avgConsistency = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => {
        const count = Object.values(h.history).filter(Boolean).length;
        return acc + (count / 60) * 100;
      }, 0) / habits.length)
    : 0;

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Atomic Habits</h2>
          <p className="text-xs text-slate-500 mt-1">Consistency is rewiring your neural pathways every single day</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">TOTAL STREAK</div>
            <div className="text-lg font-black text-amber-400 font-mono flex items-center gap-1">
              <Flame className="h-4 w-4" />{totalStreak}d
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">AVG CONSISTENCY</div>
            <div className="text-lg font-black text-emerald-400 font-mono">{avgConsistency}%</div>
          </div>
          <Button onClick={() => setShowForm(v => !v)} icon={<Plus className="h-4 w-4" />}>
            New Habit
          </Button>
        </div>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-indigo-400" />
                Create New Habit Routine
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5">
                  <Input label="Habit Name" placeholder="e.g. Read 20 pages daily" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="sm:col-span-3">
                  <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={CATEGORIES} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-lg transition-all ${color === c ? "ring-2 ring-white/30 scale-110" : "opacity-60 hover:opacity-100"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" fullWidth>Create</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      {habits.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-6 w-6" />}
          title="No habits yet"
          description="Start building atomic habits that compound over time."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>Add First Habit</Button>}
        />
      ) : (
        <div className="space-y-5">
          {habits.map((habit, idx) => {
            const completedCount = Object.values(habit.history).filter(Boolean).length;
            const consistencyRate = Math.round((completedCount / 60) * 100);
            const todayDone = habit.history[today] === true;
            const catColor = catColors[habit.category] || "indigo";

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Habit Header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${habit.color}20`, border: `1px solid ${habit.color}30` }}
                      >
                        <Repeat className="h-5 w-5" style={{ color: habit.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm">{habit.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={catColor as any} size="xs">{habit.category}</Badge>
                          <span className="text-[10px] font-mono text-slate-600">{consistencyRate}% consistency</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Streak Badge */}
                      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2">
                        <Flame className="h-4 w-4 text-amber-500 fill-amber-500/30" />
                        <div className="font-mono">
                          <div className="text-[8px] text-amber-600 leading-none font-bold">STREAK</div>
                          <div className="text-sm font-black text-amber-400">{habit.streak}d</div>
                        </div>
                      </div>
                      {/* Best Streak */}
                      <div className="glass px-3 py-2 rounded-xl font-mono">
                        <div className="text-[8px] text-slate-600 leading-none font-bold">BEST</div>
                        <div className="text-sm font-black text-slate-300">{habit.bestStreak}d</div>
                      </div>
                      {/* Today Toggle */}
                      <button
                        onClick={() => toggleHabitDay(habit.id, today)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                          todayDone
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {todayDone ? "Done Today" : "Log Today"}
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        aria-label="Delete habit"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="px-5 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-3 w-3" />
                      60-Day Activity
                    </span>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600">
                      <span>Miss</span>
                      {[0.1, 0.4, 0.7, 1].map(o => (
                        <div key={o} className="h-3 w-3 rounded-sm" style={{ background: `${habit.color}`, opacity: o }} />
                      ))}
                      <span>Hit</span>
                    </div>
                  </div>
                  <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(15, 1fr)" }}>
                    {past60Days.map(date => {
                      const done = habit.history[date] === true;
                      const isToday = date === today;
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabitDay(habit.id, date)}
                          title={`${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${done ? "Done" : "Missed"}`}
                          className={`aspect-square rounded-sm transition-all hover:scale-110 active:scale-90 ${isToday ? "ring-1 ring-white/30" : ""}`}
                          style={{
                            background: done ? habit.color : "rgba(255,255,255,0.04)",
                            opacity: done ? 1 : 0.6,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
