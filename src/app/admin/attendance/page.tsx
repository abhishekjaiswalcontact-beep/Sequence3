"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, CheckCircle2, XCircle, 
  Trash2, Download, RefreshCw, Star, AlertTriangle, 
  MessageSquare, Check, Settings, ShieldAlert, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  membership: {
    membershipId: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  attendance: {
    id: number;
    date: string;
    time: string;
    status: 'Present' | 'Absent';
  } | null;
}

interface AnalyticsData {
  overall: {
    totalPresent: number;
    totalAbsent: number;
    overallPercentage: number;
    activeMembersCount: number;
  };
  trends: Array<{ date: string; present: number; absent: number }>;
  mostConsistent: Array<{
    user: { id: number; name: string; email: string; phone: string };
    present: number;
    absent: number;
    percentage: number;
    currentStreak: number;
    longestStreak: number;
  }>;
  leastActive: Array<{
    user: { id: number; name: string; email: string; phone: string };
    present: number;
    absent: number;
    percentage: number;
    currentStreak: number;
    longestStreak: number;
  }>;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminAttendancePage() {

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM
  const [useMonthFilter, setUseMonthFilter] = useState(false);

  // Data States
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modals & Details
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [userLogs, setUserLogs] = useState<{ id: number; date: string; time: string; status: string; markedBy: string }[]>([]);
  const [userStats, setUserStats] = useState<{ totalPresent: number; totalAbsent: number; currentStreak: number; longestStreak: number; attendancePercentage: number } | null>(null);
  const [loadingUserLogs, setLoadingUserLogs] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Page Subsections View Toggle
  const [activeTab, setActiveTab] = useState<'members' | 'analytics' | 'settings'>('members');

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Fetch Attendance List
  const fetchAttendanceList = useCallback(async () => {
    try {
      let url = `/api/admin/attendance?search=${encodeURIComponent(searchQuery)}&plan=${encodeURIComponent(filterPlan)}`;
      if (useMonthFilter) {
        url += `&month=${filterMonth || new Date().toISOString().slice(0, 7)}`;
      } else {
        url += `&date=${filterDate}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        addToast('error', 'Failed to retrieve attendance logs.');
      }
    } catch {
      addToast('error', 'Network error while fetching attendance.');
    }
  }, [searchQuery, filterPlan, filterDate, filterMonth, useMonthFilter]);

  // Fetch Analytics & Settings
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setRemindersEnabled(settings.whatsapp_reminders_enabled === 'true');
      }

      // Fetch analytics
      const analyticsRes = await fetch('/api/admin/attendance/analytics');
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      
      await fetchAttendanceList();
    } catch {
      addToast('error', 'Error loading dashboard statistics.');
    }
  }, [fetchAttendanceList]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Trigger search refetch
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceList();
  };

  // Update System Settings
  const toggleReminders = async () => {
    const nextState = !remindersEnabled;
    setRemindersEnabled(nextState); // optimistic update
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_reminders_enabled: nextState ? 'true' : 'false' }),
      });
      if (res.ok) {
        addToast('success', `WhatsApp reminders ${nextState ? 'enabled' : 'disabled'} successfully.`);
      } else {
        setRemindersEnabled(!nextState); // rollback
        addToast('error', 'Failed to update reminder settings.');
      }
    } catch {
      setRemindersEnabled(!nextState); // rollback
      addToast('error', 'Network error.');
    }
  };

  // Manually Log Attendance (Admin)
  const handleMarkAttendance = async (userId: number, status: 'Present' | 'Absent') => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: filterDate,
          status
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast('success', `Attendance marked as ${status} for this member.`);
        fetchAttendanceList();
        
        // Refresh analytics in background
        fetch('/api/admin/attendance/analytics').then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
      } else {
        addToast('error', data.error || 'Failed to update attendance.');
      }
    } catch {
      addToast('error', 'Network error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete/Revert Check In
  const handleDeleteAttendance = async (userId: number) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/attendance?userId=${userId}&date=${filterDate}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Attendance record cleared.');
        fetchAttendanceList();
        
        // Refresh analytics in background
        fetch('/api/admin/attendance/analytics').then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
      } else {
        addToast('error', data.error || 'Failed to delete record.');
      }
    } catch {
      addToast('error', 'Network error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let url = `/api/admin/attendance/export?search=${encodeURIComponent(searchQuery)}&plan=${encodeURIComponent(filterPlan)}`;
    if (useMonthFilter) {
      url += `&month=${filterMonth || new Date().toISOString().slice(0, 7)}`;
    } else {
      url += `&date=${filterDate}`;
    }
    window.open(url, '_blank');
  };

  // View individual history
  const openHistoryModal = async (user: ManagedUser) => {
    setSelectedUser(user);
    setLoadingUserLogs(true);
    setUserLogs([]);
    setUserStats(null);
    try {
      // Wait, /api/attendance/history gets current logged in user.
      // Let's make an admin call or we can get user logs directly by querying matching records from database. Let's check:
      // We can fetch from a route that gets a specific user's logs if we have it, or query it. Let's make a call to get user history.
      // Wait! We can retrieve user logs directly from `/api/admin/attendance?search=${user.email}` or similar. Or let's create a specific user history fetching endpoint or pass query param:
      // We can modify the GET `/api/attendance/history` or create a new endpoint `/api/admin/attendance/user?userId=...` to query a specific user.
      // Wait, let's create a quick API fetcher or let's create the sub-endpoint or let's query it. Let's create an admin endpoint that returns that user's history! Let's pass `userId` to a endpoint or just check in `GET /api/attendance/history?userId=...`.
      // Let's update `GET /api/attendance/history` to support a `userId` query parameter if the requesting user is an admin!
      // This is extremely modular and avoids creating another API file. Let's check `src/app/api/attendance/history/route.ts`:
      // If session.isAdmin is true and searchParams contains `userId`, we query that `userId` instead of session.sub!
      // This is incredibly smart and clean. Let's check: we can implement this easily. First, let's see how our frontend fetches it:
      const userRes = await fetch(`/api/attendance/history?userId=${user.id}`);
      if (userRes.ok) {
        const data = await userRes.json();
        setUserLogs(data.records);
        setUserStats(data.stats);
      } else {
        addToast('error', 'Could not load member logs.');
      }
    } catch {
      addToast('error', 'Network error.');
    } finally {
      setLoadingUserLogs(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-8 container mx-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button aria-label="Back to dashboard" className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tighter">
                Attendance <span className="text-brand">Console</span>
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Admin Panel — PINAKA FITNESS Attendance Management &amp; WhatsApp Settings</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                activeTab === 'members' 
                  ? 'bg-brand text-white border-brand' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Members Logs
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                activeTab === 'analytics' 
                  ? 'bg-brand text-white border-brand' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                activeTab === 'settings' 
                  ? 'bg-brand text-white border-brand' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Global Summary Info Bar */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Checked In Today</span>
              <span className="text-2xl font-black font-heading text-green-400 mt-1 block">
                {analytics.overall.totalPresent}
              </span>
            </div>
            <div className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Absent Today</span>
              <span className="text-2xl font-black font-heading text-red-400 mt-1 block">
                {analytics.overall.totalAbsent}
              </span>
            </div>
            <div className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Attendance Rate</span>
              <span className="text-2xl font-black font-heading text-brand-light mt-1 block">
                {analytics.overall.overallPercentage}%
              </span>
            </div>
            <div className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Monitored Members</span>
              <span className="text-2xl font-black font-heading text-white mt-1 block">
                {analytics.overall.activeMembersCount}
              </span>
            </div>
          </div>
        )}

        {/* Main tabs content */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <motion.div 
              key="tab-members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Search & Filter Form */}
              <form onSubmit={handleFilterSubmit} className="bg-surface/30 border border-surfaceBorder rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-400">Search Member</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-400">Plan</label>
                  <select 
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                  >
                    <option value="">All Plans</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly (3 Months)">Quarterly (3 Months)</option>
                    <option value="Half Yearly (6 Months)">Half Yearly (6 Months)</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Switcher for Date / Month */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-gray-400">
                      {useMonthFilter ? 'Month Filter' : 'Date Filter'}
                    </label>
                    <button 
                      type="button"
                      onClick={() => setUseMonthFilter(!useMonthFilter)}
                      className="text-[10px] text-brand hover:text-brand-light font-bold"
                    >
                      {useMonthFilter ? 'Use Date' : 'Use Month'}
                    </button>
                  </div>
                  {useMonthFilter ? (
                    <input 
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                    />
                  ) : (
                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Apply
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportCSV}
                    title="Export to CSV"
                    className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Members Logs Table */}
              <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest font-semibold">
                        <th className="pb-3 pl-3">Member</th>
                        <th className="pb-3">Contact</th>
                        <th className="pb-3">Active Plan</th>
                        <th className="pb-3">Status ({useMonthFilter ? 'Month Record' : filterDate})</th>
                        <th className="pb-3 pr-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">No members found matching the queries.</td>
                        </tr>
                      ) : (
                        users.map(user => {
                          let isPresent = false;
                          let isAbsent = false;
                          let checkinTime = 'N/A';
                          
                          if (user.attendance) {
                            if (Array.isArray(user.attendance)) {
                              // If array (month filter), summarize
                              isPresent = user.attendance.some(a => a.status === 'Present');
                              isAbsent = user.attendance.some(a => a.status === 'Absent');
                            } else {
                              isPresent = user.attendance.status === 'Present';
                              isAbsent = user.attendance.status === 'Absent';
                              checkinTime = user.attendance.status === 'Present' ? user.attendance.time : 'N/A';
                            }
                          }

                          return (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                              <td 
                                className="py-3.5 pl-3 cursor-pointer group"
                                onClick={() => openHistoryModal(user)}
                              >
                                <span className="font-bold text-gray-200 group-hover:text-brand-light transition-colors block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-gray-500 block">{user.email}</span>
                              </td>
                              <td className="py-3.5 font-medium text-gray-400">
                                {user.phone || 'No phone'}
                              </td>
                              <td className="py-3.5 text-gray-400">
                                {user.membership ? (
                                  <div>
                                    <span className="text-white font-semibold">{user.membership.plan}</span>
                                    <span className={`block text-[9px] font-bold ${
                                      user.membership.status === 'Active' ? 'text-green-500' : 'text-amber-500'
                                    }`}>{user.membership.status}</span>
                                  </div>
                                ) : (
                                  <span className="text-red-500 font-bold">No active plan</span>
                                )}
                              </td>
                              <td className="py-3.5">
                                {useMonthFilter ? (
                                  <div className="flex gap-2">
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                      {Array.isArray(user.attendance) ? user.attendance.filter(a => a.status === 'Present').length : 0} Present
                                    </span>
                                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                      {Array.isArray(user.attendance) ? user.attendance.filter(a => a.status === 'Absent').length : 0} Absent
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {isPresent && (
                                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                        Present ({checkinTime})
                                      </span>
                                    )}
                                    {isAbsent && (
                                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Absent
                                      </span>
                                    )}
                                    {!isPresent && !isAbsent && (
                                      <span className="bg-white/5 text-gray-400 border border-white/5 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Unmarked
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 pr-3 text-right">
                                {useMonthFilter ? (
                                  <button 
                                    onClick={() => openHistoryModal(user)}
                                    className="px-2.5 py-1 bg-brand/10 hover:bg-brand/20 text-brand-light font-bold text-[10px] uppercase rounded-lg border border-brand/20 transition-colors"
                                  >
                                    View Log
                                  </button>
                                ) : (
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      disabled={actionLoadingId === user.id}
                                      onClick={() => handleMarkAttendance(user.id, 'Present')}
                                      className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors ${
                                        isPresent 
                                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                          : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                      }`}
                                      title="Mark Present"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      disabled={actionLoadingId === user.id}
                                      onClick={() => handleMarkAttendance(user.id, 'Absent')}
                                      className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors ${
                                        isAbsent 
                                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                          : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                      }`}
                                      title="Mark Absent"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                    {(isPresent || isAbsent) && (
                                      <button
                                        disabled={actionLoadingId === user.id}
                                        onClick={() => handleDeleteAttendance(user.id)}
                                        className="p-1.5 rounded-lg bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                        title="Clear Entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div 
              key="tab-analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Left column: Trends Graph */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual SVG Trend Graph Card */}
                <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Daily Attendance Trends</h3>
                    <p className="text-xs text-gray-500">Aggregate Present vs Absent logs for the last 14 days.</p>
                  </div>
                  
                  <div className="h-64 flex items-end gap-2 pt-8 border-b border-white/10 relative">
                    {analytics && analytics.trends.length > 0 ? (
                      analytics.trends.map((day) => {
                        const maxCount = Math.max(...analytics.trends.map(t => t.present + t.absent), 1);
                        const presentPct = (day.present / maxCount) * 100;
                        const absentPct = (day.absent / maxCount) * 100;

                        const dateObj = new Date(day.date);
                        const label = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            
                            {/* Tooltip */}
                            <div className="absolute top-[-30px] opacity-0 group-hover:opacity-100 transition-opacity bg-brand text-white px-2 py-1 rounded text-[9px] font-bold pointer-events-none z-10 whitespace-nowrap">
                              Pres: {day.present} | Abs: {day.absent}
                            </div>

                            <div className="w-full max-w-[24px] flex flex-col-reverse h-full justify-start rounded-t overflow-hidden bg-white/5 border border-white/5">
                              {/* Present (green) */}
                              <div style={{ height: `${presentPct}%` }} className="w-full bg-brand" />
                              {/* Absent (red) */}
                              <div style={{ height: `${absentPct}%` }} className="w-full bg-red-500/20" />
                            </div>

                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-2.5">
                              {label}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                        No trends data available.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 text-[10px] text-gray-500 pt-2 justify-center">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-brand rounded-sm"></span> Present check-ins</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 rounded-sm"></span> Absent overrides</span>
                  </div>
                </div>

                {/* Audit Logs summary */}
                <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Member Status Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <span className="text-xs text-gray-400">Total Checked In (Overall)</span>
                      <span className="text-2xl font-black block mt-2 text-green-400">{analytics?.overall.totalPresent || 0}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <span className="text-xs text-gray-400">Total Missed/Absent (Overall)</span>
                      <span className="text-2xl font-black block mt-2 text-red-400">{analytics?.overall.totalAbsent || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right column: Consistency Leaderboard */}
              <div className="space-y-6">
                
                {/* Most Consistent Members */}
                <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Most Consistent Members</h3>
                  </div>

                  <div className="space-y-3">
                    {analytics && analytics.mostConsistent.length > 0 ? (
                      analytics.mostConsistent.map((item, index) => (
                        <div key={item.user.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-xs font-bold text-gray-200 block">
                              {index + 1}. {item.user.name}
                            </span>
                            <span className="text-[9px] text-gray-500">Longest Streak: {item.longestStreak} days</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-brand-light font-bold block">{item.present} Days Present</span>
                            <span className="text-[9px] text-green-400 font-bold block">🔥 {item.currentStreak} Streak</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4 text-xs">No attendance marked yet.</div>
                    )}
                  </div>
                </div>

                {/* Least Active Members */}
                <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Least Active Members</h3>
                  </div>

                  <div className="space-y-3">
                    {analytics && analytics.leastActive.length > 0 ? (
                      analytics.leastActive.map((item, index) => (
                        <div key={item.user.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-xs font-bold text-gray-200 block">
                              {index + 1}. {item.user.name}
                            </span>
                            <span className="text-[9px] text-gray-500">{item.user.phone || 'No phone'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-red-400 font-bold block">{item.absent} Absences</span>
                            <span className="text-[9px] text-gray-500 font-semibold block">{item.percentage}% Attended</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4 text-xs">No absences recorded yet.</div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div 
              key="tab-settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              
              {/* WhatsApp Reminders Config Card */}
              <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold font-heading uppercase mt-3">WhatsApp Notification Reminders</h3>
                    <p className="text-gray-400 text-xs max-w-md">
                      Send daily automated check-in reminder messages to active gym members on WhatsApp at 7:00 PM IST (Indian Time).
                    </p>
                  </div>
                  
                  {/* Styled Switch Component */}
                  <button 
                    onClick={toggleReminders}
                    className={`relative w-14 h-8 rounded-full p-1 transition-all duration-300 focus:outline-none ${
                      remindersEnabled ? 'bg-brand' : 'bg-white/10'
                    }`}
                  >
                    <motion.div 
                      layout
                      className="w-6 h-6 rounded-full bg-white shadow-md"
                      animate={{ x: remindersEnabled ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-2 text-gray-400">
                  <span className="font-bold text-gray-200 block">Message Preview:</span>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-gray-300 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                    🏋️ PINAKA FITNESS{'\n\n'}
                    Hi [Member Name],{'\n\n'}
                    Don&apos;t forget to mark today&apos;s gym attendance.{'\n\n'}
                    Click here:{'\n'}
                    https://yourwebsite.com/dashboard/attendance{'\n\n'}
                    Track your consistency and maintain your streak!{'\n\n'}
                    — PINAKA FITNESS
                  </div>
                </div>

                <div className="flex gap-2.5 items-center text-gray-500 text-[10px]">
                  <Settings className="w-3.5 h-3.5 text-gray-600" />
                  <span>Configured to use: {process.env.TWILIO_ACCOUNT_SID ? 'Twilio API Gateway' : 'Meta WhatsApp Cloud API'}</span>
                </div>
              </div>

              {/* CRON instructions card */}
              <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">CRON Jobs Instructions</span>
                </div>
                
                <p className="text-gray-400 text-xs leading-relaxed">
                  The automatic absent marker and WhatsApp reminder schedulers are exposed on secured API endpoints.
                  To automate them, configure a scheduler (like Vercel Cron, Github Actions, or cron job) to trigger these endpoints with bearer token auth:
                </p>

                <div className="space-y-3">
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-[10px] font-mono space-y-2 text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-brand font-bold">1. Daily WhatsApp Reminder (7:00 PM IST)</span>
                      <span className="text-gray-500">GET/POST</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded select-all">
                      https://yourwebsite.com/api/cron/whatsapp-reminders
                    </div>
                    <span className="text-gray-500 block">Header: Authorization: Bearer &lt;CRON_SECRET&gt;</span>
                  </div>

                  <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-[10px] font-mono space-y-2 text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-brand font-bold">2. Auto-Absent Calculation (11:59 PM IST)</span>
                      <span className="text-gray-500">GET/POST</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded select-all">
                      https://yourwebsite.com/api/cron/absent-calculation
                    </div>
                    <span className="text-gray-500 block">Header: Authorization: Bearer &lt;CRON_SECRET&gt;</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Individual History Detail Modal Overlay */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full relative flex flex-col max-h-[85vh] overflow-hidden"
            >
              
              {/* Close button */}
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute right-6 top-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-white/10 space-y-1">
                <span className="text-[10px] text-brand-light font-bold uppercase tracking-wider block">Member History Profile</span>
                <h3 className="text-2xl font-black font-heading uppercase text-white">{selectedUser.name}</h3>
                <p className="text-xs text-gray-500">{selectedUser.email} • {selectedUser.phone || 'No Phone'}</p>
              </div>

              {/* Stats overview grids */}
              {userStats && (
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Present</span>
                    <span className="text-lg font-black text-white mt-1 block">{userStats.totalPresent}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Absent</span>
                    <span className="text-lg font-black text-white mt-1 block">{userStats.totalAbsent}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Att. Rate</span>
                    <span className="text-lg font-black text-brand-light mt-1 block">{userStats.attendancePercentage}%</span>
                  </div>
                </div>
              )}

              {/* Scrollable logs list */}
              <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-2.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Check-in Logs</span>
                
                {loadingUserLogs ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-gray-500">Loading history logs...</span>
                  </div>
                ) : userLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-xs">No attendance entries found for this member.</div>
                ) : (
                  userLogs.slice().reverse().map((log) => (
                    <div 
                      key={log.id} 
                      className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-gray-300">
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="block text-[9px] text-gray-500">Logged Time: {log.status === 'Present' ? log.time : 'N/A'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.status === 'Present' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-white/10 mt-2">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-xl transition-colors text-xs border border-white/5"
                >
                  Close Profile
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto bg-zinc-950 max-w-sm ${
              t.type === 'success' ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="text-xs font-semibold">{t.message}</span>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
