"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Crown,
  X,
  Phone,
  Mail,
  UserCheck,
  Eye,
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  joinDate: string;
  lastLoginAt?: string;
  remainingDays: number;
  referralSource: string;
  trainerAssigned: string;
  profile?: {
    gender?: string;
    age?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessGoal?: string;
  };
  activeMembership?: {
    id: number;
    membershipId: string;
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
    amountPaid: number;
    totalAmount: number;
    remainingBalance: number;
    paymentStatus: string;
    paymentMode: string;
    personalTrainerIncluded: boolean;
    ptTrainerName?: string;
  };
  membershipHistory: Array<{
    id: number;
    membershipId: string;
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
    amountPaid: number;
  }>;
}

export default function MembershipDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(""); // active, expired, expiring_soon, pending_payment, new
  const [planFilter, setPlanFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchMembers();
  }, [search, filter, planFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, filter, plan: planFilter });
      const res = await fetch(`/api/owner/members?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to load membership directory", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Membership Directory
          </h1>
          <p className="text-xs text-gray-400">Complete record of gym members, subscriptions, trainers, and payment statuses</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold uppercase">
            Total Roster: {members.length} Members
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search member name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="expiring_soon">Expiring Soon (30 Days)</option>
            <option value="expired">Expired Members</option>
            <option value="pending_payment">Pending Payments</option>
            <option value="new">New Members (30 Days)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Membership Plans</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly (3 Months)">Quarterly</option>
            <option value="Half Yearly (6 Months)">Half Yearly</option>
            <option value="Yearly">Yearly</option>
            <option value="Custom">Custom</option>
          </select>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSearch(""); setFilter(""); setPlanFilter(""); }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <Users className="w-12 h-12 mx-auto opacity-20" />
            <p>No members found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <th className="p-4 font-bold">Member</th>
                  <th className="p-4 font-bold">Plan &amp; Dates</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold">Amount Paid</th>
                  <th className="p-4 font-bold">Trainer</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const mem = m.activeMembership;
                  return (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      {/* Name & Contact */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs uppercase shrink-0">
                            {m.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{m.name}</div>
                            <div className="text-gray-500 flex items-center gap-2 text-[10px]">
                              <span>{m.email}</span>
                              {m.phone && <span>• {m.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Dates */}
                      <td className="p-4">
                        {mem ? (
                          <div>
                            <div className="font-bold text-amber-400">{mem.plan}</div>
                            <div className="text-[10px] text-gray-500">
                              Exp: {new Date(mem.endDate).toLocaleDateString("en-GB")} ({m.remainingDays} days left)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No Active Plan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {mem ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                              mem.status === "Active"
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : mem.status === "Upcoming"
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                          >
                            {mem.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-gray-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="p-4">
                        {mem ? (
                          <div>
                            <div className="font-bold text-white">₹{mem.amountPaid.toLocaleString("en-IN")}</div>
                            {mem.remainingBalance > 0 ? (
                              <div className="text-[10px] text-red-400 font-bold">
                                Bal: ₹{mem.remainingBalance.toLocaleString("en-IN")}
                              </div>
                            ) : (
                              <div className="text-[10px] text-green-400">Fully Paid</div>
                            )}
                          </div>
                        ) : (
                          "₹0"
                        )}
                      </td>

                      {/* Trainer */}
                      <td className="p-4 text-gray-300 font-medium">{m.trainerAssigned}</td>

                      {/* Join Date */}
                      <td className="p-4 text-gray-500">
                        {new Date(m.joinDate).toLocaleDateString("en-GB")}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Profile Drawer Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E14] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg uppercase">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight">{selectedMember.name}</h3>
                    <p className="text-xs text-gray-400">Joined {new Date(selectedMember.joinDate).toLocaleDateString("en-GB")} • Referral: {selectedMember.referralSource}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 text-gray-500 hover:text-white rounded-full bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Contact & Personal Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl space-y-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400" /> Email Address
                    </div>
                    <div className="font-medium text-white truncate">{selectedMember.email}</div>
                  </div>
                  <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl space-y-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" /> Phone Number
                    </div>
                    <div className="font-medium text-white">{selectedMember.phone || "Not provided"}</div>
                  </div>
                  <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl space-y-1">
                    <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-amber-400" /> Assigned Trainer
                    </div>
                    <div className="font-bold text-amber-400">{selectedMember.trainerAssigned}</div>
                  </div>
                </div>

                {/* Active Membership Details Card */}
                {selectedMember.activeMembership ? (
                  <div className="bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-4 h-4" /> Active Plan Details ({selectedMember.activeMembership.membershipId})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-500/20 border border-green-500/40 text-green-400 uppercase">
                        {selectedMember.activeMembership.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Plan Name</div>
                        <div className="font-bold text-white">{selectedMember.activeMembership.plan}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Start Date</div>
                        <div className="font-medium text-white">{new Date(selectedMember.activeMembership.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Expiry Date</div>
                        <div className="font-medium text-amber-400">{new Date(selectedMember.activeMembership.endDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Payment Status</div>
                        <div className="font-bold text-green-400">{selectedMember.activeMembership.paymentStatus} (₹{selectedMember.activeMembership.amountPaid})</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-white/10 rounded-2xl text-center text-gray-500">
                    No active subscription plan assigned to this member.
                  </div>
                )}

                {/* Subscription History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Membership History</h4>
                  <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 uppercase text-[10px]">
                          <th className="p-3">Plan</th>
                          <th className="p-3">Start Date</th>
                          <th className="p-3">End Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMember.membershipHistory.map((h) => (
                          <tr key={h.id} className="border-b border-white/5 last:border-0">
                            <td className="p-3 font-bold text-white">{h.plan}</td>
                            <td className="p-3 text-gray-400">{new Date(h.startDate).toLocaleDateString()}</td>
                            <td className="p-3 text-gray-400">{new Date(h.endDate).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 text-gray-300">
                                {h.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-green-400">₹{h.amountPaid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
