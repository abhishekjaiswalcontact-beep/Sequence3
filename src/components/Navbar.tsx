'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, ArrowRight, Info, Camera, Target, Activity, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated: isLoggedIn, logout } = useAuth();

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen || isScannerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isScannerModalOpen]);

  const menuItems = [
    { title: "Programs", hasDropdown: false },
    { title: "Trainers", hasDropdown: false },
    { title: "Gallery", hasDropdown: false },
    { title: "Careers", hasDropdown: false },
    { title: "Contact Us", hasDropdown: false }
  ];

  const getHref = useCallback((title: string) => {
    switch (title) {
      case 'Careers':
        return '/careers';
      case 'Contact Us':
        return '/#contact';
      case 'Programs':
        return '/#programs';
      case 'Trainers':
        return '/#trainers';
      case 'Gallery':
        return '/#showcase';
      default:
        return `/#${title.toLowerCase().replace(/\s+/g, '-')}`;
    }
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        e.preventDefault();
        const wasOpen = isOpen;
        if (wasOpen) {
          setIsOpen(false);
          document.body.style.overflow = '';
        }

        const scrollToTarget = () => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', href);
          }
        };

        if (wasOpen) {
          setTimeout(scrollToTarget, 100);
        } else {
          scrollToTarget();
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      // Hard navigation clears all JS state and ensures browser sends no stale cookies
      window.location.replace("/login");
    }
  }, [logout, isLoggingOut]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full max-w-[100vw] z-[1000] flex flex-col">
        {/* Futuristic Announcement Bar */}
        <div
          className="w-full relative overflow-hidden bg-[#050505]/80 backdrop-blur-xl text-white px-4 md:px-12 py-2.5 flex justify-between items-center border-b border-brand/20 z-[1001] group"
          style={{ opacity: 1 }}
        >
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/10 via-blue-600/10 to-brand/10 opacity-70 pointer-events-none" />
          
          {/* CSS-only shimmer — runs on hover instead of infinite loop */}
          <div className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Left Content */}
          <div className="flex items-center gap-3 z-10 flex-1 min-w-0">
            <div
              className="text-brand shrink-0 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
            >
              <Scan size={16} />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
              <span className="text-[10px] sm:text-xs font-medium tracking-wide truncate">
                <span className="hidden md:inline">Scan your body through our </span>
                <span className="md:hidden">Try our </span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-blue-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">AI Scanner</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 border border-brand/30 text-[9px] font-bold uppercase tracking-widest text-brand-light shadow-[0_0_10px_rgba(139,92,246,0.2)] shrink-0">
                Members Only
              </span>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2 z-10">
            <button 
              onClick={() => setIsScannerModalOpen(true)}
              aria-label="About AI Scanner"
              className="relative px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-brand/10 hover:border-brand/50 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 group/btn overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/20 to-brand/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <Info size={14} className="text-gray-400 group-hover/btn:text-brand-light transition-colors" />
              <span className="hidden sm:inline text-gray-300 group-hover/btn:text-white transition-colors">About</span>
            </button>

            {!isLoggedIn && (
              <div className="hover:scale-105 active:scale-95 transition-transform">
                <Link href="/login" className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand to-blue-600 hover:from-brand-light hover:to-blue-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all group/login">
                  Login
                  <ArrowRight size={14} className="group-hover/login:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <nav className={`w-full max-w-[100vw] h-16 md:h-20 backdrop-blur-xl border-b transition-all duration-300 ${isOpen ? 'bg-[#050505]/95 border-brand/30 shadow-[0_4px_25px_rgba(139,92,246,0.12)]' : 'bg-[#0a0a0a]/90 border-white/5'}`}>
      <div className="max-w-[1600px] mx-auto flex justify-between items-center px-4 md:px-12 h-full w-full relative">
        {/* Mobile Toggle / Hamburger (Left) */}
        <div className="flex items-center lg:hidden relative z-[110]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`focus:outline-none transition-all duration-300 flex items-center justify-center p-1.5 -ml-1 rounded-xl border ${
              isOpen
                ? 'text-white bg-brand/15 border-brand/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'text-white/90 border-transparent hover:text-brand active:scale-95'
            }`}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <X size={26} className="text-brand-light" /> : <Menu size={26} />}
          </button>
        </div>

        {/* Logo Section (Centered on Mobile, Left-aligned on Desktop) */}
        <Link
          href="/"
          onClick={() => { if (isOpen) setIsOpen(false); }}
          className={`flex items-center shrink-0 group h-full py-1 z-[110] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 transition-all duration-300 ${
            isOpen ? 'drop-shadow-[0_0_14px_rgba(139,92,246,0.7)]' : ''
          }`}
        >
          <Image
            src="/logo0.png"
            alt="Pinaka Fitness"
            width={120}
            height={56}
            className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Central Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-10">
          {menuItems.map((item) => {
            const href = getHref(item.title);
            return (
              <Link
                key={item.title}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="text-sm font-heading font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all duration-300 relative group text-white/80 hover:text-white hover:-translate-y-0.5"
              >
                {item.title}
                {item.hasDropdown && (
                  <ChevronDown size={14} className="transition-colors text-white/50 group-hover:text-white" />
                )}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full bg-brand shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              </Link>
            );
          })}
        </div>

        {/* Right Section: CTA & Auth */}
        <div className="hidden lg:flex items-center space-x-8">
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-heading font-semibold uppercase tracking-[0.15em] transition-all duration-300 text-white/80 hover:text-brand hover:-translate-y-0.5"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-heading font-semibold uppercase tracking-[0.15em] text-white/40 hover:text-red-500 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoggingOut ? "Exiting..." : "Exit"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-heading font-semibold uppercase tracking-[0.15em] transition-all duration-300 text-white/80 hover:text-brand hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/#contact"
            className="font-heading font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 bg-brand text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] border border-brand/50 hover:bg-brand-light hover:text-white"
          >
            Join the Elite
          </Link>
        </div>

        {/* Mobile Auth / Login (Right) */}
        <div className="flex items-center lg:hidden relative z-[110]">
          {!isOpen && (
            isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-xs font-heading font-semibold uppercase tracking-[0.15em] transition-all duration-300 text-white/80 hover:text-white"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-heading font-semibold uppercase tracking-[0.15em] transition-all duration-300 text-white/80 hover:text-white"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>

      </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl flex flex-col justify-between pt-[108px] pb-6 px-6 sm:px-10 lg:hidden z-[990] overflow-y-auto overscroll-contain hide-scrollbar"
            data-lenis-prevent
          >
            {/* Ambient luxury background lighting */}
            <div className="absolute top-1/4 -left-24 w-72 h-72 bg-brand/12 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col justify-between min-h-[calc(100svh-132px)] max-w-lg mx-auto w-full">
              {/* Navigation Items */}
              <div className="flex flex-col justify-center py-2 space-y-1.5 sm:space-y-2.5">
                {menuItems.map((item, idx) => {
                  const href = getHref(item.title);
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={href}
                        onClick={(e) => {
                          handleNavClick(e, href);
                          if (!href.startsWith('/#')) {
                            setIsOpen(false);
                          }
                        }}
                        className="group relative flex items-center justify-between py-3 px-3.5 -mx-3.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] active:bg-brand/10"
                      >
                        {/* Purple line indicator on active/hover */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-6 rounded-full bg-gradient-to-b from-brand-light to-brand opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />

                        <div className="flex items-center gap-3.5 pl-2">
                          <span className="font-mono text-xs font-semibold text-white/35 group-hover:text-brand-light transition-colors tracking-widest">
                            {num}
                          </span>
                          <span className="text-2xl sm:text-[28px] font-heading font-bold uppercase tracking-[0.14em] text-white/85 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                            {item.title}
                          </span>
                        </div>

                        <ArrowRight
                          size={18}
                          className="text-white/20 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-brand-light transition-all duration-300 shrink-0"
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Section: Member Portal & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="pt-4 space-y-3.5 mt-auto"
              >
                {/* Thin purple gradient divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand/35 to-transparent" />

                {/* Member Portal Card */}
                {isLoggedIn ? (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-white/[0.04] to-brand/[0.06] border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-light font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Member
                      </span>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-[11px] font-heading font-semibold uppercase tracking-wider text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {isLoggingOut ? "Signing Out..." : "Sign Out"}
                      </button>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-brand-light transition-colors uppercase tracking-[0.1em]">
                          My Account
                        </div>
                        <div className="text-[11px] text-white/50">
                          Access workouts, diet plans & body scanner
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-light group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] via-brand/[0.05] to-white/[0.03] border border-white/10 hover:border-brand/40 backdrop-blur-xl transition-all duration-300 group hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand-light px-2.5 py-0.5 rounded-full bg-brand/15 border border-brand/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                        Members Only
                      </span>
                      <span className="text-[10px] font-medium text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-wider">
                        Sign In
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-brand-light transition-colors uppercase tracking-[0.1em]">
                          Member Portal
                        </div>
                        <div className="text-[11px] text-white/50">
                          Access workouts, diet plans & AI scanner
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* CTA Button */}
                <Link
                  href="/#contact"
                  onClick={(e) => {
                    handleNavClick(e, '/#contact');
                    setIsOpen(false);
                  }}
                  className="relative group overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand via-purple-600 to-brand-dark text-white font-heading font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] border border-brand/50 hover:border-brand-light active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <span>Get Started Free</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Details Modal */}
      <AnimatePresence>
        {isScannerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsScannerModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-y-auto overscroll-contain"
              data-lenis-prevent="true"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand/10 blur-[100px] pointer-events-none" />

              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="p-2 bg-brand/20 text-brand rounded-lg">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white uppercase tracking-tight">AI Body Scanner</h2>
              </div>
              
              <p className="text-brand text-xs font-bold uppercase tracking-[0.2em] mb-8 relative z-10">Exclusive Members Only Feature</p>

              <div className="space-y-6 relative z-10">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 hover:bg-white/10 transition-colors">
                  <Target className="text-blue-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">What It Does</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Our advanced AI scanner performs a comprehensive body analysis, detecting your posture, measuring key body metrics, and providing deep fitness insights. In addition, it generates personalized diet plans, calorie recommendations, and customized workout routines tailored specifically to your body and fitness goals.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 hover:bg-white/10 transition-colors">
                  <Camera className="text-purple-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">How It Works</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Using cutting-edge computer vision through your device&apos;s camera, the AI maps your body structure in real-time. After scanning, it processes your data and instantly creates a complete fitness plan — including what to eat, which exercises to perform, and how to improve step-by-step. No manual input required — just stand in front of the camera.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 hover:bg-white/10 transition-colors">
                  <Activity className="text-green-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Benefits For You</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Get a complete fitness roadmap powered by AI. Know exactly what to eat, when to eat, and which exercises to perform. Track your progress visually, improve posture, prevent injuries, and achieve faster results with fully personalized diet and workout plans designed just for you.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end relative z-10">
                <button 
                  onClick={() => setIsScannerModalOpen(false)}
                  className="bg-brand text-white font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-xl hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
