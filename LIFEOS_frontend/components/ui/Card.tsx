import type { ReactNode } from "react";
import { motion } from "motion/react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: "indigo" | "emerald" | "amber" | "none";
  hover?: boolean;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg" | "none";
}

const glowMap = {
  indigo: "hover:shadow-indigo-500/10 hover:border-indigo-500/20",
  emerald: "hover:shadow-emerald-500/10 hover:border-emerald-500/20",
  amber: "hover:shadow-amber-500/10 hover:border-amber-500/20",
  none: "",
};

const padMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className = "", glow = "none", hover = true, onClick, padding = "md" }: CardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl transition-all duration-300 ${padMap[padding]} ${hover ? "hover:bg-white/[0.05]" : ""} ${glow !== "none" ? `hover:shadow-lg ${glowMap[glow]}` : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -1 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  color?: string;
  trend?: number;
}

export function StatCard({ label, value, sub, icon, color = "text-indigo-400", trend }: StatCardProps) {
  return (
    <Card glow="indigo" hover>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <div className={`${color}`}>{icon}</div>}
      </div>
      <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
      {trend !== undefined && (
        <div className={`text-xs font-mono mt-2 ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
        </div>
      )}
    </Card>
  );
}
