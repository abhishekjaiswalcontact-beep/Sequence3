"use client";

import React, { useEffect, useState } from "react";
import { Crown, Bell, CreditCard, Building2, Zap, RefreshCw } from "lucide-react";

interface AlertItem {
  id: string;
  category: "MEMBERSHIP" | "SALARY" | "RENT" | "ELECTRICITY";
  title: string;
  message: string;
  severity: "important" | "warning" | "info";
  createdAt: string;
}

const categoryIcons = {
  MEMBERSHIP: CreditCard,
  SALARY: Building2,
  RENT: Building2,
  ELECTRICITY: Zap,
};

const severityStyles = {
  important: "bg-red-500/10 border-red-500/30 text-red-300",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
};

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/notifications");
      if (res.ok) setAlerts(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const categories = ["ALL", "MEMBERSHIP", "SALARY", "RENT", "ELECTRICITY"];

  const filtered = alerts.filter(a => filter === "ALL" || a.category === filter);
  const importantCount = alerts.filter(a => a.severity === "important").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Alerts &amp; Notifications
          </h1>
          <p className="text-xs text-gray-400">Real-time alerts for pending salaries, expiring memberships, rent, and electricity bills</p>
        </div>
        <button onClick={fetchAlerts} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase">Total Alerts</div>
          <div className="text-2xl font-heading font-black text-white">{alerts.length}</div>
        </div>
        <div className="bg-[#0D0D12] border border-red-500/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase">Critical</div>
          <div className="text-2xl font-heading font-black text-red-400">{importantCount}</div>
        </div>
        <div className="bg-[#0D0D12] border border-amber-500/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase">Warnings</div>
          <div className="text-2xl font-heading font-black text-amber-400">{warningCount}</div>
        </div>
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase">Info</div>
          <div className="text-2xl font-heading font-black text-blue-400">{alerts.filter(a => a.severity === "info").length}</div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap bg-white/5 rounded-xl p-1 w-fit">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === cat ? "bg-amber-500 text-black shadow" : "text-gray-400 hover:text-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Bell className="w-16 h-16 mx-auto text-gray-700" />
          <div className="text-gray-500 font-medium">All clear! No alerts in this category.</div>
          <div className="text-xs text-gray-600">The gym is running smoothly with no urgent attention needed.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const Icon = categoryIcons[alert.category] || Bell;
            return (
              <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${severityStyles[alert.severity]}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-current/10">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold">{alert.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${severityStyles[alert.severity]} opacity-80`}>
                        {alert.severity === "important" ? "CRITICAL" : alert.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 border border-white/20 text-gray-300">{alert.category}</span>
                    </div>
                  </div>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
