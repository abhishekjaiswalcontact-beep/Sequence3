"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  UserPlus,
  Crown,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Building2,
  Briefcase,
  Phone,
  ChevronDown,
} from "lucide-react";

interface Staff {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  designation: string;
  department: string;
  joiningDate?: string;
  employmentStatus: string;
  monthlySalary: number;
  workingHours?: string;
  notes?: string;
  assignedClientsCount: number;
  activeClientsCount: number;
  totalIncentiveEarned: number;
  pendingIncentive: number;
  paidIncentive: number;
}

interface Toast { id: string; type: "success" | "error"; message: string; }

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", designation: "", department: "", monthlySalary: 0, workingHours: "9:00 AM - 6:00 PM", notes: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", designation: "", department: "", monthlySalary: 0, employmentStatus: "", workingHours: "", notes: ""
  });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStaff(); }, []);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/staff");
      if (res.ok) setStaffList(await res.json());
    } catch { addToast("error", "Failed to load staff."); }
    finally { setLoading(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true); setCreateError("");
    const res = await fetch("/api/owner/staff", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, monthlySalary: Number(createForm.monthlySalary) })
    });
    const d = await res.json();
    if (res.ok) {
      addToast("success", `Staff member "${createForm.name}" added!`);
      setShowCreate(false);
      setCreateForm({ name: "", email: "", phone: "", designation: "", department: "", monthlySalary: 0, workingHours: "9:00 AM - 6:00 PM", notes: "" });
      fetchStaff();
    } else { setCreateError(d.error || "Failed to add staff."); }
    setCreateLoading(false);
  };

  const openEdit = (s: Staff) => {
    setEditTarget(s);
    setEditForm({ name: s.name, email: s.email, phone: s.phone, designation: s.designation, department: s.department, monthlySalary: s.monthlySalary, employmentStatus: s.employmentStatus, workingHours: s.workingHours || "", notes: s.notes || "" });
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    const res = await fetch("/api/owner/staff", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editTarget.id, ...editForm, monthlySalary: Number(editForm.monthlySalary) })
    });
    if (res.ok) {
      addToast("success", `Updated staff details for ${editForm.name}.`);
      setEditTarget(null); fetchStaff();
    } else { addToast("error", "Update failed."); }
    setEditLoading(false);
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch("/api/owner/staff", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id })
    });
    if (res.ok) {
      addToast("success", `Staff member "${deleteTarget.name}" removed.`);
      setDeleteTarget(null); fetchStaff();
    } else { addToast("error", "Deletion failed."); }
    setDeleteLoading(false);
  };

  const filtered = staffList.filter(s =>
    search === "" ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl pointer-events-auto backdrop-blur-md ${t.type === "success" ? "bg-green-900/80 border border-green-700/50 text-green-300" : "bg-red-900/80 border border-red-700/50 text-red-300"}`}>
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
            <Crown className="w-6 h-6 text-amber-400" /> Staff Directory
          </h1>
          <p className="text-xs text-gray-400">Manage trainers, front desk, sales staff, and operational team</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
        <input type="text" placeholder="Search by name, designation, department..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-white" />
      </div>

      {/* Staff Cards */}
      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-500 space-y-2">
          <UserCheck className="w-12 h-12 mx-auto opacity-20" />
          <p>No staff members found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                {/* Left: Profile */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg uppercase shrink-0">
                    {s.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{s.name}</div>
                    <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-amber-400" /> {s.designation}</span>
                      <span className="text-gray-600">|</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-blue-400" /> {s.department}</span>
                      {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-500" /> {s.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Middle: Stats */}
                <div className="flex items-center gap-5 flex-wrap shrink-0">
                  <div className="text-center">
                    <div className="text-base font-heading font-bold text-amber-400">₹{s.monthlySalary.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Monthly Salary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-heading font-bold text-green-400">{s.activeClientsCount}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-heading font-bold text-purple-400">₹{s.pendingIncentive.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Pending Incentive</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${s.employmentStatus === "Active" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                    {s.employmentStatus}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === s.id ? "rotate-180" : ""}`} />
                  </button>
                  <button onClick={() => openEdit(s)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(s)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden">
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Email</div>
                        <div className="text-gray-300">{s.email}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Working Hours</div>
                        <div className="text-gray-300">{s.workingHours || "9:00 AM - 6:00 PM"}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Total Incentive Earned</div>
                        <div className="text-amber-400 font-bold">₹{s.totalIncentiveEarned.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Total Clients Handled</div>
                        <div className="text-blue-400 font-bold">{s.assignedClientsCount}</div>
                      </div>
                      {s.notes && (
                        <div className="col-span-full space-y-1">
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Internal Notes</div>
                          <div className="text-gray-400">{s.notes}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase flex items-center gap-2"><UserPlus className="w-5 h-5 text-amber-400" /> Add Staff Member</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                {[
                  { label: "Full Name *", field: "name", type: "text", placeholder: "John Doe" },
                  { label: "Email Address *", field: "email", type: "email", placeholder: "john@example.com" },
                  { label: "Phone Number", field: "phone", type: "text", placeholder: "+91 9876543210" },
                  { label: "Designation *", field: "designation", type: "text", placeholder: "Personal Trainer / Head Trainer" },
                  { label: "Department *", field: "department", type: "text", placeholder: "Fitness / Operations / Sales" },
                  { label: "Monthly Salary (₹) *", field: "monthlySalary", type: "number", placeholder: "25000" },
                  { label: "Working Hours", field: "workingHours", type: "text", placeholder: "9:00 AM - 6:00 PM" },
                ].map(f => (
                  <div key={f.field} className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">{f.label}</label>
                    <input type={f.type} required={f.label.includes("*")} value={(createForm as unknown as Record<string, string | number>)[f.field]}
                      onChange={e => setCreateForm({ ...createForm, [f.field]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Internal Notes</label>
                  <textarea value={createForm.notes} onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Any internal notes about this staff member..."
                    rows={2} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none resize-none" />
                </div>
                {createError && <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">{createError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50">
                    {createLoading ? "Adding..." : "Add Staff Member"}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase flex items-center gap-2"><Edit2 className="w-5 h-5 text-amber-400" /> Edit {editTarget.name}</h3>
                <button onClick={() => setEditTarget(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditStaff} className="space-y-3 text-xs">
                {[
                  { label: "Full Name", field: "name", type: "text" },
                  { label: "Email", field: "email", type: "email" },
                  { label: "Phone", field: "phone", type: "text" },
                  { label: "Designation", field: "designation", type: "text" },
                  { label: "Department", field: "department", type: "text" },
                  { label: "Monthly Salary (₹)", field: "monthlySalary", type: "number" },
                  { label: "Working Hours", field: "workingHours", type: "text" },
                ].map(f => (
                  <div key={f.field} className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">{f.label}</label>
                    <input type={f.type} value={(editForm as unknown as Record<string, string | number>)[f.field]}
                      onChange={e => setEditForm({ ...editForm, [f.field]: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Employment Status</label>
                  <select value={editForm.employmentStatus} onChange={e => setEditForm({ ...editForm, employmentStatus: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Notes</label>
                  <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50">
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-black text-white uppercase">Remove Staff Member?</h3>
                <p className="text-xs text-gray-400 mt-1">Remove <span className="font-bold text-white">{deleteTarget.name}</span> from staff directory?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDeleteStaff} disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl uppercase text-xs disabled:opacity-50">
                  {deleteLoading ? "Removing..." : "Remove"}
                </button>
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
