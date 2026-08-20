"use client";

import React, { useEffect, useState } from "react";
import { Crown, History, Search, RefreshCw, ShieldAlert } from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  performedByUserId?: number;
  performedByName: string;
  role: string;
  targetRecordId?: string;
  targetRecordType?: string;
  description: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  USER_ADDED: "text-green-400 bg-green-500/10 border-green-500/30",
  USER_EDITED: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  USER_DELETED: "text-red-400 bg-red-500/10 border-red-500/30",
  STAFF_ADDED: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  STAFF_EDITED: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  STAFF_REMOVED: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  SALARY_CHANGED: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  SALARY_PAID: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  INCENTIVE_ADDED: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  INCENTIVE_PAID: "text-lime-400 bg-lime-500/10 border-lime-500/30",
  EXPENSE_ADDED: "text-red-400 bg-red-500/10 border-red-500/30",
  REVENUE_ADDED: "text-green-400 bg-green-500/10 border-green-500/30",
  TRAINER_ASSIGNED: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  REFERRAL_TOGGLED: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  SETTINGS_CHANGED: "text-gray-400 bg-gray-500/10 border-gray-500/30",
};

const ACTION_LABELS: Record<string, string> = {
  USER_ADDED: "User Added",
  USER_EDITED: "User Edited",
  USER_DELETED: "User Deleted",
  STAFF_ADDED: "Staff Added",
  STAFF_EDITED: "Staff Edited",
  STAFF_REMOVED: "Staff Removed",
  SALARY_CHANGED: "Salary Created",
  SALARY_PAID: "Salary Paid",
  INCENTIVE_ADDED: "Incentive Added",
  INCENTIVE_PAID: "Incentive Paid",
  EXPENSE_ADDED: "Expense Added",
  REVENUE_ADDED: "Revenue Added",
  TRAINER_ASSIGNED: "Trainer Assigned",
  REFERRAL_TOGGLED: "Referral Toggle",
  SETTINGS_CHANGED: "Settings Changed",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/audit-logs");
      if (res.ok) setLogs(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const uniqueActions = ["ALL", ...Array.from(new Set(logs.map(l => l.action)))];

  const filtered = logs.filter(l => {
    const matchesSearch = search === "" ||
      l.performedByName.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Owner Audit Logs
          </h1>
          <p className="text-xs text-gray-400">
            Complete immutable log of all high-privilege owner actions — user deletions, financial entries, system toggles, and settings changes
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh Logs
        </button>
      </div>

      {/* Summary Stat */}
      <div className="bg-gradient-to-r from-[#12121A] to-[#0E0E14] border border-amber-500/20 rounded-2xl p-5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-amber-400">{logs.length}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Total Audit Events</div>
          </div>
        </div>
        <div className="h-10 w-px bg-white/10 hidden sm:block" />
        <div className="text-xs text-gray-400">
          Every sensitive action performed by the Owner is permanently logged here for accountability and compliance.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search by performer name, action, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-white"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-[#0D0D12] border border-white/10 rounded-xl text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
        >
          {uniqueActions.map(a => (
            <option key={a} value={a}>
              {a === "ALL" ? "All Action Types" : (ACTION_LABELS[a] || a)}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <History className="w-12 h-12 mx-auto opacity-20" />
            <p>No audit logs match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                  <th className="p-4 text-left font-bold">#</th>
                  <th className="p-4 text-left font-bold">Action Type</th>
                  <th className="p-4 text-left font-bold">Performed By</th>
                  <th className="p-4 text-left font-bold">Target</th>
                  <th className="p-4 text-left font-bold">Description</th>
                  <th className="p-4 text-left font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, index) => {
                  const colorClass = actionColors[log.action] || "text-gray-400 bg-white/5 border-white/10";
                  return (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-gray-600 font-mono">{logs.length - index}</td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border whitespace-nowrap ${colorClass}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">{log.performedByName}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{log.role}</div>
                      </td>

                      <td className="p-4 text-gray-400">
                        {log.targetRecordType ? (
                          <div>
                            <span className="text-gray-300">{log.targetRecordType}</span>
                            {log.targetRecordId && (
                              <span className="text-gray-600"> #{log.targetRecordId}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      <td className="p-4 text-gray-400 max-w-sm">
                        <p className="leading-relaxed line-clamp-2">{log.description}</p>
                      </td>

                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        <div>{new Date(log.createdAt).toLocaleDateString("en-GB")}</div>
                        <div className="text-[10px] text-gray-600">{new Date(log.createdAt).toLocaleTimeString()}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
