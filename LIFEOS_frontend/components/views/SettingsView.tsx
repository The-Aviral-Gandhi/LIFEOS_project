import { useState } from "react";
import { Settings, User, Bell, Palette, Database, Shield, Trash2, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../../types";
import { Card } from "../ui/Card";
import { Input, Button } from "../ui/Forms";

interface SettingsViewProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

export default function SettingsView({ profile, updateProfile, onLogout }: SettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Preferences & system configuration</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-400" />
          Profile Settings
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          {profile.avatar && (
            <div className="flex items-center gap-4 mb-4">
              <img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-2xl object-cover border border-white/10" />
              <div>
                <p className="font-bold text-slate-200">{profile.name || "User"}</p>
                <p className="text-xs text-slate-500 font-mono">Level {profile.level} · {profile.rank}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Avatar URL" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <Button type="submit">
            {saved ? "✓ Saved!" : "Save Changes"}
          </Button>
        </form>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Palette className="h-4 w-4 text-purple-400" />
          Appearance
        </h3>
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-3">Theme</label>
          <div className="flex gap-3">
            {[
              { id: "dark" as const, label: "Dark", icon: Moon },
              { id: "light" as const, label: "Light", icon: Sun },
              { id: "system" as const, label: "System", icon: Monitor },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => updateProfile({ theme: id })}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  profile.theme === id
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                    : "glass text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          Notifications
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-200">Push Notifications</p>
            <p className="text-xs text-slate-500 mt-0.5">Get reminded about tasks, habits, and goals</p>
          </div>
          <button
            onClick={() => updateProfile({ notifications: !profile.notifications })}
            className={`relative h-6 w-11 rounded-full transition-all ${profile.notifications ? "bg-indigo-600" : "bg-white/10"}`}
          >
            <motion.div
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
              animate={{ left: profile.notifications ? "calc(100% - 22px)" : "2px" }}
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
          </button>
        </div>
      </Card>

      {/* Account Stats */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          Account Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Level", value: String(profile.level), color: "text-indigo-400" },
            { label: "Total XP", value: `${profile.xp.toLocaleString()}`, color: "text-amber-400" },
            { label: "Day Streak", value: `${profile.streak}`, color: "text-emerald-400" },
            { label: "Rank", value: profile.rank, color: "text-purple-400" },
            { label: "Joined", value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—", color: "text-cyan-400" },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-3">
              <div className="text-[10px] font-mono text-slate-600 mb-1">{s.label}</div>
              <div className={`text-sm font-black font-mono ${s.color}`}>{s.value || "—"}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-400" />
          Data Management
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-400">Sign Out</p>
              <p className="text-xs text-slate-500">Log out from your LifeOS account</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout} icon={<LogOut className="h-3.5 w-3.5" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <p className="text-[10px] font-mono text-slate-700">LifeOS v3.0 · Cognitive Engine · Your AI Operating System for Life</p>
      </div>
    </div>
  );
}
