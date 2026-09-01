'use client';

import { ReactLenis } from 'lenis/react';
import { useEffect, useState } from 'react';

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,            // Responsive linear interpolation for instant response
        duration: 0.9,         // Snappy duration without floaty drag
        smoothWheel: !reducedMotion,
        syncTouch: false,      // Native momentum scroll on touch devices (mobile & tablet)
        touchMultiplier: 1.0,  // 1:1 natural touch tracking
        wheelMultiplier: 1.0,  // 1:1 responsive desktop trackpad & mouse wheel tracking
        infinite: false,
        autoRaf: true,         // Managed internal RAF loop
      }}
    >
      {children}
    </ReactLenis>
  );
}