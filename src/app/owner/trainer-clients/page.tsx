"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users, UserCheck, PlusCircle, CheckCircle, AlertCircle, X } from "lucide-react";

interface TrainerOverview {
  trainerId: number; trainerName: string; email: string; phone: string;
  totalAssigned: number; activeClientsCount: number; expiredClientsCount: number; ptClientsCount: number; revenueGenerated: number;
  assignedClients: Array<{
    id: number; status: string;
    client: { id: number; name: string; email: string; phone: string; memberships: Array<{ plan: string; status: string; }> };
  }>;
}

interface Member {
  id: number; name: string; email: string; phone: string;
  memberships: Array<{ plan: string; status: string; }>;
  assignedAsClient: Array<{ trainerId: number; trainer: { name: string; }; }>;
}

interface Toast { id: string; type: "success" | "error"; message: string; }

export default function TrainerClientsPage() {
  const [trainers, setTrainers] = useState<TrainerOverview[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerOverview | null>(null);

  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ trainerId: "", clientId: "", notes: "" });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/trainer-clients");
      if (res.ok) {
        const d = await res.json();
        setTrainers(d.trainerOverview || []);
        setAllMembers(d.allMembers || []);
      }
    } catch { addToast("error", "Failed to load trainer client data."); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true); setAssignError("");
    const res = await fetch("/api/owner/trainer-clients", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId: Number(assignForm.trainerId), clientId: Number(assignForm.clientId), notes: assignForm.notes })
    });
    const d = await res.json();
    if (res.ok) {
      addToast("success", "Client assigned successfully!");
      setShowAssign(false);
      setAssignForm({ trainerId: "", clientId: "", notes: "" });
      fetchData();
    } else { setAssignError(d.error || "Assignment failed."); }
    setAssignLoading(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toasts */}
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
            <Crown className="w-6 h-6 text-amber-400" /> Trainer Client Management
          </h1>
          <p className="text-xs text-gray-400">View trainer workloads, assign clients, and track PT program performance</p>
        </div>
        <button onClick={() => setShowAssign(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Assign Client to Trainer
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {trainers.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto opacity-20 mb-2" />
              <p>No trainers found. Add a trainer from Staff Management first.</p>
            </div>
          ) : (
            trainers.map(t => (
              <div key={t.trainerId} className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                {/* Trainer Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg uppercase shrink-0">
                      {t.trainerName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{t.trainerName}</div>
                      <div className="text-xs text-gray-400">{t.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-lg font-heading font-black text-green-400">{t.activeClientsCount}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Active</div>
                    </div>
                    <div>
                      <div className="text-lg font-heading font-black text-amber-400">{t.totalAssigned}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-heading font-black text-emerald-400">₹{t.revenueGenerated.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Revenue</div>
                    </div>
                    <button
                      onClick={() => setSelectedTrainer(selectedTrainer?.trainerId === t.trainerId ? null : t)}
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold uppercase transition-colors">
                      {selectedTrainer?.trainerId === t.trainerId ? "Hide Clients" : "View Clients"}
                    </button>
                  </div>
                </div>

                {/* Client List Expansion */}
                <AnimatePresence>
                  {selectedTrainer?.trainerId === t.trainerId && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 overflow-hidden">
                      {t.assignedClients.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500">No clients assigned to this trainer yet.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-white/[0.01] text-gray-500 uppercase text-[10px] border-b border-white/5">
                                <th className="p-3 text-left">Client Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Plan</th>
                                <th className="p-3 text-center">Assignment Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {t.assignedClients.map(c => (
                                <tr key={c.id} className="border-b border-white/5 last:border-0">
                                  <td className="p-3 font-bold text-white">{c.client.name}</td>
                                  <td className="p-3 text-gray-400">{c.client.email}</td>
                                  <td className="p-3 text-gray-300">{c.client.memberships[0]?.plan || "No Plan"}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${c.status === "Active" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-gray-500/10 border-gray-500/30 text-gray-400"}`}>
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      )}

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase flex items-center gap-2"><Users className="w-5 h-5 text-amber-400" /> Assign Client to Trainer</h3>
                <button onClick={() => setShowAssign(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAssign} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Select Trainer *</label>
                  <select required value={assignForm.trainerId} onChange={e => setAssignForm({ ...assignForm, trainerId: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    <option value="">Select Trainer</option>
                    {trainers.map(t => <option key={t.trainerId} value={t.trainerId}>{t.trainerName} ({t.activeClientsCount} active clients)</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Select Member / Client *</label>
                  <select required value={assignForm.clientId} onChange={e => setAssignForm({ ...assignForm, clientId: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    <option value="">Select Member</option>
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.assignedAsClient.length > 0 ? `(Currently: ${m.assignedAsClient[0].trainer.name})` : "(Unassigned)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Notes (Optional)</label>
                  <input type="text" value={assignForm.notes} onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="Reason for assignment..."
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                </div>
                {assignError && <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">{assignError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={assignLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 disabled:opacity-50">
                    {assignLoading ? "Assigning..." : "Assign Client"}
                  </button>
                  <button type="button" onClick={() => setShowAssign(false)} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
