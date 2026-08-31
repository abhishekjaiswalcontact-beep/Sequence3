'use client';

import { useEffect, useRef, useCallback } from 'react';

const FRAME_COUNT = 196; // 0 to 195
const TARGET_FPS = 18; // Cinematic frame rate for smooth motion
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// Build frame path — WebP
const getFrameSrc = (i: number) => {
  const name = i.toString().padStart(3, '0');
  return `/sequence/frame_${name}_delay-0.066s.webp`;
};

// State enum for frame loading
const STATUS_UNLOADED = 0;
const STATUS_LOADING = 1;
const STATUS_LOADED = 2;
const STATUS_ERROR = 3;

export default function ScrollyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT).fill(null));
  const frameStatusRef = useRef<Uint8Array>(new Uint8Array(FRAME_COUNT));
  const loadedCount = useRef(0);
  const currentFrameRef = useRef(0);
  const lastRenderedIndex = useRef(-1);
  const isVisibleRef = useRef(true);

  // Helper to trigger custom event for loading progress
  const emitProgress = useCallback(() => {
    const progress = Math.min(100, Math.round((loadedCount.current / FRAME_COUNT) * 100));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));
    }
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
      for (let radius = 1; radius < 25; radius++) {
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

    // Skip if exact same source frame was already rendered at this size
    if (actualIndex === lastRenderedIndex.current) {
      return;
    }
    lastRenderedIndex.current = actualIndex;

    const scale = Math.max(canvasWidth / srcWidth, canvasHeight / srcHeight);
    const x = canvasWidth / 2 - (srcWidth / 2) * scale;
    const y = canvasHeight / 2 - (srcHeight / 2) * scale;

    ctx.drawImage(source, x, y, srcWidth * scale, srcHeight * scale);
  }, []);

  // Single frame preloader
  const loadSingleFrame = useCallback((index: number, isPriority = false): Promise<boolean> => {
    if (index < 0 || index >= FRAME_COUNT) return Promise.resolve(false);
    if (frameStatusRef.current[index] !== STATUS_UNLOADED) return Promise.resolve(frameStatusRef.current[index] === STATUS_LOADED);

    frameStatusRef.current[index] = STATUS_LOADING;
    const img = new Image();
    if (isPriority) {
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

        if (index === 0) {
          renderFrame(0);
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

  // Initial Preloading & Progressive Background Load
  useEffect(() => {
    let cancelled = false;

    async function initSequence() {
      // Step 1: Load Frame 0 immediately (critical LCP asset)
      await loadSingleFrame(0, true);
      if (cancelled) return;
      renderFrame(0);

      // Step 2: Load immediate buffer (1 to 10)
      for (let i = 1; i <= 10; i++) {
        loadSingleFrame(i);
      }

      // Step 3: Progressive background loading in chunks
      const loadNextChunk = (startIndex: number) => {
        if (cancelled || startIndex >= FRAME_COUNT) return;

        const chunkSize = 8;
        const promises = [];
        for (let i = startIndex; i < Math.min(FRAME_COUNT, startIndex + chunkSize); i++) {
          if (frameStatusRef.current[i] === STATUS_UNLOADED) {
            promises.push(loadSingleFrame(i));
          }
        }

        const scheduleNext = () => {
          if (cancelled) return;
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => loadNextChunk(startIndex + chunkSize), { timeout: 1000 });
          } else {
            setTimeout(() => loadNextChunk(startIndex + chunkSize), 50);
          }
        };

        Promise.all(promises).then(scheduleNext).catch(scheduleNext);
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadNextChunk(11), { timeout: 1500 });
      } else {
        setTimeout(() => loadNextChunk(11), 150);
      }
    }

    initSequence();

    return () => {
      cancelled = true;
    };
  }, [loadSingleFrame, renderFrame]);

  // 🎬 Smooth Continuous Cinema Playback Loop (pauses when out of view)
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = 0;

    const loop = (timestamp: number) => {
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      if (elapsed >= FRAME_INTERVAL) {
        lastTimestamp = timestamp - (elapsed % FRAME_INTERVAL);
        currentFrameRef.current = (currentFrameRef.current + 1) % FRAME_COUNT;
        renderFrame(currentFrameRef.current);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [renderFrame]);

  // 👁️ Pause loop when scrolled offscreen for battery/CPU efficiency
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 📐 Responsive Canvas Resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const newWidth = Math.round(rect.width);
      const newHeight = Math.round(rect.height);

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        lastRenderedIndex.current = -1; // Force redraw on resize
        renderFrame(currentFrameRef.current);
      }
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
  }, [renderFrame]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 bg-[#040408] overflow-hidden pointer-events-none select-none">
      {/* Critical Hero Image (SSR poster fallback for instant visual paint) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getFrameSrc(0)}
        alt="Hero cinematic background"
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