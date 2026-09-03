"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Bell,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Apple,
  Building2,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
  {
    name: "Website CMS",
    href: "/admin/trainers",
    icon: Globe,
    badge: "Owner",
    children: [
      { name: "Trainers & Coaches", href: "/admin/trainers" },
      { name: "Showcase Gallery", href: "/admin/gallery" },
      { name: "Pricing & Plans", href: "/admin/pricing" },
      { name: "Website FAQs", href: "/admin/faqs" },
      { name: "Website Content", href: "/admin/content" },
      { name: "Media Library", href: "/admin/media" },
    ],
  },
  {
    name: "Members",
    href: "/owner/members",
    icon: Users,
    children: [
      { name: "Membership Directory", href: "/owner/members" },
      { name: "User Management", href: "/owner/users" },
      { name: "Attendance Management", href: "/owner/attendance" },
    ],
  },
  {
    name: "Staff",
    href: "/owner/staff",
    icon: UserCheck,
    children: [
      { name: "Staff Directory", href: "/owner/staff" },
      { name: "Salary Management", href: "/owner/salaries" },
      { name: "Incentive Tracking", href: "/owner/incentives" },
      { name: "Trainer Clients", href: "/owner/trainer-clients" },
    ],
  },
  { name: "Admins", href: "/owner/admins", icon: ShieldCheck },
  { name: "Workouts", href: "/owner/workouts", icon: Zap },
  { name: "Diet Plans", href: "/owner/diets", icon: Apple },
  { name: "Enquiries", href: "/owner/enquiries", icon: Building2 },
  { name: "Complaints", href: "/owner/complaints", icon: ShieldAlert },
  {
    name: "Finance",
    href: "/owner/finance",
    icon: DollarSign,
  },
  { name: "Reports", href: "/owner/reports", icon: FileText },
  { name: "Notifications", href: "/owner/notifications", icon: Bell },
  { name: "Audit Logs", href: "/owner/audit-logs", icon: History },
  { name: "Settings", href: "/owner/settings", icon: Settings },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [unreadEnquiriesCount, setUnreadEnquiriesCount] = useState<number>(0);

  // Fetch pending alert count and unread enquiries count
  useEffect(() => {
    if (!isHydrated || !user?.isOwner) return;

    const fetchCounts = () => {
      fetch("/api/owner/notifications")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setAlertCount(data.length);
          }
        })
        .catch(() => {});

      fetch("/api/admin/contact-messages?countOnly=true")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadEnquiriesCount(data.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);

    const handleUpdate = () => fetchCounts();
    window.addEventListener("enquiriesUpdated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("enquiriesUpdated", handleUpdate);
    };
  }, [isHydrated, user]);

  // Auth Guard
  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !user.isOwner) {
      if (user?.isAdmin) {
        router.replace("/admin/users");
      } else if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isHydrated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!isHydrated || !user?.isOwner) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-amber-500 font-mono tracking-widest uppercase">Authenticating Owner Privilege...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A0A0E] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-extrabold shadow-lg">
            <Crown className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-heading font-black tracking-wider text-sm uppercase text-white">OWNER PANEL</span>
            <p className="text-[9px] text-amber-400 font-mono">Pinaka Gym Control</p>
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
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0A0A0E] border-r border-white/10 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 border border-amber-300/30">
            <Crown className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-base font-heading font-black tracking-wide uppercase text-white flex items-center gap-1.5">
              OWNER PANEL
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-2.5 h-2.5" /> High Control
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.children && item.children.some((c) => pathname === c.href));
            const hasChildren = item.children && item.children.length > 0;
            const isSubOpen = openSubmenu === item.name || isActive;

            return (
              <div key={item.name} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={() => {
                    if (hasChildren) {
                      setOpenSubmenu(isSubOpen ? null : item.name);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-amber-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.href === "/owner/enquiries" && unreadEnquiriesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black shadow-sm animate-pulse">
                        {unreadEnquiriesCount}
                      </span>
                    )}
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubOpen ? "rotate-180 text-amber-400" : "text-gray-600"}`}
                      />
                    )}
                  </div>
                </Link>

                {/* Submenu children */}
                <AnimatePresence>
                  {hasChildren && isSubOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-9 pr-2 space-y-1 overflow-hidden"
                    >
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                              childActive
                                ? "text-amber-400 bg-amber-500/10 font-bold"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            • {child.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-white/10 bg-[#060608]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs uppercase shrink-0">
                {(user.name || user.email)[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user.name || "Gym Owner"}</div>
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
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0A0A0E]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-heading font-black uppercase tracking-wider text-white flex items-center gap-2">
              Gym Master Control Panel
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                OWNER MODE
              </span>
            </h2>
            <p className="text-xs text-gray-500">Real-time gym finances, personnel, operations &amp; business metrics</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/owner/notifications"
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {alertCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => router.push("/admin/users")}
              className="px-3.5 py-1.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              View Admin View
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
