'use client';

import { useEffect, useRef } from 'react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 196; // 0 to 195

export default function ScrollyCanvas({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedImages = useRef(0);

  const loadingStarted = useRef(false);
  
  // 🔥 Preload all frames
  useEffect(() => {
    if (loadingStarted.current) return;
    loadingStarted.current = true;
    
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i
        .toString()
        .padStart(3, '0')}_delay-0.066s.png`;

      img.onload = () => {
        loadedImages.current++;
        
        // Emit progress event
        const progress = Math.min(100, (loadedImages.current / FRAME_COUNT) * 100);
        window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));

        // first frame load hone pe render
        if (loadedImages.current === 1) {
          renderFrame(0);
        }
      };

      img.onerror = () => {
        // Increment count even on error to ensure progress reaches 100
        loadedImages.current++;
        const progress = Math.min(100, (loadedImages.current / FRAME_COUNT) * 100);
        window.dispatchEvent(new CustomEvent('scrolly-loading-progress', { detail: progress }));
      };

      images.push(img);
    }

    imagesRef.current = images;
  }, []);

  // 🎯 Draw frame on canvas
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const images = imagesRef.current;

    if (!canvas || !images[index]) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[index];

    if (!img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scale = Math.max(
      canvasWidth / img.width,
      canvasHeight / img.height
    );

    const x = canvasWidth / 2 - (img.width / 2) * scale;
    const y = canvasHeight / 2 - (img.height / 2) * scale;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  // 🌀 Scroll → frame mapping
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.floor(latest * (FRAME_COUNT - 1));

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
      const frameIndex = Math.floor(currentProgress * (FRAME_COUNT - 1));

      renderFrame(frameIndex);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [scrollYProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
    />
  );
}