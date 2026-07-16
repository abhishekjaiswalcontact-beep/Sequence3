"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, UserPlus, Users, Eye, EyeOff, Trash2, Edit2,
  ToggleLeft, ToggleRight, LogOut, ArrowLeft, AlertCircle,
  CheckCircle, Crown, X, Key, Mail, User as UserIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Create user form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", isAdmin: false });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Edit user state
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", password: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        addToast("error", "Failed to load users.");
      }
    } catch {
      addToast("error", "Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !user.isAdmin) {
      router.replace(user ? "/dashboard" : "/login");
    } else {
      fetchUsers();
    }
  }, [isHydrated, user, router, fetchUsers]);

  const handleToggleActive = async (u: ManagedUser) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, isActive: !u.isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, isActive: !u.isActive } : x));
      addToast("success", `${u.name || u.email} ${!u.isActive ? "activated" : "deactivated"}.`);
    } else {
      const d = await res.json();
      addToast("error", d.error || "Update failed.");
    }
  };

  const handleToggleAdmin = async (u: ManagedUser) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, isAdmin: !u.isAdmin }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, isAdmin: !u.isAdmin } : x));
      addToast("success", `${u.name || u.email} is now ${!u.isAdmin ? "an admin" : "a regular user"}.`);
    } else {
      const d = await res.json();
      addToast("error", d.error || "Update failed.");
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      addToast("success", `${u.name || u.email} deleted.`);
    } else {
      const d = await res.json();
      addToast("error", d.error || "Delete failed.");
    }
    setDeleteTarget(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "create-user", 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        isAdmin: formData.isAdmin 
      }),
    });

    const data = await res.json();

    if (res.ok) {
      addToast("success", `User "${data.user.name}" created successfully!`);
      setFormData({ name: "", email: "", password: "", isAdmin: false });
      setShowForm(false);
      fetchUsers();
    } else {
      setFormError(data.error || "Failed to create user.");
    }
    setFormLoading(false);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    
    setEditLoading(true);
    setEditError("");

    interface UpdatePayload {
      userId: number;
      name: string;
      email: string;
      password?: string;
    }

    const updatePayload: UpdatePayload = {
      userId: editTarget.id,
      name: editFormData.name,
      email: editFormData.email,
    };

    if (editFormData.password) {
      updatePayload.password = editFormData.password;
    }

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const data = await res.json();

    if (res.ok) {
      addToast("success", `User "${editFormData.name}" updated successfully!`);
      setEditTarget(null);
      fetchUsers();
    } else {
      setEditError(data.error || "Failed to update user.");
    }
    setEditLoading(false);
  };

  const openEditModal = (u: ManagedUser) => {
    setEditTarget(u);
    setEditFormData({
      name: u.name || "",
      email: u.email,
      password: "",
    });
    setEditError("");
    setShowEditPassword(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!isHydrated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl pointer-events-auto ${
                t.type === "success"
                  ? "bg-green-900/80 border border-green-700/50 text-green-300 backdrop-blur-md"
                  : "bg-red-900/80 border border-red-700/50 text-red-300 backdrop-blur-md"
              }`}
            >
              {t.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center border border-brand/30">
                <ShieldCheck className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold uppercase tracking-tight">Admin Panel</h1>
                <p className="text-xs text-gray-500">User Management</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users },
            { label: "Active", value: users.filter((u) => u.isActive).length, icon: ToggleRight, color: "text-green-400" },
            { label: "Admins", value: users.filter((u) => u.isAdmin).length, icon: Crown, color: "text-brand" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <stat.icon className={`w-6 h-6 ${stat.color || "text-gray-400"}`} />
              <div>
                <div className="text-2xl font-heading font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold uppercase">All Users</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand rounded-xl text-sm font-bold uppercase tracking-wide shadow-neon hover:bg-brand-light transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </motion.button>
        </div>

        {/* Create user form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleCreateUser}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-lg font-heading font-bold uppercase">New User</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                      placeholder="member@example.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium">Password *</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
                        placeholder="Min 8 characters"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer w-fit">
                      <div
                        onClick={() => setFormData((d) => ({ ...d, isAdmin: !d.isAdmin }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${formData.isAdmin ? "bg-brand" : "bg-white/20"}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isAdmin ? "translate-x-6" : "translate-x-1"}`} />
                      </div>
                      <span className="text-sm text-gray-300">Grant admin privileges</span>
                    </label>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold uppercase disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Create</>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(""); }}
                    className="px-6 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-gray-500 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-20" />
              <p>No users yet. Create one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-6 text-xs text-gray-500 font-medium uppercase tracking-wider">User</th>
                    <th className="text-left py-4 px-6 text-xs text-gray-500 font-medium uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="text-center py-4 px-6 text-xs text-gray-500 font-medium uppercase tracking-wider">Admin</th>
                    <th className="text-center py-4 px-6 text-xs text-gray-500 font-medium uppercase tracking-wider">Access</th>
                    <th className="text-right py-4 px-6 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm shrink-0 uppercase">
                            {(u.name || u.email)[0]}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {u.name || "—"}
                              {u.id === Number(user?.id) && <span className="text-[10px] text-brand bg-brand/10 px-1.5 py-0.5 rounded-full border border-brand/30">You</span>}
                            </div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => u.id !== Number(user?.id) && handleToggleAdmin(u)}
                          disabled={u.id === Number(user?.id)}
                          title={u.id === Number(user?.id) ? "Cannot change your own admin status" : "Toggle admin"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            u.isAdmin
                              ? "bg-brand/20 text-brand border border-brand/30 hover:bg-brand/30"
                              : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-white"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <Crown className="w-3 h-3" />
                          {u.isAdmin ? "Admin" : "User"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => u.id !== Number(user?.id) && handleToggleActive(u)}
                          disabled={u.id === Number(user?.id)}
                          title={u.id === Number(user?.id) ? "Cannot deactivate your own account" : "Toggle access"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            u.isActive
                              ? "text-green-400 hover:text-green-300"
                              : "text-red-400 hover:text-red-300"
                          }`}
                        >
                          {u.isActive
                            ? <><ToggleRight className="w-5 h-5" /><span className="text-xs font-medium">Active</span></>
                            : <><ToggleLeft className="w-5 h-5" /><span className="text-xs font-medium">Blocked</span></>}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit user"
                            className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={u.id === Number(user?.id)}
                            title="Delete user"
                            className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setEditTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-tight">Edit User</h3>
                  <p className="text-gray-400 text-sm">Update details or reset password for {editTarget.name || editTarget.email}</p>
                </div>
                <button 
                  onClick={() => setEditTarget(null)} 
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData((d) => ({ ...d, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={editFormData.email}
                        onChange={(e) => setEditFormData((d) => ({ ...d, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-brand/5 border border-brand/10 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-brand font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="w-3 h-3" /> Change Password
                      </label>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Leave blank to keep current</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        minLength={8}
                        value={editFormData.password}
                        onChange={(e) => setEditFormData((d) => ({ ...d, password: e.target.value }))}
                        placeholder="New secure password"
                        className="w-full bg-black/50 border border-brand/20 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {editError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-2xl px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" /> {editError}
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="flex-1 py-3.5 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-wide text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-3.5 bg-brand text-white rounded-2xl text-sm font-bold uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 shadow-neon transition-all"
                  >
                    {editLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                    ) : (
                      "Save Changes"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-tight">Delete User?</h3>
                <button onClick={() => setDeleteTarget(null)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-1">
                You are about to permanently delete:
              </p>
              <p className="text-white font-medium mb-6">
                {deleteTarget.name || "—"} <span className="text-gray-500 text-sm">({deleteTarget.email})</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold uppercase transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors"
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
