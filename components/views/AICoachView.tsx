import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Brain, Zap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ChatMessage, UserProfile, Task, Goal, Habit } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Forms";

interface AICoachViewProps {
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  profile: UserProfile;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
}

const QUICK_PROMPTS = [
  "Analyze my productivity this week",
  "How can I improve my discipline score?",
  "Create a 30-day habit challenge for me",
  "What should I focus on today?",
  "Help me set SMART goals",
  "Review my habit consistency",
];

const LOCAL_RESPONSES: Record<string, string> = {
  "default": `I'm your AI Life Coach powered by Gemini. I analyze your LifeOS data — tasks, habits, goals, focus sessions — to give you personalized guidance.

**To activate the Gemini AI backend:**
1. Add your GEMINI_API_KEY to the server environment
2. The backend will then process your requests with full context

For now, here's my assessment based on your profile:
- You have **{tasks}** tasks in your pipeline
- Your habits show **{habits}** active routines
- **{goals}** goals are in progress

**Key Recommendation:** Focus on completing your top 3 priority tasks before checking any new inputs. Build the "finish what you start" neural pathway first.`,
};

function buildSystemContext(profile: UserProfile, tasks: Task[], goals: Goal[], habits: Habit[]) {
  return `You are LifeOS AI Coach for ${profile.name}. Level ${profile.level}, Rank: ${profile.rank}, Streak: ${profile.streak} days.

Active Tasks: ${tasks.filter(t => !t.completed).length}/${tasks.length}
Goals: ${goals.map(g => `${g.title} (${g.progress}%)`).join(", ")}
Top Habits: ${habits.slice(0, 3).map(h => `${h.name} (${h.streak}d streak)`).join(", ")}

Be direct, motivational, and data-driven. Use the user's actual metrics to give specific advice. Keep responses concise and actionable.`;
}

export default function AICoachView({ chatHistory, addMessage, profile, tasks, goals, habits }: AICoachViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    const loadingMsg: ChatMessage = {
      id: "loading-" + Date.now(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isLoading: true,
    };
    addMessage(loadingMsg);

    try {
      // Try to call the Gemini API via backend
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: buildSystemContext(profile, tasks, goals, habits),
          history: chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      let aiText = "";
      if (response.ok) {
        const data = await response.json();
        aiText = data.message || data.response || "I'm here to help! Ask me anything about your goals and habits.";
      } else {
        // Fallback local response
        aiText = LOCAL_RESPONSES["default"]
          .replace("{tasks}", String(tasks.filter(t => !t.completed).length))
          .replace("{habits}", String(habits.length))
          .replace("{goals}", String(goals.filter(g => g.progress < 100).length));
      }

      // Remove loading message and add real response
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: aiText,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMsg);
    } catch {
      const fallback: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: LOCAL_RESPONSES["default"]
          .replace("{tasks}", String(tasks.filter(t => !t.completed).length))
          .replace("{habits}", String(habits.length))
          .replace("{goals}", String(goals.filter(g => g.progress < 100).length)),
        timestamp: new Date().toISOString(),
      };
      addMessage(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl pb-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-black gradient-text">AI Life Coach</h2>
        <p className="text-xs text-slate-500 mt-1">Powered by Gemini — personalized intelligence for peak performance</p>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={isLoading}
            className="px-3 py-1.5 glass rounded-full text-[10px] font-semibold text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
          {chatHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-slate-300 font-bold mb-2">AI Coach Ready</h3>
              <p className="text-slate-500 text-xs max-w-sm">
                I have full context of your LifeOS data. Ask me anything about productivity, habits, goals, or get a personalized action plan.
              </p>
            </motion.div>
          )}

          {chatHistory.filter(m => !m.isLoading).map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
                  : "bg-slate-700"
              }`}>
                {msg.role === "assistant"
                  ? <Sparkles className="h-4 w-4 text-indigo-400" />
                  : <User className="h-4 w-4 text-slate-400" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "glass text-slate-200 rounded-tl-sm"
              }`}>
                {msg.content.split("\n").map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={j} className="font-bold my-1">{line.slice(2, -2)}</p>;
                  }
                  if (line.startsWith("- ")) {
                    return <p key={j} className="pl-3 opacity-90">• {line.slice(2)}</p>;
                  }
                  return <p key={j} className={line === "" ? "h-2" : ""}>{line}</p>;
                })}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 0.2, 0.4].map(d => (
                    <motion.div
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06]">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              className="input-dark flex-1 rounded-xl py-3 px-4 text-sm"
              placeholder="Ask your AI coach anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} icon={<Send className="h-4 w-4" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
