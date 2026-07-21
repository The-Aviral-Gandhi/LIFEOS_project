import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          className={`input-dark w-full rounded-xl py-2.5 text-sm font-medium ${icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-red-500/50" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`input-dark w-full rounded-xl py-2.5 px-3 text-sm font-medium appearance-none cursor-pointer ${error ? "border-red-500/50" : ""} ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#1a1a2e]">{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = "", ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`input-dark w-full rounded-xl py-2.5 px-3 text-sm font-medium resize-none ${error ? "border-red-500/50" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
  secondary: "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10",
  ghost: "hover:bg-white/5 text-slate-400 hover:text-slate-200",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
};

const sizeStyles = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-sm px-6 py-3",
};

export function Button({ children, variant = "primary", size = "md", disabled, loading, onClick, type = "button", className = "", icon, fullWidth }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-600 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-400">{title}</h3>
      {description && <p className="text-xs text-slate-600 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function Skeleton({ lines = 1, className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`} />
      ))}
    </div>
  );
}
