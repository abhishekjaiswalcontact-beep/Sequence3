"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Copy, Share2, Users, CheckCircle, Clock,
  Gift, Award, Calendar, AlertCircle, Bell,
  BellOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ReferralHistoryItem {
  id: number;
  codeUsed: string;
  joinDate: string;
  status: string;
  rewardStatus: string;
  referred: {
    name: string;
    createdAt: string;
    memberships: Array<{
      plan: string;
      status: string;
    }>;
  };
}

interface RewardItem {
  id: number;
  rewardName: string;
  rewardType: string;
  rewardValue: string;
  status: string;
  createdAt: string;
}

interface Milestone {
  referrals: number;
  rewardName: string;
  rewardType: string;
  rewardValue: string;
  enabled: boolean;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function MemberReferralPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [codeActive, setCodeActive] = useState(true);
  const [stats, setStats] = useState({ totalReferrals: 0, successfulReferrals: 0, pendingReferrals: 0 });
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [systemEnabled, setSystemEnabled] = useState(true);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchReferralData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/referral");
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode || "");
        setCodeActive(data.referralCodeActive);
        setStats(data.stats);
        setHistory(data.history);
        setRewards(data.rewards);
        setMilestones(data.milestones || []);
        setSystemEnabled(data.systemEnabled !== false);
      } else {
        addToast("error", "Failed to fetch referral details.");
      }
    } catch (e) {
      console.error(e);
      addToast("error", "Network error occurred.");
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Notifications fetch error", e);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
    } else {
      Promise.all([fetchReferralData(), fetchNotifications()]).finally(() => {
        setLoading(false);
      });
    }
  }, [isHydrated, user, router, fetchReferralData, fetchNotifications]);

  const handleCopyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      addToast("success", `Referral code "${referralCode}" copied to clipboard!`);
    } catch {
      addToast("error", "Failed to copy code.");
    }
  };

  const handleShareCode = async () => {
    if (!referralCode) return;
    const shareText = `Join PINAKA FITNESS gym with me! Use my referral code: ${referralCode} during signup to get exclusive perks.`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join PINAKA FITNESS",
          text: shareText,
          url: shareUrl,
        });
        addToast("success", "Shared successfully!");
      } catch (err) {
        // Ignore abort error
        if ((err as Error).name !== "AbortError") {
          addToast("error", "Sharing failed.");
        }
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        addToast("info", "Share message and link copied to clipboard!");
      } catch {
        addToast("error", "Failed to copy share link.");
      }
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    if (unreadNotifications === 0) return;
    try {
      const res = await fetch("/api/dashboard/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotifications(0);
        addToast("success", "Notifications marked as read.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Find next milestone and calculate progress percentage
  const activeMilestones = milestones.filter(m => m.enabled);
  const nextMilestone = activeMilestones.find((m) => stats.successfulReferrals < m.referrals) || activeMilestones[activeMilestones.length - 1];
  
  const currentReferralsForMilestone = stats.successfulReferrals;
  const targetReferrals = nextMilestone ? nextMilestone.referrals : 1;
  const progressPercent = nextMilestone
    ? Math.min(100, Math.round((currentReferralsForMilestone / targetReferrals) * 100))
    : 100;

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!systemEnabled) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Referrals Paused</h1>
          <p className="text-gray-400">
            The PINAKA FITNESS referral program is currently disabled by the administrator. Please check back later!
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-2.5 bg-brand hover:bg-brand-light transition-colors text-white font-bold rounded-xl uppercase text-xs">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 container mx-auto">
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
                  : t.type === "error"
                  ? "bg-red-900/80 border border-red-700/50 text-red-300 backdrop-blur-md"
                  : "bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 backdrop-blur-md"
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tighter">
                Referral <span className="text-brand">Program</span>
              </h1>
              <p className="text-gray-400 text-xs mt-1">PINAKA FITNESS Member Invites &amp; Perks</p>
            </div>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                handleMarkNotificationsAsRead();
              }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors relative flex items-center gap-2 text-sm"
            >
              {unreadNotifications > 0 ? (
                <>
                  <Bell className="w-4 h-4 text-brand animate-bounce" />
                  <span className="bg-brand text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] absolute -top-1.5 -right-1.5 shadow-neon">
                    {unreadNotifications}
                  </span>
                </>
              ) : (
                <BellOff className="w-4 h-4 text-gray-400" />
              )}
              Alerts
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-[#0e0e0f] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 p-4 space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="font-heading font-bold text-xs uppercase text-gray-400">Recent Alerts</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-gray-500 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border transition-colors ${
                            notif.isRead
                              ? "bg-white/[0.02] border-white/5 text-gray-400"
                              : "bg-brand/5 border-brand/20 text-white"
                          }`}
                        >
                          <div className="text-xs font-bold font-heading">{notif.title}</div>
                          <div className="text-[10px] mt-0.5 leading-relaxed">{notif.message}</div>
                          <div className="text-[8px] text-gray-500 mt-1.5">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-500">No alerts found.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code invite card & stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Invite card */}
            <div className="bg-surface/50 backdrop-blur-md border border-surfaceBorder rounded-3xl p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-brand/10 border border-brand/30 rounded-2xl flex items-center justify-center mx-auto mb-2 text-brand">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold uppercase">Invite Friends</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Share your referral code with friends and family. Earn free memberships, gym merchandise, and cash.
                </p>
              </div>

              {codeActive ? (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">My Referral Code</span>
                    <span className="text-3xl font-heading font-black tracking-widest text-brand uppercase select-all">
                      {referralCode || "Generating..."}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button
                      onClick={handleShareCode}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-brand hover:bg-brand-light rounded-xl text-xs font-bold uppercase transition-colors shadow-neon"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-950/20 border border-red-800/30 text-red-400 rounded-2xl p-4 text-center text-xs space-y-1">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                  <div className="font-bold">Your referral code is deactivated.</div>
                  <div>Contact admin to reactivate or regenerate.</div>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Invites", value: stats.totalReferrals, icon: Users, color: "text-gray-400" },
                { label: "Successful", value: stats.successfulReferrals, icon: CheckCircle, color: "text-green-400" },
                { label: "Pending Joins", value: stats.pendingReferrals, icon: Clock, color: "text-yellow-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-surface/50 border border-surfaceBorder rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div className="text-xl font-heading font-black">{item.value}</div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold tracking-wide leading-tight">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reward Milestones & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rewards Progress Milestones */}
            {activeMilestones.length > 0 && (
              <div className="bg-surface/50 backdrop-blur-md border border-surfaceBorder rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-brand" />
                    <h3 className="text-lg font-heading font-bold uppercase">Rewards milestones</h3>
                  </div>
                  {nextMilestone && (
                    <span className="text-[10px] text-gray-400">
                      {targetReferrals - currentReferralsForMilestone} more referrals for <strong className="text-brand">{nextMilestone.rewardName}</strong>
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Progression</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-brand-dark to-brand shadow-neon"
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeMilestones.map((milestone) => {
                    const isEarned = stats.successfulReferrals >= milestone.referrals;
                    return (
                      <div
                        key={milestone.referrals}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                          isEarned
                            ? "bg-brand/10 border-brand/30"
                            : "bg-white/[0.02] border-white/5 text-gray-500"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className={`text-xs font-heading font-bold uppercase ${isEarned ? "text-brand" : ""}`}>
                            {milestone.rewardName}
                          </div>
                          <div className="text-[10px] font-medium text-gray-400 leading-tight">
                            {milestone.rewardValue} ({milestone.rewardType})
                          </div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
                            Requires {milestone.referrals} Ref.
                          </div>
                        </div>

                        <div>
                          {isEarned ? (
                            <span className="px-3 py-1 rounded-full text-[9px] bg-green-500/10 border border-green-500/30 text-green-400 font-bold uppercase tracking-wider">
                              Unlocked
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[9px] bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Referral History Logs */}
            <div className="bg-surface/50 backdrop-blur-md border border-surfaceBorder rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Calendar className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-heading font-bold uppercase">Referral History</h3>
              </div>

              <div className="overflow-x-auto">
                {history.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/5 pb-2">
                        <th className="py-2.5 font-bold uppercase">Friend Name</th>
                        <th className="py-2.5 font-bold uppercase">Membership Plan</th>
                        <th className="py-2.5 font-bold uppercase">Join Date</th>
                        <th className="py-2.5 font-bold uppercase">Referral Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => {
                        const activePlan = item.referred.memberships?.[0];
                        return (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-bold">{item.referred.name}</td>
                            <td className="py-3">
                              {activePlan ? (
                                <span className="flex items-center gap-1.5 text-xs text-gray-300">
                                  {activePlan.plan}
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      activePlan.status === "Active" ? "bg-green-500" : "bg-red-500"
                                    }`}
                                  />
                                </span>
                              ) : (
                                "No Plan"
                              )}
                            </td>
                            <td className="py-3 text-gray-400">
                              {new Date(item.joinDate).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  ["Joined", "Membership Activated", "Completed"].includes(item.status)
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : ["Cancelled", "Rejected", "Expired"].includes(item.status)
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500 space-y-3">
                    <Users className="w-12 h-12 mx-auto opacity-20" />
                    <p className="font-medium text-sm">No referrals registered yet.</p>
                    <p className="text-xs text-gray-500">
                      Share your code above with friends to start getting rewards!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
