"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, LogOut, Users, CheckCircle,
  Clock, X, Search, Filter, Eye, Trash2, Edit2,
  Settings, Award, Download, ToggleLeft, ToggleRight, AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReferralData {
  id: number;
  referrerId: number;
  referredId: number;
  codeUsed: string;
  joinDate: string;
  status: string;
  rewardStatus: string;
  notes?: string;
  referrer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  referred: {
    id: number;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    memberships: Array<{
      id: number;
      membershipId: string;
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      amountPaid: number;
      totalAmount: number;
      paymentStatus: string;
    }>;
  };
}

interface TopReferrer {
  referrerId: number;
  name: string;
  email: string;
  referralCount: number;
  successfulJoins: number;
  conversionRate: number;
  rewardEarned: string;
}

interface Milestone {
  referrals: number;
  rewardName: string;
  rewardType: string;
  rewardValue: string;
  enabled: boolean;
}


interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminReferralsPage() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [analytics, setAnalytics] = useState({
    totalCodes: 0,
    activeCodes: 0,
    successfulReferrals: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    conversionRate: 0,
  });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [rewardsConfig, setRewardsConfig] = useState<Milestone[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filters & Search state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // 'today' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals / Details view target
  const [detailsTarget, setDetailsTarget] = useState<ReferralData | null>(null);
  const [editingReferral, setEditingReferral] = useState<ReferralData | null>(null);
  const [editForm, setEditForm] = useState({ status: "", rewardStatus: "", notes: "" });

  const limit = 10;

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        membership: membershipFilter,
        dateFilter,
        startDate,
        endDate,
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(`/api/admin/referrals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals);
        setAnalytics(data.analytics);
        setTopReferrers(data.topReferrers);
        setSystemEnabled(data.systemEnabled);
        setRewardsConfig(data.rewardsConfig);
        setTotalPages(Math.ceil(data.totalReferrals / limit));
      } else {
        addToast("error", "Failed to load referral stats.");
      }
    } catch {
      addToast("error", "Network error.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, membershipFilter, dateFilter, startDate, endDate, page]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !user.isAdmin) {
      router.replace(user ? "/dashboard" : "/login");
    } else {
      fetchAdminData();
    }
  }, [isHydrated, user, router, fetchAdminData]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleToggleSystem = async () => {
    try {
      const nextState = !systemEnabled;
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-system", systemEnabled: nextState }),
      });
      if (res.ok) {
        setSystemEnabled(nextState);
        addToast("success", `Referral system is now ${nextState ? "enabled" : "disabled"}.`);
      } else {
        addToast("error", "Failed to update global settings.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const handleSaveMilestones = async (newMilestones: Milestone[]) => {
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-rewards-settings", rewardsConfig: JSON.stringify(newMilestones) }),
      });
      if (res.ok) {
        setRewardsConfig(newMilestones);
        addToast("success", "Rewards settings updated successfully.");
      } else {
        addToast("error", "Failed to save rewards configuration.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReferral) return;

    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-referral-status",
          referralId: editingReferral.id,
          status: editForm.status,
          rewardStatus: editForm.rewardStatus,
          notes: editForm.notes,
        }),
      });

      if (res.ok) {
        addToast("success", "Referral details updated successfully.");
        setEditingReferral(null);
        fetchAdminData();
      } else {
        const err = await res.json();
        addToast("error", err.error || "Update failed.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const handleDeleteReferral = async (id: number) => {
    if (!confirm("Are you sure you want to delete this referral record? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-referral", referralId: id }),
      });

      if (res.ok) {
        addToast("success", "Referral record deleted.");
        fetchAdminData();
      } else {
        addToast("error", "Failed to delete referral.");
      }
    } catch {
      addToast("error", "Network error.");
    }
  };

  const handleExportCSV = () => {
    if (referrals.length === 0) {
      addToast("error", "No data available to export.");
      return;
    }
    const headers = ["Referral ID", "Referrer Name", "Referrer Email", "Code Used", "Referred Member", "Referred Email", "Join Date", "Referral Status", "Reward Status"];
    const rows = referrals.map((r) => [
      r.id,
      r.referrer.name,
      r.referrer.email,
      r.codeUsed,
      r.referred.name,
      r.referred.email,
      new Date(r.joinDate).toLocaleDateString(),
      r.status,
      r.rewardStatus,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `referrals_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("success", "CSV Exported successfully.");
  };

  // Compile Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }).reverse();

  // Simple growth chart simulation or compile from logs
  const referralGrowthData = {
    labels: last7Days,
    datasets: [
      {
        label: "Signup Growth",
        data: [1, 2, 4, 3, 5, 8, analytics.successfulReferrals || 4],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const rewardTypeDistribution = {
    labels: ["Membership Days", "Cash Rewards", "Discounts", "Gifts/Coupons"],
    datasets: [
      {
        data: [5, 3, 2, 1],
        backgroundColor: ["#8b5cf6", "#a78bfa", "#6d28d9", "#3b0764"],
        borderColor: "rgba(255,255,255,0.05)",
      },
    ],
  };

  if (!isHydrated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
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
                <p className="text-xs text-gray-500">Referral Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSystem}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors"
            >
              {systemEnabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-green-400" />
                  System Enabled
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                  System Disabled
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Referral Codes", value: analytics.totalCodes, icon: Users },
            { label: "Active Referral Codes", value: analytics.activeCodes, icon: CheckCircle, color: "text-green-400" },
            { label: "Successful Referrals", value: analytics.successfulReferrals, icon: Award, color: "text-brand" },
            { label: "Conversion Rate", value: `${analytics.conversionRate}%`, icon: Clock, color: "text-yellow-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <stat.icon className={`w-6 h-6 shrink-0 ${stat.color || "text-gray-400"}`} />
              <div>
                <div className="text-2xl font-heading font-bold">{stat.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Date presets overview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Today's Invites", value: analytics.todayCount },
            { label: "This Week", value: analytics.weekCount },
            { label: "This Month", value: analytics.monthCount },
          ].map((tStat) => (
            <div key={tStat.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-xl font-heading font-bold text-gray-300">{tStat.value}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{tStat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:col-span-2 space-y-3">
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-gray-400">Referral Growth Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <Line
                data={referralGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#888" } },
                    x: { grid: { display: false }, ticks: { color: "#888" } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-gray-400">Rewards Distributed</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={rewardTypeDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom", labels: { color: "#888", boxWidth: 10 } } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-heading font-bold uppercase tracking-wider">Search &amp; Filter</h3>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase rounded-xl hover:bg-brand/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, ID, or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm focus:border-brand focus:outline-none text-gray-300"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Joined">Joined</option>
              <option value="Membership Activated">Membership Activated</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </select>

            {/* Membership Filter */}
            <select
              value={membershipFilter}
              onChange={(e) => {
                setMembershipFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm focus:border-brand focus:outline-none text-gray-300"
            >
              <option value="">All Plans</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly (3 Months)">Quarterly</option>
              <option value="Half Yearly (6 Months)">Half Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>

            {/* Date preset Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm focus:border-brand focus:outline-none text-gray-300"
            >
              <option value="">All Join Dates</option>
              <option value="today">Joined Today</option>
              <option value="week">Joined This Week</option>
              <option value="month">Joined This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Range selector */}
          {dateFilter === "custom" && (
            <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Referrals table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-gray-400 border-b border-white/10">
                  <th className="p-4 font-bold uppercase">ID</th>
                  <th className="p-4 font-bold uppercase">Referrer Name</th>
                  <th className="p-4 font-bold uppercase">Referrer ID</th>
                  <th className="p-4 font-bold uppercase">Referral Code</th>
                  <th className="p-4 font-bold uppercase">Referred User</th>
                  <th className="p-4 font-bold uppercase">Referred ID</th>
                  <th className="p-4 font-bold uppercase">Join Date</th>
                  <th className="p-4 font-bold uppercase">Plan</th>
                  <th className="p-4 font-bold uppercase">Referral Status</th>
                  <th className="p-4 font-bold uppercase">Reward Status</th>
                  <th className="p-4 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-gray-500">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : referrals.length > 0 ? (
                  referrals.map((r) => {
                    const activePlan = r.referred.memberships?.[0];
                    return (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono text-gray-500">#{r.id}</td>
                        <td className="p-4 font-bold">{r.referrer.name}</td>
                        <td className="p-4 text-gray-400">MEM-{r.referrerId}</td>
                        <td className="p-4 font-mono text-brand uppercase font-bold">{r.codeUsed}</td>
                        <td className="p-4 font-bold">{r.referred.name}</td>
                        <td className="p-4 text-gray-400">MEM-{r.referredId}</td>
                        <td className="p-4 text-gray-400">{new Date(r.joinDate).toLocaleDateString()}</td>
                        <td className="p-4">{activePlan ? activePlan.plan : "No Plan"}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                              ["Joined", "Membership Activated", "Completed"].includes(r.status)
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : ["Cancelled", "Rejected"].includes(r.status)
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                              r.rewardStatus === "Claimed"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : r.rewardStatus === "Pending"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                            }`}
                          >
                            {r.rewardStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setDetailsTarget(r)}
                              className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingReferral(r);
                                setEditForm({ status: r.status, rewardStatus: r.rewardStatus, notes: r.notes || "" });
                              }}
                              className="p-1.5 hover:bg-white/5 text-brand hover:text-brand-light rounded-lg transition-colors"
                              title="Edit Status"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReferral(r.id)}
                              className="p-1.5 hover:bg-white/5 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-gray-500">
                      No referrals found matching the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-black border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-black border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard & Settings grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Award className="w-5 h-5 text-brand" />
              <h3 className="text-sm font-heading font-bold uppercase tracking-wider">Top Referrer Leaderboard</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-gray-500 border-b border-white/5 pb-2">
                    <th className="py-2.5 font-bold uppercase">Rank</th>
                    <th className="py-2.5 font-bold uppercase">Referrer Name</th>
                    <th className="py-2.5 font-bold uppercase text-center">Invited</th>
                    <th className="py-2.5 font-bold uppercase text-center">Conversion</th>
                    <th className="py-2.5 font-bold uppercase">Reward Claimed</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.length > 0 ? (
                    topReferrers.map((item, index) => (
                      <tr key={item.referrerId} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="py-3 font-mono font-bold text-gray-400">
                          {index === 0 ? "🥇 1st" : index === 1 ? "🥈 2nd" : index === 2 ? "🥉 3rd" : `#${index + 1}`}
                        </td>
                        <td className="py-3 font-bold">{item.name}</td>
                        <td className="py-3 text-center font-bold">{item.successfulJoins}</td>
                        <td className="py-3 text-center text-gray-400">{item.conversionRate}%</td>
                        <td className="py-3 text-gray-400 truncate max-w-[120px]">{item.rewardEarned}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        No referrers active yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reward thresholds config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Settings className="w-5 h-5 text-brand" />
              <h3 className="text-sm font-heading font-bold uppercase tracking-wider">Reward Milestone Settings</h3>
            </div>

            <div className="space-y-4">
              {rewardsConfig.map((milestone, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-black/40 border border-white/5 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 uppercase sm:col-span-1">
                    {milestone.referrals} Referrals
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <input
                      type="text"
                      value={milestone.rewardName}
                      onChange={(e) => {
                        const copy = [...rewardsConfig];
                        copy[idx].rewardName = e.target.value;
                        setRewardsConfig(copy);
                      }}
                      className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-xs focus:border-brand focus:outline-none"
                      placeholder="Milestone Name"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={milestone.rewardType}
                        onChange={(e) => {
                          const copy = [...rewardsConfig];
                          copy[idx].rewardType = e.target.value;
                          setRewardsConfig(copy);
                        }}
                        className="bg-black border border-white/10 rounded-lg px-1 py-1 text-[10px] text-gray-300 focus:outline-none"
                      >
                        <option value="Free Membership Days">Free Days</option>
                        <option value="Cash Reward">Cash Reward</option>
                        <option value="Discount">Discount</option>
                        <option value="Gift">Gift</option>
                        <option value="Coupon">Coupon</option>
                        <option value="Custom Reward">Custom</option>
                      </select>
                      <input
                        type="text"
                        value={milestone.rewardValue}
                        onChange={(e) => {
                          const copy = [...rewardsConfig];
                          copy[idx].rewardValue = e.target.value;
                          setRewardsConfig(copy);
                        }}
                        className="bg-black border border-white/10 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end sm:col-span-1">
                    <button
                      onClick={() => {
                        const copy = [...rewardsConfig];
                        copy[idx].enabled = !copy[idx].enabled;
                        setRewardsConfig(copy);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${
                        milestone.enabled
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}
                    >
                      {milestone.enabled ? "Active" : "Disabled"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => handleSaveMilestones(rewardsConfig)}
                className="w-full py-2.5 bg-brand hover:bg-brand-light text-white font-bold rounded-xl uppercase text-xs transition-colors shadow-neon"
              >
                Save Milestone Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {detailsTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0e0e0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setDetailsTarget(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-heading font-bold uppercase tracking-wide border-b border-white/5 pb-3 text-brand">
                Referral Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Referrer details */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Referrer details</h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Name</span>
                      <div className="text-sm font-bold">{detailsTarget.referrer.name}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Email</span>
                      <div className="text-xs text-gray-400">{detailsTarget.referrer.email}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Phone Number</span>
                      <div className="text-xs text-gray-400">{detailsTarget.referrer.phone || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Member Since</span>
                      <div className="text-xs text-gray-400">{new Date(detailsTarget.referrer.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Referred details */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Referred member</h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Name</span>
                      <div className="text-sm font-bold">{detailsTarget.referred.name}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Email</span>
                      <div className="text-xs text-gray-400">{detailsTarget.referred.email}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Phone Number</span>
                      <div className="text-xs text-gray-400">{detailsTarget.referred.phone || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Gym Join Date</span>
                      <div className="text-xs text-gray-400">{new Date(detailsTarget.referred.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referred user membership details */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Membership details</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  {detailsTarget.referred.memberships?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold text-center">Membership Plan</span>
                        <div className="text-xs font-bold">{detailsTarget.referred.memberships[0].plan}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Current Status</span>
                        <div className="text-xs font-bold text-green-400">{detailsTarget.referred.memberships[0].status}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Renewal Date</span>
                        <div className="text-xs text-gray-400">{new Date(detailsTarget.referred.memberships[0].endDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Payment Status</span>
                        <div className="text-xs font-bold text-green-400">{detailsTarget.referred.memberships[0].paymentStatus}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-500">No membership plan assigned.</div>
                  )}
                </div>
              </div>

              {/* Status and Notes overview */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Referral Status</span>
                  <div className="text-xs font-bold mt-1">
                    <span className="px-2.5 py-1 bg-brand/10 border border-brand/20 text-brand font-bold uppercase rounded-full">
                      {detailsTarget.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Reward Status</span>
                  <div className="text-xs font-bold mt-1">
                    <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase rounded-full">
                      {detailsTarget.rewardStatus}
                    </span>
                  </div>
                </div>
              </div>

              {detailsTarget.notes && (
                <div className="mt-6">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Admin Notes</span>
                  <p className="text-xs text-gray-400 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 mt-1 leading-relaxed">
                    {detailsTarget.notes}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingReferral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e0e0f] border border-white/10 rounded-3xl p-6 relative"
            >
              <button
                onClick={() => setEditingReferral(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-heading font-bold uppercase tracking-wide border-b border-white/5 pb-3 text-brand">
                Update Referral status
              </h2>

              <form onSubmit={handleUpdateStatus} className="mt-6 space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Referral Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-brand"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Joined">Joined</option>
                    <option value="Membership Activated">Membership Activated</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Reward status</label>
                  <select
                    value={editForm.rewardStatus}
                    onChange={(e) => setEditForm((f) => ({ ...f, rewardStatus: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-brand"
                  >
                    <option value="None">None</option>
                    <option value="Pending">Pending</option>
                    <option value="Claimed">Claimed</option>
                    <option value="Sent">Sent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Notes</label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-3 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-brand resize-none"
                    placeholder="Enter referral notes..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingReferral(null)}
                    className="w-1/2 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-brand hover:bg-brand-light text-white font-bold rounded-xl uppercase text-xs transition-colors shadow-neon"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
