import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CareersSection from "@/components/CareersSection";
import { Users, Rocket, ShieldCheck, HeartPulse } from "lucide-react";

export const metadata = {
  title: "Careers | Pinaka Fitness",
  description: "Join the elite team at Pinaka Fitness and help transform lives.",
};

const benefits = [
  {
    title: "Competitive Pay",
    desc: "Industry-leading compensation and performance-based bonuses.",
    icon: Rocket,
  },
  {
    title: "Health & Wellness",
    desc: "Free membership for you and a guest, plus health insurance benefits.",
    icon: HeartPulse,
  },
  {
    title: "Growth Opportunities",
    desc: "Personalized career paths and certification reimbursement.",
    icon: Users,
  },
  {
    title: "Premium Environment",
    desc: "Work in state-of-the-art facilities with the best lifting equipment.",
    icon: ShieldCheck,
  },
];

export default function CareersPage() {
  return (
    <main className="relative bg-black text-white selection:bg-brand/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          {/* Level 1: Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
              CAREER OPPORTUNITIES
            </span>
          </div>

          {/* Level 2: Main Heading */}
          <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl font-heading font-extrabold uppercase tracking-tight leading-tight mb-4 text-white">
            BUILD YOUR CAREER IN <br />
            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-200 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              PINAKA FITNESS
            </span>
          </h1>

          {/* Level 3: Supporting Description */}
          <p className="text-xs sm:text-sm md:text-base text-gray-400 font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
            We&apos;re looking for passionate, driven individuals to join our team of world-class trainers and fitness innovators. If you are obsessed with results and excellence, you belong here.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="#openings" className="px-6 sm:px-8 py-3 bg-gradient-to-r from-brand to-purple-600 text-white font-heading font-semibold uppercase tracking-wider text-xs rounded-full shadow-neon hover:shadow-neon-strong transition-all hover:scale-105 active:scale-95">
              View Openings
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Content */}
      <section className="py-20 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)] mb-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
                OUR CULTURE &amp; VALUES
              </span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight mb-2.5">
              WHY WORK AT <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-200">PINAKA?</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-lg mx-auto leading-relaxed">
              Join a high-performance environment where exceptional talent is recognized, mentored, and rewarded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-surface border border-surfaceBorder rounded-[2.5rem] p-8 text-center hover:border-brand/40 transition-all group">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand group-hover:text-white transition-all shadow-lg">
                  <benefit.icon size={32} />
                </div>
                <h3 className="text-xl font-heading font-bold mb-4 uppercase tracking-wider">{benefit.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings Section */}
      <section id="openings" className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)] mb-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
                AVAILABLE POSITIONS
              </span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight mb-2.5">
              CURRENT <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-200">OPENINGS</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-lg leading-relaxed">
              Find the perfect role that matches your expertise, ambition, and drive to transform lives.
            </p>
          </div>
          <CareersSection />
        </div>
      </section>

      {/* Bottom CTA */}
      <section id="resume" className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-brand to-brand-dark rounded-[2.5rem] p-10 md:p-16 text-center shadow-neon relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight mb-4 text-white">
            Don&apos;t see a role for you?
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Tell us why you&apos;d be a great fit for Pinaka Fitness regardless. We&apos;re always looking for exceptional talent.
          </p>
          <a href="mailto:pinakafitnessnoidasec127@gmail.com" className="px-8 sm:px-10 py-3.5 bg-white text-black font-heading font-bold rounded-full hover:scale-105 transition-all text-xs uppercase tracking-wider">
            Send Your Resume
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
