"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Building2,
  DollarSign,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  Phone,
  Mail,
  MapPin,
  Tag,
} from "lucide-react";

interface OwnerSettings {
  gymName: string;
  gymAddress: string;
  gymPhone: string;
  gymEmail: string;
  monthlyPlanPrice: string;
  quarterlyPlanPrice: string;
  yearlyPlanPrice: string;
  currency: string;
  securityMode: string;
  auditLoggingEnabled: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<OwnerSettings>({
    gymName: "",
    gymAddress: "",
    gymPhone: "",
    gymEmail: "",
    monthlyPlanPrice: "",
    quarterlyPlanPrice: "",
    yearlyPlanPrice: "",
    currency: "₹",
    securityMode: "Strict Single Device Session",
    auditLoggingEnabled: "true",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSettings();
  }, []);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      addToast("error", "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/owner/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        addToast("success", "Owner settings saved successfully!");
      } else {
        addToast("error", "Failed to save settings.");
      }
    } catch {
      addToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof OwnerSettings, value: string) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const inputClass =
    "w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none placeholder-gray-600 transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl pointer-events-auto backdrop-blur-md ${
                t.type === "success"
                  ? "bg-green-900/80 border border-green-700/50 text-green-300"
                  : "bg-red-900/80 border border-red-700/50 text-red-300"
              }`}
            >
              {t.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Owner Settings
          </h1>
          <p className="text-xs text-gray-400">
            Configure gym business details, membership pricing, security preferences, and audit controls
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {/* Section 1: Gym Identity */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Building2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
            Gym Business Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Gym Name
            </label>
            <input
              type="text"
              value={settings.gymName}
              onChange={e => update("gymName", e.target.value)}
              placeholder="PINAKA FITNESS CLUB"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Gym Address
            </label>
            <input
              type="text"
              value={settings.gymAddress}
              onChange={e => update("gymAddress", e.target.value)}
              placeholder="Plot 42, Fitness Hub, Central Avenue, Sector 5"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Contact Phone
            </label>
            <input
              type="text"
              value={settings.gymPhone}
              onChange={e => update("gymPhone", e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Contact Email
            </label>
            <input
              type="email"
              value={settings.gymEmail}
              onChange={e => update("gymEmail", e.target.value)}
              placeholder="contact@pinakafitness.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Membership Pricing */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
            Membership Pricing Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Currency Symbol</label>
            <select
              value={settings.currency}
              onChange={e => update("currency", e.target.value)}
              className={inputClass}
            >
              <option value="₹">₹ Indian Rupee (INR)</option>
              <option value="$">$ US Dollar (USD)</option>
              <option value="€">€ Euro (EUR)</option>
              <option value="£">£ British Pound (GBP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Monthly Plan Price ({settings.currency})
            </label>
            <input
              type="number"
              min="0"
              value={settings.monthlyPlanPrice}
              onChange={e => update("monthlyPlanPrice", e.target.value)}
              placeholder="1500"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Quarterly Plan Price ({settings.currency})
            </label>
            <input
              type="number"
              min="0"
              value={settings.quarterlyPlanPrice}
              onChange={e => update("quarterlyPlanPrice", e.target.value)}
              placeholder="4000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Yearly Plan Price ({settings.currency})
            </label>
            <input
              type="number"
              min="0"
              value={settings.yearlyPlanPrice}
              onChange={e => update("yearlyPlanPrice", e.target.value)}
              placeholder="12000"
              className={inputClass}
            />
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: "Monthly", price: settings.monthlyPlanPrice, sub: "Per month" },
            { label: "Quarterly", price: settings.quarterlyPlanPrice, sub: "3 months" },
            { label: "Yearly", price: settings.yearlyPlanPrice, sub: "Best value" },
          ].map(plan => (
            <div
              key={plan.label}
              className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/15 rounded-2xl text-center"
            >
              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{plan.label}</div>
              <div className="text-xl font-heading font-black text-amber-400">
                {settings.currency}{Number(plan.price || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">{plan.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Security & Compliance */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
            Security &amp; Compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Security Mode
            </label>
            <select
              value={settings.securityMode}
              onChange={e => update("securityMode", e.target.value)}
              className={inputClass}
            >
              <option value="Strict Single Device Session">Strict Single Device Session (Default)</option>
              <option value="Multi Device Session">Multi Device Session Allowed</option>
            </select>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Strict mode logs out the user from other devices whenever a new login session is created.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Owner Audit Logging
            </label>
            <select
              value={settings.auditLoggingEnabled}
              onChange={e => update("auditLoggingEnabled", e.target.value)}
              className={inputClass}
            >
              <option value="true">Enabled (Recommended)</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              When enabled, all sensitive Owner-level actions are logged to the Audit Log for accountability.
            </p>
          </div>
        </div>

        {/* Security info callout */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-xs text-gray-400 leading-relaxed flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Security Notice: </span>
            The Owner account uses the highest privilege level in the system. All login attempts, privilege escalations, user deletions, and financial configuration changes are permanently logged. Disabling audit logging is not recommended for production gyms.
          </div>
        </div>
      </div>

      {/* Owner Credentials Info */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Lock className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
            Owner Account Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Owner Login Email</div>
            <div className="font-mono font-bold text-amber-400">pinakaowner@gmail.com</div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Access Level</div>
            <div className="font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" /> Highest Privilege — Full System Control
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          To change the Owner password, go to User Management, find the Owner account, and use the Edit User action to set a new password securely.
        </p>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving Settings..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
