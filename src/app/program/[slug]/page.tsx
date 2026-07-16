'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Clock,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Lightbulb,
  Play,
  Plus,
  Zap,
  Brain,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';
import { getProgramBySlug, Exercise } from '@/lib/programData';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// ─── Difficulty Badge ───────────────────────────────────────────────────────
const difficultyConfig = {
  Beginner: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Advanced: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
};

function DifficultyBadge({ level }: { level: 'Beginner' | 'Intermediate' | 'Advanced' }) {
  const cfg = difficultyConfig[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {level}
    </span>
  );
}

// ─── Image Carousel ──────────────────────────────────────────────────────────
function ImageCarousel({ images, accent }: { images: { proper: string; wrong?: string }[]; accent: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden aspect-video bg-white/5 border border-white/10">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active].proper}
            alt="Exercise form"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute bottom-3 left-3 text-xs font-bold text-white/80 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
          Proper Form
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative flex-1 rounded-xl overflow-hidden aspect-video border-2 transition-all duration-200"
              style={{
                borderColor: active === i ? accent : 'rgba(255,255,255,0.1)',
                opacity: active === i ? 1 : 0.5,
              }}
            >
              <img src={img.proper} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Exercise Accordion Card ─────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  index,
  accent,
  glow,
}: {
  exercise: Exercise;
  index: number;
  accent: string;
  glow: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'steps' | 'tips' | 'safety'>('steps');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
    >
      <div
        className="rounded-2xl border transition-all duration-300 overflow-hidden"
        style={{
          background: 'rgba(18,18,18,0.8)',
          borderColor: open ? accent + '55' : 'rgba(255,255,255,0.08)',
          boxShadow: open ? `0 0 24px ${glow}` : 'none',
        }}
      >
        {/* Card Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-4 p-5 text-left group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0 transition-colors duration-300"
            style={{
              background: open ? accent : 'rgba(255,255,255,0.06)',
              color: open ? '#000' : accent,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="text-base font-heading font-bold text-white">{exercise.name}</h3>
              <DifficultyBadge level={exercise.difficulty} />
            </div>
            <p className="text-xs text-gray-400 truncate">{exercise.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Clock size={13} />
              {exercise.duration}
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Flame size={13} />
              {exercise.calories}
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: open ? accent + '20' : 'rgba(255,255,255,0.05)' }}
            >
              {open ? <ChevronUp size={16} style={{ color: accent }} /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-6 space-y-6 border-t border-white/5 pt-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Sets', value: exercise.sets || '—', icon: <Target size={14} /> },
                    { label: 'Reps', value: exercise.reps || exercise.duration, icon: <Zap size={14} /> },
                    { label: 'Calories', value: exercise.calories, icon: <Flame size={14} /> },
                    { label: 'Level', value: exercise.difficulty, icon: <Star size={14} /> },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3 flex flex-col gap-1"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wider">
                        <span style={{ color: accent }}>{stat.icon}</span>
                        {stat.label}
                      </span>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Muscles Worked */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Muscles Worked</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.musclesWorked.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: accent + '18', color: accent, border: `1px solid ${accent}30` }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <ImageCarousel images={exercise.images} accent={accent} />

                {/* Tabs */}
                <div>
                  <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {(['steps', 'tips', 'safety'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                        style={
                          tab === t
                            ? { background: accent, color: '#000' }
                            : { color: 'rgba(255,255,255,0.5)' }
                        }
                      >
                        {t === 'steps' ? '📋 Steps' : t === 'tips' ? '💡 Tips' : '🛡️ Safety'}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab === 'steps' && (
                        <ol className="space-y-3">
                          {exercise.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                                style={{ background: accent + '20', color: accent }}
                              >
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {tab === 'tips' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Lightbulb size={12} style={{ color: accent }} /> Pro Tips
                          </p>
                          {exercise.tips.map((tip, i) => (
                            <div key={i} className="flex gap-2.5 text-sm text-gray-300">
                              <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: accent }} />
                              <span>{tip}</span>
                            </div>
                          ))}
                          <p className="text-xs text-gray-500 uppercase tracking-widest mt-4 mb-3 flex items-center gap-1.5">
                            <XCircle size={12} className="text-red-400" /> Common Mistakes
                          </p>
                          {exercise.mistakes.map((m, i) => (
                            <div key={i} className="flex gap-2.5 text-sm text-gray-300">
                              <XCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {tab === 'safety' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <ShieldAlert size={12} className="text-yellow-400" /> Safety Guidelines
                          </p>
                          {exercise.safety.map((s, i) => (
                            <div key={i} className="flex gap-2.5 text-sm text-gray-300">
                              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-yellow-400" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

import { useLenis } from 'lenis/react';

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProgramPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const program = getProgramBySlug(slug);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const lenis = useLenis();

  // Scroll lock when modal is open
  useEffect(() => {
    if (showVideoModal) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [showVideoModal, lenis]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login?redirect=/program/' + slug);
    }
  }, [isHydrated, isAuthenticated, router, slug]);

  if (!isHydrated) return null;
  if (isHydrated && !isAuthenticated) return null;

  if (!program) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏋️</p>
          <p className="text-white font-heading text-2xl mb-2">Program Not Found</p>
          <p className="text-gray-400 mb-6">This training program doesn&apos;t exist yet.</p>
          <Link href="/#programs" className="text-brand underline">← Back to Programs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Banner */}
      <div
        className="relative pt-24 pb-16 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${program.gradientFrom} 0%, #0a0a0a 50%, ${program.gradientTo} 100%)`,
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none"
          style={{ background: program.accentColor }}
        />

        <div className="relative z-10 container mx-auto px-6 max-w-5xl">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/#programs"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Programs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row items-start gap-8"
          >
            {/* Icon */}
            <div
              className="text-7xl w-28 h-28 rounded-3xl flex items-center justify-center shrink-0"
              style={{ background: program.accentColor + '18', border: `2px solid ${program.accentColor}30` }}
            >
              {program.icon}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                  style={{ color: program.accentColor, background: program.accentColor + '18', border: `1px solid ${program.accentColor}30` }}
                >
                  Training Program
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} /> {program.weeklySchedule}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Flame size={12} /> {program.caloriesBurn}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tighter uppercase mb-3">
                {program.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-400 italic mb-6">&quot;{program.tagline}&quot;</p>
              <p className="text-gray-300 leading-relaxed max-w-2xl">{program.fullDescription}</p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-black transition-all"
                  style={{ background: program.accentColor, boxShadow: `0 0 20px ${program.glowColor}` }}
                >
                  <Play size={16} fill="currentColor" />
                  Start Workout
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Plus size={16} />
                  Add to Plan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
                  style={{ color: program.accentColor, background: program.accentColor + '12', border: `1px solid ${program.accentColor}30` }}
                >
                  <Play size={16} />
                  Watch Demo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-5xl py-12 space-y-16">

        {/* Benefits Grid */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <SectionHeading label="Key Benefits" accent={program.accentColor} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {program.benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: program.accentColor }} />
                <span className="text-sm text-gray-300 leading-relaxed">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Who Is This For */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <SectionHeading label="Who Is This For?" accent={program.accentColor} icon={<Users size={18} />} />
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {(
              [
                { level: 'Beginner', key: 'beginner', emoji: '🌱' },
                { level: 'Intermediate', key: 'intermediate', emoji: '⚡' },
                { level: 'Advanced', key: 'advanced', emoji: '🔥' },
              ] as const
            ).map(({ level, key, emoji }) => (
              <div
                key={level}
                className="rounded-2xl p-5 space-y-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emoji}</span>
                  <DifficultyBadge level={level} />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{program.targetAudience[key]}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* AI Coach Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${program.accentColor}12 0%, rgba(0,0,0,0.4) 100%)`,
            border: `1px solid ${program.accentColor}30`,
            boxShadow: `0 0 40px ${program.glowColor}`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: program.accentColor + '20', border: `1px solid ${program.accentColor}40` }}
            >
              <Brain size={22} style={{ color: program.accentColor }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2" style={{ color: program.accentColor }}>
                🤖 AI Coach Insight
              </p>
              <p className="text-sm text-gray-300 leading-relaxed italic">&quot;{program.aiCoachTip}&quot;</p>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <section>
          <SectionHeading
            label={`Exercises (${program.exercises.length})`}
            accent={program.accentColor}
            icon={<Target size={18} />}
          />
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Click any exercise to expand step-by-step instructions, form images, tips, and safety guidelines.
          </p>
          <div className="space-y-4">
            {program.exercises.map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={i}
                accent={program.accentColor}
                glow={program.glowColor}
              />
            ))}
          </div>
        </section>

        {/* Other Programs CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Explore More</p>
          <h2 className="text-3xl font-heading font-bold uppercase tracking-tighter mb-8">
            Other Programs
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['strength', 'cardio', 'hiit', 'yoga']
              .filter((s) => s !== program.slug)
              .map((s) => (
                <Link
                  key={s}
                  href={`/program/${s}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <ChevronRight size={14} />
                </Link>
              ))}
          </div>
        </motion.section>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors border border-white/10"
              >
                <XCircle size={24} />
              </button>
              
              <iframe
                src={`${program.demoVideoUrl}?autoplay=1&rel=0`}
                title={`${program.title} Demo Video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Heading Helper ──────────────────────────────────────────────────
function SectionHeading({ label, accent, icon }: { label: string; accent: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent + '18', color: accent }}
        >
          {icon}
        </div>
      )}
      <h2 className="text-xl font-heading font-bold uppercase tracking-widest text-white">{label}</h2>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }} />
    </div>
  );
}
