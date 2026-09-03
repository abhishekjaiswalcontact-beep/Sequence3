"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode2,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  Sparkles,
  MapPin,
  Layers,
  Dumbbell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

interface AIFeatureItem {
  id: string;
  title: string;
  metric: string;
  desc: string;
  badge: string;
}

interface HeroData {
  telemetryStatus: string;
  telemetryAccuracy: string;
  kickerBadge: string;
  mainHeadlineLine1: string;
  mainHeadlineLine2: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  ratingText: string;
  ratingCount: string;
  aiFeatures: AIFeatureItem[];
}

interface ProgramItem {
  slug: string;
  title: string;
  image: string;
  desc: string;
  accentColor: string;
  glowColor: string;
  emoji: string;
  tag: string;
  badge: string;
}

interface ContactData {
  gymName: string;
  addressLine1: string;
  addressLine2: string;
  phone1: string;
  phone2: string;
  email: string;
  hoursHeadline: string;
  hoursNote: string;
  mapsUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
  twitterUrl?: string;
}

interface FooterData {
  tagline: string;
  membersCount: string;
  equipmentQuality: string;
  whyChooseUs: string[];
}

export default function AdminContentPage() {
  const { user, isHydrated } = useAuth();
  const [activeTab, setActiveTab] = useState<"hero" | "programs" | "contact" | "footer">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Section Data States
  const [heroData, setHeroData] = useState<HeroData>({
    telemetryStatus: "AI CORE V3.8 ACTIVE",
    telemetryAccuracy: "99.4% BIO-CALIBRATION",
    kickerBadge: "✦ NEXT-GEN AI FITNESS PLATFORM",
    mainHeadlineLine1: "YOUR FITNESS.",
    mainHeadlineLine2: "POWERED BY AI.",
    subheadline: "Where elite biomechanical coaching meets real-time AI computer vision. Experience dynamic adaptive workouts, instant posture correction, and precision nutrition.",
    primaryCtaText: "START YOUR JOURNEY",
    primaryCtaLink: "#contact",
    secondaryCtaText: "EXPLORE PINAKA",
    secondaryCtaLink: "#programs",
    ratingText: "4.9/5 Rating",
    ratingCount: "30,000+ FITNESS JOURNEYS",
    aiFeatures: [],
  });

  const [programsData, setProgramsData] = useState<ProgramItem[]>([]);
  const [contactData, setContactData] = useState<ContactData>({
    gymName: "Pinaka Fitness Noida",
    addressLine1: "Pinaka Fitness, Sector 127 Near Shani Mandir",
    addressLine2: "Noida, UP 201301",
    phone1: "+91-783-587-0089",
    phone2: "+91-783-587-0082",
    email: "pinakafitnessnoidasec127@gmail.com",
    hoursHeadline: "Open 18/7",
    hoursNote: "*Staff 5AM-10PM",
    mapsUrl: "https://www.google.com/maps/place/PINAKA+FITNESS/@28.5332574,77.3542702,851m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390ce7d06cfc41ad:0x5136f01d684bb5c3!8m2!3d28.5332574!4d77.3542702!16s%2Fg%2F11zd49g43c?entry=ttu",
    instagramUrl: "https://www.instagram.com/pinakafitnessnoida127/?hl=en",
    youtubeUrl: "#",
    facebookUrl: "#",
    twitterUrl: "#",
  });

  const [footerData, setFooterData] = useState<FooterData>({
    tagline: "We don't just build bodies; we build character. A premium sanctuary dedicated to absolute physical and mental transformation.",
    membersCount: "500+",
    equipmentQuality: "Top 1%",
    whyChooseUs: [
      "Advanced AI Posture Analysis",
      "Olympic Weightlifting Zone",
      "Biomechanically Perfect Equipment",
      "Exclusive Recovery Lounge",
      "Personalized Diet Counseling",
    ],
  });

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchAllContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-content");
      if (res.ok) {
        const data = await res.json();
        if (data.hero) setHeroData(data.hero);
        if (data.programs) setProgramsData(data.programs);
        if (data.contact) setContactData(data.contact);
        if (data.footer) setFooterData(data.footer);
      } else {
        addToast("error", "Failed to load content settings");
      }
    } catch {
      addToast("error", "Network error loading content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchAllContent();
    }
  }, [isHydrated, user, fetchAllContent]);

  const handleSaveSection = async (sectionKey: string, contentPayload: unknown) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/website-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          content: contentPayload,
        }),
      });

      if (res.ok) {
        addToast("success", `${sectionKey.toUpperCase()} section updated successfully!`);
      } else {
        const err = await res.json();
        addToast("error", err.error || "Failed to update content");
      }
    } catch {
      addToast("error", "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="Website Content & Copy CMS" />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[120] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold shadow-xl pointer-events-auto ${
                t.type === "success"
                  ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 backdrop-blur-md"
                  : "bg-red-950/90 border border-red-500/50 text-red-300 backdrop-blur-md"
              }`}
            >
              {t.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              Website Content &amp; Copy CMS
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Edit live text, headlines, AI cards, training protocols, contact information, and working hours without editing code.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10 w-fit"
        >
          <Eye className="w-3.5 h-3.5 text-brand-light" /> View Live Website
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: "hero", label: "Hero & AI Telemetry", icon: Sparkles },
          { id: "programs", label: "Training Protocols", icon: Dumbbell },
          { id: "contact", label: "Contact & Location", icon: MapPin },
          { id: "footer", label: "Footer & Brand Info", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? "bg-brand text-white shadow-lg shadow-brand/20 border border-brand-light/40"
                  : "bg-[#0D0D12] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {/* TAB 1: HERO SECTION */}
          {activeTab === "hero" && (
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-heading font-black text-white uppercase tracking-tight">
                    Hero Section Headlines &amp; CTAs
                  </h3>
                  <p className="text-xs text-gray-400">
                    Live copy displayed on the top landing screen.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSection("hero", heroData)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Hero Section"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Top Telemetry Left Status
                  </label>
                  <input
                    type="text"
                    value={heroData.telemetryStatus || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, telemetryStatus: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Top Telemetry Right Metric
                  </label>
                  <input
                    type="text"
                    value={heroData.telemetryAccuracy || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, telemetryAccuracy: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Kicker Badge Text
                </label>
                <input
                  type="text"
                  value={heroData.kickerBadge || ""}
                  onChange={(e) =>
                    setHeroData((prev) => ({ ...prev, kickerBadge: e.target.value }))
                  }
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Main Headline Line 1
                  </label>
                  <input
                    type="text"
                    value={heroData.mainHeadlineLine1 || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, mainHeadlineLine1: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Main Headline Line 2 (Highlighted Gradient)
                  </label>
                  <input
                    type="text"
                    value={heroData.mainHeadlineLine2 || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, mainHeadlineLine2: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-brand-light focus:outline-none focus:border-brand font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Subheadline / Supporting Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={heroData.subheadline || ""}
                  onChange={(e) =>
                    setHeroData((prev) => ({ ...prev, subheadline: e.target.value }))
                  }
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.primaryCtaText || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, primaryCtaText: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.secondaryCtaText || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, secondaryCtaText: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Social Proof Rating
                  </label>
                  <input
                    type="text"
                    value={heroData.ratingText || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, ratingText: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Transformations Count
                  </label>
                  <input
                    type="text"
                    value={heroData.ratingCount || ""}
                    onChange={(e) =>
                      setHeroData((prev) => ({ ...prev, ratingCount: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* 4 AI Glass Telemetry Cards */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  4 Floating AI Glass Telemetry Cards
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(heroData.aiFeatures || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHeroData((prev) => {
                              const updated = [...prev.aiFeatures];
                              updated[idx] = { ...updated[idx], title: val };
                              return { ...prev, aiFeatures: updated };
                            });
                          }}
                          className="bg-black border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:border-brand w-3/4"
                        />
                        <input
                          type="text"
                          value={feat.badge}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHeroData((prev) => {
                              const updated = [...prev.aiFeatures];
                              updated[idx] = { ...updated[idx], badge: val };
                              return { ...prev, aiFeatures: updated };
                            });
                          }}
                          className="bg-black border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-brand-light focus:border-brand w-1/3 text-right"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Description text"
                        value={feat.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroData((prev) => {
                            const updated = [...prev.aiFeatures];
                            updated[idx] = { ...updated[idx], desc: val };
                            return { ...prev, aiFeatures: updated };
                          });
                        }}
                        className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:border-brand"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAINING PROTOCOLS (PROGRAMS) */}
          {activeTab === "programs" && (
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-heading font-black text-white uppercase tracking-tight">
                    Training Protocols (Programs Section)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Manage the 4 scientific workout pillars displayed on the homepage.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSection("programs", programsData)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Protocols"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programsData.map((prog, idx) => (
                  <div
                    key={prog.slug || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        <span>{prog.emoji}</span> {prog.title}
                      </span>
                      <input
                        type="text"
                        placeholder="Badge text"
                        value={prog.badge || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProgramsData((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], badge: val };
                            return copy;
                          });
                        }}
                        className="bg-black border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-brand-light text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={prog.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProgramsData((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], title: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={prog.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProgramsData((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], desc: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                        Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={prog.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProgramsData((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], image: val };
                            return copy;
                          });
                        }}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & LOCATION */}
          {activeTab === "contact" && (
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-heading font-black text-white uppercase tracking-tight">
                    Contact Information &amp; Hours
                  </h3>
                  <p className="text-xs text-gray-400">
                    Location, phone numbers, email, working hours, and social media links.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSection("contact", contactData)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Contact Info"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Gym Brand Name
                  </label>
                  <input
                    type="text"
                    value={contactData.gymName || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, gymName: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactData.email || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={contactData.addressLine1 || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, addressLine1: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Address Line 2 (City, State, Pincode)
                  </label>
                  <input
                    type="text"
                    value={contactData.addressLine2 || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, addressLine2: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    value={contactData.phone1 || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, phone1: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="text"
                    value={contactData.phone2 || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, phone2: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Working Hours Headline
                  </label>
                  <input
                    type="text"
                    value={contactData.hoursHeadline || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, hoursHeadline: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Staff Timings Note
                  </label>
                  <input
                    type="text"
                    value={contactData.hoursNote || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, hoursNote: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Google Maps Location Link
                </label>
                <input
                  type="text"
                  value={contactData.mapsUrl || ""}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, mapsUrl: e.target.value }))
                  }
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={contactData.instagramUrl || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, instagramUrl: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={contactData.youtubeUrl || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="text"
                    value={contactData.facebookUrl || ""}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, facebookUrl: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOOTER */}
          {activeTab === "footer" && (
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-heading font-black text-white uppercase tracking-tight">
                    Footer &amp; Brand Philosophy Copy
                  </h3>
                  <p className="text-xs text-gray-400">
                    Tagline, member stats, and &quot;Why Choose Pinaka&quot; bullet points.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSection("footer", footerData)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Footer"}</span>
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Brand Philosophy Tagline
                </label>
                <textarea
                  rows={3}
                  value={footerData.tagline || ""}
                  onChange={(e) =>
                    setFooterData((prev) => ({ ...prev, tagline: e.target.value }))
                  }
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Members Metric Stat (e.g. 500+)
                  </label>
                  <input
                    type="text"
                    value={footerData.membersCount || ""}
                    onChange={(e) =>
                      setFooterData((prev) => ({ ...prev, membersCount: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Equipment Metric Stat (e.g. Top 1%)
                  </label>
                  <input
                    type="text"
                    value={footerData.equipmentQuality || ""}
                    onChange={(e) =>
                      setFooterData((prev) => ({ ...prev, equipmentQuality: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  &quot;Why Pinaka&quot; Reasons (one per line)
                </label>
                <textarea
                  rows={5}
                  value={(footerData.whyChooseUs || []).join("\n")}
                  onChange={(e) =>
                    setFooterData((prev) => ({
                      ...prev,
                      whyChooseUs: e.target.value.split("\n").filter(Boolean),
                    }))
                  }
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
