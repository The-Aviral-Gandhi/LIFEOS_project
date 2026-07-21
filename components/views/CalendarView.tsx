import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion } from "motion/react";
import type { Task, Goal, Habit, Subject } from "../../types";

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  subjects: Subject[];
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ tasks, goals, habits, subjects }: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.toISOString().split("T")[0];

  // Build events map
  const events: Record<string, { label: string; color: string; done?: boolean }[]> = {};

  tasks.forEach(t => {
    if (!events[t.deadline]) events[t.deadline] = [];
    events[t.deadline].push({ label: t.title.slice(0, 20), color: "#6366f1", done: t.completed });
  });

  goals.forEach(g => {
    if (!events[g.deadline]) events[g.deadline] = [];
    events[g.deadline].push({ label: `Goal: ${g.title.slice(0, 15)}`, color: "#10b981" });
  });

  subjects.forEach(s => {
    if (!events[s.examDate]) events[s.examDate] = [];
    events[s.examDate].push({ label: `Exam: ${s.name}`, color: "#f59e0b" });
    s.assignments.forEach(a => {
      if (!events[a.dueDate]) events[a.dueDate] = [];
      events[a.dueDate].push({ label: a.title.slice(0, 20), color: "#8b5cf6", done: a.completed });
    });
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Calendar View</h2>
        <p className="text-xs text-slate-500 mt-1">Schedule overview — tasks, goals, exams, and events</p>
      </div>

      {/* Calendar Card */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Month Navigation */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <h3 className="font-bold text-slate-200 text-base">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-mono font-bold text-slate-600 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="border-b border-r border-white/[0.04] min-h-[80px]" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const dayEvents = events[dateStr] || [];
            const isPast = new Date(dateStr) < now && !isToday;

            return (
              <motion.div
                key={dateStr}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className={`border-b border-r border-white/[0.04] min-h-[80px] p-2 transition-colors ${isPast ? "opacity-60" : ""}`}
              >
                <div className={`flex items-center justify-center h-6 w-6 rounded-full mb-1 text-xs font-mono font-bold ${
                  isToday
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-500"
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <div
                      key={i}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded truncate flex items-center gap-1"
                      style={{ background: `${ev.color}20`, color: ev.color }}
                    >
                      {ev.done && <Check className="h-2.5 w-2.5 flex-shrink-0" />}
                      <span className="truncate">{ev.label}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] font-mono text-slate-600 px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { color: "#6366f1", label: "Tasks" },
          { color: "#10b981", label: "Goals" },
          { color: "#f59e0b", label: "Exams" },
          { color: "#8b5cf6", label: "Assignments" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ background: l.color }} />
            <span className="text-xs font-mono text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
