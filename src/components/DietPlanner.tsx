"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Apple, Flame, Sparkles,
  Check, User, AlertCircle,
  Droplets, Dumbbell, ShoppingCart, MessageSquare,
  TrendingUp, Printer, Plus, Clock, ShieldAlert,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

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

interface Meal {
  meal: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: string;
  items: string[];
  alternatives?: Array<{
    item: string;
    replacements: string[];
  }>;
}

interface DietPlan {
  id: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  meals: Meal[];
  goal: string;
  preference: string;
  height?: number;
  weight?: number;
  age?: number;
  activityLevel?: string;
  allergies?: string;
  budget?: string;
  waterGoal?: number;
  micronutrients?: Record<string, string> | string;
  groceryList?: Record<string, string[]> | string;
  supplementRecommendations?: { items: string[]; disclaimer: string } | string;
  isLocked?: boolean;
  trainerNotes?: string;
  createdAt?: string | Date;
}

interface UserProfile {
  age: number;
  gender: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  bodyFat?: number;
  activityLevel: string;
  workoutFrequency?: number;
  workoutTiming?: string;
  fitnessGoal: string;
  healthConditions?: string;
  allergies?: string;
  preference: string;
  restrictions?: string;
  excludedFoods?: string;
  budget?: string;
  wakeUpTime?: string;
  breakfastTime?: string;
  midMorningTime?: string;
  lunchTime?: string;
  eveningSnackTime?: string;
  dinnerTime?: string;
  bedtimeMealTime?: string;
  remindersEnabled?: string;
}

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'thyroid', label: 'Thyroid' },
  { id: 'pcos', label: 'PCOS' },
  { id: 'hypertension', label: 'High Blood Pressure' },
  { id: 'cholesterol', label: 'Cholesterol' },
  { id: 'kidney', label: 'Kidney Disease' },
  { id: 'liver', label: 'Liver Disease' },
  { id: 'allergies', label: 'Food Allergies' },
  { id: 'lactose', label: 'Lactose Intolerance' },
  { id: 'gluten', label: 'Gluten Intolerance' }
];

const RESTRICTIONS = [
  { id: 'jain', label: 'Jain' },
  { id: 'halal', label: 'Halal' },
  { id: 'no-beef', label: 'No Beef' },
  { id: 'no-pork', label: 'No Pork' }
];

const BUDGETS = [
  { id: '50', label: '₹50/day' },
  { id: '100', label: '₹100/day' },
  { id: '150', label: '₹150/day' },
  { id: '250', label: '₹250/day' },
  { id: '500', label: '₹500/day' },
  { id: '1000', label: '₹1000/day' },
  { id: 'no-limit', label: 'No Budget Limit' }
];

const GOALS = [
  { id: 'weight-loss', label: 'Weight Loss' },
  { id: 'fat-loss', label: 'Fat Loss' },
  { id: 'muscle-gain', label: 'Muscle Gain' },
  { id: 'lean-bulk', label: 'Lean Bulk' },
  { id: 'body-recomp', label: 'Body Recomposition' },
  { id: 'maintain', label: 'Maintain Weight' }
];

const PREFERENCES = [
  { id: 'veg', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'eggitarian', label: 'Eggitarian' },
  { id: 'non-veg', label: 'Non-Vegetarian' }
];

export default function DietPlanner() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'plan' | 'water' | 'grocery' | 'progress' | 'chat'>('plan');

  // Core State
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  interface Metrics { bmi: number; bmr: number; tdee: number; targetCalories: number; targetWater: number; }
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Loaders
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Profile State
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [workoutFrequency, setWorkoutFrequency] = useState(4);
  const [workoutTiming, setWorkoutTiming] = useState('Evening');
  const [fitnessGoal, setFitnessGoal] = useState('fat-loss');
  const [preference, setPreference] = useState('veg');
  const [budget, setBudget] = useState('no-limit');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [excludedFoods, setExcludedFoods] = useState('');
  const [allergies, setAllergies] = useState('');

  // Reminders & Timings
  const [wakeUpTime, setWakeUpTime] = useState('06:00 AM');
  const [breakfastTime, setBreakfastTime] = useState('08:30 AM');
  const [midMorningTime, setMidMorningTime] = useState('11:00 AM');
  const [lunchTime, setLunchTime] = useState('01:30 PM');
  const [eveningSnackTime, setEveningSnackTime] = useState('05:30 PM');
  const [dinnerTime, setDinnerTime] = useState('08:30 PM');
  const [bedtimeMealTime, setBedtimeMealTime] = useState('10:00 PM');
  
  const [reminders, setReminders] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    water: true,
  });

  // Trackers State
  const [waterTotal, setWaterTotal] = useState(0);
  interface WaterLog { id: number; amount: number; createdAt: string; }
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [mealsLogged, setMealsLogged] = useState<Record<string, boolean>>({});
  interface WeightLog { date: string; weight: number; bmi?: number; bodyFat?: number; waist?: number; chest?: number; arms?: number; thighs?: number; }
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

  // Log Modal Weight State
  const [logWeight, setLogWeight] = useState<number>(70);
  const [logBodyFat, setLogBodyFat] = useState<number | ''>('');
  const [logWaist, setLogWaist] = useState<number | ''>('');
  const [logChest, setLogChest] = useState<number | ''>('');
  const [logArms, setLogArms] = useState<number | ''>('');
  const [logThighs, setLogThighs] = useState<number | ''>('');

  // AI Chat State
  interface ChatMsg { role: string; content: string; }
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Grocery Checked List
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  // Protect client route
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/diet');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Load User Data
  const loadUserData = useCallback(async () => {
    setProfileLoading(true);
    try {
      // 1. Fetch Profile
      const profileRes = await fetch('/api/diet/profile');
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.profile) {
          setProfile(data.profile);
          setMetrics(data.metrics);
          setAge(data.profile.age);
          setGender(data.profile.gender);
          setHeight(data.profile.height);
          setWeight(data.profile.currentWeight);
          setTargetWeight(data.profile.targetWeight);
          setBodyFat(data.profile.bodyFat || '');
          setActivityLevel(data.profile.activityLevel);
          setWorkoutFrequency(data.profile.workoutFrequency || 4);
          setWorkoutTiming(data.profile.workoutTiming || 'Evening');
          setFitnessGoal(data.profile.fitnessGoal);
          setPreference(data.profile.preference);
          setBudget(data.profile.budget || 'no-limit');
          setExcludedFoods(data.profile.excludedFoods || '');
          setAllergies(data.profile.allergies || '');
          setWakeUpTime(data.profile.wakeUpTime || '06:00 AM');
          setBreakfastTime(data.profile.breakfastTime || '08:30 AM');
          setMidMorningTime(data.profile.midMorningTime || '11:00 AM');
          setLunchTime(data.profile.lunchTime || '01:30 PM');
          setEveningSnackTime(data.profile.eveningSnackTime || '05:30 PM');
          setDinnerTime(data.profile.dinnerTime || '08:30 PM');
          setBedtimeMealTime(data.profile.bedtimeMealTime || '10:00 PM');
          
          if (data.profile.healthConditions) {
            setSelectedConditions(data.profile.healthConditions.split(',').filter(Boolean));
          }
          if (data.profile.restrictions) {
            setSelectedRestrictions(data.profile.restrictions.split(',').filter(Boolean));
          }
          if (data.profile.remindersEnabled) {
            try {
              setReminders(JSON.parse(data.profile.remindersEnabled));
            } catch {}
          }
        } else {
          setIsEditingProfile(true);
        }
      }

      // 2. Fetch Diet History / Active Diet
      const dietRes = await fetch('/api/diet/history');
      if (dietRes.ok) {
        const data = await dietRes.json();
        if (data.length > 0) {
          setActivePlan(data[0]);
        }
      }

      // 3. Fetch Water Logs
      const waterRes = await fetch('/api/diet/water');
      if (waterRes.ok) {
        const data = await waterRes.json();
        setWaterTotal(data.total);
        setWaterLogs(data.logs);
      }

      // 4. Fetch Meal Checklist
      const mealsRes = await fetch('/api/diet/meals');
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        const map: Record<string, boolean> = {};
        data.forEach((log: { mealName: string; status: string }) => {
          map[log.mealName] = log.status === 'completed';
        });
        setMealsLogged(map);
      }

      // 5. Fetch Progress History
      const progressRes = await fetch('/api/diet/progress');
      if (progressRes.ok) {
        const data = await progressRes.json();
        setWeightLogs(data);
      }

      // 6. Fetch Chat History
      const chatRes = await fetch('/api/diet/chat');
      if (chatRes.ok) {
        const data = await chatRes.json();
        setChatMessages(data);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, loadUserData]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: UserProfile = {
        age,
        gender,
        height,
        currentWeight: weight,
        targetWeight,
        bodyFat: bodyFat === '' ? undefined : bodyFat,
        activityLevel,
        workoutFrequency,
        workoutTiming,
        fitnessGoal,
        preference,
        budget,
        excludedFoods,
        allergies,
        healthConditions: selectedConditions.join(','),
        restrictions: selectedRestrictions.join(','),
        wakeUpTime,
        breakfastTime,
        midMorningTime,
        lunchTime,
        eveningSnackTime,
        dinnerTime,
        bedtimeMealTime,
        remindersEnabled: JSON.stringify(reminders),
      };

      const res = await fetch('/api/diet/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setMetrics(data.metrics);
        setIsEditingProfile(false);
        // Refresh weights list
        loadUserData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save profile.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Diet Plan Generation
  const handleGenerateDiet = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/diet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setActivePlan(data);
        loadUserData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to generate diet plan.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Health Condition Selection
  const toggleCondition = (id: string) => {
    setSelectedConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Toggle Restrictions Selection
  const toggleRestriction = (id: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Toggle Reminder
  const toggleReminder = (key: 'breakfast' | 'lunch' | 'dinner' | 'water') => {
    const updated = { ...reminders, [key]: !reminders[key] };
    setReminders(updated);
    // Auto save if profile exists
    if (profile) {
      fetch('/api/diet/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, currentWeight: profile.currentWeight, remindersEnabled: JSON.stringify(updated) }),
      });
    }
  };

  // Water Log Quick Add
  const handleAddWater = async (amount: number) => {
    try {
      const res = await fetch('/api/diet/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setWaterTotal(data.total);
        setWaterLogs(prev => [data.log, ...prev]);
      }
    } catch {}
  };

  // Water Log Reset
  const handleResetWater = async () => {
    try {
      const res = await fetch('/api/diet/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        setWaterTotal(0);
        setWaterLogs([]);
      }
    } catch {}
  };

  // Log Progress Stats
  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/diet/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: logWeight,
          bodyFat: logBodyFat === '' ? null : logBodyFat,
          waist: logWaist === '' ? null : logWaist,
          chest: logChest === '' ? null : logChest,
          arms: logArms === '' ? null : logArms,
          thighs: logThighs === '' ? null : logThighs,
        }),
      });

      if (res.ok) {
        setLogBodyFat('');
        setLogWaist('');
        setLogChest('');
        setLogArms('');
        setLogThighs('');
        loadUserData();
      }
    } catch {}
  };

  // Meal consumption log toggle
  const toggleMealCompleted = async (mealName: string) => {
    if (!activePlan) return;
    const current = !!mealsLogged[mealName];
    try {
      const res = await fetch('/api/diet/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietPlanId: activePlan.id,
          mealName,
          status: current ? 'uncompleted' : 'completed',
        }),
      });

      if (res.ok) {
        setMealsLogged(prev => ({
          ...prev,
          [mealName]: !current,
        }));
      }
    } catch {}
  };

  // AI Swap Replacement
  const handleSwapItem = async (originalItem: string, replacementItem: string) => {
    if (!activePlan) return;
    setLoading(true);
    try {
      const res = await fetch('/api/diet/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Replace "${originalItem}" with "${replacementItem}" in my active diet plan.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // The chat endpoint returns the updatedPlan
        if (data.updatedPlan) {
          setActivePlan(data.updatedPlan);
          loadUserData();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Chat message send
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !activePlan) return;

    const userMsgText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    const tempUserMsg = { id: Math.random().toString(), role: 'user', content: userMsgText, createdAt: new Date() };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/diet/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText }),
      });

      if (res.ok) {
        const data = await res.json();
        const tempBotMsg = { id: Math.random().toString(), role: 'assistant', content: data.response, createdAt: new Date() };
        setChatMessages(prev => [...prev, tempBotMsg]);

        if (data.updatedPlan) {
          setActivePlan(data.updatedPlan);
        }
      } else {
        const tempBotMsg = { id: Math.random().toString(), role: 'assistant', content: 'Sorry, I failed to process that request. Make sure your diet plan is unlocked.', createdAt: new Date() };
        setChatMessages(prev => [...prev, tempBotMsg]);
      }
    } catch {
      const tempBotMsg = { id: Math.random().toString(), role: 'assistant', content: 'Connection timed out.', createdAt: new Date() };
      setChatMessages(prev => [...prev, tempBotMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Toggle grocery check
  const toggleGroceryChecked = (item: string) => {
    setCheckedGroceries(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Print support
  const handlePrint = () => {
    window.print();
  };

  // Parse details
  const parsedMeals: Meal[] = activePlan?.meals 
    ? (typeof activePlan.meals === 'string' ? JSON.parse(activePlan.meals) : activePlan.meals) 
    : [];

  const parsedGroceryList: Record<string, string[]> = activePlan?.groceryList
    ? (typeof activePlan.groceryList === 'string' ? JSON.parse(activePlan.groceryList) : activePlan.groceryList)
    : {};

  const parsedSupplements: { items: string[]; disclaimer: string } = activePlan?.supplementRecommendations
    ? (typeof activePlan.supplementRecommendations === 'string' ? JSON.parse(activePlan.supplementRecommendations) : activePlan.supplementRecommendations)
    : { items: [], disclaimer: '' };

  const parsedMicros: Record<string, string> = activePlan?.micronutrients
    ? (typeof activePlan.micronutrients === 'string' ? JSON.parse(activePlan.micronutrients) : activePlan.micronutrients)
    : {};

  // Hydrating Loader
  if (!isHydrated || profileLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Loading Nutrition Portal...</p>
        </div>
      </div>
    );
  }

  // Weight Chart Data
  const chartData = {
    labels: weightLogs.map(log => new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightLogs.map(log => log.weight),
        borderColor: '#E85A4F', // Brand primary color
        backgroundColor: 'rgba(232, 90, 79, 0.05)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#E85A4F',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 selection:bg-brand/20">
      
      {/* ─────────────────────────────────────────────────────────────
          PORTAL HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 print:hidden">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[3px] text-brand">Premium Feature Upgrade</span>
          <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter mt-1 flex items-center gap-2">
            AI Nutrition <span className="text-brand">Hub</span>
            <Sparkles className="w-5 h-5 text-brand animate-pulse" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track daily calories, macros, hydration, log body metrics, and adapt meals in real-time with your AI assistant.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {activePlan && (
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Export / Print Plan
            </button>
          )}
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-neon hover:bg-brand-light transition"
          >
            <User className="w-3.5 h-3.5" /> {isEditingProfile ? 'Close Settings' : 'Edit Health & Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SETTINGS / EDIT PROFILE FORM
      ───────────────────────────────────────────────────────────── */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 md:p-8 space-y-6 backdrop-blur-xl print:hidden"
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="text-xl font-heading font-bold uppercase tracking-tight flex items-center gap-2">
              <User className="text-brand w-5 h-5" /> Physiology & Dietary Settings
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Configure Profile</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Row 1: Biometrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                  min="5" max="110" required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white [appearance:textfield] outline-none"
                  min="50" max="250" required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                  min="20" max="250" required
                />
              </div>
            </div>

            {/* Row 2: Targets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                  min="20" max="250" required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Body Fat % (Optional)</label>
                <input
                  type="number"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                  min="1" max="60"
                  placeholder="e.g. 15%"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                >
                  {GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Daily Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                >
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="light">Lightly Active (1-3 days/wk)</option>
                  <option value="moderate">Moderately Active (3-5 days/wk)</option>
                  <option value="active">Highly Active (Daily heavy training)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Timings & Frequency */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/2 p-4 rounded-2xl border border-white/5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Workout Freq (/wk)</label>
                <input
                  type="number"
                  value={workoutFrequency}
                  onChange={(e) => setWorkoutFrequency(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                  min="0" max="7"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Workout Timing</label>
                <input
                  type="text"
                  value={workoutTiming}
                  onChange={(e) => setWorkoutTiming(e.target.value)}
                  placeholder="e.g. 6:00 PM"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Daily Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                >
                  {BUDGETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Diet Preference</label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none"
                >
                  {PREFERENCES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Health Conditions Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold">Health Information / Conditions</label>
              <div className="flex flex-wrap gap-2">
                {HEALTH_CONDITIONS.map(item => {
                  const selected = selectedConditions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCondition(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        selected 
                          ? 'bg-red-500/20 border-red-500 text-red-300' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Restrictions Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {RESTRICTIONS.map(item => {
                  const selected = selectedRestrictions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRestriction(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        selected 
                          ? 'bg-brand/20 border-brand text-brand-light' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exclusions & Allergies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Allergies / Exclusions</label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Seafood, Dairy"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Excluded Foods (Never Include)</label>
                <input
                  type="text"
                  placeholder="e.g. White Sugar, Soya sauce, Pork, Beef"
                  value={excludedFoods}
                  onChange={(e) => setExcludedFoods(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>
            </div>

            {/* Meal Timings */}
            <div className="bg-white/2 p-5 rounded-2xl border border-white/5 space-y-4">
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Meal Timing Schedule</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Wake Up', val: wakeUpTime, set: setWakeUpTime },
                  { label: 'Breakfast', val: breakfastTime, set: setBreakfastTime },
                  { label: 'Mid Morning', val: midMorningTime, set: setMidMorningTime },
                  { label: 'Lunch', val: lunchTime, set: setLunchTime },
                  { label: 'Evening Snack', val: eveningSnackTime, set: setEveningSnackTime },
                  { label: 'Dinner', val: dinnerTime, set: setDinnerTime },
                  { label: 'Bedtime Meal', val: bedtimeMealTime, set: setBedtimeMealTime },
                ].map(timeObj => (
                  <div key={timeObj.label}>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">{timeObj.label}</label>
                    <input
                      type="text"
                      value={timeObj.val}
                      onChange={(e) => timeObj.set(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 focus:border-brand text-xs px-2.5 py-2 rounded-xl text-white outline-none text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders Toggles */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-brand" /> Meal Reminders
              </label>
              <div className="flex flex-wrap gap-4 bg-white/2 p-4 rounded-xl border border-white/5">
                {[
                  { key: 'breakfast', label: 'Breakfast' },
                  { key: 'lunch', label: 'Lunch' },
                  { key: 'dinner', label: 'Dinner' },
                  { key: 'water', label: 'Water Hydration' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => toggleReminder(item.key as 'breakfast' | 'lunch' | 'dinner' | 'water')}
                      className={`w-10 h-6.5 rounded-full transition relative border ${
                        reminders[item.key as keyof typeof reminders] 
                          ? 'bg-brand border-brand' 
                          : 'bg-white/10 border-white/10'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        reminders[item.key as keyof typeof reminders] ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <span className="text-xs font-semibold text-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-light transition disabled:opacity-50"
              >
                {loading ? 'Saving Settings...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CALORIES & METRICS SUMMARY CARDS (Top dashboard row)
      ───────────────────────────────────────────────────────────── */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="bg-surface border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Metabolic Rate (BMR)</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl md:text-3xl font-heading font-black">{metrics.bmr}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">kcal/day</span>
            </div>
          </div>
          <div className="bg-surface border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Energy Output (TDEE)</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl md:text-3xl font-heading font-black">{metrics.tdee}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">kcal/day</span>
            </div>
          </div>
          <div className="bg-surface border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Recommended Daily Intake</span>
            <div className="flex items-baseline gap-1 mt-2 text-brand">
              <span className="text-2xl md:text-3xl font-heading font-black">{metrics.targetCalories}</span>
              <span className="text-[10px] font-bold uppercase">kcal</span>
            </div>
          </div>
          <div className="bg-surface border border-surfaceBorder rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Calculated BMI</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl md:text-3xl font-heading font-black">{metrics.bmi}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                metrics.bmi < 18.5 ? 'bg-yellow-500/10 text-yellow-500' :
                metrics.bmi < 25 ? 'bg-green-500/10 text-green-400' :
                metrics.bmi < 30 ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {metrics.bmi < 18.5 ? 'Underweight' :
                 metrics.bmi < 25 ? 'Normal' :
                 metrics.bmi < 30 ? 'Overweight' : 'Obese'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PORTAL TABS NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4 scrollbar-none pb-0.5 print:hidden">
        {[
          { id: 'plan', label: 'Diet Plan Schedule', icon: Apple },
          { id: 'water', label: 'Water Log', icon: Droplets },
          { id: 'grocery', label: 'Weekly Grocery List', icon: ShoppingCart },
          { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
          { id: 'chat', label: 'AI Diet Assistant', icon: MessageSquare },
        ].map(tab => {
          const Active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'plan' | 'water' | 'grocery' | 'progress' | 'chat')}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-bold uppercase tracking-wider text-xs whitespace-nowrap transition ${
                Active 
                  ? 'border-brand text-white font-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB CONTENT PANELS
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        
        {/* 1. DIET PLAN SCHEDULE */}
        {activeTab === 'plan' && (
          <motion.div
            key="plan-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {activePlan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Panel: Macros overview & progress rings */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Circular Calorie Tracker Card */}
                  <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-brand/5 blur-[50px] pointer-events-none" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">Calorie Split Targets</span>
                    
                    {/* Ring Container */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" strokeWidth="10" stroke="rgba(255,255,255,0.05)" fill="transparent" />
                        <circle cx="80" cy="80" r="70" strokeWidth="10" stroke="#E85A4F" fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={0}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <Flame className="w-6 h-6 text-orange-400 animate-pulse mb-1" />
                        <span className="text-3xl font-heading font-black">{activePlan.calories}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">kcal / day</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6 text-xs font-semibold text-gray-400">
                      <div>Goal: <span className="text-white capitalize">{activePlan.goal.replace('-', ' ')}</span></div>
                      <div>•</div>
                      <div>Pref: <span className="text-brand-light uppercase">{activePlan.preference}</span></div>
                    </div>

                    {activePlan.trainerNotes && (
                      <div className="mt-4 pt-4 border-t border-white/5 w-full text-left bg-brand/5 p-4 rounded-2xl border border-brand/10">
                        <p className="text-[10px] text-brand font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> Trainer Notes
                        </p>
                        <p className="text-xs text-gray-300 italic">{activePlan.trainerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Macros & Fiber/Sugar Progress bars */}
                  <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl space-y-4">
                    <h3 className="text-xs uppercase tracking-[3px] text-gray-400 font-bold">Macronutrients Split</h3>
                    
                    {/* Protein bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Protein</span>
                        <span className="text-white font-mono">{activePlan.protein}g</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Carbs bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Carbs</span>
                        <span className="text-white font-mono">{activePlan.carbs}g</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Fats bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Fats</span>
                        <span className="text-white font-mono">{activePlan.fat}g</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Fiber & Sugar */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Fiber</span>
                        <p className="text-sm font-bold text-white mt-0.5">{activePlan.fiber || 0}g</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Sugar Limit</span>
                        <p className="text-sm font-bold text-white mt-0.5">{activePlan.sugar || 0}g</p>
                      </div>
                    </div>
                  </div>

                  {/* Micronutrients */}
                  {Object.keys(parsedMicros).length > 0 && (
                    <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl space-y-3">
                      <h3 className="text-xs uppercase tracking-[3px] text-gray-400 font-bold">Estimated Micronutrients</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(parsedMicros).map(([key, val]) => (
                          <div key={key} className="bg-white/2 p-2.5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-gray-500 font-bold capitalize">{key.replace('vitamin', 'Vit ')}</span>
                            <p className="font-bold text-white mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* locked state */}
                  {activePlan.isLocked && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-2xl flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-semibold">Locked by trainer. User modifications disabled.</p>
                    </div>
                  )}

                </div>

                {/* Right Panel: Meals Timeline & replacements */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-[4px] text-gray-500 font-bold">Daily Meal Timeline</h3>
                    <span className="text-xs text-gray-500 font-medium">Log meal consumption</span>
                  </div>

                  <div className="space-y-4">
                    {parsedMeals.map((mealItem, index) => {
                      const completed = !!mealsLogged[mealItem.meal];
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-4 border rounded-2xl p-5 transition-all bg-surface ${
                            completed ? 'border-green-500/30' : 'border-surfaceBorder hover:border-brand/20'
                          }`}
                        >
                          {/* Checklist circle */}
                          <button
                            onClick={() => toggleMealCompleted(mealItem.meal)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex justify-between items-baseline gap-2">
                              <div>
                                <h4 className={`font-bold text-sm text-white ${completed ? 'line-through text-gray-500' : ''}`}>{mealItem.meal}</h4>
                                <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3 text-brand" /> {mealItem.time || 'Schedule slot'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 font-mono">
                                {mealItem.calories} kcal · P: {mealItem.protein}g · C: {mealItem.carbs}g · F: {mealItem.fat}g
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {mealItem.items.map((item, j) => (
                                <span key={j} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                                  {item}
                                </span>
                              ))}
                            </div>

                            {mealItem.portionSize && (
                              <div className="text-[10px] text-gray-500">
                                Portion: <span className="font-semibold text-gray-300">{mealItem.portionSize}</span>
                              </div>
                            )}

                            {/* Replacements dropdown */}
                            {!activePlan.isLocked && mealItem.alternatives && mealItem.alternatives.length > 0 && (
                              <div className="pt-2 border-t border-white/5 space-y-1.5 print:hidden">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Replace With alternatives:</span>
                                <div className="flex flex-col gap-2">
                                  {mealItem.alternatives.map((alt, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] text-gray-400 font-medium">{alt.item} →</span>
                                      {alt.replacements.map((repl, rIdx) => (
                                        <button
                                          key={rIdx}
                                          onClick={() => handleSwapItem(alt.item, repl)}
                                          disabled={loading}
                                          className="text-[9px] px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand-light font-bold hover:bg-brand/20 transition disabled:opacity-50"
                                        >
                                          {repl}
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Supplements guide */}
                  {parsedSupplements && parsedSupplements.items && parsedSupplements.items.length > 0 && (
                    <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 space-y-3">
                      <h4 className="text-xs font-heading font-bold uppercase text-white flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-brand" /> Recommended Supplements
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedSupplements.items.map((supp, i) => (
                          <span key={i} className="text-[10px] px-3 py-1 rounded-xl bg-brand/15 border border-brand/20 text-brand-light font-bold">
                            {supp}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 italic leading-relaxed pt-2 border-t border-white/5">
                        ⚠️ Disclaimer: {parsedSupplements.disclaimer}
                      </p>
                    </div>
                  )}

                  {/* print only footer */}
                  <div className="hidden print:block text-center text-xs text-gray-500 pt-8 border-t border-dashed border-white/10">
                    Generated via AI Nutrition Planner on Pinaka Fitness Gym Management.
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-12 text-center max-w-lg mx-auto flex flex-col items-center">
                <Apple className="w-12 h-12 text-brand/30 mb-4" />
                <h3 className="text-xl font-heading font-bold uppercase">No Diet Plan Generated</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">
                  Set up your profile settings and click below to construct a custom dietary plan tailored for your metabolism.
                </p>
                <button
                  onClick={handleGenerateDiet}
                  disabled={loading}
                  className="px-6 py-3 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-neon hover:bg-brand-light transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 animate-spin" /> Generate AI Diet Plan
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* 2. WATER LOG TRACKER */}
        {activeTab === 'water' && (
          <motion.div
            key="water-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto space-y-6"
          >
            <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 md:p-8 space-y-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 blur-[50px] pointer-events-none" />
              <Droplets className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-bounce" />
              
              <div>
                <h3 className="text-xl font-heading font-bold uppercase">Water Consumption Logs</h3>
                <p className="text-gray-400 text-xs mt-1">Recommended daily water intake is dynamically calculated.</p>
              </div>

              {/* Progress Circle or Bar */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl max-w-sm mx-auto space-y-2">
                <span className="text-[10px] text-blue-400 font-bold uppercase">Today&apos;s Consumption</span>
                <p className="text-4xl font-heading font-black text-white">{waterTotal} ml</p>
                {metrics && (
                  <p className="text-xs text-gray-400">Goal: {metrics.targetWater} Liters ({Math.round(metrics.targetWater * 1000)} ml)</p>
                )}
                
                {/* Progress bar */}
                {metrics && (
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mt-3">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min((waterTotal / (metrics.targetWater * 1000)) * 100, 100)}%` }} />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <button
                  onClick={() => handleAddWater(250)}
                  className="py-3 bg-blue-600/20 border border-blue-500/30 text-blue-200 hover:bg-blue-600/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> Add +250ml
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="py-3 bg-blue-600 border border-blue-500 text-white hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition shadow-lg shadow-blue-500/10"
                >
                  <Plus className="w-4 h-4" /> Add +500ml
                </button>
              </div>

              <button
                onClick={handleResetWater}
                className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase tracking-wider mt-4 block mx-auto transition"
              >
                Reset Intake Logs
              </button>
            </div>

            {/* History logs list */}
            <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 space-y-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hydration Logs History</span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {waterLogs.length > 0 ? (
                  waterLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="font-bold text-blue-400">+{log.amount} ml</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">No water logs registered for today yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. WEEKLY GROCERY LIST */}
        {activeTab === 'grocery' && (
          <motion.div
            key="grocery-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h3 className="text-xl font-heading font-bold uppercase tracking-tight flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-brand" /> Weekly Grocery List
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Check off shopping items</span>
              </div>

              {Object.keys(parsedGroceryList).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(parsedGroceryList).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-light border-b border-white/5 pb-1">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {items.map((item, idx) => {
                          const checked = !!checkedGroceries[item];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleGroceryChecked(item)}
                              className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                                checked 
                                  ? 'bg-white/2 border-white/5 opacity-55' 
                                  : 'bg-white/4 border-white/10 hover:border-brand/30'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                checked ? 'bg-brand border-brand text-white' : 'border-white/20'
                              }`}>
                                {checked && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span className={`text-xs ${checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-10">No grocery list generated yet. Create a diet plan first!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 4. PROGRESS TRACKING & CHARTS */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            
            {/* Chart Card */}
            {weightLogs.length > 0 && (
              <div className="bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Weight Tracking Curve</span>
                <div className="h-64 mt-4 w-full">
                  <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Logging Form Card */}
              <div className="lg:col-span-1 bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl">
                <h4 className="text-xs uppercase tracking-[3px] text-gray-500 font-bold mb-4">Log Today&apos;s Stats</h4>
                <form onSubmit={handleLogProgress} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      value={logWeight}
                      onChange={(e) => setLogWeight(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      min="20" required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Body Fat %</label>
                    <input
                      type="number"
                      value={logBodyFat}
                      onChange={(e) => setLogBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      placeholder="e.g. 15%"
                    />
                  </div>
                  
                  {/* Measurements */}
                  <div className="border-t border-white/5 pt-3 space-y-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Circumference (inches / cm)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold mb-1">Waist</label>
                        <input
                          type="number"
                          value={logWaist}
                          onChange={(e) => setLogWaist(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold mb-1">Chest</label>
                        <input
                          type="number"
                          value={logChest}
                          onChange={(e) => setLogChest(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold mb-1">Arms</label>
                        <input
                          type="number"
                          value={logArms}
                          onChange={(e) => setLogArms(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 font-bold mb-1">Thighs</label>
                        <input
                          type="number"
                          value={logThighs}
                          onChange={(e) => setLogThighs(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Save Log
                  </button>
                </form>
              </div>

              {/* History Table List */}
              <div className="lg:col-span-2 bg-surface border border-surfaceBorder rounded-[2rem] p-6 backdrop-blur-xl space-y-4">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Measurements Log History</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 font-bold uppercase text-[9px]">
                        <th className="py-2 pr-2">Date</th>
                        <th className="py-2 px-2">Weight</th>
                        <th className="py-2 px-2">BMI</th>
                        <th className="py-2 px-2">Fat%</th>
                        <th className="py-2 px-2">Waist</th>
                        <th className="py-2 px-2">Chest</th>
                        <th className="py-2 px-2">Arms</th>
                        <th className="py-2 px-2">Thighs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weightLogs.slice().reverse().map((log, index) => (
                        <tr key={index} className="border-b border-white/5 text-gray-300 font-mono">
                          <td className="py-2.5 pr-2 font-sans font-semibold text-white">{new Date(log.date).toLocaleDateString('en-GB')}</td>
                          <td className="py-2.5 px-2">{log.weight} kg</td>
                          <td className="py-2.5 px-2">{log.bmi || '—'}</td>
                          <td className="py-2.5 px-2">{log.bodyFat !== null ? `${log.bodyFat}%` : '—'}</td>
                          <td className="py-2.5 px-2">{log.waist !== null ? `${log.waist}"` : '—'}</td>
                          <td className="py-2.5 px-2">{log.chest !== null ? `${log.chest}"` : '—'}</td>
                          <td className="py-2.5 px-2">{log.arms !== null ? `${log.arms}"` : '—'}</td>
                          <td className="py-2.5 px-2">{log.thighs !== null ? `${log.thighs}"` : '—'}</td>
                        </tr>
                      ))}
                      {weightLogs.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-gray-500 italic">No progress logs recorded yet. Log your weights on the left!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* 5. AI DIET COACH CHAT PANEL */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-surface border border-surfaceBorder rounded-[2rem] h-[520px] flex flex-col overflow-hidden backdrop-blur-xl">
              
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-brand/5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-brand w-4 h-4" />
                  <div>
                    <h4 className="text-sm font-bold uppercase text-white leading-tight">Diet AI Coach</h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Dynamic adjustments bot</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              </div>

              {/* Message List */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-5 overflow-y-auto space-y-4 min-h-0"
              >
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-gray-200 text-xs px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] leading-relaxed">
                    👋 Hey! I&apos;m your specialized AI Sports Nutritionist. Ask me to substitute ingredients, customize meal schedules, or adjust targets:
                    <div className="mt-3 flex flex-col gap-1 text-[10px] text-brand-light font-bold">
                      <div>• &ldquo;I don&apos;t have chicken&rdquo;</div>
                      <div>• &ldquo;Replace rice with sweet potato&rdquo;</div>
                      <div>• &ldquo;I am fasting today&rdquo;</div>
                      <div>• &ldquo;I only eat vegetarian food&rdquo;</div>
                    </div>
                  </div>
                </div>

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`text-xs px-4 py-3 rounded-2xl leading-relaxed max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-brand text-white rounded-br-sm' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 text-gray-500 text-xs px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                      Adjusting plan...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-black/50">
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI Coach adjustments..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-brand/40 transition"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                  >
                    Send
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
