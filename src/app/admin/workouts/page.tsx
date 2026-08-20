"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Plus, Search, Dumbbell,
  AlertCircle, X, Edit2, Trash2, UserCheck
} from "lucide-react";

interface WorkoutPlan {
  id: number;
  userId: number;
  title: string;
  goal: string;
  level: string; // Beginner, Intermediate, Advanced
  duration: string;
  daysPerWeek: number;
  exercises: string;
  notes?: string;
  createdAt: string;
  user?: { id: number; name: string; email: string; phone: string };
}

interface MemberUser {
  id: number;
  name: string;
  email: string;
}

export default function AdminWorkoutsPage() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    userId: 0,
    title: "",
    goal: "Muscle Gain",
    level: "Intermediate",
    duration: "4 Weeks",
    daysPerWeek: 4,
    exercises: "Day 1: Chest & Triceps\nDay 2: Back & Biceps\nDay 3: Rest\nDay 4: Shoulders & Abs\nDay 5: Legs & Calves",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, mRes] = await Promise.all([
        fetch("/api/admin/workouts"),
        fetch("/api/admin/users"),
      ]);

      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkoutPlans(wData);
      }
      if (mRes.ok) {
        const mData = await mRes.json();
        setMembers(mData.filter((u: { isOwner?: boolean }) => !u.isOwner));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      id: 0,
      userId: members.length > 0 ? members[0].id : 0,
      title: "Custom Split Routine",
      goal: "Muscle Gain",
      level: "Intermediate",
      duration: "4 Weeks",
      daysPerWeek: 4,
      exercises: "Day 1: Chest & Triceps (Bench Press 4x10, Incline Dumbbell 3x12)\nDay 2: Back & Biceps (Lat Pulldown 4x10, Barbell Curl 3x12)\nDay 3: Rest & Mobility\nDay 4: Legs & Abs (Squats 4x10, Leg Press 3x12)",
      notes: "Stay hydrated and maintain proper execution form.",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (w: WorkoutPlan) => {
    setFormData({
      id: w.id,
      userId: w.userId,
      title: w.title,
      goal: w.goal,
      level: w.level,
      duration: w.duration,
      daysPerWeek: w.daysPerWeek,
      exercises: w.exercises,
      notes: w.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.userId) {
      setError("Please select a member to assign the workout plan.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/workouts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to save workout plan.");
      }
    } catch {
      setError("Network error while saving plan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workout plan?")) return;
    try {
      const res = await fetch("/api/admin/workouts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = workoutPlans.filter((item) => {
    const memberName = item.user?.name || "";
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.goal.toLowerCase().includes(search.toLowerCase()) ||
      memberName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] border border-white/10 p-6 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" /> Fitness Engineering
          </div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Workout Plan Management</h1>
          <p className="text-xs text-gray-400 mt-1">Design customized exercise routines and assign workout split plans to members.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create &amp; Assign Routine
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0D0D12] border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by plan title, fitness goal, or member name..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Workout Plans Grid */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading workout routines...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Dumbbell className="w-10 h-10 text-emerald-500/40 mx-auto" />
            <p className="text-sm font-bold text-gray-300">No Workout Plans Assigned</p>
            <p className="text-xs text-gray-500">Create customized exercise splits for gym members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {filtered.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#121218] border border-white/10 rounded-2xl p-5 space-y-4 relative group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {plan.level} • {plan.duration}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{plan.title}</h3>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Assigned to: <strong className="text-white">{plan.user?.name || "Member"}</strong> ({plan.user?.email})
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Target Goal</div>
                  <div className="text-xs font-semibold text-emerald-300">{plan.goal} ({plan.daysPerWeek} days / week)</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Routine Schedule</div>
                  <pre className="text-[11px] text-gray-300 bg-white/5 p-3 rounded-xl whitespace-pre-wrap font-mono">
                    {plan.exercises}
                  </pre>
                </div>

                {plan.notes && (
                  <div className="text-[11px] text-gray-400 italic">
                    Note: {plan.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-heading font-bold text-white uppercase">
                  {formData.id ? "Edit Workout Routine" : "Assign Workout Routine"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Select Member</label>
                  <select
                    disabled={!!formData.id}
                    value={formData.userId}
                    onChange={(e) => setFormData((d) => ({ ...d, userId: parseInt(e.target.value) }))}
                    className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={0}>-- Select Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Routine Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Hypertrophy Split 4-Day"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Fitness Goal</label>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => setFormData((d) => ({ ...d, goal: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData((d) => ({ ...d, level: e.target.value }))}
                      className="w-full bg-[#121218] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData((d) => ({ ...d, duration: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Exercise Routine &amp; Sets</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.exercises}
                    onChange={(e) => setFormData((d) => ({ ...d, exercises: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Trainer Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Hydration advice, tempo guidance..."
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Workout Routine"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
