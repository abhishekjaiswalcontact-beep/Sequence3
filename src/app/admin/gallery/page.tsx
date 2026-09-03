"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  X,
  Maximize2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  src: string;
  caption: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const DEFAULT_CATEGORIES = ["Workout", "Trainers", "Equipment"];

export default function AdminGalleryPage() {
  const { user, isHydrated } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Form
  const [formData, setFormData] = useState({
    category: "Workout",
    title: "",
    src: "",
    caption: "",
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

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        addToast("error", "Failed to load gallery items");
      }
    } catch {
      addToast("error", "Network error loading gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchGallery();
    }
  }, [isHydrated, user, fetchGallery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "gallery");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, src: data.url }));
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

  const openCreateModal = () => {
    setFormData({
      category: "Workout",
      title: "",
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format",
      caption: "",
      order: items.length,
      isActive: true,
    });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      category: item.category,
      title: item.title,
      src: item.src,
      caption: item.caption,
      order: item.order,
      isActive: item.isActive,
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.src.trim()) {
      setFormError("Title and image are required");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/website-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "Gallery photo added successfully");
        setShowAddModal(false);
        fetchGallery();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to create gallery item");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`/api/admin/website-gallery/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("success", "Gallery photo updated successfully");
        setShowEditModal(false);
        fetchGallery();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to update item");
      }
    } catch {
      setFormError("Network error. Please retry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/website-gallery/${selectedItem.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", "Photo deleted from gallery");
        setShowDeleteModal(false);
        fetchGallery();
      } else {
        const err = await res.json();
        addToast("error", err.error || "Failed to delete item");
      }
    } catch {
      addToast("error", "Network error during deletion");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (item: GalleryItem) => {
    try {
      const res = await fetch(`/api/admin/website-gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (res.ok) {
        addToast("success", `Photo ${!item.isActive ? "activated" : "hidden from website"}`);
        fetchGallery();
      }
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="Showcase Gallery" />;
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
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              Gallery &amp; Showcase Management
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Upload new photos, assign workout or equipment categories, and manage the live website showcase gallery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#showcase"
            target="_blank"
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" /> View on Website
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </button>
        </div>
      </div>

      {/* Filters & Category Pills */}
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
            placeholder="Search gallery..."
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

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#0D0D12] border border-dashed border-white/10 rounded-3xl space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Photos Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery ? "Try clearing your search query." : "Click 'Add Photo' to upload your first gallery asset."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-[#0D0D12] border rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
                item.isActive ? "border-white/10 hover:border-brand/40" : "border-red-500/20 opacity-70"
              }`}
            >
              {/* Photo Area */}
              <div className="relative aspect-square w-full bg-black overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-brand-light border border-brand/30 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Preview Lightbox Button */}
                <button
                  onClick={() => setPreviewImage(item)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-brand text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                  title="Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info & Caption */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.caption || "No caption provided"}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      item.isActive
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/40"
                        : "text-red-400 border-red-500/30 bg-red-950/40"
                    }`}
                  >
                    {item.isActive ? "Active" : "Hidden"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit photo"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-brand/20 text-gray-400 hover:text-brand-light transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteModal(true);
                      }}
                      title="Delete photo"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
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
                    {showAddModal ? "Add Gallery Photo" : "Edit Photo Details"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Changes immediately reflect in the showcase gallery on the live website.
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
                {/* Photo Upload & Preview */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-purple-400" /> Image Source
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0">
                      {formData.src ? (
                        <Image src={formData.src} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <label className="px-4 py-2 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImg ? "Uploading..." : "Upload New File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingImg}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste image URL (Unsplash / /showcase/...)"
                        value={formData.src}
                        onChange={(e) => setFormData((prev) => ({ ...prev, src: e.target.value }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Category Tag *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                      >
                        {DEFAULT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Strength Squats"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Caption Description */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Caption / Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short caption shown in gallery grid and lightbox..."
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, caption: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {/* Order & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <span className="text-xs font-bold text-white">Active in Showcase</span>
                    </label>
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
                    {formLoading ? "Saving..." : showAddModal ? "Add to Gallery" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX PREVIEW */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              className="relative max-w-4xl w-full h-[70vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={previewImage.src}
                  alt={previewImage.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center mt-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-light">
                  {previewImage.category}
                </span>
                <h3 className="text-lg font-bold text-white uppercase">{previewImage.title}</h3>
                <p className="text-xs text-gray-400 max-w-md">{previewImage.caption}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
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
                  Delete Gallery Photo?
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to remove &quot;
                  <span className="text-white font-bold">{selectedItem.title}</span>&quot; from the website showcase gallery?
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
                  {formLoading ? "Deleting..." : "Yes, Delete Photo"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
