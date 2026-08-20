"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Plus, Search,
  AlertCircle, X, Edit2, Trash2
} from "lucide-react";

interface Complaint {
  id: number;
  userId?: number;
  memberName: string;
  subject: string;
  description: string;
  priority: string; // Low, Medium, High, Urgent
  status: string; // Open, In Progress, Resolved, Closed
  resolution?: string;
  createdAt: string;
  user?: { id: number; name: string; email: string; phone: string };
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    memberName: "",
    subject: "",
    description: "",
    priority: "Medium",
    status: "Open",
    resolution: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      id: 0,
      memberName: "",
      subject: "",
      description: "",
      priority: "Medium",
      status: "Open",
      resolution: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (c: Complaint) => {
    setFormData({
      id: c.id,
      memberName: c.memberName,
      subject: c.subject,
      description: c.description,
      priority: c.priority,
      status: c.status,
      resolution: c.resolution || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/complaints", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchComplaints();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to save complaint.");
      }
    } catch {
      setError("Network error while saving complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this complaint record?")) return;
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = complaints.filter((item) => {
    const matchesSearch =
      item.memberName.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] border border-white/10 p-6 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Support &amp; Quality Control
          </div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Member Complaints &amp; Feedback</h1>
          <p className="text-xs text-gray-400 mt-1">Log facility issues, equipment maintenance requests, or member grievances.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Complaint Ticket
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0D0D12] border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member, subject, description..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-500 font-bold uppercase">Filter:</span>
          {["ALL", "Open", "In Progress", "Resolved", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-emerald-500 text-black shadow-md"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading complaint tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <ShieldAlert className="w-10 h-10 text-emerald-500/40 mx-auto" />
            <p className="text-sm font-bold text-gray-300">No Complaints Found</p>
            <p className="text-xs text-gray-500">No issues or grievances recorded matching current criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Subject &amp; Details</th>
                  <th className="py-4 px-6 text-center">Priority</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Resolution Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{item.memberName}</div>
                      <div className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-white text-xs">{item.subject}</div>
                      <div className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{item.description}</div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.priority === "Urgent" || item.priority === "High"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : item.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === "Resolved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : item.status === "In Progress"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : item.status === "Closed"
                            ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-400 max-w-xs truncate">
                      {item.resolution || "—"}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-heading font-bold text-white uppercase">
                  {formData.id ? "Update Complaint Ticket" : "Log Complaint Ticket"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Member Name</label>
                  <input
                    type="text"
                    required
                    value={formData.memberName}
                    onChange={(e) => setFormData((d) => ({ ...d, memberName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Member Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData((d) => ({ ...d, subject: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Broken Treadmill #3 / AC Temperature"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData((d) => ({ ...d, priority: e.target.value }))}
                      className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Resolution Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((d) => ({ ...d, status: e.target.value }))}
                      className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Issue Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Provide details about the issue reported by the member..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Resolution / Action Taken</label>
                  <textarea
                    rows={2}
                    value={formData.resolution}
                    onChange={(e) => setFormData((d) => ({ ...d, resolution: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Action taken to address complaint..."
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Complaint"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
