"use client";

/**
 * AICoachGate — renders the AI Coach floating button ONLY for authenticated users.
 *
 * Usage:
 *   <AICoachGate />                          — default (no auto-open)
 *   <AICoachGate autoOpen greeting="..." />  — dashboard welcome
 *
 * Visibility rules:
 *   - Not hydrated yet  → renders nothing (prevents flicker)
 *   - Not authenticated → renders nothing
 *   - Authenticated     → renders <AICoach> with a smooth fade-in
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';

const AICoach = dynamic(() => import("@/components/AICoach"), { ssr: false });

interface AICoachGateProps {
  autoOpen?: boolean;
  greeting?: string;
}

export default function AICoachGate(props: AICoachGateProps) {
  const { isAuthenticated, isHydrated } = useAuth();

  // Don't render anything until we've read the cookie (prevents SSR flicker)
  if (!isHydrated) return null;

  return (
    <AnimatePresence>
      {isAuthenticated && (
        <motion.div
          key="ai-coach-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AICoach {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
