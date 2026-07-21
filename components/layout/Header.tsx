import { Bell, Search, Menu, Brain } from "lucide-react";
import type { UserProfile, TabId } from "../../types";

interface HeaderProps {
  currentTab: TabId;
  profile: UserProfile;
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const tabLabels: Record<TabId, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your cognitive command center" },
  mission: { title: "Today's Mission", subtitle: "High-priority operational targets" },
  tasks: { title: "Tasks Database", subtitle: "Granular action items & ledger" },
  goals: { title: "Goals Matrix", subtitle: "Long-term objectives & milestones" },
  habits: { title: "Habit Compounding", subtitle: "Atomic routines rewiring your neural pathways" },
  studies: { title: "Study Tracker", subtitle: "Academic performance & subject mastery" },
  focus: { title: "Focus Mode", subtitle: "Deep work sessions & Pomodoro engine" },
  projects: { title: "Project Board", subtitle: "Kanban workflow & project management" },
  health: { title: "Health Metrics", subtitle: "Physical vitality & wellness tracking" },
  finance: { title: "Finance Hub", subtitle: "Income, expenses & financial clarity" },
  journal: { title: "Reflection Journal", subtitle: "Daily wins, lessons & gratitude log" },
  analytics: { title: "Analytics Engine", subtitle: "Performance metrics & growth insights" },
  achievements: { title: "Achievements", subtitle: "Unlocked badges & milestone rewards" },
  coach: { title: "AI Coach", subtitle: "Powered by AI · Personal intelligence" },
  calendar: { title: "Calendar View", subtitle: "Schedule overview & event planning" },
  settings: { title: "Settings", subtitle: "Preferences & system configuration" },
};

export default function Header({ currentTab, profile, onMenuClick }: HeaderProps) {
  const { title, subtitle } = tabLabels[currentTab] ?? { title: "LifeOS", subtitle: "" };
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <header className="sticky top-0 z-40 bg-[#08080f]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-100 leading-tight truncate">{title}</h2>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className="hidden md:block text-xs font-mono text-slate-600">{today}</span>

        <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Search...</span>
          <span className="text-[10px] font-mono text-slate-700 bg-white/[0.04] px-1.5 py-0.5 rounded">⌘K</span>
        </div>

        <button
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-7 w-7 rounded-lg object-cover border border-white/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10">
              <span className="text-xs font-bold text-white">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <Brain className="h-3.5 w-3.5" />}
              </span>
            </div>
          )}
          <span className="hidden sm:block text-xs font-semibold text-slate-300 max-w-[100px] truncate">
            {profile.name || "LifeOS User"}
          </span>
        </div>
      </div>
    </header>
  );
}
