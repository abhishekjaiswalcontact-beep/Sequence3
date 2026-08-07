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
        lerp: 0.1,             // Slightly reduced — smoother on low-end devices
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,      // Disable smooth scroll interception on touch / mobile (fixes table scroll & nested scroll)
        touchMultiplier: 1.5,  // Natural touch feel
        wheelMultiplier: 0.8,  // Less aggressive on desktop trackpads
        infinite: false,
        autoRaf: true,         // Lenis manages its own RAF loop — avoids double RAF
      }}
    >
      {children}
    </ReactLenis>
  );
}