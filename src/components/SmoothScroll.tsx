'use client';

import { ReactLenis } from 'lenis/react';
import { useEffect, useState } from 'react';

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(true); // Default to true for SSR safety

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,             // Slightly reduced — smoother on low-end devices
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,      // Disable smooth scroll interception on touch / mobile
        touchMultiplier: 1.5,  // Natural touch feel
        wheelMultiplier: 0.8,  // Less aggressive on desktop trackpads
        infinite: false,
        autoRaf: true,         // Lenis manages its own RAF loop
      }}
    >
      {children}
    </ReactLenis>
  );
}