'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { useAudio } from '@/context/AudioContext';

export default function ScrollSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isMuted } = useAudio();

  // Initialize audio context on first user interaction to comply with browser autoplay policies
  useEffect(() => {
    const initAudio = () => {
      if (audioCtxRef.current || isMuted) return;
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create continuous brown noise buffer (smooth, non-harsh sound)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate gain
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for a subtle UI whoosh / mechanical glide sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100; // very low, smooth rumble initially
      filterNodeRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.value = 0; // Start muted
      gainNodeRef.current = gain;

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();

      // Clean up event listeners after init
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    if (!isMuted) {
      window.addEventListener('click', initAudio);
      window.addEventListener('touchstart', initAudio, { passive: true });
      window.addEventListener('keydown', initAudio);
    }

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isMuted]);

  useLenis((lenis) => {
    if (!audioCtxRef.current || !gainNodeRef.current || !filterNodeRef.current || isMuted) {
      if (gainNodeRef.current && audioCtxRef.current && isMuted) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
      return;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    const { velocity } = lenis;
    const absVelocity = Math.abs(velocity);

    if (absVelocity > 0.1) {
      if (!isPlaying) setIsPlaying(true);

      // Volume mapped to velocity. Cap at low volume (0.15) for non-intrusiveness
      const targetVolume = Math.min(absVelocity * 0.005, 0.15); 
      
      // Pitch/frequency mapping to velocity. Gives a slight dynamic rise in pitch when scrolling faster
      const targetFrequency = Math.min(100 + absVelocity * 10, 500);

      const currentTime = audioCtxRef.current.currentTime;
      // Smoothly ramp to the target values to prevent glitchy audio popping
      gainNodeRef.current.gain.setTargetAtTime(targetVolume, currentTime, 0.05);
      filterNodeRef.current.frequency.setTargetAtTime(targetFrequency, currentTime, 0.05);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Tail delay so sound linearly fades out instead of abruptly cutting off when stopped
      timeoutRef.current = setTimeout(() => {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
        }
        setIsPlaying(false);
      }, 100);

    } else {
      if (isPlaying) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
        setIsPlaying(false);
      }
    }
  });

  // Global click sound effect
  useEffect(() => {
    const handleActionClick = (e: MouseEvent) => {
      if (isMuted) return;

      const target = e.target as HTMLElement;
      // Check if clicked element or its parent is a button or link
      const isClickable = target.closest('button, a, [role="button"]');
      
      if (isClickable && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        
        // Synthesize a very short, modern UI "tick" sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Start high pitch and drop fast for a 'click' sensation
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.02);
        
        // Quick volume pop and fade
        gain.gain.setValueAtTime(0.15, ctx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      }
    };

    window.addEventListener('click', handleActionClick);

    return () => {
      window.removeEventListener('click', handleActionClick);
    };
  }, [isMuted]);

  return null;
}
