import { useState, useMemo } from "react";
import { CheckSquare, Plus, Trash, Check, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Task } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { PriorityBadge, Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/Progress";

interface TasksViewProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const CATEGORIES = ["All", "Studies", "Projects", "Finance", "Health", "Growth", "Other"];

export default function TasksView({ tasks, addTask, toggleTask, deleteTask }: TasksViewProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Studies");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "done">("all");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const xp = priority === "High" ? 150 : priority === "Medium" ? 80 : 40;
    addTask({
      id: "task-" + Date.now(),
      title: title.trim(),
      category,
      deadline,
      priority,
      completed: false,
      xp,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
  };

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterCat !== "All" && t.category !== filterCat) return false;
      if (filterStatus === "active" && t.completed) return false;
      if (filterStatus === "done" && !t.completed) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterCat, filterStatus, search]);

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  const isOverdue = (deadline: string, completed: boolean) => {
    return !completed && new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Tasks Database</h2>
          <p className="text-xs text-slate-500 mt-1">Granular action items that feed your discipline score</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Total", value: tasks.length, color: "text-slate-300" },
            { label: "Done", value: tasks.filter(t => t.completed).length, color: "text-emerald-400" },
            { label: "Rate", value: `${completionRate}%`, color: "text-indigo-400" },
          ].map(s => (
            <div key={s.label} className="glass px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] font-mono text-slate-600">{s.label}</div>
              <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={completionRate} showLabel height={6} />

      {/* Add Task Form */}
      <Card>
        <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-400" />
          Add New Task
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4">
            <Input
              label="Task Description"
              placeholder="e.g. Prepare semester presentation"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={CATEGORIES.filter(c => c !== "All").map(c => ({ value: c, label: c }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              options={[
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
          <div className="sm:col-span-1">
            <Button type="submit" fullWidth>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="input-dark w-full rounded-xl pl-9 pr-3 py-2.5 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "active", "done"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? "bg-indigo-600 text-white"
                  : "glass text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.slice(0, 5).map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterCat === c
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "glass text-slate-500 hover:text-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-6 w-6" />}
            title={search || filterCat !== "All" || filterStatus !== "all" ? "No matching tasks" : "No tasks yet"}
            description="Add your first task above to start tracking your progress."
          />
        ) : (
          <AnimatePresence>
            {filtered.map((task, i) => {
              const overdue = isOverdue(task.deadline, task.completed);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass rounded-xl px-4 py-3.5 flex items-center gap-3 group transition-all hover:border-white/10 ${
                    task.completed ? "opacity-50" : ""
                  } ${overdue ? "border-red-500/20" : ""}`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      task.completed
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "border-white/20 hover:border-indigo-400 hover:bg-indigo-500/10"
                    }`}
                    aria-label={task.completed ? "Unmark task" : "Complete task"}
                  >
                    {task.completed && <Check className="h-3 w-3" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-600" : "text-slate-200"}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="slate" size="xs">{task.category}</Badge>
                      <PriorityBadge priority={task.priority} />
                      {overdue && <Badge variant="rose" size="xs">Overdue</Badge>}
                      <span className="text-[10px] font-mono text-slate-600">
                        Due: {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">+{task.xp}xp</span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
