'use client';

import { ReactLenis } from 'lenis/react';

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1,
        wheelMultiplier: 1,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}