import { useState } from "react";
import { GraduationCap, Plus, Check, BookOpen, Clock, Calendar } from "lucide-react";
import { motion } from "motion/react";
import type { Subject, Assignment } from "../../types";
import { Card } from "../ui/Card";
import { Input, Button, EmptyState } from "../ui/Forms";
import { Badge } from "../ui/Badge";
import { ProgressBar, ProgressRing } from "../ui/Progress";

interface StudyTrackerViewProps {
  subjects: Subject[];
  addSubject: (s: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function StudyTrackerView({ subjects, addSubject, updateSubject }: StudyTrackerViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("2026-07-10");
  const [gradeGoal, setGradeGoal] = useState("A+");
  const [hoursGoal, setHoursGoal] = useState("60");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSubject({
      id: "s-" + Date.now(),
      name: name.trim(),
      hoursSpent: 0,
      totalGoals: parseInt(hoursGoal) || 60,
      completedGoals: 0,
      examDate,
      gradeGoal,
      assignments: [],
      color: COLORS[subjects.length % COLORS.length],
    });
    setName(""); setShowForm(false);
  };

  const addStudyHours = (subjectId: string, hours: number) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;
    updateSubject(subjectId, { hoursSpent: Math.max(0, sub.hoursSpent + hours) });
  };

  const toggleAssignment = (subjectId: string, assignmentId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const assignments = sub.assignments.map(a =>
      a.id === assignmentId ? { ...a, completed: !a.completed } : a
    );
    const completedGoals = assignments.filter(a => a.completed).length;
    updateSubject(subjectId, { assignments, completedGoals });
  };

  const totalHours = subjects.reduce((a, s) => a + s.hoursSpent, 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Study Tracker</h2>
          <p className="text-xs text-slate-500 mt-1">Academic performance matrix — subject mastery & assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">TOTAL HOURS</div>
            <div className="text-lg font-black text-indigo-400 font-mono">{totalHours}h</div>
          </div>
          <Button onClick={() => setShowForm(v => !v)} icon={<Plus className="h-4 w-4" />}>Add Subject</Button>
        </div>
      </div>

      {/* Add Subject Form */}
      {showForm && (
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-4">Add New Subject</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Input label="Subject Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Graphics" required />
            <Input label="Exam Date" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
            <Input label="Grade Goal" value={gradeGoal} onChange={e => setGradeGoal(e.target.value)} placeholder="A+" />
            <Input label="Hours Target" type="number" value={hoursGoal} onChange={e => setHoursGoal(e.target.value)} min="1" />
            <Button type="submit">Add Subject</Button>
          </form>
        </Card>
      )}

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="No subjects added" description="Add your subjects to start tracking your academic progress." action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>Add Subject</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {subjects.map((sub, i) => {
            const hoursProgress = Math.min(100, Math.round((sub.hoursSpent / sub.totalGoals) * 100));
            const assignmentsDone = sub.assignments.filter(a => a.completed).length;
            const daysToExam = Math.ceil((new Date(sub.examDate).getTime() - Date.now()) / 86400000);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Subject Header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-4">
                  <ProgressRing value={hoursProgress} size={56} strokeWidth={5} color={sub.color} label={`${hoursProgress}%`} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-200 text-sm">{sub.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{sub.hoursSpent}h / {sub.totalGoals}h
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{daysToExam > 0 ? `${daysToExam}d to exam` : "Exam passed"}
                      </span>
                      <Badge variant="indigo" size="xs">Goal: {sub.gradeGoal}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Progress Bar */}
                  <ProgressBar value={hoursProgress} color="from-indigo-500 to-purple-500" height={5} showLabel />

                  {/* Log Hours */}
                  <div>
                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-2">Log Study Hours</p>
                    <div className="flex gap-2">
                      {[0.5, 1, 1.5, 2, 3].map(h => (
                        <button
                          key={h}
                          onClick={() => addStudyHours(sub.id, h)}
                          className="flex-1 py-1.5 glass rounded-lg text-[10px] font-mono font-bold text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          +{h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assignments */}
                  {sub.assignments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-2">
                        Assignments — {assignmentsDone}/{sub.assignments.length}
                      </p>
                      <div className="space-y-1.5">
                        {sub.assignments.map(a => (
                          <button
                            key={a.id}
                            onClick={() => toggleAssignment(sub.id, a.id)}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                              a.completed ? "opacity-50" : "hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              a.completed ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-white/20"
                            }`}>
                              {a.completed && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className={`text-xs flex-1 ${a.completed ? "line-through text-slate-600" : "text-slate-300"}`}>{a.title}</span>
                            <span className="text-[9px] font-mono text-slate-600">
                              {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
