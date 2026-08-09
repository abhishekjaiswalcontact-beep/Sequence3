'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 196; // 0 to 195

// Build frame path — prefer WebP
const getFrameSrc = (i: number) => {
  const name = i.toString().padStart(3, '0');
  return `/sequence/frame_${name}_delay-0.066s.webp`;
};

// State enum for frame loading
const STATUS_UNLOADED = 0;
const STATUS_LOADING = 1;
const STATUS_LOADED = 2;
const STATUS_ERROR = 3;

export default function ScrollyCanvas({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT).fill(null));
  const frameStatusRef = useRef<Uint8Array>(new Uint8Array(FRAME_COUNT));
  const loadedCount = useRef(0);
  const lastFrameIndex = useRef(-1);
  const lastRenderedIndex = useRef(-1);

  // Helper to trigger custom event for loading progress
  const emitProgress = useCallback(() => {
    const progress = Math.min(100, Math.round((loadedCount.current / FRAME_COUNT) * 100));
    window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));
  }, []);

  // 🎯 Draw frame on canvas with fallback to nearest loaded frame
  const renderFrame = useCallback((targetIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (!canvasWidth || !canvasHeight) return;

    // Find requested or nearest available loaded frame
    let source: HTMLImageElement | null = null;
    let actualIndex = targetIndex;

    if (imagesRef.current[targetIndex]?.complete && frameStatusRef.current[targetIndex] === STATUS_LOADED) {
      source = imagesRef.current[targetIndex];
    } else {
      // Search expanding radius for closest loaded frame
      for (let radius = 1; radius < 30; radius++) {
        const prev = targetIndex - radius;
        const next = targetIndex + radius;
        if (prev >= 0 && imagesRef.current[prev]?.complete && frameStatusRef.current[prev] === STATUS_LOADED) {
          source = imagesRef.current[prev];
          actualIndex = prev;
          break;
        }
        if (next < FRAME_COUNT && imagesRef.current[next]?.complete && frameStatusRef.current[next] === STATUS_LOADED) {
          source = imagesRef.current[next];
          actualIndex = next;
          break;
        }
      }
    }

    if (!source) return;

    const srcWidth = source.naturalWidth;
    const srcHeight = source.naturalHeight;
    if (!srcWidth || !srcHeight) return;

    // Skip if exact same source frame was already rendered
    if (actualIndex === lastRenderedIndex.current && canvasWidth === canvas.width && canvasHeight === canvas.height) {
      return;
    }
    lastRenderedIndex.current = actualIndex;

    const scale = Math.max(canvasWidth / srcWidth, canvasHeight / srcHeight);
    const x = canvasWidth / 2 - (srcWidth / 2) * scale;
    const y = canvasHeight / 2 - (srcHeight / 2) * scale;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(source, x, y, srcWidth * scale, srcHeight * scale);
  }, []);

  // Single frame preloader
  const loadSingleFrame = useCallback((index: number, isPriority = false): Promise<boolean> => {
    if (index < 0 || index >= FRAME_COUNT) return Promise.resolve(false);
    if (frameStatusRef.current[index] !== STATUS_UNLOADED) return Promise.resolve(frameStatusRef.current[index] === STATUS_LOADED);

    frameStatusRef.current[index] = STATUS_LOADING;
    const img = new Image();
    if (isPriority) {
      // High priority hint for browser resource scheduler
      (img as unknown as { fetchPriority?: string }).fetchPriority = 'high';
    }
    img.decoding = 'async';
    img.src = getFrameSrc(index);

    return new Promise((resolve) => {
      img.onload = () => {
        imagesRef.current[index] = img;
        frameStatusRef.current[index] = STATUS_LOADED;
        loadedCount.current++;
        emitProgress();

        // If this is frame 0 or the current target frame, render immediately
        if (index === 0 || index === lastFrameIndex.current) {
          renderFrame(index);
        }
        resolve(true);
      };
      img.onerror = () => {
        frameStatusRef.current[index] = STATUS_ERROR;
        loadedCount.current++;
        emitProgress();
        resolve(false);
      };
    });
  }, [emitProgress, renderFrame]);

  // Request window of frames around a given index
  const requestFrameWindow = useCallback((centerIndex: number) => {
    const range = 8;
    const start = Math.max(0, centerIndex - 2);
    const end = Math.min(FRAME_COUNT - 1, centerIndex + range);

    for (let i = start; i <= end; i++) {
      if (frameStatusRef.current[i] === STATUS_UNLOADED) {
        loadSingleFrame(i, true);
      }
    }
  }, [loadSingleFrame]);

  // 🚀 Initial Load Strategy:
  // 1. Instantly load Frame 0 (critical LCP asset)
  // 2. Load immediate buffer (1..5)
  // 3. Defer remaining sequence frames progressively via idle callback
  useEffect(() => {
    let cancelled = false;

    async function initSequence() {
      // Step 1: Load Frame 0 immediately
      await loadSingleFrame(0, true);
      if (cancelled) return;

      // Draw frame 0 right away
      renderFrame(0);

      // Step 2: Load immediate buffer (1 to 5)
      for (let i = 1; i <= 5; i++) {
        loadSingleFrame(i);
      }

      // Step 3: Progressive background loading in idle chunks
      const loadNextChunk = (startIndex: number) => {
        if (cancelled || startIndex >= FRAME_COUNT) return;

        const chunkSize = 6;
        const promises = [];
        for (let i = startIndex; i < Math.min(FRAME_COUNT, startIndex + chunkSize); i++) {
          if (frameStatusRef.current[i] === STATUS_UNLOADED) {
            promises.push(loadSingleFrame(i));
          }
        }

        const scheduleNext = () => {
          if (cancelled) return;
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => loadNextChunk(startIndex + chunkSize), { timeout: 1500 });
          } else {
            setTimeout(() => loadNextChunk(startIndex + chunkSize), 60);
          }
        };

        Promise.all(promises).then(scheduleNext).catch(scheduleNext);
      };

      // Delay start of progressive preloading until initial render completes
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadNextChunk(6), { timeout: 2000 });
      } else {
        setTimeout(() => loadNextChunk(6), 200);
      }
    }

    initSequence();

    return () => {
      cancelled = true;
    };
  }, [loadSingleFrame, renderFrame]);

  // 🌀 Scroll → frame mapping (with deduplication & scroll-driven priority fetch)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest * (FRAME_COUNT - 1))));

    if (frameIndex === lastFrameIndex.current) return;
    lastFrameIndex.current = frameIndex;

    // Prioritize fetching surrounding frames on scroll
    requestFrameWindow(frameIndex);

    requestAnimationFrame(() => {
      renderFrame(frameIndex);
    });
  });

  // 📐 Responsive Canvas Resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
      }

      const currentProgress = scrollYProgress.get();
      const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(currentProgress * (FRAME_COUNT - 1)));
      renderFrame(frameIndex);
    };

    resizeCanvas();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [scrollYProgress, renderFrame]);

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden">
      {/* Critical Hero Image (SSR poster fallback for instant visual paint) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getFrameSrc(0)}
        alt="Hero sequence poster"
        fetchPriority="high"
        decoding="sync"
        className="absolute inset-0 w-full h-full object-cover -z-20 pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full -z-10"
        style={{ willChange: 'contents' }}
      />
    </div>
  );
}