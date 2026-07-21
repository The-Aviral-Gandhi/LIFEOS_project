import { useState, useMemo } from "react";
import { Coins, Plus, Trash, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Transaction } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button, EmptyState } from "../ui/Forms";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/Progress";

interface FinanceViewProps {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const INCOME_CATS = ["Freelance", "Salary", "Investment", "Gift", "Other Income"];
const EXPENSE_CATS = ["Education", "Food", "Health", "Tech", "Transport", "Entertainment", "Utilities", "Shopping", "Other"];

export default function FinanceView({ transactions, addTransaction, deleteTransaction }: FinanceViewProps) {
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterType, setFilterType] = useState<"all" | "Income" | "Expense">("all");

  const cats = type === "Income" ? INCOME_CATS : EXPENSE_CATS;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    addTransaction({
      id: "tr-" + Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
    });
    setDescription(""); setAmount("");
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === "Income").reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "Expense").reduce((a, t) => a + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
    return { income, expenses, balance, savingsRate };
  }, [transactions]);

  const filtered = filterType === "all" ? transactions : transactions.filter(t => t.type === filterType);

  const categoryBreakdown = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === "Expense").forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
    const total = Object.values(expensesByCategory).reduce((a, v) => a + v, 0);
    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amount]) => ({ cat, amount, percent: total > 0 ? Math.round((amount / total) * 100) : 0 }));
  }, [transactions]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Finance Hub</h2>
        <p className="text-xs text-slate-500 mt-1">Income, expenses & financial clarity at a glance</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" glow="emerald">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-mono text-slate-600 uppercase">Income</span>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">{fmt(stats.income)}</div>
        </Card>
        <Card padding="sm" glow="rose">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-[10px] font-mono text-slate-600 uppercase">Expenses</span>
          </div>
          <div className="text-xl font-black text-red-400 font-mono">{fmt(stats.expenses)}</div>
        </Card>
        <Card padding="sm" glow="indigo">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-mono text-slate-600 uppercase">Balance</span>
          </div>
          <div className={`text-xl font-black font-mono ${stats.balance >= 0 ? "text-indigo-400" : "text-red-400"}`}>{fmt(stats.balance)}</div>
        </Card>
        <Card padding="sm" glow="amber">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-mono text-slate-600 uppercase">Savings Rate</span>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">{stats.savingsRate}%</div>
          <ProgressBar value={Math.max(0, stats.savingsRate)} color="from-amber-500 to-yellow-500" height={3} className="mt-2" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            Add Transaction
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            {/* Income/Expense Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
              {(["Income", "Expense"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setCategory(t === "Income" ? INCOME_CATS[0] : EXPENSE_CATS[0]); }}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                    type === t
                      ? t === "Income" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t === "Income" ? "+" : "-"} {t}
                </button>
              ))}
            </div>
            <Input label="Description" placeholder="e.g. Freelance project payment" value={description} onChange={e => setDescription(e.target.value)} required />
            <Input label="Amount (₹)" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
            <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={cats.map(c => ({ value: c, label: c }))} />
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Button type="submit" fullWidth>Add Transaction</Button>
          </form>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5">Expense Breakdown</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-slate-600 text-sm">No expense data yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(({ cat, amount: amt, percent }) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-300">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{percent}%</span>
                      <span className="text-xs font-mono text-slate-300">{fmt(amt)}</span>
                    </div>
                  </div>
                  <ProgressBar value={percent} color="from-red-500 to-pink-500" height={4} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Transaction List */}
        <Card padding="none" className="lg:col-span-1">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm">Transactions</h3>
            <div className="flex gap-1">
              {["all", "Income", "Expense"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f as any)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    filterType === f ? "bg-white/10 text-white" : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto scrollbar-none">
            {filtered.length === 0 ? (
              <EmptyState icon={<Coins className="h-5 w-5" />} title="No transactions" />
            ) : filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-light rounded-xl px-3 py-2.5 flex items-center gap-3 group"
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === "Income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {tx.type === "Income" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="slate" size="xs">{tx.category}</Badge>
                    <span className="text-[9px] font-mono text-slate-600">{new Date(tx.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black font-mono ${tx.type === "Income" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type === "Income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                    aria-label="Delete"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
