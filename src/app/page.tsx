import { Suspense } from "react";
import LocalBusinessLd from "@/components/LocalBusinessLd";
import dynamic from "next/dynamic";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectionHeader from "@/components/SectionHeader";
import Programs from "@/components/Programs";
import Trainers from "@/components/Trainers";

// Dynamically import below-the-fold heavy components (code‑splitting)
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
            src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1920&q=70"
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
          <section id="programs" className="scroll-mt-24 md:scroll-mt-28 py-20 md:py-28 px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                subtitle="OUR SERVICES"
                title="Programs"
                description="Explore our curated training programs designed for every fitness level."
              />
              <Programs />
            </div>
          </section>
          {/* Trainers Section */}
          <section id="trainers" className="scroll-mt-24 md:scroll-mt-28 py-20 md:py-28 px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                subtitle="MEET THE TEAM"
                title="Our Trainers"
                description="Professional coaches ready to guide you on every step of your fitness journey."
              />
              <Trainers />
            </div>
          </section>
          {/* Below‑the‑fold sections */}
          <section className="py-20 md:py-28">
            <Suspense fallback={<SectionSkeleton />}>
              <Showcase />
            </Suspense>
          </section>
          <section className="py-20 md:py-28 px-6">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                subtitle="PRICING"
                title="Membership Plans"
                description="Choose a plan that fits your goals and start your transformation today."
              />
              <Suspense fallback={<SectionSkeleton />}>
                <Pricing />
              </Suspense>
            </div>
          </section>
          <section className="py-20 md:py-28">
            <Suspense fallback={<SectionSkeleton />}>
              <SupportFAQ />
            </Suspense>
          </section>
          <section className="py-20 md:py-28">
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
    </>
  );
}
