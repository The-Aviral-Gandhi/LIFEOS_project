import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, CheckCircle, Plus, Coffee, Brain, Book, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { FocusSession } from "../../types";
import { Card } from "../ui/Card";
import { Select, Button } from "../ui/Forms";
import { Badge } from "../ui/Badge";
import { ProgressRing } from "../ui/Progress";

interface FocusModeViewProps {
  focusSessions: FocusSession[];
  addFocusSession: (session: FocusSession) => void;
}

const PRESETS = [
  { label: "Pomodoro", mins: 25, icon: Coffee, color: "#f59e0b" },
  { label: "Deep Work", mins: 90, icon: Brain, color: "#6366f1" },
  { label: "Study Block", mins: 60, icon: Book, color: "#10b981" },
  { label: "Sprint", mins: 45, icon: Laptop, color: "#8b5cf6" },
];

const CATEGORIES = [
  { value: "Studies", label: "Studies" },
  { value: "Projects", label: "Projects" },
  { value: "Deep Work", label: "Deep Work" },
  { value: "Reading", label: "Reading" },
  { value: "Exercise", label: "Exercise" },
];

export default function FocusModeView({ focusSessions, addFocusSession }: FocusModeViewProps) {
  const [duration, setDuration] = useState(25 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [category, setCategory] = useState("Studies");
  const [customMins, setCustomMins] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const start = () => { setRunning(true); setCompleted(false); };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setCompleted(false); setTimeLeft(duration); };

  const setPreset = (mins: number) => {
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
    setRunning(false);
    setCompleted(false);
    setCustomMins(mins);
  };

  const saveSession = () => {
    const durationMins = Math.round((duration - timeLeft) / 60);
    if (durationMins < 1) return;
    addFocusSession({
      id: "fs-" + Date.now(),
      timestamp: new Date().toISOString(),
      durationMinutes: durationMins,
      category,
    });
    reset();
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const totalFocusHours = Math.round(focusSessions.reduce((a, s) => a + s.durationMinutes, 0) / 60 * 10) / 10;
  const todaySessions = focusSessions.filter(s => s.timestamp.startsWith(new Date().toISOString().split("T")[0]));
  const weekSessions = focusSessions.slice(0, 14);

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Focus Mode</h2>
        <p className="text-xs text-slate-500 mt-1">Deep work engine — eliminate distractions, maximize output</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: `${totalFocusHours}h`, color: "text-indigo-400" },
          { label: "Sessions", value: focusSessions.length, color: "text-emerald-400" },
          { label: "Today", value: `${todaySessions.reduce((a, s) => a + s.durationMinutes, 0)}m`, color: "text-amber-400" },
          { label: "Avg Session", value: focusSessions.length > 0 ? `${Math.round(focusSessions.reduce((a, s) => a + s.durationMinutes, 0) / focusSessions.length)}m` : "0m", color: "text-cyan-400" },
        ].map(s => (
          <Card key={s.label} padding="sm">
            <div className="text-[10px] font-mono text-slate-600 mb-1">{s.label}</div>
            <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Timer className="h-4.5 w-4.5 text-indigo-400" />
              Focus Timer
            </h3>
          </div>

          {/* Preset buttons */}
          <div className="p-4 grid grid-cols-4 gap-2 border-b border-white/[0.06]">
            {PRESETS.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => setPreset(p.mins)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    customMins === p.mins ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" style={{ color: p.color }} />
                  <span className="text-[10px]">{p.mins}m</span>
                  <span className="text-[9px] font-mono opacity-70">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Timer Display */}
          <div className="p-8 flex flex-col items-center gap-6">
            <div className="relative">
              <ProgressRing
                value={progress}
                size={180}
                strokeWidth={8}
                color={running ? "#6366f1" : completed ? "#10b981" : "#334155"}
                label={timeStr}
                sublabel={category.toUpperCase()}
              />
            </div>

            <div className="flex gap-3">
              {!running && !completed && (
                <Button onClick={start} icon={<Play className="h-4 w-4" />} size="lg">Start Focus</Button>
              )}
              {running && (
                <Button onClick={pause} variant="secondary" icon={<Pause className="h-4 w-4" />} size="lg">Pause</Button>
              )}
              {completed && (
                <Button onClick={saveSession} icon={<CheckCircle className="h-4 w-4" />} size="lg">Save Session</Button>
              )}
              <Button onClick={reset} variant="ghost" icon={<RotateCcw className="h-4 w-4" />} size="lg">Reset</Button>
            </div>

            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
              >
                <p className="text-emerald-400 font-bold text-sm">🎉 Session Complete!</p>
                <p className="text-xs text-slate-500 mt-1">+{Math.round(customMins * 1.5)} XP earned</p>
              </motion.div>
            )}
          </div>

          <div className="px-6 pb-6">
            <Select
              label="Session Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={CATEGORIES}
            />
          </div>
        </Card>

        {/* Recent Sessions */}
        <Card padding="none">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
              Recent Sessions
            </h3>
          </div>
          <div className="p-4 space-y-2.5 max-h-[400px] overflow-y-auto scrollbar-none">
            {weekSessions.length === 0 ? (
              <div className="py-8 text-center text-slate-600 text-sm">No sessions yet. Start your first focus session!</div>
            ) : weekSessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-3.5 flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Timer className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{s.category}</span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">{s.durationMinutes}m</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                    {new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
