"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, DollarSign, TrendingUp, TrendingDown, Building2, Zap,
  PlusCircle, CheckCircle, AlertCircle, X, Search, Edit2,
  Trash2, Receipt, Sparkles, PieChart as PieChartIcon
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface FinanceSummary {
  totalRevenue: number;
  totalMembershipIncome: number;
  totalCustomIncome: number;
  totalExpenses: number;
  totalOtherExpenses: number;
  netProfit: number;
  profitMargin: number;
}

interface ExpenseBreakdown {
  Rent: number;
  Electricity: number;
  Salaries: number;
  Incentives: number;
  Other: number;
}

interface OtherExpenseRecord {
  id: number;
  category: string;
  amount: number;
  date: string;
  month: string;
  year: number;
  paymentStatus: string;
  paymentMode: string;
  description: string;
  notes?: string;
  createdAt: string;
}

interface RentRecord {
  id: number;
  month: string;
  year: number;
  monthlyRent: number;
  amountPaid: number;
  pendingAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  landlordInfo?: string;
  dueDate: string;
  paymentDate?: string;
  notes?: string;
}

interface ElectricityRecord {
  id: number;
  month: string;
  year: number;
  billAmount: number;
  paymentStatus: string;
  provider?: string;
  billNumber?: string;
  meterReading?: string;
  dueDate: string;
  paymentDate?: string;
  notes?: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const currentMonthName = MONTHS[new Date().getMonth()];

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown | null>(null);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpenseRecord[]>([]);
  const [rentPayments, setRentPayments] = useState<RentRecord[]>([]);
  const [electricityBills, setElectricityBills] = useState<ElectricityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [activeTab, setActiveTab] = useState<"overview" | "other-expenses" | "rent" | "electricity">("overview");
  const [search, setSearch] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"other-expense" | "rent" | "electricity">("other-expense");
  const [editingExpense, setEditingExpense] = useState<OtherExpenseRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<{ id: number; type: "expense" | "rent" | "electricity"; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Other Expense Form
  const [expenseForm, setExpenseForm] = useState({
    id: 0,
    category: "Equipment & Maintenance",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    month: currentMonthName,
    year: currentYear,
    paymentMode: "Bank Transfer",
    paymentStatus: "Paid",
    notes: "",
  });

  // Rent Form
  const [rentForm, setRentForm] = useState({
    month: currentMonthName,
    year: currentYear,
    monthlyRent: "",
    amountPaid: "",
    dueDate: new Date().toISOString().split("T")[0],
    paymentDate: new Date().toISOString().split("T")[0],
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    landlordInfo: "",
    notes: "",
  });

  // Electricity Form
  const [electricityForm, setElectricityForm] = useState({
    month: currentMonthName,
    year: currentYear,
    billAmount: "",
    dueDate: new Date().toISOString().split("T")[0],
    paymentDate: new Date().toISOString().split("T")[0],
    paymentStatus: "Paid",
    provider: "State Electricity Board",
    billNumber: "",
    meterReading: "",
    notes: "",
  });

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/finance");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setExpenseBreakdown(data.expenseBreakdown);
        setOtherExpenses(data.otherExpenses || []);
        setRentPayments(data.rentPayments || []);
        setElectricityBills(data.electricityBills || []);
      } else {
        addToast("error", "Failed to load financial records.");
      }
    } catch {
      addToast("error", "Network error while fetching finance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddExpense = () => {
    setExpenseForm({
      id: 0,
      category: "Equipment & Maintenance",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      month: currentMonthName,
      year: currentYear,
      paymentMode: "Bank Transfer",
      paymentStatus: "Paid",
      notes: "",
    });
    setFormError("");
    setAddModalType("other-expense");
    setShowAddModal(true);
  };

  const handleOpenEditExpense = (exp: OtherExpenseRecord) => {
    setEditingExpense(exp);
    setExpenseForm({
      id: exp.id,
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
      date: exp.date ? new Date(exp.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      month: exp.month,
      year: exp.year,
      paymentMode: exp.paymentMode,
      paymentStatus: exp.paymentStatus,
      notes: exp.notes || "",
    });
    setFormError("");
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim()) {
      setFormError("Description / Reason is required.");
      return;
    }
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid expense amount.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const isEdit = expenseForm.id > 0;
      const action = isEdit ? "edit-expense" : "add-expense";
      const payload = {
        action,
        ...(isEdit ? { id: expenseForm.id } : {}),
        category: expenseForm.category,
        description: expenseForm.description,
        amount: amt,
        date: expenseForm.date,
        month: expenseForm.month,
        year: Number(expenseForm.year),
        paymentMode: expenseForm.paymentMode,
        paymentStatus: expenseForm.paymentStatus,
        notes: expenseForm.notes,
      };

      const res = await fetch("/api/owner/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast("success", isEdit ? "Expense record updated." : "Other expense added.");
        setShowAddModal(false);
        setEditingExpense(null);
        fetchData();
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to save expense.");
      }
    } catch {
      setFormError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRent = async (e: React.FormEvent) => {
    e.preventDefault();
    const rent = parseFloat(rentForm.monthlyRent);
    const paid = parseFloat(rentForm.amountPaid);
    if (isNaN(rent) || rent <= 0) {
      setFormError("Please enter valid monthly rent amount.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/owner/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record-rent",
          month: rentForm.month,
          year: Number(rentForm.year),
          monthlyRent: rent,
          amountPaid: isNaN(paid) ? 0 : paid,
          dueDate: rentForm.dueDate,
          paymentDate: rentForm.paymentDate,
          paymentStatus: rentForm.paymentStatus,
          paymentMethod: rentForm.paymentMethod,
          landlordInfo: rentForm.landlordInfo,
          notes: rentForm.notes,
        }),
      });

      if (res.ok) {
        addToast("success", "Rent payment recorded.");
        setShowAddModal(false);
        fetchData();
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to record rent.");
      }
    } catch {
      setFormError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveElectricity = async (e: React.FormEvent) => {
    e.preventDefault();
    const bill = parseFloat(electricityForm.billAmount);
    if (isNaN(bill) || bill <= 0) {
      setFormError("Please enter valid bill amount.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/owner/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record-electricity",
          month: electricityForm.month,
          year: Number(electricityForm.year),
          billAmount: bill,
          dueDate: electricityForm.dueDate,
          paymentDate: electricityForm.paymentDate,
          paymentStatus: electricityForm.paymentStatus,
          provider: electricityForm.provider,
          billNumber: electricityForm.billNumber,
          meterReading: electricityForm.meterReading,
          notes: electricityForm.notes,
        }),
      });

      if (res.ok) {
        addToast("success", "Electricity bill recorded.");
        setShowAddModal(false);
        fetchData();
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to record electricity bill.");
      }
    } catch {
      setFormError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;
    try {
      const res = await fetch(`/api/owner/finance?id=${deletingRecord.id}&type=${deletingRecord.type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", `${deletingRecord.name} record deleted.`);
        setDeletingRecord(null);
        fetchData();
      } else {
        const d = await res.json();
        addToast("error", d.error || "Failed to delete record.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const filteredOtherExpenses = otherExpenses.filter((exp) => {
    return (
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const chartData = expenseBreakdown ? {
    labels: ["Rent", "Electricity", "Salaries", "Incentives", "Other"],
    datasets: [
      {
        data: [
          expenseBreakdown.Rent,
          expenseBreakdown.Electricity,
          expenseBreakdown.Salaries,
          expenseBreakdown.Incentives,
          expenseBreakdown.Other,
        ],
        backgroundColor: [
          "#F59E0B", // Rent - Amber
          "#EF4444", // Electricity - Red
          "#8B5CF6", // Salaries - Purple
          "#06B6D4", // Incentives - Cyan
          "#10B981", // Other - Emerald
        ],
        borderColor: "#0D0D12",
        borderWidth: 2,
      },
    ],
  } : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
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
              <Crown className="w-3.5 h-3.5" /> Owner Financial Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Business Finances &amp; Accounting
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Track gym revenues, rent, electricity, salaries, and manage itemized general/other operational expenses.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleOpenAddExpense}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Add Other Expense
            </button>
            <button
              onClick={() => {
                setAddModalType("rent");
                setFormError("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Building2 className="w-4 h-4" /> Record Rent
            </button>
            <button
              onClick={() => {
                setAddModalType("electricity");
                setFormError("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Zap className="w-4 h-4" /> Record Electricity
            </button>
          </div>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-amber-400">
            {loading ? "..." : `₹${(summary?.totalRevenue || 0).toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-gray-500">
            Membership: ₹{(summary?.totalMembershipIncome || 0).toLocaleString("en-IN")} | Custom: ₹{(summary?.totalCustomIncome || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Total Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-red-400">
            {loading ? "..." : `₹${(summary?.totalExpenses || 0).toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-gray-500">
            Rent + Electricity + Salaries + Incentives + Other Expenses
          </p>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Net Profit / Loss
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              (summary?.netProfit || 0) >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-heading font-black ${
            (summary?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400"
          }`}>
            {loading ? "..." : `₹${(summary?.netProfit || 0).toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-gray-500">
            Profit Margin: {summary?.profitMargin || 0}%
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: "overview", label: "Financial Overview", icon: PieChartIcon },
          { id: "other-expenses", label: `Other Expenses (${otherExpenses.length})`, icon: Receipt },
          { id: "rent", label: `Rent Payments (${rentPayments.length})`, icon: Building2 },
          { id: "electricity", label: `Electricity Bills (${electricityBills.length})`, icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "overview" | "other-expenses" | "rent" | "electricity")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-amber-500 text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Breakdown Pie Chart */}
          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-amber-400" /> Expense Breakdown
            </h3>

            {chartData && (
              <div className="w-48 h-48 mx-auto relative">
                <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Rent
                </span>
                <strong className="text-white">₹{(expenseBreakdown?.Rent || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Electricity
                </span>
                <strong className="text-white">₹{(expenseBreakdown?.Electricity || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Staff Salaries
                </span>
                <strong className="text-white">₹{(expenseBreakdown?.Salaries || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Trainer Incentives
                </span>
                <strong className="text-white">₹{(expenseBreakdown?.Incentives || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Other Expenses
                </span>
                <strong className="text-white">₹{(expenseBreakdown?.Other || 0).toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          {/* Quick Summary Preview Tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* Other Expenses Preview */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" /> Recent Other Expenses
                </h3>
                <button
                  onClick={() => setActiveTab("other-expenses")}
                  className="text-xs text-amber-400 font-bold hover:underline"
                >
                  View All ({otherExpenses.length}) →
                </button>
              </div>

              {otherExpenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs border border-dashed border-white/10 rounded-2xl">
                  No general/other expenses recorded in database. Click &quot;Add Other Expense&quot; above to log equipment, maintenance, or supplies.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-300">
                    <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Description / Reason</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {otherExpenses.slice(0, 4).map((exp) => (
                        <tr key={exp.id}>
                          <td className="py-2.5 px-4 text-gray-400">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="py-2.5 px-4 font-bold text-emerald-400">{exp.category}</td>
                          <td className="py-2.5 px-4 text-white font-medium">{exp.description}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-white">₹{exp.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rent & Electricity Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rent Card */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Gym Rent
                  </span>
                  <button onClick={() => setActiveTab("rent")} className="text-[11px] text-gray-400 hover:text-white">View All</button>
                </div>
                <div className="text-xl font-heading font-black text-white">
                  ₹{(expenseBreakdown?.Rent || 0).toLocaleString("en-IN")}
                </div>
                <p className="text-[11px] text-gray-500">{rentPayments.length} monthly payment records logged</p>
              </div>

              {/* Electricity Card */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-yellow-400 uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Electricity Bills
                  </span>
                  <button onClick={() => setActiveTab("electricity")} className="text-[11px] text-gray-400 hover:text-white">View All</button>
                </div>
                <div className="text-xl font-heading font-black text-white">
                  ₹{(expenseBreakdown?.Electricity || 0).toLocaleString("en-IN")}
                </div>
                <p className="text-[11px] text-gray-500">{electricityBills.length} utility bill records logged</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OTHER EXPENSES MANAGEMENT */}
      {activeTab === "other-expenses" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0D0D12] border border-white/10 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, category, notes..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-xs text-gray-400">
                Total Other Expenses: <strong className="text-emerald-400 font-bold">₹{(summary?.totalOtherExpenses || 0).toLocaleString("en-IN")}</strong>
              </div>
              <button
                onClick={handleOpenAddExpense}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" /> Add Other Expense
              </button>
            </div>
          </div>

          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {filteredOtherExpenses.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Receipt className="w-10 h-10 text-emerald-500/40 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No General / Other Expenses Found</p>
                <p className="text-xs text-gray-500">Log itemized expenses like equipment, maintenance, cleaning, or marketing.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Description / Reason</th>
                      <th className="py-4 px-6">Payment Mode</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOtherExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-xs text-gray-400">
                          {new Date(exp.date).toLocaleDateString()}
                          <div className="text-[10px] text-gray-600">{exp.month} {exp.year}</div>
                        </td>

                        <td className="py-4 px-6 text-xs">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {exp.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs max-w-xs">
                          <div className="font-bold text-white">{exp.description}</div>
                          {exp.notes && <div className="text-[10px] text-gray-500 truncate mt-0.5">{exp.notes}</div>}
                        </td>

                        <td className="py-4 px-6 text-xs text-gray-400">
                          {exp.paymentMode} ({exp.paymentStatus})
                        </td>

                        <td className="py-4 px-6 text-right font-extrabold text-white text-base">
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              title="Edit Expense"
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 text-gray-300 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingRecord({ id: exp.id, type: "expense", name: exp.description })}
                              title="Delete Expense"
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-colors"
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
        </div>
      )}

      {/* TAB 3: RENT PAYMENTS */}
      {activeTab === "rent" && (
        <div className="space-y-4">
          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {rentPayments.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Building2 className="w-10 h-10 text-amber-500/40 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Rent Payments Logged</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Month &amp; Year</th>
                      <th className="py-4 px-6 text-right">Monthly Rent</th>
                      <th className="py-4 px-6 text-right">Amount Paid</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6">Payment Method</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rentPayments.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-6 font-bold text-white">{r.month} {r.year}</td>
                        <td className="py-4 px-6 text-right font-bold text-white">₹{r.monthlyRent.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-400">₹{r.amountPaid.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            r.paymentStatus === "Paid" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {r.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400">{r.paymentMethod || "Bank Transfer"}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDeletingRecord({ id: r.id, type: "rent", name: `Rent for ${r.month} ${r.year}` })}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ELECTRICITY BILLS */}
      {activeTab === "electricity" && (
        <div className="space-y-4">
          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {electricityBills.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Zap className="w-10 h-10 text-yellow-500/40 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Electricity Bills Logged</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Month &amp; Year</th>
                      <th className="py-4 px-6 text-right">Bill Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6">Provider</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {electricityBills.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-6 font-bold text-white">{b.month} {b.year}</td>
                        <td className="py-4 px-6 text-right font-bold text-white">₹{b.billAmount.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            b.paymentStatus === "Paid" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400">{b.provider || "—"}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDeletingRecord({ id: b.id, type: "electricity", name: `Electricity bill for ${b.month} ${b.year}` })}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT OTHER EXPENSE & RENT & ELECTRICITY MODAL */}
      <AnimatePresence>
        {(showAddModal || editingExpense) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setEditingExpense(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-heading font-bold text-white uppercase">
                  {editingExpense
                    ? "Edit Other Expense"
                    : addModalType === "other-expense"
                    ? "Add Other Expense"
                    : addModalType === "rent"
                    ? "Record Rent Payment"
                    : "Record Electricity Bill"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FORM TYPE 1: OTHER EXPENSE */}
              {(addModalType === "other-expense" || editingExpense) && (
                <form onSubmit={handleSaveExpense} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Expense Category</label>
                      <select
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Equipment & Maintenance">Equipment &amp; Maintenance</option>
                        <option value="Supplies & Inventory">Supplies &amp; Inventory</option>
                        <option value="Cleaning & Sanitation">Cleaning &amp; Sanitation</option>
                        <option value="Marketing & Promotions">Marketing &amp; Promotions</option>
                        <option value="Utility & Services">Utility &amp; Services</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="e.g. 15000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Description / Reason</label>
                    <input
                      type="text"
                      required
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Treadmill Belt Replacement / Water Cooler Repair"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Expense Date</label>
                      <input
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Month</label>
                      <select
                        value={expenseForm.month}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Year</label>
                      <input
                        type="number"
                        value={expenseForm.year}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, year: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Payment Mode</label>
                      <select
                        value={expenseForm.paymentMode}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, paymentMode: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Payment Status</label>
                      <select
                        value={expenseForm.paymentStatus}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Internal Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm((f) => ({ ...f, notes: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="Vendor details, invoice reference..."
                    />
                  </div>

                  {formError && (
                    <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingExpense(null);
                      }}
                      className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : editingExpense ? "Update Expense" : "Save Other Expense"}
                    </button>
                  </div>
                </form>
              )}

              {/* FORM TYPE 2: RENT PAYMENT */}
              {addModalType === "rent" && !editingExpense && (
                <form onSubmit={handleSaveRent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        required
                        value={rentForm.monthlyRent}
                        onChange={(e) => setRentForm((f) => ({ ...f, monthlyRent: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="100000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Amount Paid (₹)</label>
                      <input
                        type="number"
                        required
                        value={rentForm.amountPaid}
                        onChange={(e) => setRentForm((f) => ({ ...f, amountPaid: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="100000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Month</label>
                      <select
                        value={rentForm.month}
                        onChange={(e) => setRentForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Year</label>
                      <input
                        type="number"
                        value={rentForm.year}
                        onChange={(e) => setRentForm((f) => ({ ...f, year: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                    >
                      {submitting ? "Recording..." : "Record Rent"}
                    </button>
                  </div>
                </form>
              )}

              {/* FORM TYPE 3: ELECTRICITY BILL */}
              {addModalType === "electricity" && !editingExpense && (
                <form onSubmit={handleSaveElectricity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Bill Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={electricityForm.billAmount}
                        onChange={(e) => setElectricityForm((f) => ({ ...f, billAmount: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="5000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Utility Provider</label>
                      <input
                        type="text"
                        value={electricityForm.provider}
                        onChange={(e) => setElectricityForm((f) => ({ ...f, provider: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Month</label>
                      <select
                        value={electricityForm.month}
                        onChange={(e) => setElectricityForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Year</label>
                      <input
                        type="number"
                        value={electricityForm.year}
                        onChange={(e) => setElectricityForm((f) => ({ ...f, year: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                    >
                      {submitting ? "Recording..." : "Record Electricity Bill"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeletingRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0D0D12] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-tight">Delete Financial Record?</h3>
                <button onClick={() => setDeletingRecord(null)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed">
                You are about to permanently delete <strong className="text-white">&quot;{deletingRecord.name}&quot;</strong>. This action will recalculate your total expenses and net profit.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteRecord}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Delete Record
                </button>
                <button
                  onClick={() => setDeletingRecord(null)}
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
