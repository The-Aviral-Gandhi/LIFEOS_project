import { useState } from "react";
import { FolderKanban, Plus, Trash, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ProjectCard, ProjectStatus, Priority } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { PriorityBadge, Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/Progress";

interface ProjectsViewProps {
  projects: ProjectCard[];
  addProject: (p: ProjectCard) => void;
  updateProject: (id: string, updates: Partial<ProjectCard>) => void;
  deleteProject: (id: string) => void;
}

const COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: "Backlog", label: "Backlog", color: "text-slate-400" },
  { id: "In_Progress", label: "In Progress", color: "text-indigo-400" },
  { id: "Review", label: "Review", color: "text-amber-400" },
  { id: "Completed", label: "Completed", color: "text-emerald-400" },
];

const TAGS = ["Development", "Design", "Academic", "AI/ML", "Health Tech", "Research", "Marketing"];

export default function ProjectsView({ projects, addProject, updateProject, deleteProject }: ProjectsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Development");
  const [priority, setPriority] = useState<Priority>("High");
  const [dueDate, setDueDate] = useState("2026-12-31");
  const [progress, setProgress] = useState(0);
  const [column, setColumn] = useState<ProjectStatus>("Backlog");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addProject({
      id: "p-" + Date.now(),
      title: title.trim(),
      column,
      progress,
      dueDate,
      tag,
      priority,
    });
    setTitle(""); setShowForm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Project Board</h2>
          <p className="text-xs text-slate-500 mt-1">Kanban workflow — track projects from ideation to completion</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} icon={<Plus className="h-4 w-4" />}>
          New Project
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <h3 className="font-bold text-slate-200 text-sm mb-5">Add New Project</h3>
              <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-3">
                  <Input label="Project Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. LifeOS v3.0 Launch" required />
                </div>
                <Select label="Status" value={column} onChange={e => setColumn(e.target.value as any)} options={COLUMNS.map(c => ({ value: c.id, label: c.label }))} />
                <Select label="Priority" value={priority} onChange={e => setPriority(e.target.value as any)} options={[{ value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]} />
                <Select label="Tag" value={tag} onChange={e => setTag(e.target.value)} options={TAGS.map(t => ({ value: t, label: t }))} />
                <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">Progress ({progress}%)</label>
                  <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Add Project</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colProjects = projects.filter(p => p.column === col.id);
          return (
            <div key={col.id} className="glass rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase ${col.color}`}>{col.label}</span>
                  <span className="text-[10px] glass px-2 py-0.5 rounded-full font-mono text-slate-500">
                    {colProjects.length}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                {colProjects.length === 0 ? (
                  <div className="py-6 text-center text-slate-700 text-xs">Drop projects here</div>
                ) : colProjects.map((p, i) => (
                  <ProjectCardItem
                    key={p.id}
                    project={p}
                    onDelete={deleteProject}
                    onUpdateColumn={(id, col) => updateProject(id, { column: col as ProjectStatus })}
                    index={i}
                    columns={COLUMNS}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectCardItem({
  project, onDelete, onUpdateColumn, index, columns
}: {
  project: ProjectCard;
  onDelete: (id: string) => void;
  onUpdateColumn: (id: string, col: string) => void;
  index: number;
  columns: typeof COLUMNS;
}) {
  const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-light rounded-xl p-3.5 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-xs font-semibold text-slate-200 leading-snug">{project.title}</h4>
        <button
          onClick={() => onDelete(project.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
          aria-label="Delete project"
        >
          <Trash className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <Badge variant="slate" size="xs">{project.tag}</Badge>
        <PriorityBadge priority={project.priority} />
      </div>

      <ProgressBar value={project.progress} height={3} className="mb-2.5" />

      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-mono ${daysLeft < 0 ? "text-red-400" : daysLeft < 7 ? "text-amber-400" : "text-slate-600"}`}>
          {daysLeft > 0 ? `${daysLeft}d` : daysLeft === 0 ? "Today" : `${Math.abs(daysLeft)}d late`}
        </span>
        <select
          value={project.column}
          onChange={e => onUpdateColumn(project.id, e.target.value)}
          className="text-[10px] font-mono bg-transparent text-slate-500 hover:text-slate-300 cursor-pointer outline-none"
        >
          {columns.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a2e]">{c.label}</option>)}
        </select>
      </div>
    </motion.div>
  );
}
