"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import Image from "next/image";

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const loadingTexts = [
  "INITIALIZING",
  "LOADING ASSETS",
  "PREPARING EXPERIENCE",
  "ALMOST READY",
];

export default function Preloader({
  onLoadingComplete,
}: PreloaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 4.5,
      ease: "easeInOut",
      onUpdate(value) {
        setProgress(value);
      },
      onComplete() {
        setTimeout(() => {
          setLoading(false);
          onLoadingComplete?.();
        }, 400);
      },
    });

    return () => controls.stop();
  }, [onLoadingComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.6 },
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#07070B]"
        >
          {/* Background */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,.15),transparent_70%)]" />

          {/* Background decorations — CSS animations (GPU thread, not JS thread) */}
          <div className="absolute w-[850px] h-[850px] rounded-full border border-violet-500/10 animate-[spin_50s_linear_infinite]" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-violet-400/10 animate-[spin_70s_linear_infinite_reverse]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-600 blur-[120px] animate-[pulse_5s_ease-in-out_infinite] opacity-20" />

          {/* Content */}

          <div className="relative z-20 flex flex-col items-center">

            {/* Logo */}

            <motion.div
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-32 h-32 md:w-40 md:h-40"
            >
              <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl" />

              <Image
                src="/logo0.png"
                alt="Pinaka Fitness"
                fill
                priority
                className="relative object-contain drop-shadow-[0_0_25px_rgba(139,92,246,.8)]"
              />
            </motion.div>

            {/* Heading */}

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8 }}
              className="mt-8text-2xlsm:text-3xlmd:text-5xlfont-blackuppercasetracking-[0.08em]md:tracking-[0.22em]text-centerpx-5leading-tighttext-transparentbg-clip-textbg-gradient-to-bfrom-whitevia-violet-200to-violet-500">
              PINAKA FITNESS
            </motion.h1>

            {/* Loading Text */}

            <motion.p
              key={textIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: .3 }}
              className="mt-5 uppercase tracking-[0.45em] text-violet-300/70 text-xs"
            >
              {loadingTexts[textIndex]}
            </motion.p>
            {/* Progress Bar */}

            <div className="mt-10 w-[320px] max-w-[85vw]">

              <div className="relative h-2 rounded-full overflow-hidden bg-white/10 border border-violet-500/20">

                {/* Progress */}

                <motion.div
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    ease: "easeOut",
                    duration: 0.2,
                  }}
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-700 via-violet-500 to-violet-300"
                />

                {/* Shine */}

                <motion.div
                  animate={{
                    x: ["-120%", "450%"],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 top-0 h-full w-16 bg-white/50 blur-sm"
                />

              </div>

              {/* Bottom Row */}

              <div className="mt-4 flex items-center justify-between">

                <span className="text-[11px] uppercase tracking-[0.35em] text-violet-300/60">
                  Loading
                </span>

                <motion.span
                  key={Math.round(progress)}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-white text-lg"
                >
                  {Math.round(progress)}%
                </motion.span>

              </div>

            </div>

            {/* Bottom Glow */}

            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="mt-12 w-56 h-2 rounded-full bg-violet-500 blur-xl"
            />

          </div>

          {/* Noise Overlay */}

          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
}