"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  TrendingUp,
  Video,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  popular: boolean;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const FAQ_CATEGORIES = ["General", "Membership", "Pricing", "Trainers", "Workout"];

export default function AdminFAQsPage() {
  const { user, isHydrated } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "General",
    question: "",
    answer: "",
    popular: false,
    videoUrl: "",
    order: 0,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      } else {
        addToast("error", "Failed to load FAQs");
      }
    } catch {
      addToast("error", "Network error loading FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchFAQs();
    }
  }, [isHydrated, user, fetchFAQs]);

  const openCreateModal = () => {
    setFormData({
      category: "General",
      question: "",
      answer: "",
      popular: false,
      videoUrl: "",
      order: faqs.length,
      isActive: true,
    });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (f: FAQ) => {
    setSelectedFAQ(f);
    setFormData({
      category: f.category,
      question: f.question,
      answer: f.answer,
      popular: f.popular,
      videoUrl: f.videoUrl || "",
      order: f.order,
      isActive: f.isActive,
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setFormError("Question and answer are required");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/website-faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "FAQ created successfully");
        setShowAddModal(false);
        fetchFAQs();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to create FAQ");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFAQ) return;

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`/api/admin/website-faqs/${selectedFAQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "FAQ updated successfully");
        setShowEditModal(false);
        fetchFAQs();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to update FAQ");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFAQ) return;

    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/website-faqs/${selectedFAQ.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", "FAQ removed from website");
        setShowDeleteModal(false);
        fetchFAQs();
      } else {
        const err = await res.json();
        addToast("error", err.error || "Failed to delete FAQ");
      }
    } catch {
      addToast("error", "Network error during deletion");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (f: FAQ) => {
    try {
      const res = await fetch(`/api/admin/website-faqs/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !f.isActive }),
      });

      if (res.ok) {
        addToast("success", `FAQ ${!f.isActive ? "activated" : "hidden from website"}`);
        fetchFAQs();
      }
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const togglePopular = async (f: FAQ) => {
    try {
      const res = await fetch(`/api/admin/website-faqs/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ popular: !f.popular }),
      });

      if (res.ok) {
        addToast("success", `FAQ ${!f.popular ? "marked as Most Asked" : "removed from Most Asked"}`);
        fetchFAQs();
      }
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFAQs = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="FAQ Management" />;
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
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              FAQ Management
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Create, edit, and organize questions &amp; answers, video explanations, and &quot;Most Asked&quot; questions on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#faq"
            target="_blank"
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" /> View on Website
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand text-white shadow-sm border border-brand-light/40"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2 w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder:text-gray-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FAQ Accordion List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="py-16 text-center bg-[#0D0D12] border border-dashed border-white/10 rounded-3xl space-y-3">
          <HelpCircle className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No FAQs Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery ? "Try searching for different keywords." : "Click 'Add FAQ' to add your first question."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFAQs.map((f) => {
            const isExpanded = expandedId === f.id;

            return (
              <div
                key={f.id}
                className={`bg-[#0D0D12] border rounded-2xl transition-all duration-300 overflow-hidden ${
                  f.isActive ? "border-white/10 hover:border-brand/40" : "border-red-500/20 opacity-70"
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand/15 text-brand-light border border-brand/30">
                        {f.category}
                      </span>
                      {f.popular && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Most Asked
                        </span>
                      )}
                      {f.videoUrl && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Video Included
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500">#{f.order}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white tracking-wide pt-1">
                      {f.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(f);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-brand/20 text-gray-400 hover:text-brand-light transition-colors border border-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFAQ(f);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors border border-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-2 text-gray-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 bg-black/30 space-y-4">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {f.answer}
                    </p>

                    {f.videoUrl && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block mb-1">
                          Video Explanation URL:
                        </span>
                        <a
                          href={f.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-light hover:underline font-mono"
                        >
                          {f.videoUrl}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePopular(f)}
                          className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase transition-colors ${
                            f.popular
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {f.popular ? "★ Most Asked Active" : "☆ Mark as Most Asked"}
                        </button>
                        <button
                          onClick={() => toggleActive(f)}
                          className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase transition-colors ${
                            f.isActive
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                              : "bg-red-950/60 text-red-400 border-red-500/40"
                          }`}
                        >
                          {f.isActive ? "● Active on Site" : "○ Hidden from Site"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
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
              className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                    {showAddModal ? "Add New FAQ" : "Edit FAQ"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modifications will immediately reflect in the Support FAQ section.
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
                {/* Category & Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    >
                      {FAQ_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>

                {/* Question */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What are your operating hours?"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, question: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Answer Content *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detailed answer to this question..."
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, answer: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Video Explanation Embed URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/embed/..."
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2 p-2.5 bg-black border border-white/10 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, popular: e.target.checked }))
                      }
                      className="rounded border-white/20 text-brand focus:ring-0"
                    />
                    <span className="text-xs font-bold text-white">Show in &quot;Most Asked&quot;</span>
                  </label>

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

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-brand/20 transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : showAddModal ? "Create FAQ" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <AnimatePresence>
        {showDeleteModal && selectedFAQ && (
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
                  Delete FAQ Question?
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to remove &quot;
                  <span className="text-white font-bold">{selectedFAQ.question}</span>&quot; from the website?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20"
                >
                  {formLoading ? "Deleting..." : "Yes, Delete FAQ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
