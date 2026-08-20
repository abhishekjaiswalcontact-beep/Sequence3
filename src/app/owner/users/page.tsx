"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Crown,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isOwner: boolean;
  role: string;
  isActive: boolean;
  createdAt: string;
  staff?: {
    designation: string;
    department: string;
    monthlySalary: number;
  };
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function OwnerUserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Create User Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "MEMBER",
    designation: "",
    department: "",
    monthlySalary: 0,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit User State
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "MEMBER",
    designation: "",
    department: "",
    monthlySalary: 0,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Target Modal
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, role: roleFilter });
      const res = await fetch(`/api/owner/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      addToast("error", "Failed to load user roster.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u: ManagedUser) => {
    const res = await fetch("/api/owner/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, isActive: !u.isActive }),
    });

    if (res.ok) {
      addToast("success", `Account access for ${u.name} ${!u.isActive ? "activated" : "deactivated"}.`);
      fetchUsers();
    } else {
      addToast("error", "Failed to toggle account access.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    const res = await fetch("/api/owner/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    const data = await res.json();

    if (res.ok) {
      addToast("success", `User "${createForm.name}" created with role ${createForm.role}!`);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "MEMBER",
        designation: "",
        department: "",
        monthlySalary: 0,
      });
      fetchUsers();
    } else {
      setCreateError(data.error || "Failed to create user.");
    }
    setCreateLoading(false);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setEditLoading(true);

    const payload: Record<string, unknown> = {
      userId: editTarget.id,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      role: editForm.role,
      designation: editForm.designation,
      department: editForm.department,
      monthlySalary: Number(editForm.monthlySalary),
    };

    if (editForm.password.trim().length >= 8) {
      payload.password = editForm.password.trim();
    }

    const res = await fetch("/api/owner/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      addToast("success", `Updated details for ${editForm.name}.`);
      setEditTarget(null);
      fetchUsers();
    } else {
      const d = await res.json();
      addToast("error", d.error || "Update failed.");
    }
    setEditLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    const res = await fetch("/api/owner/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: deleteTarget.id }),
    });

    if (res.ok) {
      addToast("success", `User "${deleteTarget.name}" permanently deleted.`);
      setDeleteTarget(null);
      fetchUsers();
    } else {
      const d = await res.json();
      addToast("error", d.error || "Failed to delete user.");
    }
    setDeleteLoading(false);
  };

  const openEditModal = (u: ManagedUser) => {
    setEditTarget(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      role: u.role || (u.isOwner ? "OWNER" : u.isAdmin ? "ADMIN" : "MEMBER"),
      designation: u.staff?.designation || "",
      department: u.staff?.department || "",
      monthlySalary: u.staff?.monthlySalary || 0,
    });
  };

  return (
    <div className="space-y-6 pb-12">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> User Management
          </h1>
          <p className="text-xs text-gray-400">Master control of all account roles, access statuses, and permanent deletions</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Create User &amp; Assign Role
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="OWNER">Owners</option>
            <option value="ADMIN">Admins</option>
            <option value="TRAINER">Trainers</option>
            <option value="STAFF">Staff Members</option>
            <option value="MEMBER">Gym Members</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <Users className="w-12 h-12 mx-auto opacity-20" />
            <p>No users found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold text-center">Account Access</th>
                  <th className="p-4 font-bold">Designation</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 font-bold text-right">Owner Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    {/* User Profile */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs uppercase shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {u.name}
                            {u.isOwner && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <div className="text-gray-500 text-[10px]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                          u.isOwner
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : u.isAdmin
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                            : u.role === "TRAINER"
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                            : u.role === "STAFF"
                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                            : "bg-gray-500/20 border-gray-500/40 text-gray-300"
                        }`}
                      >
                        {u.role || (u.isOwner ? "OWNER" : u.isAdmin ? "ADMIN" : "MEMBER")}
                      </span>
                    </td>

                    {/* Active Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          u.isActive
                            ? "bg-green-500/10 text-green-400 border border-green-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4" /> Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" /> Blocked
                          </>
                        )}
                      </button>
                    </td>

                    {/* Designation */}
                    <td className="p-4 text-gray-400">
                      {u.staff?.designation || "—"}
                    </td>

                    {/* Joined */}
                    <td className="p-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </td>

                    {/* Owner Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit user details"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Permanently Delete User"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors"
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

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" /> Create User &amp; Assign Role
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Password (min 8) *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Role Level *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-bold"
                  >
                    <option value="MEMBER">Member (Gym User)</option>
                    <option value="TRAINER">Personal / Head Trainer</option>
                    <option value="STAFF">Staff Member (Frontdesk/Sales/Ops)</option>
                    <option value="ADMIN">Admin (Operational Management)</option>
                    <option value="OWNER">Owner (Highest Gym Privilege)</option>
                  </select>
                </div>

                {createError && (
                  <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {createLoading ? "Creating..." : "Create Account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-400" /> Edit Details for {editTarget.name}
                </h3>
                <button onClick={() => setEditTarget(null)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Role Level</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-bold"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="TRAINER">Trainer</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Reset Password (Optional)</label>
                  <input
                    type="password"
                    minLength={8}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Permanently Delete User?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Are you sure you want to permanently delete <span className="font-bold text-white">{deleteTarget.name}</span> ({deleteTarget.email})? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl uppercase transition-colors disabled:opacity-50 text-xs"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
