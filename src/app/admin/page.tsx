"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Building2,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  UserPlus,
  Sparkles,
  UserCheck,
  Image as ImageIcon,
  DollarSign,
  HelpCircle,
  FileCode2,
  FolderOpen,
  Globe,
  ExternalLink,
  Plus,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  pendingEnquiries: number;
  openComplaints: number;
  totalTrainers: number;
  activeTrainers: number;
  totalGalleryImages: number;
  totalPricingPlans: number;
  totalFAQs: number;
  totalMediaUploads: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckIns: 0,
    pendingEnquiries: 0,
    openComplaints: 0,
    totalTrainers: 0,
    activeTrainers: 0,
    totalGalleryImages: 0,
    totalPricingPlans: 0,
    totalFAQs: 0,
    totalMediaUploads: 0,
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
            totalTrainers: data.totalTrainers || 0,
            activeTrainers: data.activeTrainers || 0,
            totalGalleryImages: data.totalGalleryImages || 0,
            totalPricingPlans: data.totalPricingPlans || 0,
            totalFAQs: data.totalFAQs || 0,
            totalMediaUploads: data.totalMediaUploads || 0,
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
      <div className="bg-gradient-to-r from-brand/15 via-purple-900/10 to-transparent border border-brand/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand-light border border-brand/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> Central Control System
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Website &amp; Club CRM Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Manage live website content (trainers, gallery, pricing, FAQs, copy) and monitor gym operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
            >
              <Globe className="w-4 h-4 text-brand-light" /> Live Website <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={() => router.push("/admin/trainers")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-light text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand/20 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Trainer
            </button>
          </div>
        </div>
      </div>

      {/* Website CMS Sections (Owner Only) */}
      {isHydrated && user?.isOwner ? (
        <>
          {/* Website CMS KPI Cards Grid */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-light" /> Website Content Overview
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Trainers */}
              <div
                onClick={() => router.push("/admin/trainers")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trainers</span>
                  <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalTrainers}
                </div>
                <p className="text-[10px] text-gray-500 truncate">{stats.activeTrainers} active on website</p>
              </div>

              {/* Total Gallery Photos */}
              <div
                onClick={() => router.push("/admin/gallery")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gallery</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalGalleryImages}
                </div>
                <p className="text-[10px] text-gray-500 truncate">Showcase photos</p>
              </div>

              {/* Total Pricing Plans */}
              <div
                onClick={() => router.push("/admin/pricing")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pricing Plans</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalPricingPlans}
                </div>
                <p className="text-[10px] text-gray-500 truncate">Website tiers</p>
              </div>

              {/* Total FAQs */}
              <div
                onClick={() => router.push("/admin/faqs")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FAQs</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalFAQs}
                </div>
                <p className="text-[10px] text-gray-500 truncate">Questions &amp; answers</p>
              </div>

              {/* Media Assets */}
              <div
                onClick={() => router.push("/admin/media")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Media</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalMediaUploads}
                </div>
                <p className="text-[10px] text-gray-500 truncate">Uploaded files</p>
              </div>

              {/* Website Leads */}
              <div
                onClick={() => router.push("/admin/enquiries")}
                className="bg-[#0D0D12] border border-white/10 hover:border-brand/40 p-4 rounded-2xl space-y-2 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inquiries</span>
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-heading font-black text-white">
                  {loading ? <div className="h-8 w-12 bg-white/10 rounded animate-pulse" /> : stats.pendingEnquiries}
                </div>
                <p className="text-[10px] text-gray-500 truncate">Pending responses</p>
              </div>
            </div>
          </div>

          {/* Website CMS Management Hub */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-light" /> Website Content Control Hub
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Trainer Management Card */}
              <div
                onClick={() => router.push("/admin/trainers")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    Trainer Management <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-brand-light transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Add coaches, edit bio, experience, specialization tags, upload photos, or delete.
                  </p>
                </div>
              </div>

              {/* Gallery Management Card */}
              <div
                onClick={() => router.push("/admin/gallery")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    Gallery Management <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Upload new photos, assign workout/equipment categories, edit captions, and manage showcase.
                  </p>
                </div>
              </div>

              {/* Pricing & Membership Tiers */}
              <div
                onClick={() => router.push("/admin/pricing")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    Pricing &amp; Memberships <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Manage website membership plans, pricing, duration, savings badges, and tier amenities.
                  </p>
                </div>
              </div>

              {/* FAQ Management Card */}
              <div
                onClick={() => router.push("/admin/faqs")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    FAQ Management <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Add and edit questions, detailed answers, category tags, video links, and popular flags.
                  </p>
                </div>
              </div>

              {/* Website Section Content */}
              <div
                onClick={() => router.push("/admin/content")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    Website Copy &amp; Info <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Edit Hero headlines, AI glass cards, training protocols, contact address, phone, and hours.
                  </p>
                </div>
              </div>

              {/* Media Library */}
              <div
                onClick={() => router.push("/admin/media")}
                className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-brand/40 cursor-pointer transition-all group space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-between">
                    Media Library <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Upload image assets, copy image URLs, preview dimensions, and clean up unused files.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Non-owner Notice */
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Website CMS Restricted to Owner
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Public website content management (Trainers, Gallery, Pricing, FAQs, and Media) requires Owner-level access. You have operational permissions for club roster and inquiries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Club Operations Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" /> Club Member Operations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => router.push("/admin/users")}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-brand-light" /> Member Roster
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="text-xl font-heading font-bold text-white">
              {stats.activeMembers} <span className="text-xs text-gray-500 font-normal">/ {stats.totalMembers} total</span>
            </div>
            <p className="text-[10px] text-gray-500">Manage member profiles</p>
          </div>

          <div
            onClick={() => router.push("/admin/attendance")}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> Daily Check-Ins
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="text-xl font-heading font-bold text-white">
              {stats.todayCheckIns} <span className="text-xs text-gray-500 font-normal">today</span>
            </div>
            <p className="text-[10px] text-gray-500">Scan &amp; log attendance</p>
          </div>

          <div
            onClick={() => router.push("/admin/enquiries")}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" /> Leads &amp; Messages
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="text-xl font-heading font-bold text-white">
              {stats.pendingEnquiries} <span className="text-xs text-gray-500 font-normal">pending</span>
            </div>
            <p className="text-[10px] text-gray-500">Process inquiries</p>
          </div>

          <div
            onClick={() => router.push("/admin/complaints")}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Support Tickets
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="text-xl font-heading font-bold text-white">
              {stats.openComplaints} <span className="text-xs text-gray-500 font-normal">open</span>
            </div>
            <p className="text-[10px] text-gray-500">Resolve member feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
}
