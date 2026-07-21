import { useState } from "react";
import { PenTool, Plus, ChevronDown, ChevronUp, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { JournalEntry } from "../../types";
import { Card } from "../ui/Card";
import { TextArea, Input, Button, EmptyState } from "../ui/Forms";
import { Badge } from "../ui/Badge";

interface JournalViewProps {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
}

const MOODS = ["🚀 Focused", "😊 Happy", "💪 Energized", "😌 Calm", "😤 Frustrated", "😴 Tired", "🤔 Reflective"];

export default function JournalView({ entries, addEntry, updateEntry }: JournalViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [wins, setWins] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [lessons, setLessons] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [score, setScore] = useState(7);
  const [mood, setMood] = useState(MOODS[0]);

  const today = new Date().toISOString().split("T")[0];
  const alreadyJournaled = entries.some(e => e.date === today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      id: "j-" + Date.now(),
      date: today,
      wins, mistakes, lessons, gratitude, tomorrowPlan,
      reflectionScore: score,
      mood,
    });
    setWins(""); setMistakes(""); setLessons(""); setGratitude(""); setTomorrowPlan("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black gradient-text">Reflection Journal</h2>
          <p className="text-xs text-slate-500 mt-1">Daily wins, lessons & gratitude — the compound log of your growth</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-mono text-slate-600">ENTRIES</div>
            <div className="text-lg font-black text-indigo-400 font-mono">{entries.length}</div>
          </div>
          {!alreadyJournaled && (
            <Button onClick={() => setShowForm(v => !v)} icon={<Plus className="h-4 w-4" />}>
              Today's Entry
            </Button>
          )}
        </div>
      </div>

      {/* Daily Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-indigo-400" />
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mood Selection */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Today's Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          mood === m ? "bg-indigo-600 text-white" : "glass text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextArea label="Today's Wins 🏆" placeholder="What did you accomplish today?" value={wins} onChange={e => setWins(e.target.value)} rows={3} />
                  <TextArea label="Mistakes & Regrets 🔴" placeholder="What could you have done better?" value={mistakes} onChange={e => setMistakes(e.target.value)} rows={3} />
                  <TextArea label="Lessons Learned 💡" placeholder="What insight did today bring?" value={lessons} onChange={e => setLessons(e.target.value)} rows={3} />
                  <TextArea label="Gratitude 🙏" placeholder="What are you grateful for today?" value={gratitude} onChange={e => setGratitude(e.target.value)} rows={3} />
                  <TextArea label="Tomorrow's Plan 🚀" placeholder="Top 3 priorities for tomorrow" value={tomorrowPlan} onChange={e => setTomorrowPlan(e.target.value)} rows={3} className="sm:col-span-2" />
                </div>

                {/* Reflection Score */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Reflection Score: <span className="text-indigo-400">{score}/10</span>
                  </label>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScore(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          n <= score ? "bg-indigo-600 text-white" : "glass text-slate-600"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit">Save Entry (+50 XP)</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      {entries.length === 0 ? (
        <EmptyState
          icon={<PenTool className="h-6 w-6" />}
          title="No journal entries yet"
          description="Start your daily reflection practice for compound growth."
          action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>Write First Entry</Button>}
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry, i) => {
            const isExpanded = expandedId === entry.id;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full px-5 py-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedId(prev => prev === entry.id ? null : entry.id)}
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <PenTool className="h-4.5 w-4.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-200">
                          {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </span>
                        <Badge variant="slate" size="xs">{entry.mood}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: entry.reflectionScore }, (_, i) => (
                            <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                          ))}
                          {Array.from({ length: 10 - entry.reflectionScore }, (_, i) => (
                            <Star key={i} className="h-3 w-3 text-slate-700" />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{entry.reflectionScore}/10</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0 mt-1" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
                        {[
                          { label: "Wins 🏆", content: entry.wins },
                          { label: "Mistakes 🔴", content: entry.mistakes },
                          { label: "Lessons 💡", content: entry.lessons },
                          { label: "Gratitude 🙏", content: entry.gratitude },
                          { label: "Tomorrow's Plan 🚀", content: entry.tomorrowPlan, wide: true },
                        ].map(({ label, content, wide }) => content ? (
                          <div key={label} className={wide ? "sm:col-span-2" : ""}>
                            <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
                          </div>
                        ) : null)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
