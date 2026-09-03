"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  X,
  Maximize2,
  FileImage,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CMSAccessDenied from "@/components/CMSAccessDenied";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  folder: string;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminMediaPage() {
  const { user, isHydrated } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload");
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      } else {
        addToast("error", "Failed to load media assets");
      }
    } catch {
      addToast("error", "Network error loading media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user?.isOwner) {
      fetchMedia();
    }
  }, [isHydrated, user, fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "general");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      addToast("success", `Successfully uploaded ${successCount} file(s)`);
      fetchMedia();
    } else {
      addToast("error", "Upload failed. Check file formats & sizes.");
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = window.location.origin + item.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    addToast("success", "Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });

      if (res.ok) {
        addToast("success", "Media asset removed");
        setDeleteTarget(null);
        fetchMedia();
      } else {
        addToast("error", "Failed to delete file");
      }
    } catch {
      addToast("error", "Network error deleting file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredMedia = media.filter(
    (m) =>
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isHydrated) return null;
  if (!user?.isOwner) {
    return <CMSAccessDenied featureName="Media Library" />;
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
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
              Media Library &amp; Asset Storage
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Upload images for trainers, gallery showcase, and website banners. Copy links to use across any section.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand/20 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-500 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search uploaded assets by filename..."
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

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center bg-[#0D0D12] border border-dashed border-white/10 rounded-3xl space-y-3">
          <FileImage className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Media Files</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Upload images from your device to store them permanently and copy their URLs for use across the website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0D0D12] border border-white/10 hover:border-brand/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
            >
              <div className="relative aspect-square w-full bg-black">
                <Image
                  src={item.url}
                  alt={item.originalName || "Asset"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-transparent opacity-80" />

                <button
                  onClick={() => setPreviewItem(item)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-brand text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Preview Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={item.originalName}>
                    {item.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-0.5">
                    <span>{formatFileSize(item.size)}</span>
                    <span className="uppercase">{item.mimeType.split("/")[1] || "IMG"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-brand/20 text-gray-300 hover:text-brand-light rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN PREVIEW */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <button
              onClick={() => setPreviewItem(null)}
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
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center mt-4 space-y-1">
                <h3 className="text-sm font-bold text-white">{previewItem.originalName}</h3>
                <p className="text-xs text-brand-light font-mono select-all">
                  {window.location.origin + previewItem.url}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
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
                  Delete Media Asset?
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-bold">{deleteTarget.originalName}</span>? If this image is in use on the website, it may break image links.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Delete Asset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
