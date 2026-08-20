"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, DollarSign, PlusCircle, CheckCircle, AlertCircle, X, BadgeCheck } from "lucide-react";

interface StaffOption { id: number; name: string; designation: string; monthlySalary: number; }
interface SalaryRecord {
  id: number; month: string; year: number;
  baseSalary: number; incentiveAmount: number; otherPayment: number; totalPayable: number;
  paymentStatus: string; paymentDate?: string; paymentMethod?: string; notes?: string;
  staff: { id: number; name: string; email: string; designation: string; department: string; monthlySalary: number; };
}
interface Toast { id: string; type: "success" | "error"; message: string; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const currentMonthName = MONTHS[new Date().getMonth()];

export default function SalaryManagementPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [monthFilter, setMonthFilter] = useState(currentMonthName);
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [totalSalaryExpense, setTotalSalaryExpense] = useState(0);
  const [pendingSalaryExpense, setPendingSalaryExpense] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    staffId: "", month: currentMonthName, year: currentYear,
    baseSalary: 0, incentiveAmount: 0, otherPayment: 0,
    paymentStatus: "Pending", paymentDate: "", paymentMethod: "Bank Transfer", notes: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSalaries();
    fetchStaff();
  }, [monthFilter, yearFilter]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: monthFilter, year: yearFilter });
      const res = await fetch(`/api/owner/salaries?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setSalaryRecords(d.salaryRecords || []);
        setTotalSalaryExpense(d.totalSalaryExpense || 0);
        setPendingSalaryExpense(d.pendingSalaryExpense || 0);
      }
    } catch { addToast("error", "Failed to load salary records."); }
    finally { setLoading(false); }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/owner/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffOptions(data.map((s: { id: number; name: string; designation: string; monthlySalary: number }) => ({ id: s.id, name: s.name, designation: s.designation, monthlySalary: s.monthlySalary })));
      }
    } catch {}
  };

  const handleStaffSelect = (staffId: string) => {
    const staff = staffOptions.find(s => s.id === Number(staffId));
    setCreateForm(f => ({ ...f, staffId, baseSalary: staff?.monthlySalary || 0 }));
  };

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true); setCreateError("");
    const res = await fetch("/api/owner/salaries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, staffId: Number(createForm.staffId), year: Number(createForm.year), baseSalary: Number(createForm.baseSalary), incentiveAmount: Number(createForm.incentiveAmount), otherPayment: Number(createForm.otherPayment) })
    });
    const d = await res.json();
    if (res.ok) {
      addToast("success", "Salary record created!");
      setShowCreate(false);
      setCreateForm({ staffId: "", month: currentMonthName, year: currentYear, baseSalary: 0, incentiveAmount: 0, otherPayment: 0, paymentStatus: "Pending", paymentDate: "", paymentMethod: "Bank Transfer", notes: "" });
      fetchSalaries();
    } else { setCreateError(d.error || "Failed to create."); }
    setCreateLoading(false);
  };

  const markAsPaid = async (salaryId: number) => {
    const res = await fetch("/api/owner/salaries", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salaryId, paymentStatus: "Paid" })
    });
    if (res.ok) { addToast("success", "Salary marked as Paid!"); fetchSalaries(); }
    else { addToast("error", "Failed to update status."); }
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
            <Crown className="w-6 h-6 text-amber-400" /> Salary Management
          </h1>
          <p className="text-xs text-gray-400">Record, track, and mark monthly salary payouts for all staff members</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Record Salary Payout
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Paid ({monthFilter})</div>
          <div className="text-2xl font-heading font-black text-green-400">₹{totalSalaryExpense.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Pending ({monthFilter})</div>
          <div className="text-2xl font-heading font-black text-red-400">₹{pendingSalaryExpense.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase">Records This Month</div>
          <div className="text-2xl font-heading font-black text-amber-400">{salaryRecords.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none">
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="px-3 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none">
          {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Salary Records Table */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : salaryRecords.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto opacity-20 mb-2" />
            <p>No salary records for {monthFilter} {yearFilter}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <th className="p-4 text-left font-bold">Staff Member</th>
                  <th className="p-4 text-left font-bold">Period</th>
                  <th className="p-4 text-right font-bold">Base Salary</th>
                  <th className="p-4 text-right font-bold">Incentive</th>
                  <th className="p-4 text-right font-bold">Total Payable</th>
                  <th className="p-4 text-center font-bold">Status</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryRecords.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{r.staff.name}</div>
                      <div className="text-[10px] text-gray-500">{r.staff.designation}</div>
                    </td>
                    <td className="p-4 text-gray-400">{r.month} {r.year}</td>
                    <td className="p-4 text-right text-white">₹{r.baseSalary.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right text-purple-400">₹{r.incentiveAmount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right font-bold text-amber-400">₹{r.totalPayable.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${r.paymentStatus === "Paid" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.paymentStatus === "Pending" && (
                        <button onClick={() => markAsPaid(r.id)}
                          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ml-auto">
                          <BadgeCheck className="w-3.5 h-3.5" /> Mark Paid
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

      {/* Create Salary Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-white uppercase flex items-center gap-2"><DollarSign className="w-5 h-5 text-amber-400" /> Record Salary Payout</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateSalary} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase">Staff Member *</label>
                  <select value={createForm.staffId} onChange={e => handleStaffSelect(e.target.value)} required
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                    <option value="">Select Staff Member</option>
                    {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name} – {s.designation}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Month *</label>
                    <select value={createForm.month} onChange={e => setCreateForm({ ...createForm, month: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Year *</label>
                    <input type="number" value={createForm.year} onChange={e => setCreateForm({ ...createForm, year: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Base Salary (₹)", field: "baseSalary" },
                    { label: "Incentive (₹)", field: "incentiveAmount" },
                    { label: "Other Payment (₹)", field: "otherPayment" },
                  ].map(f => (
                    <div key={f.field} className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase">{f.label}</label>
                      <input type="number" min="0" value={(createForm as unknown as Record<string, string | number>)[f.field]}
                        onChange={e => setCreateForm({ ...createForm, [f.field]: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <span className="text-xs text-gray-400">Total Payable: </span>
                  <span className="text-xl font-heading font-black text-amber-400">
                    ₹{(Number(createForm.baseSalary) + Number(createForm.incentiveAmount) + Number(createForm.otherPayment)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Payment Status</label>
                    <select value={createForm.paymentStatus} onChange={e => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Payment Method</label>
                    <select value={createForm.paymentMethod} onChange={e => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                </div>
                {createError && <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">{createError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl uppercase hover:bg-amber-400 transition-colors disabled:opacity-50">
                    {createLoading ? "Recording..." : "Save Salary Record"}
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
