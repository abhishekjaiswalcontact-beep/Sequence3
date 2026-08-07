"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, LogOut, Users, Scale,
  Lock, Unlock, Plus, Trash2,
  Save, Sparkles, PlusCircle, AlertCircle, CheckCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserRow {
  id: number;
  name: string;
  email: string;
  dietPlans: Array<{
    id: number;
    isLocked: boolean;
    isManual: boolean;
    calories: number;
    createdAt: string;
  }>;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

function AdminDietsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const { user, logout, isHydrated } = useAuth();

  // Lists
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected User's Details
  interface SelectedUser { id: number; name: string; email: string; }
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Selected User's Details
  interface UserProfileData { fitnessGoal: string; height: number; currentWeight: number; targetWeight: number; age: number; gender: string; healthConditions?: string; }
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  interface ActivePlan { id: number; isManual: boolean; isLocked: boolean; calories: number; protein: number; carbs: number; fat: number; meals: EditMealItem[]; trainerNotes?: string; }
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  interface WeightLogItem { date: string; weight: number; }
  const [weightLogs, setWeightLogs] = useState<WeightLogItem[]>([]);
  interface WaterLogItem { createdAt: string; amount: number; }
  const [waterLogs, setWaterLogs] = useState<WaterLogItem[]>([]);
  interface MealLogItem { mealName: string; date: string; status: string; }
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>([]);
  interface ChatLogItem { role: string; content: string; }
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>([]);

  // Manual / Edit Forms
  const [showManualForm, setShowManualForm] = useState(false);
  const [trainerNotes, setTrainerNotes] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [editCalories, setEditCalories] = useState(2000);
  const [editProtein, setEditProtein] = useState(150);
  const [editCarbs, setEditCarbs] = useState(200);
  const [editFat, setEditFat] = useState(65);
  interface EditMealItem { meal: string; time: string; calories: number; protein: number; carbs: number; fat: number; portionSize: string; items: string[]; alternatives: unknown[]; }
  const [editMeals, setEditMeals] = useState<EditMealItem[]>([]);

  // Modal manual meal additions
  const [mealFormName, setMealFormName] = useState("");
  const [mealFormTime, setMealFormTime] = useState("");
  const [mealFormItems, setMealFormItems] = useState("");

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/diet");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        addToast("error", "Failed to load user directory.");
      }
    } catch {
      addToast("error", "Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = useCallback(async (userId: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/diet?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data.user);
        setProfile(data.profile);
        setActivePlan(data.activeDiet);
        setWeightLogs(data.weightLogs);
        setWaterLogs(data.waterLogs);
        setMealLogs(data.mealLogs);
        setChatLogs(data.chatLogs);

        // Prep Edit states
        if (data.activeDiet) {
          setTrainerNotes(data.activeDiet.trainerNotes || "");
          setIsLocked(data.activeDiet.isLocked || false);
          setEditCalories(data.activeDiet.calories);
          setEditProtein(data.activeDiet.protein);
          setEditCarbs(data.activeDiet.carbs);
          setEditFat(data.activeDiet.fat);
          setEditMeals(data.activeDiet.meals || []);
        } else {
          setTrainerNotes("");
          setIsLocked(false);
          setEditCalories(2000);
          setEditProtein(140);
          setEditCarbs(200);
          setEditFat(60);
          setEditMeals([]);
        }
      } else {
        addToast("error", "Failed to fetch user diet details.");
      }
    } catch {
      addToast("error", "Failed to reach servers.");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !user.isAdmin) {
      router.replace(user ? "/dashboard" : "/login");
    } else {
      fetchUsers();
      if (initialUserId) {
        fetchUserDetails(initialUserId);
      }
    }
  }, [isHydrated, user, router, fetchUsers, initialUserId, fetchUserDetails]);

  const handleSelectUser = (u: UserRow) => {
    fetchUserDetails(String(u.id));
  };

  // Toggle Lock
  const handleToggleLock = async () => {
    if (!activePlan) return;
    try {
      const res = await fetch("/api/admin/diet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietPlanId: activePlan.id,
          isLocked: !isLocked,
        }),
      });

      if (res.ok) {
        setIsLocked(!isLocked);
        addToast("success", `Diet plan is now ${!isLocked ? "LOCKED" : "UNLOCKED"}.`);
        if (selectedUser) fetchUserDetails(String(selectedUser.id));
      }
    } catch {
      addToast("error", "Failed to update lock setting.");
    }
  };

  // Save trainer commentary & stats edits
  const handleSavePlanEdits = async () => {
    if (!activePlan) return;
    try {
      const res = await fetch("/api/admin/diet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietPlanId: activePlan.id,
          trainerNotes,
          calories: editCalories,
          protein: editProtein,
          carbs: editCarbs,
          fat: editFat,
          meals: editMeals,
        }),
      });

      if (res.ok) {
        addToast("success", "Diet plan edits saved successfully.");
        if (selectedUser) fetchUserDetails(String(selectedUser.id));
      } else {
        addToast("error", "Failed to update plan.");
      }
    } catch {
      addToast("error", "Failed to reach servers.");
    }
  };

  // Delete manual meal from edit list
  const handleDeleteMeal = (mealIndex: number) => {
    setEditMeals(prev => prev.filter((_, idx) => idx !== mealIndex));
  };

  // Add manual meal to edit list
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealFormName || !mealFormItems) return;
    const newMeal = {
      meal: mealFormName,
      time: mealFormTime || "08:00 AM",
      calories: 300,
      protein: 20,
      carbs: 35,
      fat: 8,
      portionSize: "Regular Portion",
      items: mealFormItems.split(",").map(i => i.trim()),
      alternatives: [],
    };
    setEditMeals(prev => [...prev, newMeal]);
    setMealFormName("");
    setMealFormTime("");
    setMealFormItems("");
  };

  // Create manual diet from scratch
  const handleCreateManualDiet = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/admin/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          calories: editCalories,
          protein: editProtein,
          carbs: editCarbs,
          fat: editFat,
          meals: editMeals,
          trainerNotes,
          isLocked,
        }),
      });

      if (res.ok) {
        addToast("success", "Created custom manual diet plan.");
        setShowManualForm(false);
        fetchUserDetails(String(selectedUser.id));
        fetchUsers();
      } else {
        addToast("error", "Failed to create manual diet.");
      }
    } catch {
      addToast("error", "Server connection error.");
    }
  };

  // Log weight chart data config
  const chartData = weightLogs.length > 0 ? {
    labels: weightLogs.map(log => new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Member Weight Logs (kg)',
        data: weightLogs.map(log => log.weight),
        borderColor: '#E85A4F',
        backgroundColor: 'rgba(232, 90, 79, 0.05)',
        tension: 0.3,
        fill: true,
      }
    ]
  } : null;

  // Filtered users
  const filteredUsers = usersList.filter(
    u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isHydrated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      
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
                  : "bg-red-900/80 border border-red-700/50 text-red-300 backdrop-blur-md"
              }`}
            >
              {t.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/users")}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center border border-brand/30">
                <ShieldCheck className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold uppercase tracking-tight">Admin Portal</h1>
                <p className="text-xs text-gray-500">Diet & Progress Overseer</p>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (isLoggingOut) return;
              setIsLoggingOut(true);
              try { await logout(); } finally { window.location.replace("/login"); }
            }}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <LogOut className="w-4 h-4" /> {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User directory list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" /> Member Directory
            </h3>
            
            <input
              type="text"
              placeholder="Search user by name/email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 outline-none"
            />

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const hasPlan = u.dietPlans && u.dietPlans[0];
                  const isCurSelected = selectedUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3 border rounded-xl transition cursor-pointer flex justify-between items-center ${
                        isCurSelected 
                          ? 'bg-brand/10 border-brand' 
                          : 'bg-white/2 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{u.name || 'Member'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      </div>
                      
                      {hasPlan ? (
                        <div className="text-right shrink-0">
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            u.dietPlans[0].isLocked 
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {u.dietPlans[0].isLocked ? 'Locked' : 'Unlocked'}
                          </span>
                          <p className="text-[9px] text-gray-500 mt-1 font-mono">{u.dietPlans[0].calories} kcal</p>
                        </div>
                      ) : (
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500">None</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">No members matched search.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: selected user's details controls */}
        <div className="lg:col-span-2 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
          <AnimatePresence mode="wait">
            
            {detailsLoading ? (
              <motion.div
                key="loading-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Loading user files...</p>
              </motion.div>
            ) : selectedUser ? (
              <motion.div
                key="user-details"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Profile Biometrics Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-baseline pb-3 border-b border-white/5">
                    <div>
                      <h2 className="text-xl font-heading font-black text-white">{selectedUser.name || 'Member'}</h2>
                      <p className="text-xs text-gray-500">{selectedUser.email} · ID: {selectedUser.id}</p>
                    </div>
                    {profile && (
                      <span className="text-xs text-brand font-bold uppercase">{profile.fitnessGoal.replace('-', ' ')}</span>
                    )}
                  </div>

                  {profile ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-500 font-medium">Height / Weight</span>
                        <p className="font-bold text-white mt-1">{profile.height} cm / {profile.currentWeight} kg</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-500 font-medium">Target Weight</span>
                        <p className="font-bold text-white mt-1">{profile.targetWeight} kg</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-500 font-medium">Age / Gender</span>
                        <p className="font-bold text-white mt-1 capitalize">{profile.age} yrs / {profile.gender}</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-500 font-medium">Health Info</span>
                        <p className="font-bold text-red-400 mt-1 truncate" title={profile.healthConditions}>{profile.healthConditions || 'None'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No physiology profile configured for this user yet.</p>
                  )}
                </div>

                {/* Diet Plan Controls Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <h3 className="text-md font-heading font-bold uppercase flex items-center gap-1.5">
                      <Scale className="w-5 h-5 text-brand" /> 
                      {activePlan ? (activePlan.isManual ? 'Manual Active Diet Plan' : 'AI-Generated Active Diet Plan') : 'Active Diet Plan'}
                    </h3>
                    <div className="flex items-center gap-3">
                      {activePlan && (
                        <button
                          onClick={handleToggleLock}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                            isLocked 
                              ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300' 
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          {isLocked ? 'Locked' : 'Unlock'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowManualForm(true);
                          setEditMeals([]);
                        }}
                        className="px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1 hover:bg-brand-light transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Create Manual
                      </button>
                    </div>
                  </div>

                  {activePlan || showManualForm ? (
                    <div className="space-y-6">
                      
                      {/* Calories & Macros Inputs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Calories (kcal)</label>
                          <input
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Protein (g)</label>
                          <input
                            type="number"
                            value={editProtein}
                            onChange={(e) => setEditProtein(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Carbohydrates (g)</label>
                          <input
                            type="number"
                            value={editCarbs}
                            onChange={(e) => setEditCarbs(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fats (g)</label>
                          <input
                            type="number"
                            value={editFat}
                            onChange={(e) => setEditFat(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Meals list with deletes and additions */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Meals Setup</span>
                        <div className="space-y-2">
                          {editMeals.map((meal, idx) => (
                            <div key={idx} className="p-3 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center gap-3">
                              <div>
                                <h5 className="text-xs font-bold text-white">{meal.meal} <span className="text-gray-500">({meal.time})</span></h5>
                                <p className="text-[10px] text-gray-400 mt-0.5">{meal.items.join(", ")}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteMeal(idx)}
                                className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Meal Mini Form */}
                        <form onSubmit={handleAddMeal} className="bg-white/2 border border-dashed border-white/10 p-4 rounded-xl space-y-3">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Add New Meal Card</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Meal Name (e.g. Lunch)"
                              value={mealFormName}
                              onChange={(e) => setMealFormName(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Time (e.g. 01:30 PM)"
                              value={mealFormTime}
                              onChange={(e) => setMealFormTime(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Items (comma separated: Chicken breast, Quinoa salad)"
                            value={mealFormItems}
                            onChange={(e) => setMealFormItems(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition text-white"
                          >
                            <Plus className="w-3.5 h-3.5" /> Insert Meal
                          </button>
                        </form>
                      </div>

                      {/* Trainer Notes */}
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Trainer Commentary / Notes (Shown to member)</label>
                        <textarea
                          value={trainerNotes}
                          onChange={(e) => setTrainerNotes(e.target.value)}
                          placeholder="Add advice, overrides, or tips for this user..."
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl p-3 text-xs text-white resize-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        {showManualForm ? (
                          <>
                            <button
                              onClick={handleCreateManualDiet}
                              className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Manual Plan
                            </button>
                            <button
                              onClick={() => setShowManualForm(false)}
                              className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase rounded-xl transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleSavePlanEdits}
                            className="px-5 py-2.5 bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Plan Updates
                          </button>
                        )}
                      </div>

                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-6">This user does not have any diet plans yet.</p>
                  )}
                </div>

                {/* Users Progress Logs (Line Chart) */}
                {chartData && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-brand" /> User Progress Tracking
                    </h3>
                    <div className="h-48 w-full mt-2">
                      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </div>
                )}

                {/* Meal completions & Water history */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Meal Checklists History</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                      {mealLogs.map((log, index) => (
                        <div key={index} className="p-2 bg-white/2 border border-white/5 rounded-lg flex justify-between items-center">
                          <span>{log.mealName} ({new Date(log.date).toLocaleDateString('en-GB')})</span>
                          <span className="text-green-400 font-bold capitalize">{log.status}</span>
                        </div>
                      ))}
                      {mealLogs.length === 0 && (
                        <p className="text-xs text-gray-500 italic py-4">No meal logging history registered.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Water Hydration logs</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                      {waterLogs.map((log, index) => (
                        <div key={index} className="p-2 bg-white/2 border border-white/5 rounded-lg flex justify-between items-center">
                          <span>{new Date(log.createdAt).toLocaleDateString('en-GB')} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-blue-400 font-bold font-mono">+{log.amount} ml</span>
                        </div>
                      ))}
                      {waterLogs.length === 0 && (
                        <p className="text-xs text-gray-500 italic py-4">No water logs registered.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diet Chat Logs audit history */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Diet Chat Logs Audit History</span>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                    {chatLogs.map((msg, index) => (
                      <div key={index} className={`flex flex-col p-2.5 rounded-xl border ${
                        msg.role === 'user' 
                          ? 'bg-brand/5 border-brand/20 align-end' 
                          : 'bg-white/2 border-white/5'
                      }`}>
                        <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">{msg.role === 'user' ? 'Member' : 'AI Assistant'}</span>
                        <p className="text-gray-300 leading-normal">{msg.content}</p>
                      </div>
                    ))}
                    {chatLogs.length === 0 && (
                      <p className="text-xs text-gray-500 italic py-4 text-center">No chat logs recorded with user.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="select-welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-brand/5 blur-[80px]" />
                <Sparkles className="w-12 h-12 text-brand/35 mb-4 animate-bounce" />
                <h3 className="text-2xl font-heading font-black uppercase text-white mb-2">Trainer Control Deck</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Select a member from the directory panel on the left to lock, adjust, manually design, or oversee their nutritional strategies and logs.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}

export default function AdminDietsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminDietsPageContent />
    </Suspense>
  );
}
