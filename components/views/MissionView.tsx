import { useState } from "react";
import { Rocket, Plus, Clock, Check, Trash, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Mission, UserProfile } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { PriorityBadge } from "../ui/Badge";

interface MissionViewProps {
  missions: Mission[];
  toggleMission: (id: string) => void;
  addMission: (mission: Mission) => void;
  deleteMission: (id: string) => void;
  profile: UserProfile;
}

export default function MissionView({ missions, toggleMission, addMission, deleteMission, profile }: MissionViewProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("30m");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [xp, setXp] = useState("100");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMission({
      id: "m-" + Date.now(),
      title: title.trim(),
      estimatedTime: time,
      priority,
      xpReward: parseInt(xp) || 100,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
  };

  const completed = missions.filter(m => m.completed);
  const active = missions.filter(m => !m.completed);

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Today's Mission</h2>
          <p className="text-xs text-slate-500 mt-1">High-priority operational targets to execute immediately</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">ACTIVE</div>
            <div className="text-lg font-black text-white">{active.length}</div>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">DONE</div>
            <div className="text-lg font-black text-emerald-400">{completed.length}</div>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">XP EARNED</div>
            <div className="text-lg font-black text-amber-400">
              {missions.filter(m => m.completed).reduce((a, m) => a + m.xpReward, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Add Mission Form */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-400" />
          Add New Mission
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Mission Title"
              placeholder="e.g. Complete BCA revision unit 3"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="Est. Time"
              value={time}
              onChange={e => setTime(e.target.value)}
              options={[
                { value: "15m", label: "15 mins" },
                { value: "30m", label: "30 mins" },
                { value: "45m", label: "45 mins" },
                { value: "60m", label: "1 hour" },
                { value: "90m", label: "1.5 hrs" },
                { value: "120m", label: "2 hours" },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              options={[
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="XP Reward"
              type="number"
              placeholder="100"
              value={xp}
              onChange={e => setXp(e.target.value)}
              min="10"
              max="500"
            />
          </div>
          <div className="sm:col-span-1">
            <Button type="submit" fullWidth>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Missions */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">Active Missions</h3>
        {active.length === 0 ? (
          <EmptyState
            icon={<Rocket className="h-6 w-6" />}
            title="All missions completed!"
            description="Outstanding performance. Add new missions or check back tomorrow."
          />
        ) : (
          <AnimatePresence>
            {active.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-4 sm:p-5 flex items-start gap-4 group hover:border-indigo-500/30 transition-all"
              >
                <button
                  onClick={() => toggleMission(m.id)}
                  className="mt-0.5 h-6 w-6 rounded-lg border border-white/20 hover:border-indigo-400 flex items-center justify-center flex-shrink-0 transition-all hover:bg-indigo-500/10"
                  aria-label="Complete mission"
                >
                  <Check className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-50" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{m.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{m.estimatedTime}
                    </span>
                    <PriorityBadge priority={m.priority} />
                    <span className="text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                      <Zap className="h-3 w-3" />+{m.xpReward} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMission(m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Delete mission"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Completed Missions */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">Completed</h3>
          <AnimatePresence>
            {completed.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-4 flex items-start gap-4 opacity-50 group"
              >
                <button
                  onClick={() => toggleMission(m.id)}
                  className="mt-0.5 h-6 w-6 rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-400 line-through">{m.title}</p>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">+{m.xpReward} XP earned</span>
                </div>
                <button
                  onClick={() => deleteMission(m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
