"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, DollarSign, User as UserIcon, Clock,
  AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert, Award,
  ChevronDown, ChevronUp, History, Sparkles, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Membership {
  id: number;
  membershipId: string;
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
}

interface MembershipData {
  membership: Membership | null;
  daysRemaining: number;
  totalDays: number;
  percentRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export default function UserMembershipPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [data, setData] = useState<MembershipData | null>(null);
  const [history, setHistory] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [resMember, resHistory] = await Promise.all([
          fetch("/api/dashboard/membership"),
          fetch("/api/dashboard/membership/history")
        ]);

        if (resMember.ok) {
          const memberData = await resMember.json();
          setData(memberData);
        } else {
          setError("Failed to fetch membership details.");
        }

        if (resHistory.ok) {
          const historyData = await resHistory.json();
          setHistory(historyData);
        }
      } catch (err) {
        console.error("Error loading membership:", err);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isHydrated, user, router]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "Upcoming":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "Frozen":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      case "Cancelled":
        return "bg-gray-500/10 border-gray-500/30 text-gray-400";
      case "Expired":
      default:
        return "bg-red-500/10 border-red-500/30 text-red-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "Partial":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "Pending":
      default:
        return "bg-red-500/10 border-red-500/30 text-red-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-12 container mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="h-64 bg-white/5 rounded-[2rem] animate-pulse" />
            <div className="h-24 bg-white/5 rounded-[2rem] animate-pulse" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-white/5 rounded-[2rem] animate-pulse" />
            <div className="h-40 bg-white/5 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Error Occurred</h1>
        <p className="text-gray-400 max-w-md mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand text-white font-bold rounded-full uppercase text-xs">
          Retry
        </button>
      </div>
    );
  }

  const membership = data?.membership;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 container mx-auto max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black uppercase tracking-tighter">
              My <span className="text-brand">Membership</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">Official Member Subscription Details</p>
          </div>
        </div>

        {/* Banners */}
        {data?.isExpired && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-950/40 border border-red-700/35 text-red-400 p-4 rounded-2xl">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold uppercase text-sm tracking-wide block">Membership Expired</span>
              <span className="text-xs text-gray-300">Your membership expired on {formatDate(membership?.endDate)}. Please contact administration to renew.</span>
            </div>
          </motion.div>
        )}

        {data?.isExpiringSoon && !data.isExpired && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-yellow-950/40 border border-yellow-700/35 text-yellow-400 p-4 rounded-2xl">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold uppercase text-sm tracking-wide block">Membership Expiring Soon</span>
              <span className="text-xs text-gray-300">Your plan expires in {data.daysRemaining} days. Connect with administration to avoid service disruption.</span>
            </div>
          </motion.div>
        )}

        {!membership ? (
          /* Empty State */
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[2rem] max-w-2xl mx-auto space-y-4">
            <HelpCircle className="w-16 h-16 mx-auto text-brand opacity-45" />
            <h3 className="text-xl font-heading font-bold uppercase tracking-wide">No Membership Assigned</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto px-6">
              You do not have an active or historical membership plan linked to this account yet. Please visit the front desk or contact the administrator to assign your plan.
            </p>
            <Link href="/dashboard">
              <button className="px-6 py-2.5 bg-brand text-white font-bold rounded-full uppercase text-xs tracking-wider shadow-neon">
                Back to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          /* Main Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Physical Membership Card & Expiry Progress */}
            <div className="lg:col-span-1 space-y-8">
              {/* Premium NFC-Style Gym Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[2rem] p-8 aspect-[1.58/1] w-full bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] border border-white/10 overflow-hidden shadow-neon-strong group"
              >
                {/* Glowing laser line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />
                {/* Background watermarks */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="h-full flex flex-col justify-between relative z-10">
                  {/* Top line: Gym Brand Logo / NFC Chip */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-heading font-black text-white text-lg tracking-tighter uppercase">
                        PINAKA<span className="text-brand">FITNESS</span>
                      </span>
                      <span className="text-[8px] text-gray-500 tracking-[0.2em] uppercase">Elite Member Club</span>
                    </div>
                    {/* Golden NFC Chip */}
                    <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-600 via-amber-400 to-yellow-600 border border-yellow-300/30 opacity-80 shadow-md relative">
                      <div className="absolute inset-1 border border-black/10 rounded" />
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/15" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/15" />
                    </div>
                  </div>

                  {/* Middle Line: Card Holder Info */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Cardholder</div>
                    <div className="font-heading font-bold text-lg uppercase truncate tracking-wide text-white">
                      {user?.name || "Premium Member"}
                    </div>
                  </div>

                  {/* Bottom Line: Membership Details */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest">Membership ID</div>
                      <div className="font-mono text-sm tracking-widest text-brand-light font-bold">
                        {membership.membershipId}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(membership.status)}`}>
                        {membership.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Countdowns */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Days Remaining</span>
                  <span className="font-bold text-white">
                    {data.daysRemaining} / {data.totalDays} Days
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.percentRemaining}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      data.isExpired
                        ? "from-red-600 to-red-500"
                        : data.isExpiringSoon
                        ? "from-yellow-500 to-orange-500"
                        : "from-brand to-brand-light"
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
                  <span>Start: {formatDate(membership.startDate)}</span>
                  <span>End: {formatDate(membership.endDate)}</span>
                </div>
              </div>

              {/* Quick Details Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-center space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Trainer Package</span>
                  <div className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
                    <Award className={`w-4 h-4 ${membership.personalTrainerIncluded ? "text-brand" : "text-gray-500"}`} />
                    {membership.personalTrainerIncluded ? "Trainer Inc." : "No Trainer"}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-center space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Payment Status</span>
                  <div className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${membership.paymentStatus === "Paid" ? "text-green-400" : "text-yellow-400"}`} />
                    {membership.paymentStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Subscription Info Panels */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* SECTION: Membership Information */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Calendar className="w-5 h-5 text-brand" />
                  <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Subscription Plan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Plan Name</span>
                    <span className="font-bold text-white">{membership.plan}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Membership Duration</span>
                    <span className="font-bold text-white">{membership.duration}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Joined Date</span>
                    <span className="font-bold text-white">{formatDate(membership.joinDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Start Date</span>
                    <span className="font-bold text-white">{formatDate(membership.startDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">End/Expiry Date</span>
                    <span className="font-bold text-white">{formatDate(membership.endDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Scheduled Renewal</span>
                    <span className="font-bold text-white">{formatDate(membership.renewalDate)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Payment Details */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <DollarSign className="w-5 h-5 text-brand" />
                  <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Billing & Payment</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Total Bill Amount</span>
                    <span className="font-bold text-white">₹{membership.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Discount Offered</span>
                    <span className="font-bold text-brand">₹{membership.discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="font-bold text-green-400">₹{membership.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Remaining Balance</span>
                    <span className="font-bold text-red-400">₹{membership.remainingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Payment Method</span>
                    <span className="font-bold text-white">{membership.paymentMode}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Payment Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(membership.paymentStatus)}`}>
                      {membership.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Personal Trainer (Conditional) */}
              {membership.personalTrainerIncluded && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <UserIcon className="w-5 h-5 text-brand" />
                    <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Assigned Personal Trainer</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2 col-span-1 md:col-span-2">
                      <span className="text-gray-400">Trainer Name</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand" /> {membership.ptTrainerName || "Assigned Trainer"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">PT Package Start</span>
                      <span className="font-bold text-white">{formatDate(membership.ptStartDate)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">PT Package End</span>
                      <span className="font-bold text-white">{formatDate(membership.ptEndDate)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION: Remarks & Notes (Conditional) */}
              {(membership.notes || membership.remarks) && (
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Clock className="w-5 h-5 text-brand" />
                    <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Office Remarks & Notes</h3>
                  </div>
                  {membership.notes && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Office Notes</span>
                      <p className="text-sm text-gray-300 leading-relaxed bg-black/40 border border-white/5 p-4 rounded-xl">
                        {membership.notes}
                      </p>
                    </div>
                  )}
                  {membership.remarks && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">General Remarks</span>
                      <p className="text-sm text-gray-300 leading-relaxed bg-black/40 border border-white/5 p-4 rounded-xl">
                        {membership.remarks}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: Membership History */}
        {history.length > 1 && (
          <div className="bg-[#0b0b0b] border border-white/5 rounded-[2rem] overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-brand" />
                <span className="font-heading font-bold text-base uppercase tracking-wider">Membership Subscription History ({history.length - 1} Previous)</span>
              </div>
              {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-6 space-y-6">
                    <div className="relative border-l-2 border-brand/20 ml-4 pl-8 space-y-8 py-4">
                      {history
                        .filter(h => h.id !== membership?.id) // Filter current active out
                        .map((hist, idx) => (
                          <div key={hist.id} className="relative group">
                            {/* Dot indicator */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-black border-2 border-brand flex items-center justify-center text-[10px] font-bold text-brand group-hover:bg-brand group-hover:text-white transition-all">
                              {idx + 1}
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand/40 transition-colors">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-white text-sm uppercase tracking-wide">{hist.plan} Plan</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(hist.status)}`}>
                                    {hist.status}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">({hist.membershipId})</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  Duration: {hist.duration} | Dates: {formatDate(hist.startDate)} to {formatDate(hist.endDate)}
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end text-xs shrink-0">
                                <span className="text-gray-400">Amount Paid</span>
                                <span className="font-bold text-white text-sm">₹{hist.amountPaid.toLocaleString()}</span>
                                <span className="text-[9px] text-gray-500">Mode: {hist.paymentMode} ({hist.paymentStatus})</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
