import { Award, Trophy, Shield, Flame, Target, Repeat, Timer, BookOpen, Coins, Star, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { Badge, UserProfile, Task, Habit, FocusSession } from "../../types";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/Progress";

interface AchievementsViewProps {
  badges: Badge[];
  profile: UserProfile;
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
}

const iconMap: Record<string, React.ElementType> = {
  flame: Flame, shield: Shield, timer: Timer, target: Target,
  trophy: Trophy, repeat: Repeat, coins: Coins, graduation: BookOpen, award: Award, star: Star,
};

const tierColors: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Platinum: "#e5e4e2",
};

const tierGlow: Record<string, string> = {
  Bronze: "rgba(205, 127, 50, 0.2)",
  Silver: "rgba(192, 192, 192, 0.2)",
  Gold: "rgba(255, 215, 0, 0.2)",
  Platinum: "rgba(229, 228, 226, 0.2)",
};

export default function AchievementsView({ badges, profile, tasks, habits, focusSessions }: AchievementsViewProps) {
  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);
  const totalXP = unlocked.reduce((a, b) => a + b.xpReward, 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Achievements</h2>
        <p className="text-xs text-slate-500 mt-1">Unlocked badges & milestone rewards — proof of your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Badges Earned", value: unlocked.length, sub: `of ${badges.length}`, color: "text-amber-400" },
          { label: "Total XP", value: `${totalXP.toLocaleString()}`, sub: "from achievements", color: "text-indigo-400" },
          { label: "Current Level", value: `${profile.level}`, sub: profile.rank, color: "text-purple-400" },
          { label: "Day Streak", value: `${profile.streak}`, sub: "consecutive days", color: "text-emerald-400" },
        ].map(s => (
          <Card key={s.label} padding="sm">
            <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-mono text-slate-600 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-slate-600">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Progress to next unlock */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-4">Badge Progress</h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-black text-indigo-400 font-mono">{unlocked.length}/{badges.length}</div>
          <div className="flex-1">
            <ProgressBar
              value={Math.round((unlocked.length / badges.length) * 100)}
              color="from-amber-500 to-yellow-400"
              height={8}
            />
            <p className="text-[10px] font-mono text-slate-600 mt-1">{Math.round((unlocked.length / badges.length) * 100)}% achievement completion</p>
          </div>
        </div>
      </Card>

      {/* Unlocked Badges */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest mb-4">Unlocked ({unlocked.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest mb-4">Locked ({locked.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} locked />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge, index, locked = false }: { badge: Badge; index: number; locked?: boolean }) {
  const Icon = iconMap[badge.icon] || Award;
  const color = tierColors[badge.tier];
  const glow = tierGlow[badge.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass rounded-2xl p-5 transition-all ${locked ? "opacity-50" : "hover:border-white/10"}`}
      style={{ boxShadow: locked ? "none" : `0 0 20px ${glow}` }}
    >
      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {locked ? (
            <Lock className="h-5 w-5 text-slate-600" />
          ) : (
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-200 text-sm">{badge.title}</h4>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase"
              style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}
            >
              {badge.tier}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">{badge.description}</p>
          {!locked && badge.unlockedAt && (
            <p className="text-[9px] font-mono text-slate-600 mt-1.5">
              Unlocked {new Date(badge.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
          {locked && (
            <p className="text-[9px] font-mono text-slate-600 mt-1.5">Req: {badge.requirement}</p>
          )}
        </div>
      </div>
      {!locked && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-600">{badge.category}</span>
          <span className="text-[10px] font-mono font-bold" style={{ color }}>+{badge.xpReward} XP</span>
        </div>
      )}
    </motion.div>
  );
}
