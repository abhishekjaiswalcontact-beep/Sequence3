"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Apple,
  Zap,
  Building2,
  ShieldAlert,
  FileText,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  HelpCircle,
  FileCode2,
  FolderOpen,
  Globe,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminNavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string | number;
    permission?: string;
  }>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [permLoading, setPermLoading] = useState<boolean>(true);
  const [unreadEnquiriesCount, setUnreadEnquiriesCount] = useState<number>(0);

  // Fetch unread contact messages count
  useEffect(() => {
    if (!isHydrated || !user) return;
    const fetchUnreadCount = () => {
      fetch("/api/admin/contact-messages?countOnly=true")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadEnquiriesCount(data.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);

    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("enquiriesUpdated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("enquiriesUpdated", handleUpdate);
    };
  }, [isHydrated, user]);

  // Fetch admin permissions
  useEffect(() => {
    if (!isHydrated || !user) return;
    if (user.isOwner) {
      setIsOwner(true);
      setPermLoading(false);
      return;
    }

    fetch("/api/admin/permissions/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPermissions(data.permissions || []);
          setIsOwner(!!data.isOwner);
        }
      })
      .catch(() => {})
      .finally(() => setPermLoading(false));
  }, [isHydrated, user]);

  // Auth Guard
  useEffect(() => {
    if (!isHydrated) return;
    if (!user || (!user.isAdmin && !user.isOwner)) {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navSections: AdminNavSection[] = [
    ...(isOwner
      ? [
          {
            title: "Overview",
            items: [
              { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
            ],
          },
          {
            title: "Website CMS (Owner)",
            items: [
              { name: "Trainers", href: "/admin/trainers", icon: UserCheck },
              { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
              { name: "Pricing & Tiers", href: "/admin/pricing", icon: DollarSign },
              { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
              { name: "Website Content", href: "/admin/content", icon: FileCode2 },
              { name: "Media Library", href: "/admin/media", icon: FolderOpen },
            ],
          },
        ]
      : []),
    {
      title: "Club Operations",
      items: [
        { name: "Member Roster", href: "/admin/users", icon: Users, permission: "VIEW_MEMBERS" },
        { name: "Attendance", href: "/admin/attendance", icon: Calendar, permission: "VIEW_ATTENDANCE" },
        { name: "Subscriptions", href: "/admin/memberships", icon: CreditCard, permission: "MANAGE_MEMBERSHIPS" },
        { name: "Diet Plans", href: "/admin/diets", icon: Apple, permission: "MANAGE_DIET_PLANS" },
        { name: "Workout Plans", href: "/admin/workouts", icon: Zap, permission: "MANAGE_WORKOUT_PLANS" },
        { name: "Enquiries & Leads", href: "/admin/enquiries", icon: Building2, permission: "VIEW_ENQUIRIES", badge: unreadEnquiriesCount > 0 ? unreadEnquiriesCount : undefined },
        { name: "Complaints", href: "/admin/complaints", icon: ShieldAlert, permission: "MANAGE_COMPLAINTS" },
        { name: "Reports", href: "/admin/reports", icon: FileText, permission: "VIEW_REPORTS" },
      ],
    },
  ];

  if (!isHydrated || permLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-brand-light font-mono uppercase tracking-widest">
            Loading Control Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070B] text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D0D12] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-extrabold shadow-lg">
            <Shield className="w-4 h-4 text-brand-light" />
          </div>
          <div>
            <span className="font-heading font-black tracking-wider text-sm uppercase text-white">
              CRM CONTROL
            </span>
            <p className="text-[9px] text-brand-light font-mono">Website &amp; Club CMS</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0D0D12] border-r border-white/10 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-purple-800 flex items-center justify-center text-white font-black shadow-lg shadow-brand/20 border border-brand-light/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-heading font-black tracking-wide uppercase text-white">
                PINAKA CRM
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand/10 border border-brand/30 text-brand-light">
                Control Center
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">
                {sec.title}
              </div>
              {sec.items
                .filter((item) => {
                  if (isOwner) return true;
                  if (!item.permission) return true;
                  return permissions.includes(item.permission);
                })
                .map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                        isActive
                          ? "bg-brand/20 text-brand-light border border-brand/40 shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? "text-brand-light"
                              : "text-gray-500 group-hover:text-gray-300"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-black shadow-sm animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Live Website Shortcut */}
        <div className="px-3 py-2 border-t border-white/5 bg-[#0A0A0E]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold tracking-wide transition-all border border-white/5 hover:border-brand/30 group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-brand-light" />
              <span>Live Website</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-brand-light transition-colors" />
          </Link>
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-white/10 bg-[#08080C]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light font-bold text-xs uppercase shrink-0">
                {(user.name || user.email)[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {user.name || "Administrator"}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0D0D12]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-heading font-black uppercase tracking-wider text-white flex items-center gap-2">
              Website &amp; Club Control Panel
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand-light border border-brand/30">
                LIVE SYNC
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Manage website trainers, gallery, pricing plans, FAQs, and member operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-brand-light" /> View Live Website <ExternalLink className="w-3 h-3" />
            </Link>

            {user.isOwner && (
              <button
                onClick={() => router.push("/owner")}
                className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Owner Control
              </button>
            )}
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
