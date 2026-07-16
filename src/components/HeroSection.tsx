'use client';

import { useRef } from 'react';
import { useScroll, useSpring } from 'framer-motion';
import ScrollyCanvas from '@/components/ScrollyCanvas';
import Overlay from '@/components/Overlay';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Create a spring configuration for snappy but buttery smooth frame interpolation
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 300, 
    damping: 50,
    mass: 0.5
  });

  return (
    <section ref={containerRef} id="home" className="relative h-[500vh] bg-black pt-[80px]">
      <div className="sticky top-[80px] h-[calc(100vh-80px)] w-full overflow-hidden bg-black">
        <ScrollyCanvas scrollYProgress={smoothProgress} />
        <Overlay scrollYProgress={smoothProgress} />
      </div>
    </section>
  );
}
