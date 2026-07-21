import { useState, memo, useMemo } from "react";
import {
  Trophy, Flame, CheckCircle, Zap, Shield, Target,
  Clock, TrendingUp, Brain, Activity, BookOpen, Rocket,
  Star, Sun, Dumbbell, BookOpenCheck, Droplets, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { UserProfile, Mission, Goal, Habit, FocusSession, Task, DisciplineItem } from "../../types";
import { ProgressRing, ProgressBar } from "../ui/Progress";
import { Card } from "../ui/Card";

interface DashboardViewProps {
  profile: UserProfile;
  missions: Mission[];
  toggleMission: (id: string) => void;
  tasksCount: { total: number; completed: number };
  goals: Goal[];
  habits: Habit[];
  disciplines: DisciplineItem[];
  toggleDiscipline: (id: string) => void;
  focusSessions: FocusSession[];
  tasks: Task[];
  updateXP: (amount: number) => void;
}

const iconMap: Record<string, React.ElementType> = {
  sun: Sun, dumbbell: Dumbbell, book: BookOpen, bookopen: BookOpenCheck,
  droplets: Droplets, zap: Zap
};

function ScoreCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = {
    indigo: "#6366f1", emerald: "#10b981", amber: "#f59e0b",
    rose: "#f43f5e", cyan: "#06b6d4", purple: "#8b5cf6",
  };
  return (
    <motion.div
      className="glass rounded-2xl p-4 flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ProgressRing
        value={value}
        size={88}
        strokeWidth={6}
        color={colors[color]}
        label={String(value)}
        sublabel="SCORE"
      />
      <div className="text-center">
        <div className={`flex items-center justify-center gap-1.5 mb-1`} style={{ color: colors[color] }}>
          {icon}
        </div>
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

const DashboardView = memo(function DashboardView({
  profile, missions, toggleMission, tasksCount, goals, habits,
  disciplines, toggleDiscipline, focusSessions, tasks, updateXP
}: DashboardViewProps) {

  // ─── Computed Scores ─────────────────────────────────────
  const scores = useMemo(() => {
    // Productivity: based on tasks completed today + missions
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 50;
    const completedMissions = missions.filter(m => m.completed).length;
    const missionRate = missions.length > 0 ? (completedMissions / missions.length) * 100 : 50;
    const productivity = Math.round((taskRate * 0.6) + (missionRate * 0.4));

    // Discipline: based on disciplines completed today
    const discWeight = disciplines.reduce((acc, d) => acc + (d.completed ? d.weight : 0), 0);
    const discipline = Math.min(100, discWeight);

    // Focus: based on recent focus sessions
    const recentSessions = focusSessions.slice(0, 7);
    const totalMins = recentSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const focus = Math.min(100, Math.round((totalMins / 420) * 100)); // 420 = 7 × 60min target

    // Habits: based on streak average
    const avgStreak = habits.length > 0
      ? habits.reduce((acc, h) => acc + h.streak, 0) / habits.length
      : 0;
    const habitScore = Math.min(100, Math.round(avgStreak * 3));

    // Goals progress
    const avgGoal = goals.length > 0
      ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length
      : 50;

    // Overall life score
    const overall = Math.round(
      productivity * 0.25 + discipline * 0.25 + focus * 0.20 +
      habitScore * 0.15 + avgGoal * 0.15
    );

    return { productivity, discipline, focus, habits: habitScore, goals: Math.round(avgGoal), overall };
  }, [tasks, missions, disciplines, focusSessions, habits, goals]);

  const xpPercent = Math.round((profile.xp / profile.maxXp) * 100);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* ── Hero Section ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f1e 0%, #1a1040 50%, #0f1628 100%)" }}
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Level {profile.level} · {profile.rank}
                </span>
                <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                  {profile.streak} Day Streak 🔥
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black gradient-text mb-2">
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}{profile.name ? `, ${profile.name}` : ""} 👋
              </h1>
              <p className="text-sm text-slate-400 max-w-lg">
                Compound growth is active. Your discipline score is at{" "}
                <span className="text-indigo-400 font-semibold">{scores.discipline}%</span> today.
                Maintain sequential momentum to advance your cognitive capacity.
              </p>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-4 glass px-6 py-4 rounded-2xl self-start lg:self-auto">
              <Trophy className="h-10 w-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
              <div className="font-mono">
                <span className="block text-[10px] text-slate-500 tracking-wider">AGGREGATE XP</span>
                <span className="block text-2xl font-black text-white">{profile.xp.toLocaleString()}</span>
                <span className="block text-[10px] text-slate-500">of {profile.maxXp.toLocaleString()} · Level {profile.level}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
              <span>Level {profile.level}</span>
              <span className="text-indigo-400">{xpPercent}% to Level {profile.level + 1}</span>
              <span>Level {profile.level + 1}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #06b6d4, #6366f1, #8b5cf6)" }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Score Cards Row ───────────────────────────────── */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-indigo-500" />
          Performance Scores
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <ScoreCard label="Overall" value={scores.overall} color="indigo" icon={<Star className="h-4 w-4" />} />
          <ScoreCard label="Productivity" value={scores.productivity} color="emerald" icon={<TrendingUp className="h-4 w-4" />} />
          <ScoreCard label="Discipline" value={scores.discipline} color="amber" icon={<Shield className="h-4 w-4" />} />
          <ScoreCard label="Focus" value={scores.focus} color="cyan" icon={<Brain className="h-4 w-4" />} />
          <ScoreCard label="Habits" value={scores.habits} color="purple" icon={<Activity className="h-4 w-4" />} />
          <ScoreCard label="Goals" value={scores.goals} color="rose" icon={<Target className="h-4 w-4" />} />
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Discipline Engine — spans 7 */}
        <div className="lg:col-span-7">
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Consistency Core
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Flame className="h-4.5 w-4.5 text-amber-500" />
                  Discipline Engine
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-600">DAILY SCORE</div>
                <div className="text-xl font-black text-amber-400">{scores.discipline}%</div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <ProgressBar value={scores.discipline} color="from-amber-500 to-orange-500" height={6} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {disciplines.map((disc) => {
                  const Icon = iconMap[disc.icon || "zap"] || Zap;
                  return (
                    <motion.button
                      key={disc.id}
                      onClick={() => toggleDiscipline(disc.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        disc.completed
                          ? "bg-indigo-500/10 border-indigo-500/20 text-slate-200"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                          disc.completed
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-white/20 bg-white/[0.03]"
                        }`}>
                          {disc.completed
                            ? <Check className="h-3.5 w-3.5" />
                            : <Icon className="h-3 w-3 text-slate-500" />
                          }
                        </div>
                        <span className="text-xs font-semibold">{disc.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 flex-shrink-0 ml-2">+{disc.weight}pts</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats — spans 5 */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm" glow="indigo">
              <div className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Tasks Today</div>
              <div className="text-2xl font-black text-white font-mono">
                {tasksCount.completed}<span className="text-slate-600 text-sm">/{tasksCount.total}</span>
              </div>
              <ProgressBar
                value={tasksCount.total > 0 ? Math.round((tasksCount.completed / tasksCount.total) * 100) : 0}
                height={3}
                className="mt-2"
              />
            </Card>
            <Card padding="sm" glow="emerald">
              <div className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Active Goals</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{goals.filter(g => g.progress < 100).length}</div>
              <div className="text-[10px] text-slate-600 mt-1">{goals.filter(g => g.progress === 100).length} completed</div>
            </Card>
            <Card padding="sm" glow="amber">
              <div className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Habits Active</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{habits.length}</div>
              <div className="text-[10px] text-slate-600 mt-1">Avg streak: {habits.length > 0 ? Math.round(habits.reduce((a, h) => a + h.streak, 0) / habits.length) : 0}d</div>
            </Card>
            <Card padding="sm">
              <div className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Focus Hours</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {Math.round(focusSessions.slice(0, 7).reduce((a, s) => a + s.durationMinutes, 0) / 60 * 10) / 10}h
              </div>
              <div className="text-[10px] text-slate-600 mt-1">This week</div>
            </Card>
          </div>

          {/* Top Habits */}
          <Card padding="sm">
            <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="h-3 w-3" />
              Top Habits
            </div>
            <div className="space-y-2.5">
              {habits.slice(0, 3).map(h => (
                <div key={h.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[160px]">{h.name}</span>
                    <span className="text-[10px] font-mono text-amber-400 flex-shrink-0 ml-2">🔥 {h.streak}d</span>
                  </div>
                  <ProgressBar
                    value={Math.min(100, Math.round((h.streak / 30) * 100))}
                    color="from-indigo-500 to-purple-500"
                    height={3}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Mission Center ────────────────────────────────── */}
      <Card padding="none">
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Rocket className="h-4.5 w-4.5 text-indigo-400" />
              Daily Mission Center
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">High-priority operational targets</p>
          </div>
          <div className="glass px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-slate-300">
            {missions.filter(m => m.completed).length}/{missions.length}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {missions.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-600 text-sm">No missions yet. Add from Today's Mission tab.</div>
          ) : missions.map((mission, i) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                mission.completed
                  ? "bg-white/[0.02] border-white/[0.04] opacity-60"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/30"
              }`}
            >
              <button
                onClick={() => toggleMission(mission.id)}
                className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  mission.completed
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "border-white/20 hover:border-indigo-400"
                }`}
                aria-label={mission.completed ? "Unmark mission" : "Complete mission"}
              >
                {mission.completed && <Check className="h-3 w-3" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${mission.completed ? "line-through text-slate-600" : "text-slate-200"}`}>
                  {mission.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{mission.estimatedTime}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    mission.priority === "High" ? "badge-high" :
                    mission.priority === "Medium" ? "badge-medium" : "badge-low"
                  }`}>{mission.priority}</span>
                  <span className="text-[10px] font-mono text-indigo-400 ml-auto">+{mission.xpReward}xp</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default DashboardView;
