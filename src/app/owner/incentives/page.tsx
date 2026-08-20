"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, PlusCircle, CheckCircle, AlertCircle, X, BadgeCheck } from "lucide-react";

interface StaffOption { id: number; name: string; designation: string; }
interface PerformanceMetric { staffId: number; staffName: string; designation: string; totalClientsHandled: number; activeClients: number; revenueGenerated: number; totalIncentiveEarned: number; incentivePaid: number; incentivePending: number; }
interface IncentiveRecord {
  id: number; incentiveType: string; amount: number; reason: string; month: string; year: number; paymentStatus: string; paymentDate?: string; notes?: string;
  staff: { id: number; name: string; designation: string; };
  client?: { id: number; name: string; };
}
interface Toast { id: string; type: "success" | "error"; message: string; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const currentMonthName = MONTHS[new Date().getMonth()];

export default function IncentiveManagementPage() {
  const [incentives, setIncentives] = useState<IncentiveRecord[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<"records" | "performance">("records");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    staffId: "", incentiveType: "Performance Bonus", amount: 0, reason: "", month: currentMonthName, year: currentYear, paymentStatus: "Pending", notes: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchIncentives(); fetchStaff(); }, []);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchIncentives = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/incentives");
      if (res.ok) {
        const d = await res.json();
        setIncentives(d.incentives || []);
        setMetrics(d.performanceMetrics || []);
      }
    } catch { addToast("error", "Failed to load incentives."); }
    finally { setLoading(false); }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/owner/staff");
      if (res.ok) { const d = await res.json(); setStaffOptions(d.map((s: { id: number; name: string; designation: string }) => ({ id: s.id, name: s.name, designation: s.designation }))); }
    } catch {}
  };

  const handleCreateIncentive = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true); setCreateError("");
    const res = await fetch("/api/owner/incentives", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, staffId: Number(createForm.staffId), amount: Number(createForm.amount), year: Number(createForm.year) })
    });
    const d = await res.json();
    if (res.ok) {
      addToast("success", "Incentive record created!");
      setShowCreate(false);
      setCreateForm({ staffId: "", incentiveType: "Performance Bonus", amount: 0, reason: "", month: currentMonthName, year: currentYear, paymentStatus: "Pending", notes: "" });
      fetchIncentives();
    } else { setCreateError(d.error || "Failed."); }
    setCreateLoading(false);
  };

  const markAsPaid = async (incentiveId: number) => {
    const res = await fetch("/api/owner/incentives", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incentiveId, paymentStatus: "Paid" })
    });
    if (res.ok) { addToast("success", "Incentive marked as Paid!"); fetchIncentives(); }
    else { addToast("error", "Failed to update."); }
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
            <Crown className="w-6 h-6 text-amber-400" /> Incentive Management
          </h1>
          <p className="text-xs text-gray-400">Track and pay performance bonuses and special incentives for gym staff &amp; trainers</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Incentive
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit">
        {(["records", "performance"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"}`}>
            {tab === "records" ? "Incentive Records" : "Staff Performance"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : activeTab === "records" ? (
        /* Incentive Records Table */
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {incentives.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto opacity-20 mb-2" />
              <p>No incentive records yet. Add one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                    <th className="p-4 text-left font-bold">Staff Member</th>
                    <th className="p-4 text-left font-bold">Type</th>
                    <th className="p-4 text-left font-bold">Reason</th>
                    <th className="p-4 text-left font-bold">Period</th>
                    <th className="p-4 text-right font-bold">Amount</th>
                    <th className="p-4 text-center font-bold">Status</th>
                    <th className="p-4 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incentives.map(i => (
                    <tr key={i.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{i.staff.name}</div>
                        <div className="text-[10px] text-gray-500">{i.staff.designation}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          {i.incentiveType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 max-w-xs truncate">{i.reason}</td>
                      <td className="p-4 text-gray-500">{i.month} {i.year}</td>
                      <td className="p-4 text-right font-bold text-amber-400">₹{i.amount.toLocaleString("en-IN")}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${i.paymentStatus === "Paid" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                          {i.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {i.paymentStatus === "Pending" && (
                          <button onClick={() => markAsPaid(i.id)}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ml-auto">
                            <BadgeCheck className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Staff Performance Tab */
        <div className="space-y-3">
          {metrics.map(m => (
            <div key={m.staffId} className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-base">{m.staffName}</div>
                  <div className="text-xs text-gray-500">{m.designation}</div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-base font-heading font-black text-blue-400">{m.activeClients}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Active Clients</div>
                  </div>
                  <div>
                    <div className="text-base font-heading font-black text-gray-300">{m.totalClientsHandled}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Total Clients</div>
                  </div>
                  <div>
                    <div className="text-base font-heading font-black text-green-400">₹{m.revenueGenerated.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Revenue Generated</div>
                  </div>
                  <div>
                    <div className="text-base font-heading font-black text-amber-400">₹{m.incentivePaid.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Incentives Paid</div>
                  </div>
                  <div>
                    <div className="text-base font-heading font-black text-red-400">₹{m.incentivePending.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Incentive Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Add Incentive Record</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateIncentive} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Staff Member *</label>
                  <select required value={createForm.staffId} onChange={e => setCreateForm({ ...createForm, staffId: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    <option value="">Select Staff Member</option>
                    {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name} – {s.designation}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Incentive Type *</label>
                  <select value={createForm.incentiveType} onChange={e => setCreateForm({ ...createForm, incentiveType: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    {["Performance Bonus","Client Acquisition Bonus","PT Commission","Referral Bonus","Festival Bonus","Retention Bonus","Other"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Reason / Description *</label>
                  <input type="text" required value={createForm.reason} onChange={e => setCreateForm({ ...createForm, reason: e.target.value })}
                    placeholder="E.g. 5 new PT client enrollments in July"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Incentive Amount (₹) *</label>
                  <input type="number" required min="1" value={createForm.amount} onChange={e => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Month</label>
                    <select value={createForm.month} onChange={e => setCreateForm({ ...createForm, month: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Payment Status</label>
                    <select value={createForm.paymentStatus} onChange={e => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                {createError && <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">{createError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50">
                    {createLoading ? "Adding..." : "Save Incentive"}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
