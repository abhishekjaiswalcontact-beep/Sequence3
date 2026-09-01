import { Suspense } from "react";
import LocalBusinessLd from "@/components/LocalBusinessLd";
import dynamic from "next/dynamic";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectionHeader from "@/components/SectionHeader";

import Programs from "@/components/Programs";
import Trainers from "@/components/Trainers";
import Showcase from "@/components/Showcase";
import Pricing from "@/components/Pricing";
import SupportFAQ from "@/components/SupportFAQ";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";

// Lazy-load floating Chatbot widget so it does not block initial load
const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });

export const metadata = {
  title: "PINAKA FITNESS - Gym & Fitness Center in Noida",
  description:
    "PINAKA FITNESS is a premier gym and fitness center in Noida offering personal training, workouts, and full‑service fitness programs. Join us for state‑of‑the‑art equipment and expert guidance.",
  keywords: [
    "Pinaka Fitness",
    "Gym",
    "Fitness",
    "Personal Training",
    "Workout",
    "Noida",
    "Uttar Pradesh",
  ],
  openGraph: {
    title: "PINAKA FITNESS - Gym & Fitness Center in Noida",
    description:
      "Experience top‑class gym facilities and personal training in Noida at PINAKA FITNESS.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://pinakafitness.com",
    images: [{ url: "/logo1.png", width: 800, height: 600 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PINAKA FITNESS - Gym & Fitness Center in Noida",
    description:
      "Join PINAKA FITNESS for premium gym and personal training in Noida.",
    images: ["/logo1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <LocalBusinessLd />
      <main className="relative bg-black text-white selection:bg-brand/30">
        <Navbar />
        {/* Background/Hero Section */}
        <HeroSection />
        {/* Global Background Image — lazy loaded, pointer‑events‑none so it never blocks */}
        <div className="fixed top-0 left-0 w-full h-full -z-20 opacity-40 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1080&q=75&auto=format"
            alt="Gym interior background in Noida"
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
          {/* Programs Section */}
          <section id="programs" className="scroll-mt-24 md:scroll-mt-28 pt-8 sm:pt-12 md:pt-14 pb-20 md:pb-28 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                eyebrowStyle="pill"
                subtitle="OUR SERVICES"
                title={
                  <>
                    TRAINING <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-300">PROTOCOLS</span>
                  </>
                }
                description="Explore our scientifically engineered training systems built for raw strength, metabolic endurance, and aesthetic conditioning."
              />
              <Programs />
            </div>
          </section>
          {/* Trainers Section */}
          <section id="trainers" className="scroll-mt-24 md:scroll-mt-28 py-20 md:py-28 px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                eyebrowStyle="glow-line"
                subtitle="MEET THE TEAM"
                title={
                  <>
                    MASTER <span className="italic font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">COACHES</span>
                  </>
                }
                description="World-class certified specialists and sports scientists dedicated to guiding every single milestone of your physical journey."
              />
              <Trainers />
            </div>
          </section>
          {/* Below‑the‑fold sections */}
          <section className="py-20 md:py-28">
            <Showcase />
          </section>
          <section className="py-20 md:py-28 px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                eyebrowStyle="pill"
                subtitle="PRICING & TIERS"
                title={
                  <>
                    MEMBERSHIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-blue-400">PLANS</span>
                  </>
                }
                description="Transparent, all-inclusive access designed to fuel your ambition with world-class facilities, recovery, and coaching."
              />
              <Pricing />
            </div>
          </section>
          <section className="py-20 md:py-28">
            <SupportFAQ />
          </section>
          <section className="py-20 md:py-28">
            <ContactUs />
          </section>
        </div>
        <Footer />
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      </main>
    </>
  );
}
