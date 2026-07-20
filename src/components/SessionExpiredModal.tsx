"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onRedirect?: () => void;
}

export default function SessionExpiredModal({ isOpen, onRedirect }: SessionExpiredModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const handleRedirect = useCallback(() => {
    if (onRedirect) {
      onRedirect();
    }
    router.replace("/login");
  }, [onRedirect, router]);

  useEffect(() => {
    if (!isOpen) return;

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, handleRedirect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleRedirect}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-surfaceBorder bg-gradient-to-b from-[#121214] to-[#0a0a0c] p-8 text-center shadow-neon-strong z-10"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

            {/* Warning Icon with pulsating circle */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 mb-6">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/20 opacity-75" />
              <AlertTriangle className="h-10 w-10 text-brand" />
            </div>

            {/* Content */}
            <h3 className="font-heading text-2xl font-black uppercase tracking-wider text-white mb-3">
              Session Expired
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              Your account has been logged in on another device.
              <br />
              For your security, this session has been ended.
              <br />
              Please sign in again if this was you.
            </p>

            {/* Countdown Progress Bar */}
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-8">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="bg-brand h-full"
              />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleRedirect}
                className="group relative w-full flex items-center justify-center gap-2 py-4 bg-brand text-white font-black tracking-widest uppercase text-xs sm:text-sm rounded-xl hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-[1.01] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <span>Go to Login</span>
                <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <p className="text-gray-500 text-xs font-semibold">
                Redirecting to login in <span className="text-brand font-bold">{countdown}</span>...
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
