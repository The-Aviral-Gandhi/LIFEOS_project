import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
        >
          <Sparkles className="h-5 w-5 text-white" />
        </motion.div>
        <div className="text-xs font-mono text-slate-500 animate-pulse">LOADING MODULE...</div>
      </div>
    </div>
  );
}
