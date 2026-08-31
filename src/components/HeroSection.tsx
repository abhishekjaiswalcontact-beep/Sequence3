'use client';

import ScrollyCanvas from '@/components/ScrollyCanvas';
import Overlay from '@/components/Overlay';

export default function HeroSection() {
  return (
    <section
      id="home"
      className="
        relative
        bg-[#040408]
        pt-[84px]
        sm:pt-[96px]
        md:pt-[104px]
        pb-8
        sm:pb-12
        min-h-[calc(100svh-80px)]
        lg:min-h-[calc(100vh-80px)]
        w-full
        max-w-full
        flex
        flex-col
        justify-between
        overflow-hidden
      "
    >
      {/* Ambient Depth & Luxury Lighting Layers */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
        {/* Top-Center Purple Ambient Glow */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[85vw] max-w-[850px] h-[420px] bg-gradient-to-b from-brand/20 via-purple-600/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        
        {/* Mid-Left Cyan/Blue Ambient Accent */}
        <div className="absolute top-[35%] -left-[10%] w-[45vw] max-w-[450px] h-[380px] bg-blue-600/12 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Mid-Right Violet Ambient Accent */}
        <div className="absolute top-[40%] -right-[10%] w-[45vw] max-w-[450px] h-[380px] bg-brand/12 rounded-full blur-[120px] pointer-events-none" />

        {/* Futuristic Micro Matrix Grid with Radial Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_40%,black_30%,transparent_100%)] pointer-events-none" />
      </div>

      <ScrollyCanvas />
      <Overlay />

      {/* ── Seamless Visual Transition into Programs Section ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-transparent via-[#040408]/60 to-black pointer-events-none z-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] max-w-[700px] h-20 bg-gradient-to-t from-brand/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none z-10" />
    </section>
  );
}