"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Calendar, Apple, Zap, Building2, ShieldAlert,
  ArrowUpRight, CheckCircle2, Activity, UserPlus, Sparkles
} from "lucide-react";

interface QuickStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  pendingEnquiries: number;
  openComplaints: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats>({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckIns: 0,
    pendingEnquiries: 0,
    openComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok && isMounted) {
          const data = await res.json();
          setStats({
            totalMembers: data.totalMembers || 0,
            activeMembers: data.activeMembers || 0,
            todayCheckIns: data.todayCheckIns || 0,
            pendingEnquiries: data.pendingEnquiries || 0,
            openComplaints: data.openComplaints || 0,
          });
        }
      } catch (error) {
        console.error("Admin dashboard stats load error", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> Operations Room
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Daily Gym Operations Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Monitor today check-ins, process walk-in enquiries, resolve member feedback, and manage workout schedules.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/attendance")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Calendar className="w-4 h-4" /> Mark Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Check-ins */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today&apos;s Check-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-white">
            {loading ? (
              <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              stats.todayCheckIns
            )}
          </div>
          <p className="text-[11px] text-gray-500">Members present in gym today</p>
        </div>

        {/* Active Members */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-white">
            {loading ? (
              <div className="h-9 w-24 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <>
                {stats.activeMembers} <span className="text-xs text-gray-500 font-normal">/ {stats.totalMembers} total</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-500">Currently enrolled gym members</p>
        </div>

        {/* Pending Enquiries */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Leads</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-white">
            {loading ? (
              <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              stats.pendingEnquiries
            )}
          </div>
          <p className="text-[11px] text-gray-500">Walk-in enquiries &amp; contact messages</p>
        </div>

        {/* Open Complaints */}
        <div className="bg-[#0D0D12] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open Complaints</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-white">
            {loading ? (
              <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              stats.openComplaints
            )}
          </div>
          <p className="text-[11px] text-gray-500">Unresolved member feedback tickets</p>
        </div>
      </div>

      {/* Quick Action Operations Room */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" /> Operational Action Hub
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => router.push("/admin/users")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Member Roster <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Register new members, view active profiles, or edit details.</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/admin/attendance")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Mark Check-Ins <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Record member entry times or inspect attendance history logs.</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/admin/diets")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Diet Planner <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Generate AI nutrition plans or assign manual meal macros to members.</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/admin/workouts")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Workout Routines <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Create customized workout schedules and assign routines to members.</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/admin/enquiries")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Enquiries &amp; Leads <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Track prospective client leads, set follow-ups, and convert memberships.</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/admin/complaints")}
            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center justify-between">
                Complaints &amp; Support <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-gray-400 text-xs mt-1">Manage member feedback, prioritize issue tickets, and record resolutions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
