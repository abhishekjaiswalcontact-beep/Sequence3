import { Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Programs from "@/components/Programs";
import Trainers from "@/components/Trainers";

// Dynamically import below-the-fold components to reduce initial bundle
const Showcase = dynamic(() => import("@/components/Showcase"), { ssr: false });
const Pricing = dynamic(() => import("@/components/Pricing"), { ssr: false });
const SupportFAQ = dynamic(() => import("@/components/SupportFAQ"), { ssr: false });
const ContactUs = dynamic(() => import("@/components/ContactUs"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });

// Lightweight skeleton fallbacks
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

      {/* Global Background Image — lazy loaded, properly sized */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1920&q=70"
          alt=""
          fill
          className="object-cover"
          loading="lazy"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full">
        <section id="programs" className="py-24 px-6 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Our Programs</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Programs />
        </section>

        <section id="trainers" className="py-24 px-6 container mx-auto bg-black/50 backdrop-blur-sm rounded-[3rem] border border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter text-white">Elite Trainers</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Trainers />
        </section>

        <section id="showcase" className="py-24">
          <Suspense fallback={<SectionSkeleton />}>
            <Showcase />
          </Suspense>
        </section>

        <section id="pricing" className="py-24 px-6 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Membership Plans</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Suspense fallback={<SectionSkeleton />}>
            <Pricing />
          </Suspense>
        </section>

        <section id="faq" className="py-24 px-6 container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Help & FAQ</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Suspense fallback={<SectionSkeleton />}>
            <SupportFAQ />
          </Suspense>
        </section>

        <section id="contact" className="py-24 px-6">
          <Suspense fallback={<SectionSkeleton />}>
            <ContactUs />
          </Suspense>
        </section>
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
