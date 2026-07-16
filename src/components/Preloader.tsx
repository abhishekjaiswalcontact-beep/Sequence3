"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import Image from "next/image";

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // For smooth number counter
  const progressValue = useMotionValue(0);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate the motion value to the actual progress
    const controls = animate(progressValue, progress, {
      type: "spring",
      stiffness: 50,
      damping: 20,
      onUpdate: (latest) => {
        if (progressRef.current) {
          progressRef.current.textContent = `${Math.round(latest)}%`;
        }
      }
    });
    return controls.stop;
  }, [progress, progressValue]);

  useEffect(() => {
    // Ensure the animation completes fully within 10 seconds
    const duration = 10000; // 10 seconds
    const intervalTime = 30; // 30ms per tick
    const steps = duration / intervalTime;
    let currentStep = 0;

    // Smooth, auto-filling progress bar
    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          if (onLoadingComplete) onLoadingComplete();
        }, 600); // Smooth transition once 100% is reached
      }
    }, intervalTime);

    // Listen to real progress to speed it up if actual load is faster
    const handleProgress = (e: Event) => {
      const p = (e as CustomEvent).detail;
      if (p > (currentStep / steps) * 100) {
        currentStep = Math.max(currentStep, Math.floor((p / 100) * steps));
      }
    };

    window.addEventListener('scrolly-loading-progress', handleProgress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scrolly-loading-progress', handleProgress);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 2.05,
            filter: "blur(10px)",
            transition: { duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Animated Background Effects */}
          <motion.div
            animate={{
              rotate: 180,
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 blur-[120px] rounded-full -z-10"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-light/5 blur-[80px] rounded-full -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center gap-10 w-full px-6 text-center z-10"
          >
            {/* Logo Container with Rings */}
            <div className="relative flex items-center justify-center">
              {/* Rotating Ring 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20%] rounded-full border-t-2 border-r-2 border-brand/30 border-t-brand"
              />
              {/* Rotating Ring 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-35%] rounded-full border-b-2 border-l-2 border-brand/20 border-b-brand-light opacity-50"
              />

              {/* Logo Glow */}
              <motion.div
                animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-brand/30 rounded-full blur-[24px]"
              />

              {/* Logo */}
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="relative w-28 h-28 md:w-36 md:h-36 z-10"
              >
                <Image
                  src="/logo0.png"
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.7)]"
                  priority
                />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center w-full space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-3xl md:text-4xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#d4c5f9] to-[#8b5cf6] text-center w-full"
                style={{
                  filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.6)) drop-shadow(0px 0px 15px rgba(139,92,246,0.8))"
                }}
              >
                PINAKA FITNESS
              </motion.h2>

              {/* Progress Bar Container */}
              <div className="w-full max-w-[280px] space-y-4 mx-auto">
                <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 60,
                      damping: 15,
                      mass: 0.8
                    }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-dark via-brand to-brand-light rounded-full"
                  >
                    {/* Inner glowing edge */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]" />
                  </motion.div>
                </div>

                <div className="flex justify-between items-center w-full px-1">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-brand-light/70 text-xs md:text-sm font-sans uppercase tracking-[0.25em]"
                  >
                    Initiating
                  </motion.p>
                  <span
                    ref={progressRef}
                    className="text-sm font-mono text-white font-bold tracking-widest drop-shadow-neon"
                  >
                    0%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
