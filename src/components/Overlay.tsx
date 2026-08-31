'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Scan, 
  Cpu, 
  Target, 
  Star, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export default function Overlay() {
  // AI Feature Differentiator Cards
  const aiFeatures = [
    {
      id: 'scan',
      title: 'AI BODY SCAN',
      metric: '99.4% Biomechanical Accuracy',
      desc: 'Real-time posture & joint angle tracking',
      icon: Scan,
      badge: 'LIVE COMPUTER VISION',
      color: 'from-purple-500/20 to-brand/10',
      borderColor: 'border-purple-500/30 group-hover:border-purple-400/60',
      iconBg: 'bg-purple-500/20 text-purple-300',
      dotColor: 'bg-purple-400',
    },
    {
      id: 'diet',
      title: 'AI DIET PLANNER',
      metric: 'Macro-Calibrated Metabolic Protocols',
      desc: 'Dynamic daily nutrient adaptation',
      icon: Sparkles,
      badge: 'ADAPTIVE SCIENCE',
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30 group-hover:border-blue-400/60',
      iconBg: 'bg-blue-500/20 text-blue-300',
      dotColor: 'bg-blue-400',
    },
    {
      id: 'workouts',
      title: 'SMART WORKOUTS',
      metric: 'Adaptive Load & Cadence Sync',
      desc: 'Intelligent progressive overload engine',
      icon: Cpu,
      badge: 'REAL-TIME OPTIMIZED',
      color: 'from-indigo-500/20 to-purple-500/10',
      borderColor: 'border-indigo-500/30 group-hover:border-indigo-400/60',
      iconBg: 'bg-indigo-500/20 text-indigo-300',
      dotColor: 'bg-indigo-400',
    },
    {
      id: 'personalized',
      title: 'PERSONALIZED FITNESS',
      metric: '100% Customized Biometric Path',
      desc: 'Tailored to DNA, composition & goals',
      icon: Target,
      badge: 'INDIVIDUALIZED',
      color: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30 group-hover:border-cyan-400/60',
      iconBg: 'bg-cyan-500/20 text-cyan-300',
      dotColor: 'bg-cyan-400',
    }
  ];

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col justify-between px-3.5 sm:px-6 md:px-10 py-2 sm:py-4 md:py-6 max-w-7xl mx-auto select-none">
      {/* Top HUD Telemetry Bar */}
      <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs font-mono tracking-widest text-white/40 uppercase pt-1 sm:pt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="hidden min-[400px]:inline text-white/60">SYS.STATUS:</span>
          <span className="text-brand-light font-bold">AI CORE V3.8 ACTIVE</span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <span className="hidden sm:inline">PRECISION TELEMETRY</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-blue-400/90 font-medium">99.4% BIO-CALIBRATION</span>
        </div>
      </div>

      {/* Central Dominant Hero Content */}
      <div className="flex flex-col items-center justify-center text-center my-auto w-full max-w-4xl px-2 sm:px-4 pointer-events-auto">
        {/* Futuristic Kicker Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#120e24]/80 border border-brand/40 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.25)] mb-3 sm:mb-4 group hover:border-brand/70 transition-all cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-light opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <span className="text-[10px] sm:text-xs font-heading font-extrabold uppercase tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
            ✦ NEXT-GEN AI FITNESS PLATFORM
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2.15rem] xs:text-[2.65rem] sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.4rem] font-heading font-black tracking-tight uppercase leading-[0.94] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] max-w-full"
        >
          YOUR FITNESS.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light drop-shadow-[0_0_35px_rgba(139,92,246,0.45)]">
            POWERED BY AI.
          </span>
        </motion.h1>

        {/* Subheadline / Supporting Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2.5 sm:mt-4 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-300/90 font-medium max-w-xl sm:max-w-2xl leading-relaxed text-balance drop-shadow-md"
        >
          Where elite biomechanical coaching meets real-time AI computer vision. 
          Experience dynamic adaptive workouts, instant posture correction, and precision nutrition.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mt-4 sm:mt-6 md:mt-7 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <Link
            href="#contact"
            className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-brand via-purple-600 to-blue-600 hover:from-brand-light hover:via-purple-500 hover:to-blue-500 text-white font-heading font-black tracking-[0.14em] uppercase text-xs sm:text-sm shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            <span className="relative z-10">START YOUR JOURNEY</span>
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 relative z-10 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="#programs"
            className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-brand/50 text-white/90 hover:text-white font-heading font-bold tracking-[0.14em] uppercase text-xs sm:text-sm backdrop-blur-xl shadow-sm hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>EXPLORE PINAKA</span>
            <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-brand-light group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </motion.div>

        {/* Trust / Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3.5 sm:mt-5 text-[10px] sm:text-xs text-white/70"
        >
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-semibold text-white">4.9/5 Rating</span>
          <span className="text-white/30">•</span>
          <span className="font-bold text-brand-light">30,000+ FITNESS JOURNEYS</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-white/50 hidden sm:inline tracking-wider font-mono uppercase text-[9px]">RESULTS-DRIVEN</span>
        </motion.div>
      </div>

      {/* ── MOBILE AI FEATURES CAROUSEL / GRID (Visible on screens < lg) ── */}
      <div className="lg:hidden w-full max-w-xl mx-auto pt-2 pb-1 pointer-events-auto">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {aiFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#0a0a14]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-brand/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className={`p-1 sm:p-1.5 rounded-lg ${feat.iconBg} shrink-0`}>
                    <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold uppercase tracking-wider text-brand-light truncate">
                    {feat.badge.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-[9.5px] sm:text-[11px] font-heading font-extrabold uppercase text-white tracking-tight leading-tight truncate">
                    {feat.title}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-white/50 truncate mt-0.5">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP FLOATING AI GLASS CARDS (Anchor Points on lg+ screens)
      ───────────────────────────────────────────────────────────── */}
      {/* Top-Left: AI BODY SCAN */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden lg:block absolute top-[14%] left-[2%] xl:left-[4%] z-20 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="group w-60 xl:w-64 p-3.5 rounded-2xl bg-gradient-to-br from-[#0e0d1d]/85 via-[#090914]/80 to-[#05050c]/90 border border-purple-500/25 hover:border-purple-400/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Scan size={15} />
              </div>
              <span className="text-[11px] font-heading font-extrabold text-white tracking-wide uppercase">
                AI BODY SCAN
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-mono text-emerald-400 font-bold uppercase">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed font-medium">
            Real-time joint angle & posture mapping with 99.4% precision.
          </p>
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-purple-300/80">
            <span>CALIBRATION: 0.04s</span>
            <span>AI SCANNER V2.4</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Top-Right: AI DIET PLANNER */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden lg:block absolute top-[14%] right-[2%] xl:right-[4%] z-20 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="group w-60 xl:w-64 p-3.5 rounded-2xl bg-gradient-to-br from-[#0e0d1d]/85 via-[#090914]/80 to-[#05050c]/90 border border-blue-500/25 hover:border-blue-400/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles size={15} />
              </div>
              <span className="text-[11px] font-heading font-extrabold text-white tracking-wide uppercase">
                AI DIET PLANNER
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[8px] font-mono text-blue-300 font-bold uppercase">
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              ADAPTIVE
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed font-medium">
            Macro-calibrated metabolic protocols adjusted dynamically to workout intensity.
          </p>
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-blue-300/80">
            <span>TARGET: 2,850 KCAL</span>
            <span>DYNAMIC FUEL</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom-Left: SMART WORKOUTS */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden lg:block absolute bottom-[14%] left-[2%] xl:left-[4%] z-20 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="group w-60 xl:w-64 p-3.5 rounded-2xl bg-gradient-to-br from-[#0e0d1d]/85 via-[#090914]/80 to-[#05050c]/90 border border-indigo-500/25 hover:border-indigo-400/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Cpu size={15} />
              </div>
              <span className="text-[11px] font-heading font-extrabold text-white tracking-wide uppercase">
                SMART WORKOUTS
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[8px] font-mono text-indigo-300 font-bold uppercase">
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
              CADENCE SYNC
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed font-medium">
            AI-driven progressive overload with real-time rep tempo & load tuning.
          </p>
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-indigo-300/80">
            <span>EFFICIENCY: +34%</span>
            <span>HYPERTROPHY V4</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom-Right: PERSONALIZED FITNESS */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="hidden lg:block absolute bottom-[14%] right-[2%] xl:right-[4%] z-20 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="group w-60 xl:w-64 p-3.5 rounded-2xl bg-gradient-to-br from-[#0e0d1d]/85 via-[#090914]/80 to-[#05050c]/90 border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Target size={15} />
              </div>
              <span className="text-[11px] font-heading font-extrabold text-white tracking-wide uppercase">
                PERSONALIZED FITNESS
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[8px] font-mono text-cyan-300 font-bold uppercase">
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              100% TAILORED
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-relaxed font-medium">
            Custom genetic & biometric roadmap tailored precisely to your physique goals.
          </p>
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-cyan-300/80">
            <span>GOAL: PEAK HYBRID</span>
            <span>DNA PROTOCOL</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom subtle indicator linking directly to Programs */}
      <div className="w-full flex justify-center pb-2 pt-2 text-[9px] font-mono tracking-widest text-white/40 uppercase pointer-events-auto">
        <Link
          href="#programs"
          className="group inline-flex items-center gap-1.5 hover:text-brand-light transition-colors cursor-pointer"
        >
          <span>EXPLORE PROGRAMS</span>
          <ChevronDown size={13} className="text-brand-light group-hover:translate-y-0.5 transition-transform animate-bounce" />
        </Link>
      </div>
    </div>
  );
}


