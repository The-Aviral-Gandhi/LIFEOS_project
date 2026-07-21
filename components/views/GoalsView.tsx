import { useState } from "react";
import { Target, Plus, Trash, Check, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Goal, Milestone } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { PriorityBadge, Badge } from "../ui/Badge";
import { ProgressRing, ProgressBar } from "../ui/Progress";

interface GoalsViewProps {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
}

const CATEGORIES = ["Projects", "Education", "Health", "Finance", "Personal", "Career"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function GoalsView({ goals, addGoal, updateGoal, deleteGoal, toggleMilestone }: GoalsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Projects");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [xpReward, setXpReward] = useState("500");

  const handleAddMilestone = () => {
    if (milestoneInput.trim()) {
      setMilestones(prev => [...prev, milestoneInput.trim()]);
      setMilestoneInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      id: "g-" + Date.now(),
      title: title.trim(),
      category,
      deadline,
      priority,
      progress: 0,
      milestones: milestones.map((m, i) => ({
        id: `g-${Date.now()}-${i}`,
        title: m,
        completed: false,
      })),
      rewardXP: parseInt(xpReward) || 500,
      createdAt: new Date().toISOString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    setTitle(""); setMilestones([]); setShowForm(false);
  };

  const active = goals.filter(g => g.progress < 100);
  const completed = goals.filter(g => g.progress === 100);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Goals Matrix</h2>
          <p className="text-xs text-slate-500 mt-1">Long-term objectives with measurable milestones</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} icon={<Plus className="h-4 w-4" />}>
          New Goal
        </Button>
      </div>

      {/* New Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <h3 className="font-bold text-slate-200 text-sm mb-5">Define New Goal</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Goal Title" placeholder="e.g. Launch product MVP" value={title} onChange={e => setTitle(e.target.value)} required />
                  <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                  <Input label="Target Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Priority" value={priority} onChange={e => setPriority(e.target.value as any)} options={[{ value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]} />
                    <Input label="XP Reward" type="number" value={xpReward} onChange={e => setXpReward(e.target.value)} min="100" />
                  </div>
                </div>
                {/* Milestones */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Milestones</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="input-dark flex-1 rounded-xl py-2 px-3 text-sm"
                      placeholder="Add a milestone..."
                      value={milestoneInput}
                      onChange={e => setMilestoneInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddMilestone())}
                    />
                    <Button variant="secondary" onClick={handleAddMilestone} type="button">Add</Button>
                  </div>
                  {milestones.length > 0 && (
                    <div className="space-y-1.5">
                      {milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400 glass px-3 py-2 rounded-lg">
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                          <span className="flex-1">{m}</span>
                          <button type="button" onClick={() => setMilestones(prev => prev.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400">
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit">Create Goal</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">Active Goals ({active.length})</h3>
        {active.length === 0 ? (
          <EmptyState icon={<Target className="h-6 w-6" />} title="No active goals" description="Create your first goal to start tracking progress." action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>Create Goal</Button>} />
        ) : active.map((goal, i) => (
          <GoalCard key={goal.id} goal={goal} expanded={expandedId === goal.id} onToggle={() => setExpandedId(prev => prev === goal.id ? null : goal.id)} onDelete={deleteGoal} onToggleMilestone={toggleMilestone} index={i} />
        ))}
      </div>

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">Completed ({completed.length})</h3>
          {completed.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} expanded={false} onToggle={() => {}} onDelete={deleteGoal} onToggleMilestone={toggleMilestone} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, expanded, onToggle, onDelete, onToggleMilestone, index }: {
  goal: Goal; expanded: boolean; onToggle: () => void;
  onDelete: (id: string) => void; onToggleMilestone: (gId: string, mId: string) => void; index: number;
}) {
  const isComplete = goal.progress === 100;
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
  const completed = goal.milestones.filter(m => m.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass rounded-2xl overflow-hidden transition-all ${isComplete ? "opacity-60" : "hover:border-white/10"}`}
    >
      {/* Goal Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ProgressRing value={goal.progress} size={64} strokeWidth={5} color={goal.color || "#6366f1"} label={`${goal.progress}%`} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-200 text-sm leading-snug">{goal.title}</h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <PriorityBadge priority={goal.priority} />
                <button onClick={() => onDelete(goal.id)} className="p-1 text-slate-600 hover:text-red-400 transition-all">
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="slate" size="xs">{goal.category}</Badge>
              <span className="text-[10px] font-mono text-slate-600">
                {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Due today" : `${Math.abs(daysLeft)}d overdue`}
              </span>
              <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                <Zap className="h-3 w-3" />+{goal.rewardXP} XP
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                {completed}/{goal.milestones.length} milestones
              </span>
            </div>
          </div>
        </div>

        <ProgressBar value={goal.progress} height={4} className="mt-4" color={goal.progress === 100 ? "from-emerald-500 to-emerald-400" : "from-indigo-500 to-purple-500"} />
      </div>

      {/* Expand Milestones */}
      {goal.milestones.length > 0 && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-5 py-3 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 hover:text-slate-300 hover:bg-white/[0.02] transition-all"
          >
            <span>MILESTONES — {completed}/{goal.milestones.length}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 space-y-2">
                  {goal.milestones.map(m => (
                    <button
                      key={m.id}
                      onClick={() => onToggleMilestone(goal.id, m.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        m.completed ? "opacity-60" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        m.completed
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "border-white/20"
                      }`}>
                        {m.completed && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs ${m.completed ? "line-through text-slate-600" : "text-slate-300"}`}>{m.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
