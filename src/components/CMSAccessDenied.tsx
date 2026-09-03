"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Crown, Globe } from "lucide-react";

interface CMSAccessDeniedProps {
  featureName?: string;
}

export default function CMSAccessDenied({ featureName = "Website CMS" }: CMSAccessDeniedProps) {
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4">
      <div className="bg-[#0D0D12] border border-red-500/30 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Owner Privilege Required
          </span>
          <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight">
            Access Denied: {featureName}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Access to the Website CMS (Content Management System) is strictly restricted to the **Website Owner**. Regular administrative accounts do not possess authorization to view, edit, or publish live website content.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin/users"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Member Roster
          </Link>
          <Link
            href="/"
            target="_blank"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand/20 hover:bg-brand/30 text-brand-light font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-brand/40"
          >
            <Globe className="w-4 h-4" /> View Live Website
          </Link>
        </div>
      </div>
    </div>
  );
}
