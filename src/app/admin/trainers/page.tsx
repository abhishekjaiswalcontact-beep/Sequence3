"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Upload,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface Trainer {
  id: string;
  slug: string;
  name: string;
  role: string;
  img: string;
  experience: string;
  skills: string; // JSON or array
  certifications: string; // JSON or array
  achievements: string; // JSON or array
  bio: string;
  email: string;
  phone?: string;
  socialLinks?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminTrainersPage() {
  const { user, isHydrated } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    img: "",
    experience: "5 Years",
    skills: "Strength Training, Bodybuilding, Nutrition",
    certifications: "ACE Certified Trainer\nPrecision Nutrition L1",
    achievements: "National Champion\nElite Coach",
    bio: "",
    email: "",
    phone: "",
    instagram: "",
    twitter: "",
    youtube: "",
    order: 0,
    isActive: true,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-trainers");
      if (res.ok) {
        const data = await res.json();
        setTrainers(data);
      } else {
        addToast("error", "Failed to load trainers");
      }
    } catch {
      addToast("error", "Network error loading trainers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchTrainers();
    }
  }, [isHydrated, user, fetchTrainers]);

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "trainers");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, img: data.url }));
        addToast("success", "Photo uploaded successfully");
      } else {
        const err = await res.json();
        addToast("error", err.error || "Upload failed");
      }
    } catch {
      addToast("error", "Network error during upload");
    } finally {
      setUploadingImg(false);
    }
  };

  const parseArrayField = (raw: string | undefined): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseSocialLinks = (raw: string | undefined): Record<string, string> => {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      role: "",
      img: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=600&q=75&auto=format&fit=crop",
      experience: "5 Years",
      skills: "Strength Training, Bodybuilding, Nutrition",
      certifications: "ACE Certified Personal Trainer\nCrossFit L1",
      achievements: "National Athlete\nCoach of the Year",
      bio: "Dedicated specialist in biomechanical transformation and athletic conditioning.",
      email: "",
      phone: "+91-",
      instagram: "",
      twitter: "",
      youtube: "",
      order: trainers.length,
      isActive: true,
    });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (t: Trainer) => {
    setSelectedTrainer(t);
    const skillsArr = parseArrayField(t.skills);
    const certsArr = parseArrayField(t.certifications);
    const achieveArr = parseArrayField(t.achievements);
    const socials = parseSocialLinks(t.socialLinks);

    setFormData({
      name: t.name,
      role: t.role,
      img: t.img,
      experience: t.experience,
      skills: skillsArr.join(", "),
      certifications: certsArr.join("\n"),
      achievements: achieveArr.join("\n"),
      bio: t.bio,
      email: t.email,
      phone: t.phone || "",
      instagram: socials.instagram || "",
      twitter: socials.twitter || "",
      youtube: socials.youtube || "",
      order: t.order,
      isActive: t.isActive,
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      setFormError("Name and role are required");
      return;
    }

    setFormLoading(true);
    setFormError("");

    const skillsArr = formData.skills
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const certsArr = formData.certifications
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const achieveArr = formData.achievements
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const socialLinks = {
      instagram: formData.instagram.trim() || undefined,
      twitter: formData.twitter.trim() || undefined,
      youtube: formData.youtube.trim() || undefined,
    };

    try {
      const res = await fetch("/api/admin/website-trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          img: formData.img,
          experience: formData.experience,
          skills: skillsArr,
          certifications: certsArr,
          achievements: achieveArr,
          bio: formData.bio,
          email: formData.email,
          phone: formData.phone,
          socialLinks,
          order: Number(formData.order) || 0,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        addToast("success", "Trainer added successfully");
        setShowAddModal(false);
        fetchTrainers();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to create trainer");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    setFormLoading(true);
    setFormError("");

    const skillsArr = formData.skills
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const certsArr = formData.certifications
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const achieveArr = formData.achievements
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const socialLinks = {
      instagram: formData.instagram.trim() || undefined,
      twitter: formData.twitter.trim() || undefined,
      youtube: formData.youtube.trim() || undefined,
    };

    try {
      const res = await fetch(`/api/admin/website-trainers/${selectedTrainer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          img: formData.img,
          experience: formData.experience,
          skills: skillsArr,
          certifications: certsArr,
          achievements: achieveArr,
          bio: formData.bio,
          email: formData.email,
          phone: formData.phone,
          socialLinks,
          order: Number(formData.order) || 0,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        addToast("success", "Trainer details updated successfully");
        setShowEditModal(false);
        fetchTrainers();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to update trainer");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTrainer = async () => {
    if (!selectedTrainer) return;

    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/website-trainers/${selectedTrainer.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", "Trainer deleted successfully");
        setShowDeleteModal(false);
        fetchTrainers();
      } else {
        const err = await res.json();
        addToast("error", err.error || "Failed to delete trainer");
      }
    } catch {
      addToast("error", "Network error during deletion");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (t: Trainer) => {
    try {
      const res = await fetch(`/api/admin/website-trainers/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });

      if (res.ok) {
        addToast("success", `Trainer ${!t.isActive ? "activated" : "hidden from website"}`);
        fetchTrainers();
      }
    } catch {
      addToast("error", "Failed to toggle status");
    }
  };

  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="Trainer Management" />;
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
            <UserCheck className="w-5 h-5 text-brand-light" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              Trainer Management
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Add unlimited coaches, customize biographies, photos, certifications, and skills. Changes sync to live website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#trainers"
            target="_blank"
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-brand-light" /> View on Website
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Trainer
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-500 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search trainers by name, designation, specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-white placeholder:text-gray-500 focus:outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white mr-2">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trainers Grid Display */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="py-16 text-center bg-[#0D0D12] border border-dashed border-white/10 rounded-3xl space-y-3">
          <UserCheck className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Trainers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery ? "Try clearing your search query." : "Click 'Add New Trainer' to publish your first coach profile."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((t) => {
            const skillsArr = parseArrayField(t.skills);

            return (
              <div
                key={t.id}
                className={`bg-[#0D0D12] border rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
                  t.isActive ? "border-white/10 hover:border-brand/40" : "border-red-500/20 opacity-70"
                }`}
              >
                {/* Photo & Status Banner */}
                <div className="relative aspect-[16/10] w-full bg-black">
                  <Image
                    src={t.img || "/showcase/trainer1.png"}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-md transition-all ${
                        t.isActive
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                          : "bg-red-950/80 text-red-400 border-red-500/40"
                      }`}
                    >
                      {t.isActive ? "● Live on Site" : "○ Hidden"}
                    </button>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[9px] font-mono text-gray-400 backdrop-blur-md">
                    Order: #{t.order}
                  </div>
                </div>

                {/* Trainer Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                        {t.name}
                      </h3>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">
                        {t.experience}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-brand-light uppercase tracking-widest mt-0.5">
                      {t.role}
                    </p>

                    <p className="text-xs text-gray-400 line-clamp-2 mt-3 leading-relaxed">
                      &quot;{t.bio}&quot;
                    </p>

                    {/* Specialization Tags */}
                    {skillsArr.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {skillsArr.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {skillsArr.length > 3 && (
                          <span className="text-[10px] text-gray-500 self-center">
                            +{skillsArr.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Public Link */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <Link
                      href={`/trainer/${t.slug || t.id}`}
                      target="_blank"
                      className="text-[10px] font-bold text-gray-400 hover:text-brand-light flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Profile Page
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(t)}
                        title="Edit Trainer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-brand/20 text-gray-300 hover:text-brand-light border border-white/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrainer(t);
                          setShowDeleteModal(true);
                        }}
                        title="Delete Trainer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
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
              className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                    {showAddModal ? "Add New Trainer" : `Edit ${formData.name}`}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Changes immediately reflect on the live gym website.
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

              <form
                onSubmit={showAddModal ? handleCreateTrainer : handleUpdateTrainer}
                className="space-y-6"
              >
                {/* Photo Upload & Preview */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-brand-light" /> Profile Photo
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-28 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0">
                      {formData.img ? (
                        <Image
                          src={formData.img}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImg ? "Uploading..." : "Upload Photo File"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploadingImg}
                          />
                        </label>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Or paste image URL (e.g. Unsplash, CDN)"
                          value={formData.img}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, img: e.target.value }))
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Trainer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Designation / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Head Coach / Strength Specialist"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Years"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, experience: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
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

                {/* Biography */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Bio / Philosophy Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short bio shown on website and detailed profile..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {/* Skills & Certifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Specializations (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Bodybuilding, Powerlifting, HIIT"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, skills: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Certifications (one per line)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="ACE Personal Trainer&#10;Precision Nutrition L1"
                      value={formData.certifications}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, certifications: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand resize-none"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="trainer@pinakafitness.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91-783-587-0089"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, instagram: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/..."
                      value={formData.twitter}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, twitter: e.target.value }))
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
                      placeholder="https://youtube.com/..."
                      value={formData.youtube}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, youtube: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
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
                    disabled={formLoading || uploadingImg}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-brand/20 transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : showAddModal ? "Create Trainer" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showDeleteModal && selectedTrainer && (
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
                  Delete Trainer Profile?
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="text-white font-bold">{selectedTrainer.name}</span>? This will immediately remove their card and profile from the website.
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
                  onClick={handleDeleteTrainer}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20"
                >
                  {formLoading ? "Deleting..." : "Yes, Delete Trainer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
