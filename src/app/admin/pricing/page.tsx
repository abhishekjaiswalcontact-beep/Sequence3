"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface PricingPlan {
  id: string;
  planId: string;
  title: string;
  price: string;
  period: string;
  subtitle: string;
  savings: string;
  popular: boolean;
  badge: string;
  gradient: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface FeatureItem {
  name: string;
  icon: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const GRADIENT_PRESETS = [
  { label: "Purple / Brand (Most Popular)", value: "from-brand to-purple-900" },
  { label: "Blue / Cyber (High Impact)", value: "from-blue-600 to-blue-900" },
  { label: "Gold / Amber (Best Value)", value: "from-amber-500 to-orange-700" },
  { label: "Steel / Graphite (Clean)", value: "from-gray-600 to-gray-800" },
  { label: "Emerald / Green (Elite)", value: "from-emerald-500 to-emerald-900" },
];

export default function AdminPricingPage() {
  const { user, isHydrated } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    period: "month",
    subtitle: "",
    savings: "",
    popular: false,
    badge: "",
    gradient: "from-brand to-purple-900",
    buttonText: "Join Now",
    buttonLink: "/#contact",
    order: 0,
    isActive: true,
  });

  const [amenitiesInput, setAmenitiesInput] = useState<FeatureItem[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-pricing");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        setFeatures(data.features || []);
      } else {
        addToast("error", "Failed to load pricing plans");
      }
    } catch {
      addToast("error", "Network error loading pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchPricing();
    }
  }, [isHydrated, user, fetchPricing]);

  const openCreateModal = () => {
    setFormData({
      title: "Quarterly",
      price: "9999",
      period: "3 months",
      subtitle: "Strong foundation",
      savings: "Save ₹4998",
      popular: false,
      badge: "",
      gradient: "from-blue-600 to-blue-900",
      buttonText: "Join Now",
      buttonLink: "/#contact",
      order: plans.length,
      isActive: true,
    });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (p: PricingPlan) => {
    setSelectedPlan(p);
    setFormData({
      title: p.title,
      price: p.price,
      period: p.period,
      subtitle: p.subtitle,
      savings: p.savings || "",
      popular: p.popular,
      badge: p.badge || "",
      gradient: p.gradient || "from-brand to-purple-900",
      buttonText: p.buttonText || "Join Now",
      buttonLink: p.buttonLink || "/#contact",
      order: p.order,
      isActive: p.isActive,
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim()) {
      setFormError("Title and price are required");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/website-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "Membership plan created successfully");
        setShowAddModal(false);
        fetchPricing();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to create plan");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`/api/admin/website-pricing/${selectedPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "Membership plan updated successfully");
        setShowEditModal(false);
        fetchPricing();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to update plan");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;

    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/website-pricing/${selectedPlan.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", "Plan removed from website");
        setShowDeleteModal(false);
        fetchPricing();
      } else {
        const err = await res.json();
        addToast("error", err.error || "Failed to delete plan");
      }
    } catch {
      addToast("error", "Network error during deletion");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (p: PricingPlan) => {
    try {
      const res = await fetch(`/api/admin/website-pricing/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });

      if (res.ok) {
        addToast("success", `Plan ${!p.isActive ? "activated" : "hidden from website"}`);
        fetchPricing();
      }
    } catch {
      addToast("error", "Failed to toggle status");
    }
  };

  const openAmenitiesEditor = () => {
    setAmenitiesInput(
      features.length > 0
        ? features
        : [
            { name: "Full Gym Access", icon: "Dumbbell" },
            { name: "Certified Trainers", icon: "Users" },
            { name: "Clean Changing Room", icon: "Activity" },
            { name: "Steam & Shower", icon: "Sparkles" },
            { name: "World-Class Equipment", icon: "Zap" },
            { name: "Parking Space", icon: "Shield" },
          ]
    );
    setShowAmenitiesModal(true);
  };

  const handleSaveAmenities = async () => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/website-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: "amenities",
          content: amenitiesInput,
        }),
      });

      if (res.ok) {
        addToast("success", "Tier amenities list updated successfully");
        setShowAmenitiesModal(false);
        fetchPricing();
      } else {
        addToast("error", "Failed to update amenities");
      }
    } catch {
      addToast("error", "Network error updating amenities");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="Pricing & Membership Tiers" />;
  }

  return (
    <div className="space-y-8">
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
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              Website Membership &amp; Pricing
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Control the live pricing cards, duration tiers, savings badges, and tier amenities shown on the gym website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/#pricing"
            target="_blank"
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" /> View on Website
          </Link>
          <button
            onClick={openAmenitiesEditor}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <Crown className="w-3.5 h-3.5 text-brand-light" /> Edit Tier Amenities
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Pricing Tier
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center bg-[#0D0D12] border border-dashed border-white/10 rounded-3xl space-y-3">
          <DollarSign className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Pricing Tiers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click &apos;Add Pricing Tier&apos; to create your first public membership card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-3xl p-[1px] bg-gradient-to-b ${
                p.popular ? p.gradient : "from-white/15 to-transparent"
              } transition-all duration-300 ${!p.isActive ? "opacity-60" : ""}`}
            >
              {/* Badge */}
              {p.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${p.gradient} text-white px-3.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-20 whitespace-nowrap`}
                >
                  {p.badge}
                </div>
              )}

              <div className="relative h-full flex flex-col justify-between bg-[#050505]/95 rounded-[23px] p-6 space-y-6">
                {/* Header info */}
                <div className="text-center pt-2">
                  <span className="text-gray-400 font-heading font-semibold uppercase tracking-wider text-xs">
                    {p.title}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 my-2">
                    <span className="text-lg font-semibold text-white/60">₹</span>
                    <span
                      className={`text-3xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br ${
                        p.popular ? p.gradient : "from-white to-gray-300"
                      }`}
                    >
                      {p.price}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    / {p.period}
                  </div>

                  <p className="text-xs text-gray-300 font-medium mt-3">{p.subtitle}</p>

                  {p.savings ? (
                    <p className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-500/20 inline-block px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2">
                      {p.savings}
                    </p>
                  ) : (
                    <div className="h-5" />
                  )}
                </div>

                {/* Bottom Controls */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        p.isActive
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : "bg-red-950/60 text-red-400 border-red-500/40"
                      }`}
                    >
                      {p.isActive ? "● Live on Site" : "○ Hidden"}
                    </button>
                    <span className="text-[10px] font-mono text-gray-500">Order #{p.order}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-brand/20 text-gray-300 hover:text-brand-light border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(p);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHARED TIER AMENITIES PREVIEW */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-black text-white uppercase tracking-tight">
                All Elite Plans Include (Shared Tier Amenities)
              </h3>
              <p className="text-xs text-gray-400">
                These features are displayed in the shared box below the pricing cards on the public website.
              </p>
            </div>
          </div>

          <button
            onClick={openAmenitiesEditor}
            className="px-4 py-2 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Manage Amenities List
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-brand-light shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200 truncate">{feat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT PLAN MODAL */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setShowEditModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative custom-scrollbar max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                    {showAddModal ? "Create Pricing Tier" : `Edit ${formData.title}`}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modifying this tier directly updates the live website pricing section.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={showAddModal ? handleCreate : handleUpdate} className="space-y-5">
                {/* Plan Title & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Plan Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6 Months"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15999"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Duration & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Billing Period (e.g. month, 6 months, year)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6 months"
                      value={formData.period}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, period: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Serious transformation"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Savings & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Savings Text (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Save ₹13995"
                      value={formData.savings}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, savings: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Top Floating Badge (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Most Popular / Best Value"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, badge: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Gradient Theme Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Card Accent Theme
                  </label>
                  <select
                    value={formData.gradient}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gradient: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  >
                    {GRADIENT_PRESETS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Get Started / Join Now"
                      value={formData.buttonText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      placeholder="/#contact"
                      value={formData.buttonLink}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Order & Active & Popular */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Display Order #
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2.5 bg-black border border-white/10 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, popular: e.target.checked }))
                        }
                        className="rounded border-white/20 text-brand focus:ring-0"
                      />
                      <span className="text-xs font-bold text-white">Highlighted Tier</span>
                    </label>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2.5 bg-black border border-white/10 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                        }
                        className="rounded border-white/20 text-brand focus:ring-0"
                      />
                      <span className="text-xs font-bold text-white">Active on Website</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-brand/20 transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : showAddModal ? "Create Plan" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AMENITIES EDITOR MODAL */}
      <AnimatePresence>
        {showAmenitiesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                    Manage Tier Amenities
                  </h3>
                  <p className="text-xs text-gray-400">
                    Edit the shared features included across all membership plans.
                  </p>
                </div>
                <button
                  onClick={() => setShowAmenitiesModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {amenitiesInput.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAmenitiesInput((prev) => {
                          const updated = [...prev];
                          updated[idx] = { ...updated[idx], name: val };
                          return updated;
                        });
                      }}
                      className="flex-1 bg-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAmenitiesInput((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setAmenitiesInput((prev) => [
                      ...prev,
                      { name: "New Elite Amenity", icon: "Sparkles" },
                    ])
                  }
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-brand text-xs font-bold text-gray-300 hover:text-brand-light transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Amenity Item
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAmenitiesModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAmenities}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  {formLoading ? "Saving..." : "Save Amenities"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <AnimatePresence>
        {showDeleteModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A10] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                  Delete Pricing Tier?
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-bold">{selectedPlan.title}</span>? It will be removed from the public website pricing section.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20"
                >
                  {formLoading ? "Deleting..." : "Yes, Delete Plan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
