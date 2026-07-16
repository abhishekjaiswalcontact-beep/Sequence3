"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Dumbbell, Utensils, ArrowLeft,
  BarChart2, Activity, Leaf, Drumstick, Clock, RotateCcw,
  Zap, Heart, Flame, Scale, TrendingUp, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tip: string;
}

interface DayPlan {
  day: string;
  focus: string;
  type: string;
  exercises: Exercise[];
}

interface MealItem {
  meal: string;
  items: string[];
}

interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealItem[];
}

interface ScanData {
  bodyFat?: number;
  muscleMass?: number;
  leanBodyMass?: number;
  bmi?: number;
  bodyType?: string;
  postureScore?: number;
  weeklyPlan?: DayPlan[];
  vegDiet?: DietPlan;
  nonVegDiet?: DietPlan;
  dietPlan?: string;
  postureFeedback?: string;
  estimatedTime?: string;
  userMetrics?: { height: string; weight: string; goal: string };
  error?: string;
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  Strength:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Hypertrophy:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Conditioning: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Mobility:     'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Recovery:     'bg-green-500/20 text-green-300 border-green-500/30',
};

const mealIcons: Record<string, string> = {
  'Breakfast':    '🌅',
  'Mid-Morning':  '☀️',
  'Lunch':        '🍽️',
  'Pre-Workout':  '⚡',
  'Post-Workout': '💪',
  'Dinner':       '🌙',
  'Before Bed':   '🛌',
};

const scoreColor = (s: number) =>
  s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';

// ── Expandable Exercise Row ───────────────────────────────────────────────────

function ExerciseRow({ ex, idx }: { ex: Exercise; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="w-7 h-7 rounded-full bg-brand/20 text-brand text-xs font-black flex items-center justify-center shrink-0">
            {idx + 1}
          </span>
          <div>
            <p className="font-bold text-white text-sm">{ex.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {ex.sets} sets × {ex.reps} &nbsp;·&nbsp; Rest {ex.rest}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/8 text-gray-400 font-mono">{ex.sets}×{ex.reps}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/8 text-gray-400 font-mono flex items-center gap-1"><Clock size={9} />{ex.rest}</span>
          </div>
          {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 flex items-start gap-2 border-t border-white/6">
              <Info size={13} className="text-brand mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed italic">
                Coach tip: {ex.tip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ScanData | null>(null);
  const [dietTab, setDietTab] = useState<'veg' | 'nonveg'>('nonveg');
  const [activeDay, setActiveDay] = useState(0);

  const { isAuthenticated, isHydrated } = useAuth();
  
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/scan/results');
      return;
    }
    const stored = sessionStorage.getItem('latestScanData');
    if (stored) {
      try { setData(JSON.parse(stored)); }
      catch { router.push('/scan'); }
    } else {
      router.push('/scan');
    }
  }, [router]);

  if (!data) return null;

  if (data.error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-gray-400 mb-6">{data.error}</p>
          <button onClick={() => router.push('/scan')} className="px-6 py-2 bg-brand rounded-full hover:bg-brand-light transition">Try Again</button>
        </div>
      </div>
    );
  }

  // ── Radar data ──────────────────────────────────────────────────────
  const radarData = {
    labels: ['Upper Body', 'Symmetry', 'Posture', 'Core', 'Lower Body', 'Lean Mass'],
    datasets: [{
      label: 'Your Assessment',
      data: [
        Math.min((data.muscleMass || 40) + 30, 95),
        Math.min((data.postureScore || 70) * 0.9, 95),
        data.postureScore || 70,
        Math.min((data.postureScore || 70) * 0.85, 90),
        Math.min((data.muscleMass || 40) + 25, 92),
        Math.min((data.leanBodyMass ? +data.leanBodyMass : 60), 95),
      ],
      backgroundColor: 'rgba(139,92,246,0.18)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#8b5cf6',
    }],
  };
  const radarOptions = {
    scales: {
      r: {
        min: 0, max: 100,
        angleLines: { color: 'rgba(255,255,255,0.07)' },
        grid: { color: 'rgba(255,255,255,0.07)' },
        pointLabels: { color: '#aaa', font: { size: 11 } },
        ticks: { display: false },
      },
    },
    plugins: { legend: { display: false } },
  };

  const activeDiet = dietTab === 'veg' ? data.vegDiet : data.nonVegDiet;
  const dayPlan = data.weeklyPlan?.[activeDay];

  const bodyFatCategory =
    (data.bodyFat || 15) < 10 ? 'Essential Fat' :
    (data.bodyFat || 15) < 18 ? 'Athletic' :
    (data.bodyFat || 15) < 25 ? 'Fitness' : 'Average+';

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/6 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI Scan Complete
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-14 pt-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-brand text-xs font-bold uppercase tracking-[4px] mb-3">Personalized Report</p>
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter uppercase leading-none">
            Your Body<br /><span className="text-brand">Intelligence</span> Report
          </h1>
          <p className="text-gray-400 mt-3 max-w-lg">
            Elite AI assessment based on your body scan, pose data, and biometrics. Follow this plan consistently for best results.
          </p>
        </motion.div>

        {/* ── User quick stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Height',   value: `${data.userMetrics?.height} cm`,  icon: Scale },
            { label: 'Weight',   value: `${data.userMetrics?.weight} kg`,  icon: Activity },
            { label: 'Goal',     value: data.userMetrics?.goal,             icon: TrendingUp, brand: true },
            { label: 'Timeline', value: data.estimatedTime || '12 wks',    icon: Clock, brand: true },
          ].map(({ label, value, icon: Icon, brand }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/4 border border-white/8 p-5 rounded-2xl"
            >
              <Icon size={16} className={`mb-3 ${brand ? 'text-brand' : 'text-gray-500'}`} />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</p>
              <p className={`text-lg font-heading font-black ${brand ? 'text-brand' : 'text-white'} truncate`}>{value || 'N/A'}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Body Metrics Row ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs uppercase tracking-[4px] text-gray-500 font-bold mb-6">Body Composition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Body Fat',      value: `${data.bodyFat}%`,          sub: bodyFatCategory,          icon: Flame,      color: 'text-orange-400' },
              { label: 'Muscle Mass',   value: `${data.muscleMass} kg`,     sub: data.bodyType || 'Mesomorph', icon: Dumbbell,  color: 'text-blue-400' },
              { label: 'Lean Body Mass',value: `${data.leanBodyMass} kg`,   sub: 'Fat-free mass',          icon: Heart,      color: 'text-pink-400' },
              { label: 'BMI',           value: `${data.bmi || '—'}`,        sub: 'Body Mass Index',        icon: BarChart2,  color: 'text-purple-400' },
            ].map(({ label, value, sub, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/4 border border-white/8 rounded-3xl p-6 flex flex-col gap-3"
              >
                <Icon size={20} className={color} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</p>
                  <p className="text-3xl font-heading font-black text-white mt-1">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Posture & Radar ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Posture Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/4 border border-white/8 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand/5 blur-[60px]" />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[4px] text-gray-500 font-bold mb-6">Posture & Form</p>
              <div className={`text-8xl font-black font-heading tracking-tighter ${scoreColor(data.postureScore || 70)}`}>
                {data.postureScore || 85}
              </div>
              <div className="text-gray-500 text-sm mt-1">out of 100</div>
              <div className="mt-6 w-full bg-white/8 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.postureScore || 85}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full"
                />
              </div>
              <div className="mt-6 bg-brand/10 border border-brand/20 rounded-2xl p-4 text-left">
                <p className="text-xs text-gray-400 italic leading-relaxed">&quot;{data.postureFeedback}&quot;</p>
              </div>
            </div>
          </motion.div>

          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white/4 border border-white/8 rounded-3xl p-8 flex flex-col"
          >
            <h3 className="text-xs uppercase tracking-[4px] text-gray-500 font-bold mb-6">Physical Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest">
              Derived from posture landmarks & biometrics
            </p>
          </motion.div>
        </div>

        {/* ── Weekly Exercise Plan ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-black uppercase tracking-tight">Weekly Training Protocol</h2>
              <p className="text-gray-500 text-xs">Personalized 6-day split · tap any day to explore</p>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {(data.weeklyPlan || []).map((plan, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeDay === i
                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/30'
                    : 'bg-white/4 text-gray-400 border-white/8 hover:border-brand/40'
                }`}
              >
                {plan.day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Active day detail */}
          <AnimatePresence mode="wait">
            {dayPlan && (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white/4 border border-white/8 rounded-3xl p-6 md:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-2xl font-heading font-black uppercase">{dayPlan.day}</h3>
                    <p className="text-brand font-semibold text-sm mt-0.5">{dayPlan.focus}</p>
                  </div>
                  <span className={`self-start text-[11px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${typeColors[dayPlan.type] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                    {dayPlan.type}
                  </span>
                </div>

                {dayPlan.type === 'Recovery' ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                      <Heart size={28} className="text-green-400" />
                    </div>
                    <p className="text-xl font-heading font-bold text-green-300">Rest & Recover</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-sm">
                      Recovery is where growth happens. Sleep 8h, hydrate well, and do light movement only.
                    </p>
                    {dayPlan.exercises && dayPlan.exercises.map((ex, i) => (
                      <p key={i} className="text-gray-500 text-xs mt-2">· {ex.name} — {ex.tip}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayPlan.exercises?.map((ex, i) => (
                      <ExerciseRow key={i} ex={ex} idx={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Diet Plan ────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center">
              <Utensils size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-black uppercase tracking-tight">Nutrition Strategy</h2>
              <p className="text-gray-500 text-xs">Goal-aligned daily meal plan with macros</p>
            </div>
          </div>

          {/* Veg / Non-veg toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setDietTab('nonveg')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                dietTab === 'nonveg' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-white/4 border-white/8 text-gray-400 hover:border-orange-500/30'
              }`}
            >
              <Drumstick size={15} /> Non-Vegetarian
            </button>
            <button
              onClick={() => setDietTab('veg')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                dietTab === 'veg' ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/4 border-white/8 text-gray-400 hover:border-green-500/30'
              }`}
            >
              <Leaf size={15} /> Vegetarian
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeDiet && (
              <motion.div
                key={dietTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Macro overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Calories',  value: `${activeDiet.calories} kcal`, color: 'text-yellow-400' },
                    { label: 'Protein',   value: `${activeDiet.protein}g`,      color: 'text-blue-400' },
                    { label: 'Carbs',     value: `${activeDiet.carbs}g`,        color: 'text-green-400' },
                    { label: 'Fat',       value: `${activeDiet.fat}g`,          color: 'text-orange-400' },
                  ].map(({ label, value, color }, i) => (
                    <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">{label}</p>
                      <p className={`text-2xl font-heading font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Meal timeline */}
                <div className="space-y-3">
                  {activeDiet.meals.map((meal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4 bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-brand/30 transition-colors"
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{mealIcons[meal.meal] || '🍴'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white mb-1.5">{meal.meal}</p>
                        <div className="flex flex-wrap gap-2">
                          {meal.items.map((item, j) => (
                            <span key={j} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/6 border border-white/8 text-gray-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── CTA Bar ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand/20 to-blue-600/10 border border-brand/25 rounded-3xl p-8"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[4px] text-brand font-bold mb-1">Estimated Results</p>
            <p className="text-3xl font-heading font-black text-white">{data.estimatedTime || '12 Weeks'}</p>
            <p className="text-gray-400 text-sm mt-1">of consistent effort with this plan</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => router.push('/scan')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/6 transition font-bold text-sm"
            >
              <RotateCcw size={15} /> Rescan
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('latestScanData');
                router.push('/dashboard');
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-light transition shadow-lg shadow-brand/30"
            >
              <Zap size={15} /> Commit to Protocol
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
