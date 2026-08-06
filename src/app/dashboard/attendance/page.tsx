"use client";

import { useEffect, useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, XCircle, Flame, Trophy, Percent, 
  Calendar as CalendarIcon, Check, Clock, AlertTriangle, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  currentStreak: number;
  longestStreak: number;
  isMarkedToday: boolean;
}

interface AttendanceRecord {
  id: number;
  date: string;
  time: string;
  status: 'Present' | 'Absent';
}

interface DayLog {
  date: string;
  status: 'Present' | 'Absent' | 'Unmarked';
}

export default function MemberAttendancePage() {

  // Component States
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [last30Days, setLast30Days] = useState<DayLog[]>([]);
  const [monthlyData, setMonthlyData] = useState<Record<string, { present: number; absent: number }>>({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calendar States
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAttendanceData = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/history');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecords(data.records);
        setLast30Days(data.last30Days);
        setMonthlyData(data.monthlyData);
      } else {
        showToast("Failed to fetch attendance history", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error while loading data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Mark Attendance handler
  const handleMarkAttendance = async () => {
    if (stats?.isMarkedToday || marking) return;
    setMarking(true);
    setErrorMessage("");

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessModal(true);
        await fetchAttendanceData();
        // Auto-close success modal after 3 seconds
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        setErrorMessage(data.error || "Failed to mark attendance.");
        showToast(data.error || "Failed to mark attendance", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error. Please try again.", "error");
    } finally {
      setMarking(false);
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 animate-pulse text-sm">Loading attendance stats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-8 container mx-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tighter">
                Gym <span className="text-brand">Attendance</span>
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Track your fitness journey and maintain your streak.</p>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <div className="px-4 py-2 rounded-2xl bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pinaka Elite
            </div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Widget 1: Today's Status */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Today</span>
              {stats?.isMarkedToday ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <span className={`text-lg md:text-xl font-bold font-heading uppercase ${stats?.isMarkedToday ? 'text-green-400' : 'text-amber-400'}`}>
                {stats?.isMarkedToday ? 'Present' : 'Not Marked'}
              </span>
              <p className="text-[10px] text-gray-500 mt-1">
                {stats?.isMarkedToday ? 'Checked in today' : 'Mark attendance below'}
              </p>
            </div>
          </motion.div>

          {/* Widget 2: Present Days */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
              <CalendarIcon className="w-4 h-4 text-brand" />
            </div>
            <div>
              <span className="text-3xl font-black font-heading text-white">{stats?.totalPresent || 0}</span>
              <p className="text-[10px] text-gray-500 mt-1">Total days checked in</p>
            </div>
          </motion.div>

          {/* Widget 3: Absent Days */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <span className="text-3xl font-black font-heading text-white">{stats?.totalAbsent || 0}</span>
              <p className="text-[10px] text-gray-500 mt-1">Missed sessions</p>
            </div>
          </motion.div>

          {/* Widget 4: Current Streak */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-heading text-orange-500">{stats?.currentStreak || 0}</span>
                <span className="text-xs text-orange-500/70 font-bold uppercase">Days</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Current active streak</p>
            </div>
            {stats && stats.currentStreak > 0 && (
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                <Flame className="w-20 h-20 text-orange-500 fill-orange-500" />
              </div>
            )}
          </motion.div>

          {/* Widget 5: Best Streak */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Best Streak</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-heading text-yellow-500">{stats?.longestStreak || 0}</span>
                <span className="text-xs text-yellow-500/70 font-bold uppercase">Days</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Personal record streak</p>
            </div>
            {stats && stats.longestStreak > 0 && (
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                <Trophy className="w-20 h-20 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </motion.div>

          {/* Widget 6: Attendance % */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface/40 border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Attendance %</span>
              <Percent className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <span className="text-3xl font-black font-heading text-green-400">{stats?.attendancePercentage || 0}%</span>
              <p className="text-[10px] text-gray-500 mt-1">Overall check-in rate</p>
            </div>
          </motion.div>
        </div>

        {/* Main Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Mark Button and Consistency Map */}
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            
            {/* Mark Attendance Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 min-h-[300px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {stats?.isMarkedToday ? (
                  <motion.div 
                    key="marked"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-4 py-8"
                  >
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/10">
                      <Check className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-green-400">Attendance Logged!</h2>
                      <p className="text-gray-400 text-sm max-w-sm mt-2">
                        You have already checked in today. Your streak is active and growing! Let&apos;s push harder in the gym today.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="unmarked"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-6 py-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold font-heading uppercase">Mark Today&apos;s Attendance</h2>
                      <p className="text-gray-400 text-sm max-w-md">
                        Mark your attendance once daily when you arrive at PINAKA FITNESS.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAttendance}
                      disabled={marking}
                      className="relative w-44 h-44 rounded-full bg-brand hover:bg-brand-light font-heading font-black text-lg uppercase tracking-wider text-white shadow-neon flex flex-col items-center justify-center gap-2 group disabled:opacity-50 transition-colors"
                    >
                      {marking ? (
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 text-white animate-pulse" />
                          <span>Check In</span>
                          <span className="text-[10px] text-white/70 font-semibold uppercase tracking-widest mt-1">Tap Screen</span>
                        </>
                      )}
                    </motion.button>

                    {errorMessage && (
                      <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 px-4 py-2 rounded-xl">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Consistency Map (Last 30 Days Contribution Grid) */}
            <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Last 30 Days Consistency</h3>
                <div className="flex gap-4 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/40 rounded-sm"></span> Present</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/40 rounded-sm"></span> Absent</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-white/5 border border-white/10 rounded-sm"></span> Not Marked</span>
                </div>
              </div>

              {/* GitHub-style contributions graph */}
              <div className="grid grid-cols-10 gap-2 sm:gap-3 py-2">
                {last30Days.map((day) => {
                  const dateObj = new Date(day.date);
                  const formattedDayLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  
                  let boxStyles = "bg-white/5 border border-white/10 hover:border-white/30";
                  let textColor = "text-gray-500";
                  
                  if (day.status === 'Present') {
                    boxStyles = "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 hover:border-green-500/60";
                    textColor = "text-green-400 font-semibold";
                  } else if (day.status === 'Absent') {
                    boxStyles = "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:border-red-500/60";
                    textColor = "text-red-400 font-semibold";
                  }

                  return (
                    <div 
                      key={day.date} 
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square text-center ${boxStyles}`}
                      title={`${formattedDayLabel}: ${day.status}`}
                    >
                      <span className={`text-[10px] md:text-xs font-bold block ${textColor}`}>{dateObj.getDate()}</span>
                      <span className="text-[8px] text-gray-500 block leading-tight font-medium uppercase mt-0.5">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Panel: Calendar View */}
          <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Calendar Controls */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Attendance Calendar</h3>
                <div className="flex items-center gap-3">
                  <button onClick={prevMonth} className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs font-bold">◀</button>
                  <span className="text-xs font-bold text-white uppercase tracking-wider select-none min-w-[90px] text-center">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs font-bold">▶</button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest py-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for shifting starting day */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const matchedRecord = records.find(r => r.date === dateString);

                  let dayStyle = "bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400";
                  let indicator = null;

                  if (matchedRecord) {
                    if (matchedRecord.status === 'Present') {
                      dayStyle = "bg-green-500/10 border border-green-500/30 text-green-400 font-bold hover:bg-green-500/20";
                      indicator = <span className="absolute bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />;
                    } else if (matchedRecord.status === 'Absent') {
                      dayStyle = "bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20";
                      indicator = <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full" />;
                    }
                  }

                  const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, dayNum).toDateString();
                  if (isToday) {
                    dayStyle += " ring-2 ring-brand ring-offset-2 ring-offset-black";
                  }

                  return (
                    <div 
                      key={`day-${dayNum}`}
                      className={`relative flex items-center justify-center rounded-xl aspect-square text-xs font-semibold transition-all select-none ${dayStyle}`}
                      title={matchedRecord ? `${matchedRecord.status} at ${matchedRecord.time}` : 'No record'}
                    >
                      <span>{dayNum}</span>
                      {indicator}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Quick stats checklist */}
            <div className="mt-8 pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Month Summary</span>
                <span>Active</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/40 rounded-full"></span> Marked Present</span>
                <span className="font-bold text-green-400">
                  {records.filter(r => {
                    const [yr, mo] = r.date.split('-');
                    return parseInt(yr) === currentYear && parseInt(mo) === (currentMonth + 1) && r.status === 'Present';
                  }).length} Days
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/40 rounded-full"></span> Automatically Absent</span>
                <span className="font-bold text-red-400">
                  {records.filter(r => {
                    const [yr, mo] = r.date.split('-');
                    return parseInt(yr) === currentYear && parseInt(mo) === (currentMonth + 1) && r.status === 'Absent';
                  }).length} Days
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section: Trend Visualizer */}
        <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Monthly Attendance History Trend</h3>
            <p className="text-xs text-gray-500 mt-1">Overall check-ins segmented by month.</p>
          </div>

          <div className="h-64 flex items-end gap-3 md:gap-6 pt-8 border-b border-white/10 relative">
            {Object.keys(monthlyData).length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                No attendance trend logs generated yet. Keep tracking to visualize.
              </div>
            ) : (
              Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([monthKey, counts]) => {
                const total = counts.present + counts.absent;
                const pct = total > 0 ? (counts.present / total) * 100 : 0;
                
                // e.g. "2026-08" -> "Aug"
                const [yr, mo] = monthKey.split('-');
                const dateVal = new Date(parseInt(yr), parseInt(mo) - 1, 1);
                const monthLabel = dateVal.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div key={monthKey} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip */}
                    <div className="absolute top-[-30px] opacity-0 group-hover:opacity-100 transition-opacity bg-brand text-white px-2 py-1 rounded text-[10px] font-bold pointer-events-none z-10 whitespace-nowrap">
                      P: {counts.present} | A: {counts.absent} ({Math.round(pct)}%)
                    </div>

                    {/* Bar segments */}
                    <div className="w-full max-w-[40px] flex flex-col-reverse h-full justify-start rounded-t-lg overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand/40 transition-colors">
                      {/* Present segments (green) */}
                      <div 
                        style={{ height: `${total > 0 ? (counts.present / 31) * 100 : 0}%` }}
                        className="w-full bg-gradient-to-t from-brand to-brand-light opacity-80 group-hover:opacity-100 transition-all"
                      />
                      {/* Absent segments (red) */}
                      <div 
                        style={{ height: `${total > 0 ? (counts.absent / 31) * 100 : 0}%` }}
                        className="w-full bg-red-500/20 group-hover:bg-red-500/30 transition-all"
                      />
                    </div>

                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2.5">
                      {monthLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent logs table */}
        <div className="bg-surface/30 border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Detailed Check-In logs</h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{records.length} Logs total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest font-semibold">
                  <th className="pb-3 pl-3">Date</th>
                  <th className="pb-3">Checked In Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">No attendance logs found. Get started by checking in today!</td>
                  </tr>
                ) : (
                  records.slice().reverse().slice(0, 10).map((record) => (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pl-3 font-semibold text-gray-300">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-brand" />
                          {record.status === 'Present' ? record.time : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'Present' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right text-gray-500">
                        {record.status === 'Present' ? 'Checked in via App' : 'Calculated system absent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-brand/40 shadow-neon-strong rounded-[2.5rem] p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="w-24 h-24 bg-brand/10 border border-brand/30 text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon animate-bounce">
                <CheckCircle className="w-12 h-12 text-brand-light" />
              </div>

              <h3 className="text-2xl font-black font-heading uppercase tracking-tighter mb-2 text-white">
                Attendance Marked!
              </h3>
              
              <p className="text-gray-300 text-sm mb-6">
                ✅ Attendance Marked Successfully! You have logged your session today. Keep it up!
              </p>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-brand hover:bg-brand-light text-white font-bold uppercase tracking-wider rounded-xl transition-all text-xs"
              >
                Let&apos;s go!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
              toast.type === 'success' 
                ? 'bg-zinc-950 border-green-500/20 text-green-400' 
                : 'bg-zinc-950 border-red-500/20 text-red-400'
            }`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
