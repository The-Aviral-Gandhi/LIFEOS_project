import { useState } from "react";
import { Heart, Plus, Check, Droplets, Moon, Footprints, Flame as FlameIcon, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { HealthLog, Workout } from "../../types";
import { Card } from "../ui/Card";
import { Input, Select, Button } from "../ui/Forms";
import { Badge } from "../ui/Badge";
import { ProgressBar, ProgressRing } from "../ui/Progress";

interface HealthViewProps {
  healthLog: HealthLog;
  updateHealthLog: (updates: Partial<HealthLog>) => void;
  addWorkout: (workout: Workout) => void;
  toggleWorkout: (id: string) => void;
}

export default function HealthView({ healthLog, updateHealthLog, addWorkout, toggleWorkout }: HealthViewProps) {
  const [workoutType, setWorkoutType] = useState("Running");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [workoutIntensity, setWorkoutIntensity] = useState<"High" | "Medium" | "Low">("Medium");
  const [workoutCalories, setWorkoutCalories] = useState("250");

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkout({
      id: "w-" + Date.now(),
      type: workoutType,
      durationMinutes: parseInt(workoutDuration) || 30,
      intensity: workoutIntensity,
      calories: parseInt(workoutCalories) || 250,
      completed: false,
      timestamp: new Date().toISOString(),
    });
  };

  const waterPercent = Math.min(100, (healthLog.waterIntakeLiters / 3) * 100);
  const sleepScore = healthLog.sleepQuality;
  const stepsPercent = Math.min(100, (healthLog.steps / 10000) * 100);

  const overallHealthScore = Math.round(
    (sleepScore * 0.3) + (waterPercent * 0.2) + (stepsPercent * 0.2) +
    (healthLog.workouts.filter(w => w.completed).length > 0 ? 30 : 10)
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black gradient-text">Health Metrics</h2>
        <p className="text-xs text-slate-500 mt-1">Physical vitality dashboard — track sleep, hydration, movement</p>
      </div>

      {/* Overview Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="flex flex-col items-center">
          <ProgressRing value={overallHealthScore} size={80} strokeWidth={6} color="#10b981" label={String(overallHealthScore)} sublabel="HEALTH" />
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Overall</p>
        </Card>
        <Card padding="sm" className="flex flex-col items-center">
          <ProgressRing value={sleepScore} size={80} strokeWidth={6} color="#6366f1" label={String(sleepScore)} sublabel="SLEEP" />
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Sleep Quality</p>
        </Card>
        <Card padding="sm" className="flex flex-col items-center">
          <ProgressRing value={waterPercent} size={80} strokeWidth={6} color="#06b6d4" label={`${healthLog.waterIntakeLiters}L`} sublabel="HYDRATION" />
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Water Intake</p>
        </Card>
        <Card padding="sm" className="flex flex-col items-center">
          <ProgressRing value={stepsPercent} size={80} strokeWidth={6} color="#f59e0b" label={`${(healthLog.steps / 1000).toFixed(1)}k`} sublabel="STEPS" />
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Daily Steps</p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            Daily Health Log
          </h3>
          <div className="space-y-4">
            {/* Sleep */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{healthLog.sleepHours}h quality {healthLog.sleepQuality}%</span>
                </div>
              </div>
              <ProgressBar value={healthLog.sleepQuality} color="from-indigo-500 to-purple-500" height={5} />
              <div className="flex gap-2 mt-2">
                {[6, 6.5, 7, 7.5, 8, 8.5, 9].map(h => (
                  <button
                    key={h}
                    onClick={() => updateHealthLog({ sleepHours: h })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${healthLog.sleepHours === h ? "bg-indigo-600 text-white" : "glass text-slate-500 hover:text-slate-300"}`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Water */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300">Hydration</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{healthLog.waterIntakeLiters.toFixed(1)} / 3.0 L</span>
              </div>
              <ProgressBar value={waterPercent} color="from-cyan-500 to-blue-500" height={5} />
              <div className="flex gap-2 mt-2">
                {[0.25, 0.5, 0.75, 1].map(inc => (
                  <button
                    key={inc}
                    onClick={() => updateHealthLog({ waterIntakeLiters: Math.min(5, healthLog.waterIntakeLiters + inc) })}
                    className="flex-1 py-1.5 glass rounded-lg text-[10px] font-mono text-cyan-400 hover:bg-cyan-500/10 transition-all"
                  >
                    +{inc}L
                  </button>
                ))}
                <button
                  onClick={() => updateHealthLog({ waterIntakeLiters: 0 })}
                  className="px-3 py-1.5 glass rounded-lg text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">Steps</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{healthLog.steps.toLocaleString()} / 10,000</span>
              </div>
              <ProgressBar value={stepsPercent} color="from-amber-500 to-orange-500" height={5} />
              <div className="flex gap-2 mt-2">
                {[1000, 2500, 5000].map(s => (
                  <button
                    key={s}
                    onClick={() => updateHealthLog({ steps: Math.min(25000, healthLog.steps + s) })}
                    className="flex-1 py-1.5 glass rounded-lg text-[10px] font-mono text-amber-400 hover:bg-amber-500/10 transition-all"
                  >
                    +{s >= 1000 ? `${s / 1000}k` : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Calories */}
            <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <FlameIcon className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-semibold text-slate-300">Calories Burned</span>
              </div>
              <span className="text-sm font-black font-mono text-orange-400">{healthLog.caloriesBurned} kcal</span>
            </div>
          </div>
        </Card>

        {/* Workouts */}
        <Card>
          <h3 className="font-bold text-slate-200 text-sm mb-5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Workout Log
          </h3>

          {/* Add Workout */}
          <form onSubmit={handleAddWorkout} className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-2">
              <Select label="Type" value={workoutType} onChange={e => setWorkoutType(e.target.value)} options={["Running","Cycling","Strength Training","HIIT","Yoga","Swimming","Walking"].map(v => ({ value: v, label: v }))} />
              <Select label="Intensity" value={workoutIntensity} onChange={e => setWorkoutIntensity(e.target.value as any)} options={[{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }]} />
              <Input label="Duration (mins)" type="number" value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} min="5" max="300" />
              <Input label="Calories" type="number" value={workoutCalories} onChange={e => setWorkoutCalories(e.target.value)} min="50" />
            </div>
            <Button type="submit" fullWidth icon={<Plus className="h-4 w-4" />}>Log Workout</Button>
          </form>

          {/* Workout List */}
          <div className="space-y-2">
            {healthLog.workouts.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-4">No workouts logged today</p>
            ) : healthLog.workouts.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-light rounded-xl p-3 flex items-center gap-3 transition-all ${w.completed ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() => toggleWorkout(w.id)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                    w.completed ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-white/20 hover:border-emerald-400"
                  }`}
                >
                  {w.completed && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${w.completed ? "line-through text-slate-600" : "text-slate-200"}`}>{w.type}</span>
                    <span className="text-xs font-mono text-orange-400">{w.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-600">{w.durationMinutes}m</span>
                    <Badge variant={w.intensity === "High" ? "rose" : w.intensity === "Medium" ? "amber" : "emerald"} size="xs">{w.intensity}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
