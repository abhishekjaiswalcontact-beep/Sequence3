"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Crown,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  CreditCard,
  Building2,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPIStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  expiringIn7Days: number;
  expiringIn15Days: number;
  expiringIn30Days: number;
  totalStaff: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  pendingMembershipPayments: number;
  pendingSalaries: number;
  pendingIncentives: number;
  pendingRent: number;
  pendingElectricity: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface AlertItem {
  id: string;
  type: string;
  message: string;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/stats");
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setTrends(data.monthlyTrends || []);
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !kpis) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        {/* Banner Skeleton */}
        <div className="bg-[#101018] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="h-6 w-48 bg-white/10 rounded-full" />
          <div className="h-8 w-72 bg-white/10 rounded-xl" />
          <div className="h-4 w-96 bg-white/5 rounded-lg max-w-full" />
        </div>

        {/* KPI Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-[#0D0D12] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="w-8 h-8 rounded-xl bg-white/5" />
              </div>
              <div className="h-8 w-28 bg-white/10 rounded-lg" />
              <div className="h-3 w-36 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0D0D12] border border-white/5 rounded-3xl p-6 h-80 space-y-4">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-56 bg-white/5 rounded-2xl" />
          </div>
          <div className="bg-[#0D0D12] border border-white/5 rounded-3xl p-6 h-80 space-y-4">
            <div className="h-5 w-32 bg-white/10 rounded" />
            <div className="h-56 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Chart configuration
  const chartLabels = trends.map((t) => t.month);
  const revenueData = trends.map((t) => t.revenue);
  const expensesData = trends.map((t) => t.expenses);
  const profitData = trends.map((t) => t.profit);

  const financialChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueData.length > 0 ? revenueData : [120000, 150000, 180000, 160000, 210000, 240000],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Expenses (₹)",
        data: expensesData.length > 0 ? expensesData : [80000, 95000, 110000, 105000, 120000, 130000],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const profitBarData = {
    labels: chartLabels.length > 0 ? chartLabels : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Net Profit (₹)",
        data: profitData.length > 0 ? profitData : [40000, 55000, 70000, 55000, 90000, 110000],
        backgroundColor: "#10b981",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#12121A] via-[#0E0E14] to-[#16140E] border border-amber-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> High-Level Gym Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Owner Business Control Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Complete oversight of memberships, revenue, staff salaries, incentives, expenses, rent, electricity, and overall net profit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/owner/finance")}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Financial Overview
            </button>
            <button
              onClick={() => router.push("/owner/reports")}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <PieChartIcon className="w-4 h-4 text-amber-400" /> Export Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-black text-white">{kpis.totalMembers}</div>
            <div className="flex items-center gap-2 text-xs text-green-400 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{kpis.newMembersThisMonth} new this month</span>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Memberships</span>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-black text-white">{kpis.activeMembers}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {kpis.expiringIn7Days > 0 ? `${kpis.expiringIn7Days} expiring in 7 days` : "All memberships up to date"}
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-black text-amber-400">₹{kpis.monthRevenue.toLocaleString("en-IN")}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Today: ₹{kpis.todayRevenue.toLocaleString("en-IN")} | Year: ₹{kpis.yearRevenue.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Monthly Profit */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Net Profit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-heading font-black ${kpis.monthlyProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ₹{kpis.monthlyProfit.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Expenses: ₹{kpis.monthlyExpenses.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold">{kpis.totalStaff}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Total Staff</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-yellow-400">{kpis.pendingMembershipPayments}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Pending Payments</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-rose-400">{kpis.pendingSalaries}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Pending Salaries</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-cyan-400">{kpis.pendingIncentives}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Pending Incentives</div>
          </div>
        </div>
      </div>

      {/* Charts & Urgent Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold uppercase tracking-wider text-white">Financial Performance</h3>
              <p className="text-xs text-gray-500">Monthly Revenue vs Total Expenses</p>
            </div>
            <button
              onClick={() => router.push("/owner/finance")}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              Full Breakdown <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72">
            <Line
              data={financialChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#888" } },
                  x: { grid: { display: false }, ticks: { color: "#888" } },
                },
                plugins: {
                  legend: { position: "top", labels: { color: "#bbb", boxWidth: 12 } },
                },
              }}
            />
          </div>
        </div>

        {/* Action Alerts Panel */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white">Owner Urgent Alerts</h3>
            </div>

            <div className="space-y-2.5">
              {alerts.length > 0 ? (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
                      a.type === "important"
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : a.type === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{a.message}</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  No urgent alerts at this moment. Everything is running smoothly!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/owner/notifications")}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            View Notification Hub
          </button>
        </div>
      </div>

      {/* Net Profit Bar & Expiries Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base font-heading font-bold uppercase tracking-wider text-white">Net Profit Progression</h3>
          <div className="h-64">
            <Bar
              data={profitBarData}
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

        {/* Membership Expiry Overview */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-heading font-bold uppercase tracking-wider text-white">Membership Expiry Monitor</h3>
          
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Expiring in 7 Days</div>
                <div className="text-xl font-heading font-black text-red-400">{kpis.expiringIn7Days} Members</div>
              </div>
              <button
                onClick={() => router.push("/owner/members?filter=expiring_soon")}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase"
              >
                View
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Expiring in 15 Days</div>
                <div className="text-xl font-heading font-black text-amber-400">{kpis.expiringIn15Days} Members</div>
              </div>
              <button
                onClick={() => router.push("/owner/members?filter=expiring_soon")}
                className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold uppercase"
              >
                View
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Expiring in 30 Days</div>
                <div className="text-xl font-heading font-black text-blue-400">{kpis.expiringIn30Days} Members</div>
              </div>
              <button
                onClick={() => router.push("/owner/members?filter=expiring_soon")}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
