"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Gift, ToggleLeft, ToggleRight, Settings2, CheckCircle, AlertCircle, Search, Plus, Trash2 } from "lucide-react";

interface Referral {
  id: number; codeUsed: string; status: string; rewardStatus: string; joinDate: string; notes?: string;
  referrer: { id: number; name: string; email: string; };
  referred: { id: number; name: string; email: string; createdAt: string; memberships: Array<{ plan: string; status: string; }>; };
}

interface RewardMilestone {
  referrals: number; rewardName: string; rewardType: string; rewardValue: string; enabled: boolean;
}

interface Toast { id: string; type: "success" | "error"; message: string; }

export default function ReferralManagementPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [rewardsConfig, setRewardsConfig] = useState<RewardMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"referrals" | "settings">("referrals");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingSystem, setTogglingSystem] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [search]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const res = await fetch(`/api/owner/referrals?${params}`);
      if (res.ok) {
        const d = await res.json();
        setReferrals(d.referrals || []);
        setSystemEnabled(d.systemEnabled ?? true);
        setRewardsConfig(d.rewardsConfig || []);
        setTotalReferrals(d.totalReferrals || 0);
        setSuccessfulReferrals(d.successfulReferrals || 0);
      }
    } catch { addToast("error", "Failed to load referral data."); }
    finally { setLoading(false); }
  };

  const handleToggleSystem = async () => {
    setTogglingSystem(true);
    const res = await fetch("/api/owner/referrals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-system", systemEnabled: !systemEnabled })
    });
    if (res.ok) {
      const newState = !systemEnabled;
      setSystemEnabled(newState);
      addToast("success", `Referral system is now ${newState ? "ENABLED" : "DISABLED"}.`);
    } else { addToast("error", "Failed to toggle referral system."); }
    setTogglingSystem(false);
  };

  const handleSaveRewards = async () => {
    setSavingSettings(true);
    const res = await fetch("/api/owner/referrals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save-rewards-settings", rewardsConfig: JSON.stringify(rewardsConfig) })
    });
    if (res.ok) { addToast("success", "Reward milestone settings saved!"); }
    else { addToast("error", "Failed to save settings."); }
    setSavingSettings(false);
  };

  const addMilestone = () => {
    setRewardsConfig(r => [...r, { referrals: 5, rewardName: "New Milestone", rewardType: "Cash Reward", rewardValue: "₹500", enabled: true }]);
  };

  const removeMilestone = (index: number) => {
    setRewardsConfig(r => r.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof RewardMilestone, value: string | number | boolean) => {
    setRewardsConfig(r => r.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl pointer-events-auto backdrop-blur-md ${t.type === "success" ? "bg-green-900/80 border border-green-700/50 text-green-300" : "bg-red-900/80 border border-red-700/50 text-red-300"}`}>
              {t.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-400" /> Referral Management
        </h1>
        <p className="text-xs text-gray-400">Master control for referral program — toggle system on/off, configure reward milestones, view referral history</p>
      </div>

      {/* System Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${systemEnabled ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
        <div className="flex items-center gap-3">
          <Gift className={`w-5 h-5 ${systemEnabled ? "text-green-400" : "text-red-400"}`} />
          <div>
            <div className={`text-sm font-bold ${systemEnabled ? "text-green-400" : "text-red-400"}`}>
              Referral System: {systemEnabled ? "ENABLED" : "DISABLED"}
            </div>
            <div className="text-xs text-gray-400">
              {systemEnabled ? "Members can earn referral codes and reward milestones are active." : "Referral program is globally paused. No new referrals can be processed."}
            </div>
          </div>
        </div>
        <button onClick={handleToggleSystem} disabled={togglingSystem}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase border transition-all flex items-center gap-2 ${systemEnabled ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"}`}>
          {systemEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {togglingSystem ? "Updating..." : (systemEnabled ? "Disable System" : "Enable System")}
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Referrals</div>
          <div className="text-2xl font-heading font-black text-amber-400">{totalReferrals}</div>
        </div>
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-bold text-gray-400 uppercase">Successful Conversions</div>
          <div className="text-2xl font-heading font-black text-green-400">{successfulReferrals}</div>
        </div>
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-bold text-gray-400 uppercase">Conversion Rate</div>
          <div className="text-2xl font-heading font-black text-blue-400">
            {totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit">
        {(["referrals", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"}`}>
            {tab === "referrals" ? "Referral Records" : "Milestone Settings"}
          </button>
        ))}
      </div>

      {/* Referrals Tab */}
      {activeTab === "referrals" ? (
        <>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input type="text" placeholder="Search by name, email, or referral code..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-white" />
          </div>
          <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : referrals.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Gift className="w-12 h-12 mx-auto opacity-20 mb-2" />
                <p>No referral records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                      <th className="p-4 text-left font-bold">Referrer</th>
                      <th className="p-4 text-left font-bold">Referred Member</th>
                      <th className="p-4 text-left font-bold">Code Used</th>
                      <th className="p-4 text-center font-bold">Status</th>
                      <th className="p-4 text-center font-bold">Reward</th>
                      <th className="p-4 text-left font-bold">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white">{r.referrer.name}</div>
                          <div className="text-[10px] text-gray-500">{r.referrer.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{r.referred.name}</div>
                          <div className="text-[10px] text-gray-500">{r.referred.email}</div>
                        </td>
                        <td className="p-4">
                          <code className="px-2 py-0.5 bg-white/5 rounded text-amber-400 text-[10px] font-mono">{r.codeUsed}</code>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                            r.status === "Joined" || r.status === "Membership Activated" || r.status === "Completed"
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : r.status === "Pending"
                              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                              : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${r.rewardStatus === "Granted" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-gray-500/10 border-gray-500/30 text-gray-500"}`}>
                            {r.rewardStatus}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{r.joinDate ? new Date(r.joinDate).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Milestone Settings Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-white uppercase text-base flex items-center gap-2"><Settings2 className="w-5 h-5 text-amber-400" /> Reward Milestone Configuration</h3>
              <p className="text-xs text-gray-500">Configure rewards unlocked when members reach referral milestones</p>
            </div>
            <button onClick={addMilestone}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {rewardsConfig.map((m, index) => (
              <div key={index} className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">Milestone #{index + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={m.enabled} onChange={e => updateMilestone(index, "enabled", e.target.checked)} className="w-4 h-4 accent-amber-500" />
                      <span className="text-xs text-gray-400 font-bold uppercase">Enabled</span>
                    </label>
                    <button onClick={() => removeMilestone(index)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Referrals Needed</label>
                    <input type="number" min="1" value={m.referrals} onChange={e => updateMilestone(index, "referrals", Number(e.target.value))}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Reward Name</label>
                    <input type="text" value={m.rewardName} onChange={e => updateMilestone(index, "rewardName", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Reward Type</label>
                    <select value={m.rewardType} onChange={e => updateMilestone(index, "rewardType", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none">
                      {["Cash Reward","Free Membership Days","Discount","Gift","Merchandise","Custom"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-bold uppercase">Reward Value</label>
                    <input type="text" value={m.rewardValue} onChange={e => updateMilestone(index, "rewardValue", e.target.value)}
                      placeholder="e.g. ₹500 / 7 Days"
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSaveRewards} disabled={savingSettings}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50">
            {savingSettings ? "Saving..." : "Save All Milestone Settings"}
          </button>
        </div>
      )}
    </div>
  );
}
