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
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const ALL_ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Members", href: "/admin/users", icon: Users, permission: "VIEW_MEMBERS" },
  { name: "Attendance", href: "/admin/attendance", icon: Calendar, permission: "VIEW_ATTENDANCE" },
  { name: "Memberships", href: "/admin/memberships", icon: CreditCard, permission: "MANAGE_MEMBERSHIPS" },
  { name: "Trainers", href: "/admin/trainers", icon: UserCheck, permission: "MANAGE_TRAINERS" },
  { name: "Diet Plans", href: "/admin/diets", icon: Apple, permission: "MANAGE_DIET_PLANS" },
  { name: "Workout Plans", href: "/admin/workouts", icon: Zap, permission: "MANAGE_WORKOUT_PLANS" },
  { name: "Enquiries", href: "/admin/enquiries", icon: Building2, permission: "VIEW_ENQUIRIES" },
  { name: "Complaints", href: "/admin/complaints", icon: ShieldAlert, permission: "MANAGE_COMPLAINTS" },
  { name: "Reports", href: "/admin/reports", icon: FileText, permission: "VIEW_REPORTS" },
];

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

  // Determine allowed nav items
  const allowedNavItems = ALL_ADMIN_NAV_ITEMS.filter((item) => {
    if (isOwner) return true;
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

  // Check if current path is allowed
  const currentRouteConfig = ALL_ADMIN_NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  const isCurrentRouteAllowed =
    isOwner ||
    !currentRouteConfig ||
    !currentRouteConfig.permission ||
    permissions.includes(currentRouteConfig.permission);

  if (!isHydrated || permLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-emerald-400 font-mono uppercase tracking-widest">Verifying Operational Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070B] text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D0D12] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold shadow-lg">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-heading font-black tracking-wider text-sm uppercase text-white">ADMIN PANEL</span>
            <p className="text-[9px] text-emerald-400 font-mono">Operations Control</p>
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
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-base font-heading font-black tracking-wide uppercase text-white">
              ADMIN PANEL
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Operations Room
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                  <span>{item.name}</span>
                </div>
                {item.href === "/admin/enquiries" && unreadEnquiriesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black shadow-sm animate-pulse">
                    {unreadEnquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-white/10 bg-[#08080C]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase shrink-0">
                {(user.name || user.email)[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user.name || "Gym Admin"}</div>
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
              Gym Operations Management
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ADMIN MODE
              </span>
            </h2>
            <p className="text-xs text-gray-500">Daily check-ins, member diet &amp; workout schedules, leads &amp; support</p>
          </div>

          {user.isOwner && (
            <button
              onClick={() => router.push("/owner")}
              className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Owner Control
            </button>
          )}
        </header>

        {/* Body Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {!isCurrentRouteAllowed ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[#0E0E14] border border-red-500/20 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight">Access Restricted</h3>
              <p className="text-gray-400 text-xs max-w-md">
                You do not have permission to access this section ({currentRouteConfig?.name}).
                Please contact the Gym Owner to request permission assignment.
              </p>
              <button
                onClick={() => router.push("/admin")}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Back to Admin Dashboard
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
