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
          <h1 className="text-6xl md:text-8xl font-heading font-bold uppercase tracking-tighter mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Build Your Career <br /> In <span className="text-brand">Pinaka Fitness</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            We&apos;re looking for passionate, driven individuals to join our team of world-class trainers and fitness enthusiasts. If you are obsessed with results and excellence, you belong here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#openings" className="px-10 py-4 bg-brand text-white font-bold rounded-full shadow-neon hover:shadow-neon-strong transition-all">
              View Openings
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Content */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter mb-4">Why Pinaka?</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
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
      <section id="openings" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter mb-4 text-white">Current Openings</h2>
            <p className="text-zinc-500">Find the perfect role that matches your expertise.</p>
          </div>
          <CareersSection />
        </div>
      </section>

      {/* Bottom CTA */}
      <section id="resume" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-brand to-brand-dark rounded-[3rem] p-12 md:p-24 text-center shadow-neon relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

          <h2 className="text-4xl md:text-7xl font-heading font-bold uppercase tracking-tighter mb-8 text-white">
            Don&apos;t see a role for you?
          </h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            Tell us why you&apos;d be a great fit for Pinaka Fitness regardless. We&apos;re always looking for exceptional talent.
          </p>
          <a href="mailto:pinakafitnessnoidasec127@gmail.com" className="px-12 py-5 bg-white text-black font-extrabold rounded-full hover:scale-105 transition-all text-lg tracking-tight">
            Send Your Resume
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
