import { motion } from "motion/react";

interface ProgressRingProps {
  value: number;  // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#6366f1",
  trackColor = "rgba(255,255,255,0.05)",
  label,
  sublabel,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      {(label !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black font-mono text-white leading-none" style={{ fontSize: size * 0.22 }}>{label}</span>
          {sublabel && <span className="font-mono text-slate-500 mt-0.5" style={{ fontSize: size * 0.09 }}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  animated?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  color = "from-indigo-500 to-purple-500",
  height = 6,
  animated = true,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-[10px] font-mono text-slate-500">{value}%</span>
        </div>
      )}
      <div className="w-full bg-white/[0.06] rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
