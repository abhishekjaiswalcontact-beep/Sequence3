'use client';

import { useEffect, useRef } from 'react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 196; // 0 to 195

// Build frame path — prefer WebP, fall back to PNG
const getFrameSrc = (i: number) => {
  const name = i.toString().padStart(3, '0');
  return `/sequence/frame_${name}_delay-0.066s.webp`;
};

export default function ScrollyCanvas({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  // Cache ImageBitmap for fast GPU-accelerated drawImage
  const bitmapsRef = useRef<(ImageBitmap | null)[]>(new Array(FRAME_COUNT).fill(null));
  const loadedImages = useRef(0);
  const loadingStarted = useRef(false);
  const lastFrameIndex = useRef(-1); // Skip rendering if same frame

  // 🔥 Preload all frames
  useEffect(() => {
    if (loadingStarted.current) return;
    loadingStarted.current = true;

    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.decoding = 'async'; // Non-blocking decode

      img.onload = async () => {
        loadedImages.current++;

        // Cache as ImageBitmap for faster drawImage
        try {
          bitmapsRef.current[i] = await createImageBitmap(img);
        } catch {
          // ImageBitmap not supported — fall back to regular img
        }

        // Emit progress event
        const progress = Math.min(100, (loadedImages.current / FRAME_COUNT) * 100);
        window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));

        // First frame: render immediately
        if (loadedImages.current === 1) {
          renderFrame(0);
        }
      };

      img.onerror = () => {
        loadedImages.current++;
        const progress = Math.min(100, (loadedImages.current / FRAME_COUNT) * 100);
        window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));
      };

      images.push(img);
    }

    imagesRef.current = images;

    const currentBitmaps = bitmapsRef.current;
    // Cleanup bitmaps on unmount to free GPU memory
    return () => {
      currentBitmaps.forEach(bm => bm?.close());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🎯 Draw frame on canvas
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // alpha:false = faster compositing
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Try ImageBitmap first (GPU-accelerated), fall back to img
    const bitmap = bitmapsRef.current[index];
    const img = imagesRef.current[index];
    const source: ImageBitmap | HTMLImageElement | null = bitmap ?? (img?.complete ? img : null);

    if (!source) return;

    const srcWidth = 'width' in source ? source.width : (source as HTMLImageElement).naturalWidth;
    const srcHeight = 'height' in source ? source.height : (source as HTMLImageElement).naturalHeight;

    if (!srcWidth || !srcHeight) return;

    const scale = Math.max(canvasWidth / srcWidth, canvasHeight / srcHeight);
    const x = canvasWidth / 2 - (srcWidth / 2) * scale;
    const y = canvasHeight / 2 - (srcHeight / 2) * scale;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(source as CanvasImageSource, x, y, srcWidth * scale, srcHeight * scale);
  };

  // 🌀 Scroll → frame mapping (with deduplication)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest * (FRAME_COUNT - 1))));

    // Skip if same frame — avoids redundant canvas draws
    if (frameIndex === lastFrameIndex.current) return;
    lastFrameIndex.current = frameIndex;

    requestAnimationFrame(() => {
      renderFrame(frameIndex);
    });
  });

  // 📐 Resize handling
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const currentProgress = scrollYProgress.get();
      const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(currentProgress * (FRAME_COUNT - 1)));
      renderFrame(frameIndex);
    };

    resizeCanvas();

    // Debounce resize to avoid thrashing on mobile rotation
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
      style={{ willChange: 'contents' }} // GPU layer hint
    />
  );
}