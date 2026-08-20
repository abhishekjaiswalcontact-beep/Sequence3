"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, UserPlus, Users, Eye, EyeOff, Trash2, Edit2,
  ToggleLeft, ToggleRight, AlertCircle, CheckCircle, X,
  CheckSquare, Square, ShieldAlert, Sparkles
} from "lucide-react";
import { ALL_PERMISSIONS } from "@/lib/permissions";

interface ManagedAdmin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isAdmin: boolean;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  permissions: string[];
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const PERMISSION_LABELS: Record<string, { title: string; desc: string }> = {
  VIEW_MEMBERS: { title: "View Members", desc: "Access member directory and view user profiles" },
  ADD_MEMBER: { title: "Add Member", desc: "Create new member accounts and assign initial plans" },
  EDIT_MEMBER: { title: "Edit Member", desc: "Update member information, phone, status, and profile details" },
  DELETE_MEMBER: { title: "Delete Member", desc: "Delete member accounts (Owner permission enforced)" },
  VIEW_ATTENDANCE: { title: "View Attendance", desc: "View daily check-ins, attendance records, and logs" },
  MANAGE_ATTENDANCE: { title: "Manage Attendance", desc: "Mark manual attendance or revert check-in records" },
  MANAGE_DIET_PLANS: { title: "Manage Diet Plans", desc: "Create, view, edit, and assign member diet plans" },
  MANAGE_WORKOUT_PLANS: { title: "Manage Workout Plans", desc: "Create, view, edit, and assign workout routines" },
  MANAGE_TRAINERS: { title: "Manage Trainers", desc: "View trainer workloads and manage staff assignments" },
  ASSIGN_TRAINER: { title: "Assign Trainer", desc: "Assign or reassign trainers to gym members" },
  ASSIGN_DIET_PLAN: { title: "Assign Diet Plan", desc: "Assign custom nutrition plans to members" },
  ASSIGN_WORKOUT_PLAN: { title: "Assign Workout Plan", desc: "Assign workout routines to members" },
  VIEW_ENQUIRIES: { title: "View Enquiries", desc: "Access leads, enquiries, and walk-in prospects" },
  MANAGE_COMPLAINTS: { title: "Manage Complaints", desc: "View, log, and resolve member complaints" },
  VIEW_REPORTS: { title: "View Reports", desc: "Access gym operational and membership reports" },
  MANAGE_MEMBERSHIPS: { title: "Manage Memberships", desc: "Create, extend, freeze, or update membership plans" },
};

export default function OwnerAdminsPage() {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Create Admin modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    permissions: [] as string[],
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Admin modal
  const [editAdmin, setEditAdmin] = useState<ManagedAdmin | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    permissions: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete target modal
  const [deleteTarget, setDeleteTarget] = useState<ManagedAdmin | null>(null);

  const addToast = (type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        addToast("error", "Failed to load admin list.");
      }
    } catch {
      addToast("error", "Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("/api/owner/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      const data = await res.json();
      if (res.ok) {
        addToast("success", `Admin ${createData.name} created successfully.`);
        setShowCreateModal(false);
        setCreateData({ name: "", email: "", password: "", phone: "", permissions: [] });
        fetchAdmins();
      } else {
        setCreateError(data.error || "Failed to create admin.");
      }
    } catch {
      setCreateError("Network error while creating admin.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;

    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/owner/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editAdmin.id,
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          ...(editData.password.trim() ? { password: editData.password } : {}),
          permissions: editData.permissions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast("success", `Permissions & details for ${editData.name} updated.`);
        setEditAdmin(null);
        fetchAdmins();
      } else {
        setEditError(data.error || "Failed to update admin.");
      }
    } catch {
      setEditError("Network error while updating admin.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (admin: ManagedAdmin) => {
    try {
      const res = await fetch("/api/owner/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: admin.id, isActive: !admin.isActive }),
      });
      if (res.ok) {
        addToast("success", `${admin.name} is now ${!admin.isActive ? "Active" : "Deactivated"}.`);
        fetchAdmins();
      } else {
        const d = await res.json();
        addToast("error", d.error || "Failed to toggle status.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const handleDeleteAdmin = async (admin: ManagedAdmin) => {
    try {
      const res = await fetch("/api/owner/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: admin.id }),
      });

      if (res.ok) {
        addToast("success", `Admin ${admin.name} deleted.`);
        setDeleteTarget(null);
        fetchAdmins();
      } else {
        const d = await res.json();
        addToast("error", d.error || "Failed to delete admin.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const openEditModal = (admin: ManagedAdmin) => {
    setEditAdmin(admin);
    setEditData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      permissions: [...admin.permissions],
    });
    setEditError("");
  };

  const togglePermissionInCreate = (perm: string) => {
    setCreateData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const togglePermissionInEdit = (perm: string) => {
    setEditData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[200] space-y-2">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium ${
              t.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30"
                : "bg-red-950/90 text-red-300 border-red-500/30"
            }`}
          >
            {t.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{t.message}</span>
          </motion.div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Owner Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Admin &amp; Permission Management
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Create Admin accounts, toggle active privileges, and dynamically grant or revoke operational permissions.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Create New Admin
          </button>
        </div>
      </div>

      {/* Admin Roster Table */}
      <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Active Gym Administrators ({admins.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading Administrators...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-500/40 mx-auto" />
            <p className="text-base text-gray-300 font-medium">No Administrators Found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Create your first Admin account to delegate daily gym operations like check-ins, member diet/workout assignments, and lead enquiries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6 text-center">Assigned Permissions</th>
                  <th className="py-4 px-6 text-center">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold uppercase shrink-0">
                          {(admin.name || admin.email)[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            {admin.name || "Gym Admin"}
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              ADMIN
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-400 text-xs">
                      {admin.phone ? admin.phone : "—"}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {admin.permissions.length} / {ALL_PERMISSIONS.length} Allowed
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          admin.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        }`}
                      >
                        {admin.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {admin.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          title="Configure Permissions & Details"
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:text-amber-400 transition-colors text-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(admin)}
                          title="Delete Admin Account"
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <div className="min-h-full flex items-center justify-center py-6">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-auto space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Create New Admin</h3>
                    <p className="text-gray-400 text-xs mt-1">Set account details and assign operational permissions.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={createData.name}
                        onChange={(e) => setCreateData((d) => ({ ...d, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        placeholder="Admin Full Name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={createData.email}
                        onChange={(e) => setCreateData((d) => ({ ...d, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        placeholder="admin@gym.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={createData.phone}
                        onChange={(e) => setCreateData((d) => ({ ...d, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type={showCreatePassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={createData.password}
                          onChange={(e) => setCreateData((d) => ({ ...d, password: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-amber-500"
                          placeholder="Min 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permission Checkbox Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Assign Permissions ({createData.permissions.length} selected)
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCreateData((d) => ({
                            ...d,
                            permissions: d.permissions.length === ALL_PERMISSIONS.length ? [] : [...ALL_PERMISSIONS],
                          }))
                        }
                        className="text-[11px] text-amber-400 font-bold hover:underline"
                      >
                        {createData.permissions.length === ALL_PERMISSIONS.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isChecked = createData.permissions.includes(perm);
                        const info = PERMISSION_LABELS[perm] || { title: perm, desc: "" };
                        return (
                          <div
                            key={perm}
                            onClick={() => togglePermissionInCreate(perm)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isChecked
                                ? "bg-amber-500/10 border-amber-500/40 text-white"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            <div className="mt-0.5 text-amber-400">
                              {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-600" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">{info.title}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{info.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {createError && (
                    <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {createError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
                    >
                      {createLoading ? "Creating..." : "Save Admin Account"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT ADMIN PERMISSIONS MODAL */}
      <AnimatePresence>
        {editAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.target === e.currentTarget && setEditAdmin(null)}
          >
            <div className="min-h-full flex items-center justify-center py-6">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-auto space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Configure Permissions</h3>
                    <p className="text-gray-400 text-xs mt-1">Editing access rights for {editAdmin.name}</p>
                  </div>
                  <button
                    onClick={() => setEditAdmin(null)}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditAdmin} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editData.name}
                        onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editData.email}
                        onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reset Password (Optional)</label>
                      <input
                        type="password"
                        minLength={8}
                        value={editData.password}
                        onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        placeholder="Leave empty to keep current"
                      />
                    </div>
                  </div>

                  {/* Permission Checkbox Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Active Permissions ({editData.permissions.length} of {ALL_PERMISSIONS.length})
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setEditData((d) => ({
                            ...d,
                            permissions: d.permissions.length === ALL_PERMISSIONS.length ? [] : [...ALL_PERMISSIONS],
                          }))
                        }
                        className="text-[11px] text-amber-400 font-bold hover:underline"
                      >
                        {editData.permissions.length === ALL_PERMISSIONS.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isChecked = editData.permissions.includes(perm);
                        const info = PERMISSION_LABELS[perm] || { title: perm, desc: "" };
                        return (
                          <div
                            key={perm}
                            onClick={() => togglePermissionInEdit(perm)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isChecked
                                ? "bg-amber-500/10 border-amber-500/40 text-white"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            <div className="mt-0.5 text-amber-400">
                              {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-600" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">{info.title}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{info.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {editError && (
                    <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {editError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditAdmin(null)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
                    >
                      {editLoading ? "Updating..." : "Save Permission Matrix"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-tight">Delete Administrator?</h3>
                <button onClick={() => setDeleteTarget(null)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed">
                You are about to permanently delete the admin account for <strong className="text-white">{deleteTarget.name}</strong> ({deleteTarget.email}). This will revoke all permissions.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDeleteAdmin(deleteTarget)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Delete Admin
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
