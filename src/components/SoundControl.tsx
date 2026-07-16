'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export default function SoundControl() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="fixed bottom-6 left-6 z-[100] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-brand/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
    >
      <div className="absolute inset-0 rounded-full bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
      
      <AnimatePresence mode="wait">
        {isMuted ? (
          <motion.div
            key="muted"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
            <VolumeX className="w-5 h-5 text-red-400" />
          </motion.div>
        ) : (
          <motion.div
            key="unmuted"
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
            <Volume2 className="w-5 h-5 text-brand" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sound Waves Animation when active */}
      {!isMuted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: [0.8, 1.8], 
                opacity: [0.5, 0] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.8,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border border-brand/30"
            />
          ))}
        </div>
      )}

      {/* Modern Tooltip */}
      <div className="absolute left-full ml-4 px-3 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap translate-x-1 group-hover:translate-x-0">
        Sound: {isMuted ? 'Off' : 'On'}
      </div>
    </motion.button>
  );
}
