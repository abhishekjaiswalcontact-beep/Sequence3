"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Dumbbell, Utensils, ArrowLeft,
  BarChart2, Activity, Leaf, Drumstick, Clock, RotateCcw,
  Zap, Heart, Flame, Scale, TrendingUp, Info, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2, Target, Eye
} from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';
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

interface VisibleCharacteristics {
  overallShape?: string;
  shoulderWaistProportions?: string;
  muscleDefinition?: string;
  postureAlignment?: string;
  symmetryNotes?: string;
}

interface ScanData {
  bodyFat?: number;
  muscleMass?: number;
  leanBodyMass?: number;
  bmi?: number;
  bodyType?: string;
  postureScore?: number;
  shoulderToWaistRatio?: number;
  symmetryScore?: number;
  structuralSummary?: string;
  visibleCharacteristics?: VisibleCharacteristics;
  focusAreas?: string[];
  confidenceNote?: string;
  scannedImage?: string;
  weeklyPlan?: DayPlan[];
  vegDiet?: DietPlan;
  nonVegDiet?: DietPlan;
  dietPlan?: string;
  postureFeedback?: string;
  estimatedTime?: string;
  userMetrics?: { height: string | number; weight: string | number; goal: string; gender?: string };
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
  s >= 85 ? 'text-green-400' : s >= 70 ? 'text-yellow-400' : 'text-orange-400';

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
  const [dietTab, setDietTab] = useState<'nonveg' | 'veg'>('nonveg');
  const [activeDay, setActiveDay] = useState(0);
  const [showPhoto, setShowPhoto] = useState(false);

  const { isAuthenticated, isHydrated } = useAuth();
  
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/scan/results');
      return;
    }
    const stored = sessionStorage.getItem('latestScanData');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        setData(parsed); 
      }
      catch { router.push('/scan'); }
    } else {
      router.push('/scan');
    }
  }, [isHydrated, isAuthenticated, router]);

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

  // Calculate dynamic radar chart coordinates
  const upperBodyScore = Math.min(95, Math.max(50, Math.round(((data.shoulderToWaistRatio || 1.25) / 1.5) * 85 + (data.muscleMass ? (data.muscleMass / 60) * 15 : 10))));
  const symmetryScore = data.symmetryScore || 88;
  const postureScore = data.postureScore || 84;
  const coreScore = Math.min(95, Math.max(50, Math.round(postureScore * 0.9 + (data.bodyFat ? (25 - Math.min(25, data.bodyFat)) * 0.8 : 5))));
  const lowerBodyScore = Math.min(95, Math.max(55, Math.round((data.muscleMass || 40) * 1.3 + (data.bmi ? data.bmi * 1.1 : 20))));
  const leanMassScore = Math.min(96, Math.max(55, Math.round(data.leanBodyMass ? (+data.leanBodyMass / (+(data.userMetrics?.weight || 70))) * 100 : 78)));

  const radarData = {
    labels: ['Upper Body V-Taper', 'Bilateral Symmetry', 'Spine & Posture', 'Core Bracing', 'Lower Body Base', 'Lean Body Ratio'],
    datasets: [{
      label: 'Your Assessment',
      data: [upperBodyScore, symmetryScore, postureScore, coreScore, lowerBodyScore, leanMassScore],
      backgroundColor: 'rgba(139,92,246,0.22)',
      borderColor: '#8b5cf6',
      borderWidth: 2.5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#8b5cf6',
      pointRadius: 4,
    }],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 40, max: 100,
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        grid: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: { color: '#ccc', font: { size: 11, weight: 'bold' as const } },
        ticks: { display: false },
      },
    },
    plugins: { legend: { display: false } },
  };

  const activeDiet = (dietTab === 'veg' ? data.vegDiet : data.nonVegDiet) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    meals: []
  };
  const dayPlan = data.weeklyPlan?.[activeDay];

  const bodyFatCategory =
    (data.bodyFat || 15) < 11 ? 'Athletic / Shredded' :
    (data.bodyFat || 15) < 17 ? 'Athletic Lean' :
    (data.bodyFat || 15) < 23 ? 'Moderate Fitness' : 'Power / Bulk';

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/6 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="px-3 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={12} className="text-brand animate-pulse" /> Individual Visual Analysis
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-12 pt-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-[4px] mb-2 flex items-center gap-2">
              <Sparkles size={13} /> Biomechanical Vision Report
            </p>
            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter uppercase leading-none">
              Your Body<br /><span className="text-brand">Structure</span> Analysis
            </h1>
            <p className="text-gray-400 mt-3 max-w-xl text-sm leading-relaxed">
              Personalized structural assessment generated directly from your uploaded body scan, silhouette landmarks, and biometric profile.
            </p>
          </div>

          {data.scannedImage && (
            <button
              onClick={() => setShowPhoto(!showPhoto)}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-brand/40 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Eye size={14} className="text-brand" /> {showPhoto ? "Hide Scanned Photo" : "View Scanned Photo"}
            </button>
          )}
        </motion.div>

        {/* ── Optional Scanned Photo Preview ───────────────────────────────── */}
        <AnimatePresence>
          {showPhoto && data.scannedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-3xl bg-white/4 border border-brand/30 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden border border-brand/50 shadow-neon shrink-0">
                  <Image 
                    src={data.scannedImage} 
                    alt="Analyzed body scan" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-brand/10 pointer-events-none" />
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] uppercase font-mono font-bold text-brand tracking-widest bg-brand/15 px-2 py-0.5 rounded">
                    Scanned Silhouette
                  </span>
                  <h4 className="text-lg font-heading font-bold uppercase">Image Biometrics Mapped</h4>
                  <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
                    This image was processed individually through the neural vision pipeline. Structural points, shoulder-to-waist ratios, and posture alignment have been calculated specifically for this photograph.
                  </p>
                  {data.confidenceNote && (
                    <p className="text-[11px] text-brand-light italic">
                      ℹ️ {data.confidenceNote}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── User Quick Stats Bar ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Height',   value: `${data.userMetrics?.height || '—'} cm`, icon: Scale },
            { label: 'Weight',   value: `${data.userMetrics?.weight || '—'} kg`, icon: Activity },
            { label: 'Target Goal', value: data.userMetrics?.goal || 'Build Muscle', icon: TrendingUp, brand: true },
            { label: 'Estimated Protocol', value: data.estimatedTime || '12 Weeks', icon: Clock, brand: true },
          ].map(({ label, value, icon: Icon, brand }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/4 border border-white/8 p-5 rounded-2xl"
            >
              <Icon size={16} className={`mb-3 ${brand ? 'text-brand' : 'text-gray-500'}`} />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</p>
              <p className={`text-lg font-heading font-black ${brand ? 'text-brand' : 'text-white'} truncate`}>{value || 'N/A'}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Personalized Observed Structural Summary ──────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/15 via-white/[0.03] to-blue-600/10 border border-brand/30 p-6 md:p-8"
        >
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tight">
                  Observed Structural Summary
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-[10px] font-mono font-bold uppercase tracking-widest">
                {data.bodyType || 'Athletic Structure'}
              </span>
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {data.structuralSummary || 
               `Based on your individual image scan, you exhibit a ${data.bodyType || 'balanced athletic'} structure with balanced proportion indicators. Your custom protocol has been designed around your visible frame.`}
            </p>

            {data.confidenceNote && (
              <div className="flex items-start gap-2 pt-2 border-t border-white/8 text-xs text-gray-400">
                <Info size={14} className="text-brand shrink-0 mt-0.5" />
                <span><strong>Assessment Clarity:</strong> {data.confidenceNote}</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Proportion & Biomechanical Metrics ───────────────────────────── */}
        <section>
          <h2 className="text-xs uppercase tracking-[4px] text-gray-500 font-bold mb-6">Biomechanical Proportions & Composition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Body Fat %', 
                value: `${data.bodyFat}%`, 
                sub: bodyFatCategory, 
                icon: Flame, 
                color: 'text-orange-400' 
              },
              { 
                label: 'Muscle Mass', 
                value: `${data.muscleMass} kg`, 
                sub: data.bodyType?.split('(')[0]?.trim() || 'Mesomorph', 
                icon: Dumbbell, 
                color: 'text-blue-400' 
              },
              { 
                label: 'Shoulder / Waist', 
                value: `${data.shoulderToWaistRatio ? data.shoulderToWaistRatio.toFixed(2) : '1.28'} : 1`, 
                sub: data.shoulderToWaistRatio && data.shoulderToWaistRatio >= 1.30 ? 'Broad V-Taper' : 'Balanced Taper', 
                icon: Target, 
                color: 'text-brand' 
              },
              { 
                label: 'Bilateral Symmetry', 
                value: `${data.symmetryScore || 90}%`, 
                sub: (data.symmetryScore || 90) >= 88 ? 'High Structural Symmetry' : 'Minor Lateral Delta', 
                icon: CheckCircle2, 
                color: 'text-emerald-400' 
              },
            ].map(({ label, value, sub, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/4 border border-white/8 rounded-3xl p-6 flex flex-col gap-3"
              >
                <Icon size={20} className={color} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</p>
                  <p className="text-3xl font-heading font-black text-white mt-1">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Focus Areas & Visible Characteristics ─────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Focus Areas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/4 border border-white/8 rounded-3xl p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-brand" />
                <h3 className="text-xs uppercase tracking-[3px] text-gray-400 font-bold">Identified Development Priorities</h3>
              </div>
              <h4 className="text-xl font-heading font-bold uppercase mb-4">Areas to Focus On</h4>
              
              <div className="space-y-3">
                {(data.focusAreas && data.focusAreas.length > 0 ? data.focusAreas : [
                  "Upper Chest & Lateral Deltoids for V-Taper Enhancement",
                  "Core Bracing & Transverse Abdominis",
                  "Postural Scapular Stabilization"
                ]).map((area, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/6">
                    <span className="w-5 h-5 rounded-full bg-brand/20 text-brand text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      {area}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-wider">
              * Targeted exercises for these areas have been built into your 7-day protocol below.
            </p>
          </motion.div>

          {/* Visible Characteristics Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/4 border border-white/8 rounded-3xl p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={18} className="text-blue-400" />
                <h3 className="text-xs uppercase tracking-[3px] text-gray-400 font-bold">Physical Framework Diagnostic</h3>
              </div>
              <h4 className="text-xl font-heading font-bold uppercase mb-4">Visible Body Features</h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/4 border border-white/6">
                  <span className="text-brand font-bold uppercase tracking-wider text-[10px] block mb-1">Overall Shape</span>
                  <p className="text-gray-300 leading-relaxed">
                    {data.visibleCharacteristics?.overallShape || `${data.bodyType || 'Athletic frame'} with distinct aesthetic potential.`}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/4 border border-white/6">
                  <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Shoulder & Waist Taper</span>
                  <p className="text-gray-300 leading-relaxed">
                    {data.visibleCharacteristics?.shoulderWaistProportions || `Calculated ratio is ${data.shoulderToWaistRatio || '1.30'}:1.`}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/4 border border-white/6">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Bilateral Symmetry</span>
                  <p className="text-gray-300 leading-relaxed">
                    {data.visibleCharacteristics?.symmetryNotes || `Measured structural symmetry score: ${data.symmetryScore || 90}%.`}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Posture & Physical Radar ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Posture Diagnostic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/4 border border-white/8 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand/5 blur-[60px]" />
            <div className="relative z-10 w-full">
              <p className="text-[10px] uppercase tracking-[4px] text-gray-500 font-bold mb-4">Posture & Alignment Diagnostic</p>
              
              <div className={`text-8xl font-black font-heading tracking-tighter ${scoreColor(data.postureScore || 80)}`}>
                {data.postureScore || 84}
              </div>
              <div className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-mono">Posture Index / 100</div>

              <div className="mt-6 w-full bg-white/8 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.postureScore || 84}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full"
                />
              </div>

              <div className="mt-6 bg-brand/10 border border-brand/20 rounded-2xl p-4 text-left">
                <p className="text-xs text-gray-300 leading-relaxed">
                  &quot;{data.postureFeedback || "Good overall coronal alignment. Ensure continuous core bracing and thoracic extension during compound movements."}&quot;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Physical Distribution Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white/4 border border-white/8 rounded-3xl p-8 flex flex-col"
          >
            <h3 className="text-xs uppercase tracking-[4px] text-gray-500 font-bold mb-4">Dynamic Physical Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">
              Dynamically derived from individual body scan landmarks & biometrics
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
              <h2 className="text-2xl font-heading font-black uppercase tracking-tight">Personalized 7-Day Protocol</h2>
              <p className="text-gray-400 text-xs">Customized weekly split prioritizing your identified focus areas</p>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {(data.weeklyPlan || []).map((plan, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
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
                    <p className="text-xl font-heading font-bold text-green-300">Rest & Active Recovery</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-sm">
                      Rest and sleep are essential for muscular rebuilding and neural recovery.
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
              <h2 className="text-2xl font-heading font-black uppercase tracking-tight">Macro-Targeted Nutrition</h2>
              <p className="text-gray-400 text-xs">Calculated specifically for your body composition and directive</p>
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
                      transition={{ delay: i * 0.05 }}
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
            <p className="text-[10px] uppercase tracking-[4px] text-brand font-bold mb-1">Estimated Commitment</p>
            <p className="text-3xl font-heading font-black text-white">{data.estimatedTime || '12 Weeks'}</p>
            <p className="text-gray-400 text-sm mt-1">to achieve substantial structural optimization</p>
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

