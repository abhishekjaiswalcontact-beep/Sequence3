'use client';

import { useRef } from 'react';
import { useScroll, useSpring } from 'framer-motion';
import ScrollyCanvas from '@/components/ScrollyCanvas';
import Overlay from '@/components/Overlay';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 35,
    mass: 0.35,
  });

  return (
    <section
      ref={containerRef}
      id="home"
      className="
        relative
        bg-black
        pt-[80px]
        h-[300vh]
        md:h-[500vh]
      "
    >
      <div className="sticky top-[80px] h-[calc(100vh-80px)] overflow-hidden bg-black">
        <ScrollyCanvas scrollYProgress={smoothProgress} />
        <Overlay scrollYProgress={smoothProgress} />
      </div>
    </section>
  );
}