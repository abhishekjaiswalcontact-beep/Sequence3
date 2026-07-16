'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Overlay({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Enhanced Parallax & Opacity definitions
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [1, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -100]);
  const scale1 = useTransform(scrollYProgress, [0, 0.25], [1, 1.1]);

  const opacity2 = useTransform(scrollYProgress, [0.25, 0.35, 0.45, 0.55], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.55], [100, -100]);
  const x2 = useTransform(scrollYProgress, [0.25, 0.55], [20, -20]);

  const opacity3 = useTransform(scrollYProgress, [0.55, 0.65, 0.75, 0.85], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.55, 0.85], [100, -100]);
  const x3 = useTransform(scrollYProgress, [0.55, 0.85], [-20, 20]);

  const opacity4 = useTransform(scrollYProgress, [0.85, 0.92, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.85, 1], [100, 0]);

  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      {/* Cinematic Vignette & Noise overlays to make frames look ultra-premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_150%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0" />

      {/* SCENE 1 */}
      <motion.div
        style={{ opacity: opacity1, y: y1, scale: scale1 }}
        className="absolute inset-0 flex items-center justify-center p-6 z-10"
      >
        <div className="flex flex-col items-center">
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 drop-shadow-md flex items-center gap-2">
                <span className="w-8 h-px bg-brand" /> 01 // THE IGNITION <span className="w-8 h-px bg-brand" />
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-heading font-black text-white text-center tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-[0.85]">
               AWAKEN 
               <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand via-purple-400 to-white drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]">POTENTIAL</span>
            </h1>
        </div>
      </motion.div>

      {/* SCENE 2 */}
      <motion.div
        style={{ opacity: opacity2, y: y2, x: x2 }}
        className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-[10%] p-6 z-10"
      >
        <div className="flex flex-col items-start max-w-3xl">
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 drop-shadow-md flex items-center gap-2">
                02 // THE ARSENAL <span className="w-12 h-px bg-brand" />
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-heading font-black text-white uppercase leading-[0.85] tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                TRAIN WITH <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">ELITE GEAR</span>
            </h2>
            <p className="border-l-2 border-brand pl-4 mt-6 text-gray-300 max-w-md text-sm md:text-base font-medium drop-shadow-md">
                Master your craft using biomechanically perfect machinery tailored for elite performance.
            </p>
        </div>
      </motion.div>

      {/* SCENE 3 */}
      <motion.div
        style={{ opacity: opacity3, y: y3, x: x3 }}
        className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-[10%] p-6 z-10"
      >
        <div className="flex flex-col items-end max-w-3xl text-right">
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 drop-shadow-md flex items-center gap-2">
                 <span className="w-12 h-px bg-brand" /> 03 // THE ASCENT
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-heading font-black text-white uppercase leading-[0.85] tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                SHATTER <br /><span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-blue-400 to-brand">LIMITS</span>
            </h2>
            <p className="border-r-2 border-brand pr-4 mt-6 text-gray-300 max-w-md text-sm md:text-base font-medium drop-shadow-md">
                Push completely past mental boundaries. Pain is temporary, greatness is forever.
            </p>
        </div>
      </motion.div>

      {/* SCENE 4: CTA */}
      <motion.div
        style={{ opacity: opacity4, y: y4 }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto p-6 z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-white/50 font-bold tracking-[0.5em] uppercase text-[10px] sm:text-xs mb-6">
                04 // THE PINNACLE
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-heading font-black text-white mb-10 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] uppercase leading-[0.9]">
                WELCOME TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">PINAKA</span>
            </h2>
            <Link
            href="#pricing"
            className="group relative px-10 py-5 bg-brand text-white font-black tracking-[0.2em] uppercase text-sm md:text-base rounded-full hover:bg-brand-light transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] hover:scale-[1.02] active:scale-95 flex items-center gap-3 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <span className="relative z-10">Ascend Now</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
