'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { useAudio } from '@/context/AudioContext';

export default function ScrollSound() {
  const { isMuted } = useAudio();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isMuted) return;

    const initAudio = async () => {
      if (audioCtxRef.current) return;

      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();

      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 120;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();

      gainRef.current = gain;
      filterRef.current = filter;
    };

    window.addEventListener('pointerdown', initAudio, {
      once: true,
    });

    return () => {
      window.removeEventListener('pointerdown', initAudio);

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isMuted]);

  useLenis(({ velocity }) => {
    if (isMuted) return;

    if (
      !audioCtxRef.current ||
      !gainRef.current ||
      !filterRef.current
    ) {
      return;
    }

    const ctx = audioCtxRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const speed = Math.abs(velocity);

    const volume = Math.min(speed * 0.004, 0.12);

    const frequency = Math.min(
      120 + speed * 8,
      600
    );

    gainRef.current.gain.setTargetAtTime(
      volume,
      ctx.currentTime,
      0.08
    );

    filterRef.current.frequency.setTargetAtTime(
      frequency,
      ctx.currentTime,
      0.08
    );

if (timeoutRef.current !== null) {
  clearTimeout(timeoutRef.current);
}
    timeoutRef.current = setTimeout(() => {
      if (!gainRef.current) return;

      gainRef.current.gain.setTargetAtTime(
        0,
        ctx.currentTime,
        0.2
      );
    }, 80);
  });

  useEffect(() => {
    const clickSound = () => {
      if (isMuted || !audioCtxRef.current) return;

      const ctx = audioCtxRef.current;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';

      osc.frequency.setValueAtTime(
        700,
        ctx.currentTime
      );

      osc.frequency.exponentialRampToValueAtTime(
        300,
        ctx.currentTime + 0.03
      );

      gain.gain.setValueAtTime(
        0.12,
        ctx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.03
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    };

    window.addEventListener('click', clickSound);

    return () => {
      window.removeEventListener('click', clickSound);
    };
  }, [isMuted]);

  return null;
}