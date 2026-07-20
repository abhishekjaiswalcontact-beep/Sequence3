import { Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Programs from "@/components/Programs";
import Trainers from "@/components/Trainers";

// Dynamically import below-the-fold heavy components (code-splitting)
const Showcase = dynamic(() => import("@/components/Showcase"), { ssr: false });
const Pricing = dynamic(() => import("@/components/Pricing"), { ssr: false });
const SupportFAQ = dynamic(() => import("@/components/SupportFAQ"), { ssr: false });
const ContactUs = dynamic(() => import("@/components/ContactUs"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });

// Lightweight skeleton fallback for lazy sections
const SectionSkeleton = () => (
  <div className="py-24 px-6 container mx-auto animate-pulse">
    <div className="h-8 bg-white/5 rounded-lg w-48 mx-auto mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-white/5 rounded-2xl" />
      ))}
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="relative bg-black text-white selection:bg-brand/30">
      <Navbar />

      {/* Background/Hero Section */}
      <HeroSection />

      {/* Global Background Image — lazy loaded, pointer-events-none so it never blocks */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 opacity-40 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1920&q=70"
          alt=""
          fill
          className="object-cover pointer-events-none"
          loading="lazy"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full">
        {/* Programs, Trainers — critical above-fold content, eager loaded */}
        <Programs />
        <Trainers />

        {/* Below-the-fold sections — lazy loaded */}
        <Suspense fallback={<SectionSkeleton />}>
          <Showcase />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Pricing />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SupportFAQ />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ContactUs />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </main>
  );
}
