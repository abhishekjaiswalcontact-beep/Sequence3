"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, FileText, Download, Users, DollarSign, UserCheck, Filter } from "lucide-react";

type ReportValue = string | number | boolean | { name?: string; email?: string } | null | undefined;
interface ReportRow { [key: string]: ReportValue }

interface ReportData {
  reportType: string;
  summary: Record<string, number>;
  data?: ReportRow[];
}

function downloadCSV(data: ReportRow[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === "object" && val !== null) return JSON.stringify(val).replace(/,/g, ";");
      return String(val ?? "").replace(/,/g, ";");
    }).join(","))
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("member");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  const generateReport = async () => {
    setLoading(true); setError(""); setReport(null);
    try {
      const params = new URLSearchParams({ type: reportType, dateRange, startDate, endDate });
      const res = await fetch(`/api/owner/reports?${params}`);
      if (res.ok) { setReport(await res.json()); }
      else { setError("Failed to generate report. Please try again."); }
    } catch { setError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  };

  const reportConfigs = [
    { type: "member", label: "Member Report", icon: Users, color: "blue", description: "Member enrollments, active vs expired, new joins" },
    { type: "financial", label: "Financial Report", icon: DollarSign, color: "amber", description: "Revenue, expenses, net profit & loss breakdown" },
    { type: "staff", label: "Staff Report", icon: UserCheck, color: "purple", description: "Staff salary, incentive, and performance metrics" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-400" /> Reports Center
        </h1>
        <p className="text-xs text-gray-400">Generate detailed business reports with date range filtering and export to CSV</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportConfigs.map(r => (
          <button key={r.type} onClick={() => setReportType(r.type)}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${reportType === r.type ? "bg-amber-500/10 border-amber-500/30 shadow-lg" : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${reportType === r.type ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400"}`}>
              <r.icon className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider ${reportType === r.type ? "text-amber-400" : "text-gray-300"}`}>{r.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{r.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Date Range Controls */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white uppercase">Date Range Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {[
            { val: "day", label: "Today" },
            { val: "week", label: "Last 7 Days" },
            { val: "month", label: "This Month" },
            { val: "year", label: "This Year" },
            { val: "custom", label: "Custom Range" },
          ].map(d => (
            <button key={d.val} onClick={() => setDateRange(d.val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${dateRange === d.val ? "bg-amber-500 text-black border-amber-400 shadow" : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"}`}>
              {d.label}
            </button>
          ))}
        </div>

        {dateRange === "custom" && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Start Date:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:border-amber-500 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">End Date:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:border-amber-500 focus:outline-none" />
            </div>
          </div>
        )}

        <button onClick={generateReport} disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
          <FileText className="w-4 h-4" />
          {loading ? "Generating Report..." : "Generate Report"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">{error}</div>}

      {/* Report Results */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary Metrics */}
          <div className="bg-[#0D0D12] border border-amber-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-bold uppercase text-amber-400">Report Summary</h3>
              {report.data && report.data.length > 0 && (
                <button
                  onClick={() => downloadCSV(report.data || [], `${report.reportType}-report-${new Date().toISOString().split("T")[0]}.csv`)}
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(report.summary).map(([key, value]) => (
                <div key={key} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                  <div className="text-xl font-heading font-black text-white">
                    {typeof value === "number" && key.toLowerCase().includes("revenue") || key.toLowerCase().includes("expense") || key.toLowerCase().includes("profit") || key.toLowerCase().includes("income")
                      ? `₹${value.toLocaleString("en-IN")}`
                      : value.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Records Table */}
          {report.data && report.data.length > 0 && (
            <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-heading font-bold uppercase text-white">Detailed Records ({report.data.length})</h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0">
                    <tr className="bg-[#0A0A10] text-gray-400 border-b border-white/10 uppercase tracking-wider">
                      {Object.keys(report.data[0])
                        .filter(k => !["profile", "memberships", "membershipHistory", "salaries", "incentives", "trainerClients", "assignedClients", "referralReceived", "assignedAsClient"].includes(k))
                        .slice(0, 8)
                        .map(h => <th key={h} className="p-3 text-left font-bold text-[10px]">{h.replace(/([A-Z])/g, " $1").trim()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.slice(0, 50).map((row: ReportRow, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                        {Object.keys(row)
                          .filter(k => !["profile", "memberships", "membershipHistory", "salaries", "incentives", "trainerClients", "assignedClients", "referralReceived", "assignedAsClient"].includes(k))
                          .slice(0, 8)
                          .map(k => (
                            <td key={k} className="p-3 text-gray-300 text-xs">
                              {typeof row[k] === "object" ? (row[k]?.name || row[k]?.email || "—") : String(row[k] ?? "—")}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.data.length > 50 && (
                <div className="p-3 text-center text-xs text-gray-500">Showing first 50 of {report.data.length} records. Export CSV for complete dataset.</div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
