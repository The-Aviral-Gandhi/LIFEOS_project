import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "indigo" | "emerald" | "amber" | "rose" | "slate" | "cyan" | "purple";
  size?: "xs" | "sm";
  className?: string;
}

const variantMap = {
  indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  slate: "bg-white/5 text-slate-400 border-white/10",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const sizeMap = {
  xs: "text-[9px] px-1.5 py-0.5",
  sm: "text-[10px] px-2 py-0.5",
};

export function Badge({ children, variant = "indigo", size = "sm", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold border rounded-full uppercase tracking-wider ${variantMap[variant]} ${sizeMap[size]} ${className}`}>
      {children}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "High" | "Medium" | "Low";
  size?: "xs" | "sm";
}

export function PriorityBadge({ priority, size = "xs" }: PriorityBadgeProps) {
  const map = {
    High: "rose" as const,
    Medium: "amber" as const,
    Low: "emerald" as const,
  };
  return <Badge variant={map[priority]} size={size}>{priority}</Badge>;
}
