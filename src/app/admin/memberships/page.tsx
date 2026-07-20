"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, LogOut, Search, Filter, Plus, Edit2, History,
  RotateCcw, ShieldAlert, CheckCircle, AlertCircle, Sparkles, DollarSign,
  Users, Ban, Play, Snowflake, UserCheck, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
}

interface Membership {
  id: number;
  membershipId: string;
  userId: number;
  plan: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  joinDate: string;
  renewalDate: string;
  expiryDate: string;
  paymentStatus: string;
  paymentMode: string;
  amountPaid: number;
  totalAmount: number;
  discount: number;
  remainingBalance: number;
  personalTrainerIncluded: boolean;
  ptStartDate: string | null;
  ptEndDate: string | null;
  ptTrainerName: string | null;
  notes: string | null;
  remarks: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminMembershipsPage() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTargetUser, setHistoryTargetUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [userHistory, setUserHistory] = useState<Membership[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    plan: "Monthly",
    startDate: new Date().toISOString().split("T")[0],
    customEndDate: "",
    totalAmount: 1500,
    discount: 0,
    amountPaid: 1500,
    paymentStatus: "Paid",
    paymentMode: "Cash",
    personalTrainerIncluded: false,
    ptStartDate: "",
    ptEndDate: "",
    ptTrainerName: "",
    notes: "",
    remarks: "",
    status: "Active"
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/memberships");
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      } else {
        addToast("error", "Failed to load memberships.");
      }
    } catch {
      addToast("error", "Network error loading memberships.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      console.error("Failed to load users for selector");
    }
  }, []);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !user.isAdmin) {
      router.replace(user ? "/dashboard" : "/login");
    } else {
      fetchMemberships();
      fetchUsers();
    }
  }, [isHydrated, user, router, fetchMemberships, fetchUsers]);

  // Automated date calculations for Form
  useEffect(() => {
    if (!formData.startDate) return;
    const start = new Date(formData.startDate);
    const end = new Date(start);

    if (formData.plan === "Monthly") {
      end.setMonth(start.getMonth() + 1);
      setFormData(prev => ({ ...prev, customEndDate: end.toISOString().split("T")[0], totalAmount: 1500, amountPaid: 1500 - prev.discount }));
    } else if (formData.plan === "Quarterly (3 Months)") {
      end.setMonth(start.getMonth() + 3);
      setFormData(prev => ({ ...prev, customEndDate: end.toISOString().split("T")[0], totalAmount: 4000, amountPaid: 4000 - prev.discount }));
    } else if (formData.plan === "Half Yearly (6 Months)") {
      end.setMonth(start.getMonth() + 6);
      setFormData(prev => ({ ...prev, customEndDate: end.toISOString().split("T")[0], totalAmount: 7500, amountPaid: 7500 - prev.discount }));
    } else if (formData.plan === "Yearly") {
      end.setFullYear(start.getFullYear() + 1);
      setFormData(prev => ({ ...prev, customEndDate: end.toISOString().split("T")[0], totalAmount: 12000, amountPaid: 12000 - prev.discount }));
    } else if (formData.plan === "Custom") {
      // Keep whatever Custom End Date was there
    }
  }, [formData.plan, formData.startDate]);

  // Automated balance calculations for Form
  const remainingBalance = Math.max(0, formData.totalAmount - formData.discount - formData.amountPaid);
  const calculatedPaymentStatus = remainingBalance === 0 
    ? "Paid" 
    : formData.amountPaid === 0 
      ? "Pending" 
      : "Partial";

  const handleCreateMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      setFormError("Please select a member.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    const payload = {
      userId: Number(formData.userId),
      plan: formData.plan,
      startDate: new Date(formData.startDate).toISOString(),
      customEndDate: formData.plan === "Custom" && formData.customEndDate ? new Date(formData.customEndDate).toISOString() : null,
      totalAmount: Number(formData.totalAmount),
      discount: Number(formData.discount),
      amountPaid: Number(formData.amountPaid),
      paymentStatus: calculatedPaymentStatus,
      paymentMode: formData.paymentMode,
      personalTrainerIncluded: formData.personalTrainerIncluded,
      ptStartDate: formData.personalTrainerIncluded && formData.ptStartDate ? new Date(formData.ptStartDate).toISOString() : null,
      ptEndDate: formData.personalTrainerIncluded && formData.ptEndDate ? new Date(formData.ptEndDate).toISOString() : null,
      ptTrainerName: formData.personalTrainerIncluded ? formData.ptTrainerName : null,
      notes: formData.notes || null,
      remarks: formData.remarks || null,
      status: formData.status
    };

    try {
      const res = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast("success", "Membership assigned successfully.");
        setShowAddModal(false);
        fetchMemberships();
        // Reset form
        setFormData({
          userId: "",
          plan: "Monthly",
          startDate: new Date().toISOString().split("T")[0],
          customEndDate: "",
          totalAmount: 1500,
          discount: 0,
          amountPaid: 1500,
          paymentStatus: "Paid",
          paymentMode: "Cash",
          personalTrainerIncluded: false,
          ptStartDate: "",
          ptEndDate: "",
          ptTrainerName: "",
          notes: "",
          remarks: "",
          status: "Active"
        });
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to create membership.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership) return;

    setFormLoading(true);
    setFormError("");

    const payload = {
      id: selectedMembership.id,
      plan: formData.plan,
      startDate: new Date(formData.startDate).toISOString(),
      customEndDate: formData.plan === "Custom" && formData.customEndDate ? new Date(formData.customEndDate).toISOString() : null,
      totalAmount: Number(formData.totalAmount),
      discount: Number(formData.discount),
      amountPaid: Number(formData.amountPaid),
      paymentStatus: calculatedPaymentStatus,
      paymentMode: formData.paymentMode,
      personalTrainerIncluded: formData.personalTrainerIncluded,
      ptStartDate: formData.personalTrainerIncluded && formData.ptStartDate ? new Date(formData.ptStartDate).toISOString() : null,
      ptEndDate: formData.personalTrainerIncluded && formData.ptEndDate ? new Date(formData.ptEndDate).toISOString() : null,
      ptTrainerName: formData.personalTrainerIncluded ? formData.ptTrainerName : null,
      notes: formData.notes || null,
      remarks: formData.remarks || null,
      status: formData.status
    };

    try {
      const res = await fetch("/api/admin/memberships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast("success", "Membership updated successfully.");
        setShowEditModal(false);
        fetchMemberships();
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to update membership.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (membership: Membership, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/memberships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: membership.id, status: newStatus })
      });

      if (res.ok) {
        addToast("success", `Membership status updated to "${newStatus}".`);
        fetchMemberships();
        if (showEditModal) {
          setShowEditModal(false);
        }
      } else {
        const d = await res.json();
        addToast("error", d.error || "Failed to change status.");
      }
    } catch {
      addToast("error", "Network error updating status.");
    }
  };

  const openEditModal = (m: Membership) => {
    setSelectedMembership(m);
    setFormData({
      userId: String(m.userId),
      plan: m.plan,
      startDate: m.startDate.split("T")[0],
      customEndDate: m.endDate.split("T")[0],
      totalAmount: m.totalAmount,
      discount: m.discount,
      amountPaid: m.amountPaid,
      paymentStatus: m.paymentStatus,
      paymentMode: m.paymentMode,
      personalTrainerIncluded: m.personalTrainerIncluded,
      ptStartDate: m.ptStartDate ? m.ptStartDate.split("T")[0] : "",
      ptEndDate: m.ptEndDate ? m.ptEndDate.split("T")[0] : "",
      ptTrainerName: m.ptTrainerName || "",
      notes: m.notes || "",
      remarks: m.remarks || "",
      status: m.status
    });
    setFormError("");
    setShowEditModal(true);
  };

  const openRenewForm = (m: Membership) => {
    // Open creation modal pre-populated
    const currentEnd = new Date(m.endDate);
    const tomorrow = new Date(currentEnd);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const now = new Date();
    const startDate = tomorrow < now ? now.toISOString().split("T")[0] : tomorrow.toISOString().split("T")[0];

    setFormData({
      userId: String(m.userId),
      plan: m.plan,
      startDate: startDate,
      customEndDate: "",
      totalAmount: m.totalAmount,
      discount: 0,
      amountPaid: m.totalAmount,
      paymentStatus: "Paid",
      paymentMode: "Cash",
      personalTrainerIncluded: m.personalTrainerIncluded,
      ptStartDate: "",
      ptEndDate: "",
      ptTrainerName: m.ptTrainerName || "",
      notes: "",
      remarks: `Renewal of subscription ${m.membershipId}`,
      status: "Active"
    });

    setFormError("");
    setShowAddModal(true);
  };

  const openHistoryModal = async (userId: number, name: string, email: string) => {
    setHistoryTargetUser({ id: userId, name, email });
    setHistoryLoading(true);
    setShowHistoryModal(true);

    try {
      const res = await fetch(`/api/admin/memberships?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data);
      } else {
        addToast("error", "Failed to load user history.");
      }
    } catch {
      addToast("error", "Network error loading history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Filtered memberships
  const filteredMemberships = memberships.filter((m) => {
    const userMatches =
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(searchQuery.toLowerCase());

    const planMatches = !planFilter || m.plan === planFilter;
    const statusMatches = !statusFilter || m.status === statusFilter;
    const paymentMatches = !paymentFilter || m.paymentStatus === paymentFilter;

    return userMatches && planMatches && statusMatches && paymentMatches;
  });

  // Calculate stats
  const activeCount = memberships.filter(m => m.status === "Active").length;
  const frozenCount = memberships.filter(m => m.status === "Frozen").length;
  const pendingPaymentCount = memberships.filter(m => m.paymentStatus !== "Paid").length;
  
  // Expiring soon count (active and endDate - now <= 7 days)
  const expiringSoonCount = memberships.filter(m => {
    if (m.status !== "Active" && m.status !== "Upcoming") return false;
    const diff = new Date(m.endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  }).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "Upcoming":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Frozen":
        return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
      case "Cancelled":
        return "bg-gray-500/20 text-gray-500 border border-white/10";
      case "Expired":
      default:
        return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "Partial":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "Pending":
      default:
        return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
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
      <div className="fixed top-4 right-4 z-[120] space-y-2 pointer-events-none">
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
              onClick={() => router.push("/admin/users")}
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
                <p className="text-xs text-gray-500">Membership Management</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Memberships", value: memberships.length, icon: Users },
            { label: "Active Plans", value: activeCount, icon: UserCheck, color: "text-green-400" },
            { label: "Frozen Plans", value: frozenCount, icon: Snowflake, color: "text-cyan-400" },
            { label: "Expiring Soon", value: expiringSoonCount, icon: ShieldAlert, color: "text-yellow-400" },
            { label: "Pending Payments", value: pendingPaymentCount, icon: DollarSign, color: "text-red-400" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <stat.icon className={`w-5 h-5 shrink-0 ${stat.color || "text-gray-400"}`} />
              <div>
                <div className="text-xl font-heading font-bold">{stat.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">Gym Memberships</h2>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/users")}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/5 hover:text-white transition-colors"
            >
              Users Directory
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFormData({
                  userId: "",
                  plan: "Monthly",
                  startDate: new Date().toISOString().split("T")[0],
                  customEndDate: "",
                  totalAmount: 1500,
                  discount: 0,
                  amountPaid: 1500,
                  paymentStatus: "Paid",
                  paymentMode: "Cash",
                  personalTrainerIncluded: false,
                  ptStartDate: "",
                  ptEndDate: "",
                  ptTrainerName: "",
                  notes: "",
                  remarks: "",
                  status: "Active"
                });
                setFormError("");
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand rounded-xl text-xs font-bold uppercase tracking-wider shadow-neon hover:bg-brand-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Membership
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search Name, Email, Card ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-brand transition-colors text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand text-white"
            >
              <option value="">All Plans</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly (3 Months)">Quarterly (3 Months)</option>
              <option value="Half Yearly (6 Months)">Half Yearly (6 Months)</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand text-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Frozen">Frozen</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand text-white"
          >
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Table list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="py-20 text-center text-gray-500 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-20" />
              <p>No memberships found matching filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Member</th>
                    <th className="py-4 px-6">Card ID & Plan</th>
                    <th className="py-4 px-6">Dates & Status</th>
                    <th className="py-4 px-6">Trainer Package</th>
                    <th className="py-4 px-6">Payments</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberships.map((m, i) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors align-middle"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs uppercase">
                            {m.user.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{m.user.name}</div>
                            <div className="text-gray-500 text-[10px]">{m.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-white font-medium">{m.membershipId}</div>
                        <div className="text-gray-400 font-medium">{m.plan}</div>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(m.status)}`}>
                            {m.status}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          {formatDate(m.startDate)} - {formatDate(m.endDate)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {m.personalTrainerIncluded ? (
                          <div className="flex items-center gap-1.5 text-brand-light font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{m.ptTrainerName || "Trainer Inc."}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-medium">None</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">
                          ₹{m.amountPaid.toLocaleString()} / ₹{m.totalAmount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getPaymentBadge(m.paymentStatus)}`}>
                            {m.paymentStatus}
                          </span>
                          {m.remainingBalance > 0 && (
                            <span className="text-[10px] text-red-400 font-medium">
                              Due: ₹{m.remainingBalance.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(m)}
                            title="Edit subscription details"
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openRenewForm(m)}
                            title="Renew subscription"
                            className="p-2 rounded-lg text-gray-500 hover:text-brand hover:bg-brand/10 transition-colors border border-white/5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openHistoryModal(m.userId, m.user.name, m.user.email)}
                            title="View history"
                            className="p-2 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-900/10 transition-colors border border-white/5"
                          >
                            <History className="w-3.5 h-3.5" />
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

      {/* ADD MEMBERSHIP MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative my-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">Assign Membership</h3>
                  <p className="text-gray-400 text-xs mt-1">Assign subscription packages, trainers, and log payment records.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMembership} className="space-y-6 text-xs">
                {formError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select user */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Select Member *</label>
                    <select
                      required
                      value={formData.userId}
                      disabled={formData.userId !== "" && selectedMembership !== null} // Lock user in renewal
                      onChange={(e) => setFormData(d => ({ ...d, userId: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand text-white disabled:opacity-50"
                    >
                      <option value="">-- Choose Member --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Membership Plan *</label>
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData(d => ({ ...d, plan: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand text-white"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly (3 Months)">Quarterly (3 Months)</option>
                      <option value="Half Yearly (6 Months)">Half Yearly (6 Months)</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Start date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(d => ({ ...d, startDate: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-brand text-white"
                    />
                  </div>

                  {/* End date (Calculated/Input) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      {formData.plan === "Custom" ? "End Date * (Manual)" : "End Date (Calculated)"}
                    </label>
                    <input
                      type="date"
                      required
                      disabled={formData.plan !== "Custom"}
                      value={formData.customEndDate}
                      onChange={(e) => setFormData(d => ({ ...d, customEndDate: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-brand text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Financial details */}
                <div className="bg-white/2 border border-white/5 p-4 rounded-2xl space-y-4">
                  <span className="text-[10px] text-brand font-bold uppercase tracking-widest block">Billing & Payment Information</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Total Amount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.totalAmount}
                        onChange={(e) => setFormData(d => ({ ...d, totalAmount: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Discount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.discount}
                        onChange={(e) => setFormData(d => ({ ...d, discount: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Amount Paid (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.amountPaid}
                        onChange={(e) => setFormData(d => ({ ...d, amountPaid: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="flex justify-between md:flex-col justify-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-500 font-medium text-[9px] uppercase tracking-wider">Remaining Balance</span>
                      <span className={`text-sm ${remainingBalance > 0 ? "text-red-400" : "text-green-400"}`}>
                        ₹{remainingBalance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between md:flex-col justify-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-500 font-medium text-[9px] uppercase tracking-wider">Payment Status (Auto)</span>
                      <span className={`text-sm ${calculatedPaymentStatus === "Paid" ? "text-green-400" : "text-yellow-400"}`}>
                        {calculatedPaymentStatus}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Payment Mode</label>
                      <select
                        value={formData.paymentMode}
                        onChange={(e) => setFormData(d => ({ ...d, paymentMode: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white text-xs font-normal"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trainer packaging */}
                <div className="bg-white/2 border border-white/5 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand font-bold uppercase tracking-widest block">Personal Trainer Included</span>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setFormData(d => ({ ...d, personalTrainerIncluded: !d.personalTrainerIncluded }))}
                        className={`w-10 h-5.5 rounded-full transition-colors relative ${formData.personalTrainerIncluded ? "bg-brand" : "bg-white/20"}`}
                      >
                        <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${formData.personalTrainerIncluded ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                  </div>

                  {formData.personalTrainerIncluded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5"
                    >
                      <div className="space-y-1.5">
                        <label className="text-gray-400">Trainer Name</label>
                        <input
                          type="text"
                          required
                          value={formData.ptTrainerName}
                          onChange={(e) => setFormData(d => ({ ...d, ptTrainerName: e.target.value }))}
                          placeholder="Trainer name"
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-400">PT Start Date</label>
                        <input
                          type="date"
                          required
                          value={formData.ptStartDate}
                          onChange={(e) => setFormData(d => ({ ...d, ptStartDate: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-400">PT End Date</label>
                        <input
                          type="date"
                          required
                          value={formData.ptEndDate}
                          onChange={(e) => setFormData(d => ({ ...d, ptEndDate: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Notes and Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Admin Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(d => ({ ...d, notes: e.target.value }))}
                      placeholder="Add office notes, internal remarks, etc."
                      rows={2}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Remarks for User</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(d => ({ ...d, remarks: e.target.value }))}
                      placeholder="Add comments/remarks that user can see in their membership page."
                      rows={2}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-white/10 rounded-xl font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-brand text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-neon transition-all"
                  >
                    {formLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : (
                      "Confirm Assignment"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MEMBERSHIP MODAL */}
      <AnimatePresence>
        {showEditModal && selectedMembership && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative my-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">Manage Membership</h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Card ID: <span className="font-mono text-brand-light font-bold">{selectedMembership.membershipId}</span> for {selectedMembership.user.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Action Buttons */}
              <div className="bg-white/2 border border-white/5 p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Change Subscription Status:</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedMembership.status !== "Active" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedMembership, "Active")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 font-semibold rounded-lg hover:bg-green-500/25 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" /> Activate
                    </button>
                  )}
                  {selectedMembership.status !== "Frozen" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedMembership, "Frozen")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/25 transition-colors"
                    >
                      <Snowflake className="w-3.5 h-3.5" /> Freeze
                    </button>
                  )}
                  {selectedMembership.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedMembership, "Cancelled")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/10 border border-white/10 text-gray-400 font-semibold rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdateMembership} className="space-y-6 text-xs">
                {formError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select user (Read Only) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selected Member</label>
                    <input
                      type="text"
                      disabled
                      value={`${selectedMembership.user.name} (${selectedMembership.user.email})`}
                      className="w-full bg-black border border-white/5 rounded-xl py-2.5 px-4 text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Plan */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Membership Plan *</label>
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData(d => ({ ...d, plan: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand text-white"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly (3 Months)">Quarterly (3 Months)</option>
                      <option value="Half Yearly (6 Months)">Half Yearly (6 Months)</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Start date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(d => ({ ...d, startDate: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-brand text-white"
                    />
                  </div>

                  {/* End date (Calculated/Input) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      {formData.plan === "Custom" ? "End Date * (Manual)" : "End Date (Calculated)"}
                    </label>
                    <input
                      type="date"
                      required
                      disabled={formData.plan !== "Custom"}
                      value={formData.customEndDate}
                      onChange={(e) => setFormData(d => ({ ...d, customEndDate: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-brand text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Financial details */}
                <div className="bg-white/2 border border-white/5 p-4 rounded-2xl space-y-4">
                  <span className="text-[10px] text-brand font-bold uppercase tracking-widest block">Billing & Payment Information</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Total Amount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.totalAmount}
                        onChange={(e) => setFormData(d => ({ ...d, totalAmount: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Discount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.discount}
                        onChange={(e) => setFormData(d => ({ ...d, discount: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-medium">Amount Paid (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.amountPaid}
                        onChange={(e) => setFormData(d => ({ ...d, amountPaid: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="flex justify-between md:flex-col justify-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-500 font-medium text-[9px] uppercase tracking-wider">Remaining Balance</span>
                      <span className={`text-sm ${remainingBalance > 0 ? "text-red-400" : "text-green-400"}`}>
                        ₹{remainingBalance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between md:flex-col justify-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-500 font-medium text-[9px] uppercase tracking-wider">Payment Status (Auto)</span>
                      <span className={`text-sm ${calculatedPaymentStatus === "Paid" ? "text-green-400" : "text-yellow-400"}`}>
                        {calculatedPaymentStatus}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Payment Mode</label>
                      <select
                        value={formData.paymentMode}
                        onChange={(e) => setFormData(d => ({ ...d, paymentMode: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white text-xs font-normal"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trainer packaging */}
                <div className="bg-white/2 border border-white/5 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand font-bold uppercase tracking-widest block">Personal Trainer Included</span>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setFormData(d => ({ ...d, personalTrainerIncluded: !d.personalTrainerIncluded }))}
                        className={`w-10 h-5.5 rounded-full transition-colors relative ${formData.personalTrainerIncluded ? "bg-brand" : "bg-white/20"}`}
                      >
                        <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${formData.personalTrainerIncluded ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                  </div>

                  {formData.personalTrainerIncluded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5"
                    >
                      <div className="space-y-1.5">
                        <label className="text-gray-400">Trainer Name</label>
                        <input
                          type="text"
                          required
                          value={formData.ptTrainerName}
                          onChange={(e) => setFormData(d => ({ ...d, ptTrainerName: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-400">PT Start Date</label>
                        <input
                          type="date"
                          required
                          value={formData.ptStartDate}
                          onChange={(e) => setFormData(d => ({ ...d, ptStartDate: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-400">PT End Date</label>
                        <input
                          type="date"
                          required
                          value={formData.ptEndDate}
                          onChange={(e) => setFormData(d => ({ ...d, ptEndDate: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Notes and Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Admin Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(d => ({ ...d, notes: e.target.value }))}
                      placeholder="Add office notes..."
                      rows={2}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Remarks for User</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(d => ({ ...d, remarks: e.target.value }))}
                      placeholder="Add comments visible to user..."
                      rows={2}
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand text-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border border-white/10 rounded-xl font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-brand text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-neon transition-all"
                  >
                    {formLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
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

      {/* USER SUBSCRIPTION HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && historyTargetUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-base font-heading font-bold text-white uppercase tracking-tight">Membership History</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Audit log for {historyTargetUser.name} ({historyTargetUser.email})</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
                {historyLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                  </div>
                ) : userHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No membership records registered for this user.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userHistory.map((h) => (
                      <div key={h.id} className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-3 text-[11px] align-middle hover:border-brand/35 transition-colors">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 font-semibold text-white">
                            <span className="text-sm">{h.plan} Package</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(h.status)}`}>
                              {h.status}
                            </span>
                            <span className="text-gray-500 font-mono">({h.membershipId})</span>
                          </div>
                          <div className="text-gray-400">
                            Duration: {h.duration} | Created: {formatDate(h.createdAt)}
                          </div>
                          <div className="text-gray-400 mt-1">
                            Dates: {formatDate(h.startDate)} - {formatDate(h.endDate)}
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end justify-center shrink-0">
                          <div className="text-white font-bold text-sm">
                            Paid: ₹{h.amountPaid.toLocaleString()} / ₹{h.totalAmount.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1 rounded text-[8px] font-bold uppercase ${getPaymentBadge(h.paymentStatus)}`}>
                              {h.paymentStatus}
                            </span>
                            {h.remainingBalance > 0 && (
                              <span className="text-red-400 font-bold">Due: ₹{h.remainingBalance.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="text-gray-500 text-[9px] mt-0.5">Mode: {h.paymentMode}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 font-bold uppercase hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
