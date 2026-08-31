"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Fingerprint,
  Activity,
  Zap,
  Sparkles,
  ChevronRight,
  UserCheck,
  Dumbbell,
  Clock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Real-time HUD clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both access ID and security key.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, action: "login" }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
        const defaultTarget = data.user?.isOwner
          ? "/owner"
          : data.user?.isAdmin
          ? "/admin"
          : "/dashboard";
        const from =
          searchParams.get("from") ||
          searchParams.get("redirect") ||
          defaultTarget;
        router.push(from);
      } else {
        setError(data.error || "Authentication failed. Invalid member credentials.");
      }
    } catch {
      setError("Network anomaly detected. Please check connection & retry.");
    } finally {
      setLoading(false);
    }
  };

  const triggerBiometricScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const emailInput = document.getElementById("login-email");
      emailInput?.focus();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] text-white flex flex-col justify-between relative overflow-x-hidden selection:bg-brand selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. CINEMATIC GYM ATMOSPHERE & MULTI-LAYER LIGHTING BACKGROUND
      ────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep dark gym background image with cinematic contrast and tone */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format')`,
          }}
        />

        {/* Secondary gym silhouette / heavy training depth layer */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.18),transparent_55%)]"
        />

        {/* Bottom-left ambient atmospheric glow */}
        <div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[140px]"
        />

        {/* Top-center highlight halo */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[160px]"
        />

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/85 to-[#050508]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050508_95%)]" />

        {/* Subtle Cyber Perspective Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.4) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Faint Orbital Fitness / Telemetry Radar in background */}
        <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-violet-500/10 pointer-events-none hidden lg:block animate-[spin_120s_linear_infinite]">
          <div className="absolute inset-8 rounded-full border border-dashed border-violet-400/10" />
          <div className="absolute inset-24 rounded-full border border-violet-500/5" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-violet-500/15 to-transparent" />
          {/* Radar sweeping indicator */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(139,92,246,0.08)_360deg)] animate-[spin_12s_linear_infinite]" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP TACTICAL NAVIGATION & STATUS BAR
      ────────────────────────────────────────────────────────────── */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/40 text-xs font-heading font-medium tracking-wider text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-violet-400 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO OVERVIEW</span>
        </Link>

        {/* Brand & Security Status HUD */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Real-time Clock (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/40 border border-white/5 rounded-lg px-3 py-1 backdrop-blur-md">
            <Clock className="w-3 h-3 text-violet-400" />
            <span className="tracking-widest">{currentTime || "00:00:00"}</span>
            <span className="text-[9px] text-violet-400 font-bold uppercase ml-1">SYS.ONLINE</span>
          </div>

          {/* Node Status Indicator */}
          <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-500/30 rounded-full px-3 py-1 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-violet-200 uppercase">
              NODE P-01 ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN STAGE: CINEMATIC DUAL-ZONE PORTAL
      ────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ───────────────────────────────────────────────────────────
              LEFT COLUMN: ELITE ATHLETIC TELEMETRY (Hidden on Small Screens)
          ──────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4"
          >
            {/* Supercharged Brand Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gradient-to-r from-violet-500/20 to-transparent border-l-2 border-violet-500 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-violet-300">
                  PINAKA ATHLETIC ECOSYSTEM
                </span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-heading font-black tracking-tight uppercase leading-[1.08] text-white">
                ELITE MEMBER <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                  ACCESS MATRIX
                </span>
              </h1>

              <p className="mt-4 text-sm xl:text-base text-gray-400 leading-relaxed max-w-md font-sans font-normal">
                Synchronize with next-generation biometric telemetry, AI-driven performance training protocols, and exclusive facility privileges.
              </p>
            </div>

            {/* Live Club Telemetry HUD Display */}
            <div className="grid grid-cols-2 gap-3.5 max-w-lg">
              {/* Telemetry Card 1 */}
              <div className="group p-3.5 rounded-2xl bg-[#0b0b12]/80 border border-white/[0.07] hover:border-violet-500/40 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-violet-600/20 transition-colors" />
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                </div>
                <div className="text-lg font-heading font-bold text-white tracking-wide">AI SCANNER</div>
                <div className="text-[11px] text-gray-400">Neural Form & Pose Feedback</div>
              </div>

              {/* Telemetry Card 2 */}
              <div className="group p-3.5 rounded-2xl bg-[#0b0b12]/80 border border-white/[0.07] hover:border-violet-500/40 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-violet-600/20 transition-colors" />
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-violet-400 bg-violet-950/40 border border-violet-500/20 px-1.5 py-0.5 rounded">
                    TIER 1
                  </span>
                </div>
                <div className="text-lg font-heading font-bold text-white tracking-wide">CUSTOM DIETS</div>
                <div className="text-[11px] text-gray-400">Targeted Macro Fueling</div>
              </div>

              {/* Telemetry Card 3 */}
              <div className="group p-3.5 rounded-2xl bg-[#0b0b12]/80 border border-white/[0.07] hover:border-violet-500/40 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-violet-600/20 transition-colors" />
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-violet-300 bg-violet-950/40 border border-violet-500/20 px-1.5 py-0.5 rounded">
                    SYNCED
                  </span>
                </div>
                <div className="text-lg font-heading font-bold text-white tracking-wide">ATTENDANCE</div>
                <div className="text-[11px] text-gray-400">Automated Smart Check-in</div>
              </div>

              {/* Telemetry Card 4 */}
              <div className="group p-3.5 rounded-2xl bg-[#0b0b12]/80 border border-white/[0.07] hover:border-violet-500/40 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-violet-600/20 transition-colors" />
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    ENCRYPTED
                  </span>
                </div>
                <div className="text-lg font-heading font-bold text-white tracking-wide">PRIVATE VAULT</div>
                <div className="text-[11px] text-gray-400">Secure Member Profile</div>
              </div>
            </div>

            {/* Quote / Ethos */}
            <div className="flex items-center gap-3 pt-2 text-xs text-gray-400 border-t border-white/5 max-w-lg">
              <Shield className="w-4 h-4 text-violet-400 shrink-0" />
              <span>
                Exclusive access reserved for verified Pinaka Club athletes & staff.
              </span>
            </div>
          </motion.div>

          {/* ───────────────────────────────────────────────────────────
              RIGHT COLUMN: HIGH-TECH AUTHORIZATION CONSOLE (THE PORTAL)
          ──────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            {/* Exterior Frame with Glowing Precision Border */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-violet-500/40 via-white/10 to-violet-500/10 shadow-[0_0_50px_rgba(139,92,246,0.18)]">
              
              {/* Top Accent Energy Flare */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_#a78bfa]" />

              {/* Main Console Interior */}
              <div className="relative bg-[#0a0a10]/95 backdrop-blur-2xl rounded-[23px] p-6 sm:p-9 overflow-hidden">
                
                {/* Subtle Interior Lighting Sheen */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Console Header & Branding */}
                <div className="text-center mb-8 relative">
                  {/* Pinaka Official Logo */}
                  <Link href="/" className="inline-block group mb-3 focus:outline-none">
                    <div className="relative w-28 h-12 mx-auto transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/logo0.png"
                        alt="Pinaka Fitness"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                      />
                    </div>
                  </Link>

                  {/* Header Title with Gym-Tech styling */}
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-violet-500/60" />
                    <h2 className="text-xl sm:text-2xl font-heading font-black tracking-wider uppercase text-white">
                      MEMBER ACCESS
                    </h2>
                    <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-violet-500/60" />
                  </div>

                  <p className="text-xs text-gray-400 font-sans tracking-wide">
                    Authorized terminal authentication gateway.
                  </p>
                </div>

                {/* Biometric Interactive Touch Simulator */}
                <div className="mb-6 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-violet-950/25 border border-violet-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isScanning ? 'bg-violet-500 text-white animate-pulse' : 'bg-violet-900/40 text-violet-300'}`}>
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-white tracking-wider">
                        {isScanning ? "BIOMETRIC SCAN IN PROGRESS..." : "BIO-ID RECOGNITION"}
                      </div>
                      <div className="text-[9px] font-mono text-gray-400">
                        {isScanning ? "Verifying neural key signature" : "Tap scanner to auto-focus terminal"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerBiometricScan}
                    disabled={isScanning}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-violet-300 bg-violet-500/20 hover:bg-violet-500/35 border border-violet-500/30 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? "SCANNING" : "SCAN"}
                  </button>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    LOGIN FORM
                ────────────────────────────────────────────────────────── */}
                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                  
                  {/* Email Address Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-email"
                        className="text-xs font-mono font-semibold tracking-wider text-gray-300 flex items-center gap-1.5"
                      >
                        <span className="text-violet-400">{"//"}</span>
                        <span>MEMBER EMAIL / ID</span>
                      </label>
                      <span className="text-[9px] font-mono text-gray-400">
                        {focusedField === "email" ? "ACTIVE INPUT" : "REQUIRED"}
                      </span>
                    </div>

                    <div
                      className={`relative rounded-xl transition-all duration-300 ${
                        focusedField === "email"
                          ? "ring-1 ring-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-black/80"
                          : "bg-black/40 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <UserCheck
                          className={`w-4 h-4 transition-colors ${
                            focusedField === "email" ? "text-violet-400" : "text-gray-500"
                          }`}
                        />
                      </div>

                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-transparent py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none font-sans"
                        placeholder="athlete@pinakafitness.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-mono font-semibold tracking-wider text-gray-300 flex items-center gap-1.5"
                      >
                        <span className="text-violet-400">{"//"}</span>
                        <span>SECURITY KEY</span>
                      </label>
                      <span className="text-[9px] font-mono text-gray-400">
                        {focusedField === "password" ? "ACTIVE INPUT" : "ENCRYPTED"}
                      </span>
                    </div>

                    <div
                      className={`relative rounded-xl transition-all duration-300 ${
                        focusedField === "password"
                          ? "ring-1 ring-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-black/80"
                          : "bg-black/40 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <Lock
                          className={`w-4 h-4 transition-colors ${
                            focusedField === "password" ? "text-violet-400" : "text-gray-500"
                          }`}
                        />
                      </div>

                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-transparent py-3.5 pl-10 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none font-sans tracking-wide"
                        placeholder="••••••••••••"
                      />

                      {/* Password toggle button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors rounded-md focus:outline-none cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-violet-400" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* High-Tech Error Message State */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-mono font-bold tracking-wide uppercase text-[10px] text-red-400">
                            AUTHENTICATION ERROR
                          </div>
                          <div className="mt-0.5 leading-relaxed font-sans">{error}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Futuristic Primary CTA ("ENTER PORTAL") */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    type="submit"
                    id="login-submit"
                    className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-500 text-white font-heading font-black text-sm uppercase tracking-[0.18em] py-4 px-6 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.65)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {/* Animated moving shine effect */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    {/* Button content */}
                    <div className="relative z-10 flex items-center justify-center gap-2.5">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-mono tracking-widest text-xs">
                            AUTHENTICATING SESSION...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>INITIALIZE PORTAL</span>
                          <ChevronRight className="w-4 h-4 text-violet-200 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>

                {/* Console Footer Info & Security Protocols */}
                <div className="mt-7 pt-5 border-t border-white/5 flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>256-BIT BIO-ENCRYPTED GATEWAY</span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal">
                    Access is restricted to registered members & personnel. Need assistance?{" "}
                    <Link
                      href="/#contact"
                      className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
                    >
                      Contact Concierge
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER STATUS BAR
      ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/[0.04] text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span>PINAKA FITNESS PROTOCOL {"//"} VER 4.2.0</span>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <span>HIGH-PERFORMANCE ATHLETIC NETWORK</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">ALL RIGHTS RESERVED © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_60%)]" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
            <div className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-violet-300">
              SYNCHRONIZING NEURAL CORE...
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
