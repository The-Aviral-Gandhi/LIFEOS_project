import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid, Rocket, CheckSquare, Target, Repeat, GraduationCap,
  Timer, FolderKanban, Coins, Heart, PenTool, BarChart3,
  Award, Sparkles, Calendar, Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import type { UserProfile, TabId } from "../../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: UserProfile;
  collapsed: boolean;
  toggleCollapse: () => void;
}

const navItems: { id: TabId; label: string; icon: React.ElementType; badge?: string; glow?: boolean; group?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, group: "Core" },
  { id: "mission", label: "Today's Mission", icon: Rocket, badge: "Aura", group: "Core" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, group: "Core" },
  { id: "goals", label: "Goals", icon: Target, group: "Core" },
  { id: "habits", label: "Habits", icon: Repeat, group: "Growth" },
  { id: "studies", label: "Study Tracker", icon: GraduationCap, group: "Growth" },
  { id: "focus", label: "Focus Mode", icon: Timer, group: "Growth" },
  { id: "projects", label: "Projects", icon: FolderKanban, group: "Growth" },
  { id: "health", label: "Health", icon: Heart, group: "Life" },
  { id: "finance", label: "Finance", icon: Coins, group: "Life" },
  { id: "journal", label: "Journal", icon: PenTool, group: "Life" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Insights" },
  { id: "achievements", label: "Achievements", icon: Award, group: "Insights" },
  { id: "coach", label: "AI Coach", icon: Sparkles, glow: true, group: "Insights" },
  { id: "calendar", label: "Calendar", icon: Calendar, group: "Insights" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

const groups = ["Core", "Growth", "Life", "Insights", "System"];

export default function Sidebar({ currentTab, setCurrentTab, profile, collapsed, toggleCollapse }: SidebarProps) {
  const xpPercent = Math.round((profile.xp / profile.maxXp) * 100);

  return (
    <nav className={`fixed left-0 top-0 h-screen bg-[#0d0d1a] border-r border-white/[0.06] shadow-2xl flex flex-col z-50 transition-all duration-300 overflow-hidden ${collapsed ? "w-16" : "w-72"}`}>
      {/* Brand */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"} py-5 border-b border-white/[0.06]`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight gradient-text leading-none">LifeOS</h1>
              <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400/60">Cognitive Engine v3.0</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Profile Card */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3.5 glass rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative">
            <div className="relative flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10">
                  <span className="text-sm font-bold text-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "L"}
                  </span>
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#0d0d1a] animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm truncate">{profile.name || "LifeOS User"}</span>
                <span className="text-[10px] text-indigo-400 font-mono">Lv.{profile.level}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate font-mono">{profile.rank || "Rookie"}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[9px] font-mono mb-1">
              <span className="text-slate-600">XP</span>
              <span className="text-indigo-400">{profile.xp}/{profile.maxXp}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 space-y-5">
        {groups.map(group => {
          const items = navItems.filter(n => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              {!collapsed && (
                <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150 relative group
                        ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                        ${isActive
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                        }`}
                      whileTap={{ scale: 0.97 }}
                      aria-label={item.label}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <div className={`relative flex-shrink-0 p-1.5 rounded-lg transition-colors
                        ${isActive ? "bg-indigo-500/20 text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {item.glow && (
                          <span className="absolute top-0 right-0 h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="text-xs font-semibold flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed ? (
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-600">
            STREAK <span className="text-amber-500 font-bold">{profile.streak}d</span>
          </span>
          <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            SYNAPSE ON
          </span>
        </div>
      ) : (
        <button
          onClick={toggleCollapse}
          className="mx-auto mb-4 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}
