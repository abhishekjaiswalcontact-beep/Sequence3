'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, ArrowRight, Info, Camera, Target, Activity, Scan, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated: isLoggedIn, logout, user } = useAuth();

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
    { title: "Programs", subtitle: "Elite training protocols", hasDropdown: false },
    { title: "Trainers", subtitle: "World-class certified coaches", hasDropdown: false },
    { title: "Gallery", subtitle: "State-of-the-art facility", hasDropdown: false },
    { title: "Careers", subtitle: "Join our fitness revolution", hasDropdown: false },
    { title: "Contact Us", subtitle: "Location, hours & enquiry", hasDropdown: false }
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
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, isLoggingOut]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full max-w-full z-[1000] flex flex-col box-border">
        {/* Futuristic Announcement Bar */}
        <div
          className="w-full relative overflow-hidden bg-[#050505]/90 backdrop-blur-xl text-white px-3 sm:px-4 md:px-12 py-2 sm:py-2.5 flex justify-between items-center border-b border-brand/20 z-[1001] group box-border"
          style={{ opacity: 1 }}
        >
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/10 via-blue-600/10 to-brand/10 opacity-70 pointer-events-none" />
          
          {/* CSS-only shimmer — runs on hover */}
          <div className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Left Content */}
          <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0 shrink">
            <div className="text-brand shrink-0 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
              <Scan size={15} className="sm:w-4 sm:h-4" />
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs font-medium tracking-wide truncate">
                <span className="hidden md:inline">Scan your body through our </span>
                <span className="md:hidden">Try </span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-blue-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">AI Scanner</span>
              </span>
              <span className="hidden min-[380px]:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-brand/10 border border-brand/30 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-brand-light shadow-[0_0_10px_rgba(139,92,246,0.2)] shrink-0">
                Members
              </span>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-2 z-10">
            <button 
              onClick={() => setIsScannerModalOpen(true)}
              aria-label="About AI Scanner"
              className="relative px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-brand/10 hover:border-brand/50 transition-all text-[9px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 group/btn overflow-hidden active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/20 to-brand/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <Info size={13} className="text-gray-400 group-hover/btn:text-brand-light transition-colors shrink-0" />
              <span className="hidden sm:inline text-gray-300 group-hover/btn:text-white transition-colors">About</span>
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Logout"
                className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-brand to-blue-600 hover:from-brand-light hover:to-blue-500 text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all group/logout disabled:opacity-50 disabled:cursor-wait cursor-pointer active:scale-95"
              >
                <span>{isLoggingOut ? "..." : "Logout"}</span>
                <LogOut size={13} className="group-hover/logout:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ) : (
              <Link 
                href="/login" 
                className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-brand to-blue-600 hover:from-brand-light hover:to-blue-500 text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all group/login active:scale-95"
              >
                <span>Login</span>
                <ArrowRight size={13} className="group-hover/login:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            )}
          </div>
        </div>
        
        <nav className={`w-full max-w-full h-16 md:h-20 backdrop-blur-xl border-b transition-all duration-300 box-border ${isOpen ? 'bg-[#050505]/95 border-brand/30 shadow-[0_4px_25px_rgba(139,92,246,0.12)]' : 'bg-[#0a0a0a]/90 border-white/5'}`}>
          <div className="max-w-[1600px] mx-auto flex justify-between items-center px-4 md:px-12 h-full w-full relative box-border">
            {/* Mobile Toggle / Hamburger (Left) */}
            <div className="flex items-center lg:hidden relative z-[110]">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`focus:outline-none transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-xl border ${
                  isOpen
                    ? 'text-brand-light bg-brand/20 border-brand/50 shadow-[0_0_18px_rgba(139,92,246,0.4)]'
                    : 'text-white/90 bg-white/[0.04] border-white/10 hover:border-brand/40 hover:text-brand-light active:scale-95'
                }`}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
              >
                {isOpen ? <X size={22} className="text-brand-light" /> : <Menu size={22} />}
              </button>
            </div>

            {/* Logo Section (Centered on Mobile, Left-aligned on Desktop) */}
            <Link
              href="/"
              onClick={() => { if (isOpen) setIsOpen(false); }}
              className={`flex items-center justify-center shrink-0 group h-full py-1 z-[110] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 transition-all duration-300 ${
                isOpen ? 'drop-shadow-[0_0_16px_rgba(139,92,246,0.7)]' : ''
              }`}
            >
              <Image
                src="/logo0.png"
                alt="Pinaka Fitness"
                width={240}
                height={80}
                className="h-11 xs:h-12 sm:h-[3.25rem] md:h-14 lg:h-[3.5rem] w-auto max-w-[155px] xs:max-w-[175px] sm:max-w-[195px] md:max-w-[215px] lg:max-w-[230px] object-contain transition-transform duration-300 group-hover:scale-105"
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

            {/* Right Section: CTA & Auth (Desktop) */}
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
                    {isLoggingOut ? "Logging out..." : "Logout"}
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

            {/* Mobile Right Action */}
            <div className="flex items-center lg:hidden relative z-[110]">
              {isOpen ? (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-mono font-semibold uppercase tracking-widest text-brand-light/90 px-2.5 py-1 rounded-lg bg-brand/15 border border-brand/30 hover:bg-brand/25 active:scale-95 transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                  aria-label="Close navigation"
                >
                  CLOSE
                </button>
              ) : (
                isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand-light px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/30 shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:bg-brand/20 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Account</span>
                    <ArrowRight size={12} />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-[11px] font-heading font-bold uppercase tracking-wider text-white/90 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-brand/40 hover:text-brand-light active:scale-95 transition-all"
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
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#030306]/98 backdrop-blur-3xl flex flex-col justify-between pt-[108px] sm:pt-[116px] pb-6 px-4 sm:px-8 lg:hidden z-[990] overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar box-border"
            data-lenis-prevent
          >
            {/* Background Ambient Luxury Lighting - Safely Contained to prevent any horizontal overflow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 -left-16 w-64 h-64 bg-brand/12 rounded-full blur-[90px]" />
              <div className="absolute bottom-1/3 -right-16 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col justify-between min-h-[calc(100svh-132px)] max-w-md mx-auto w-full box-border">
              {/* Navigation Items Section */}
              <div className="flex flex-col justify-center py-2 space-y-1 sm:space-y-1.5 w-full">
                {menuItems.map((item, idx) => {
                  const href = getHref(item.title);
                  const num = String(idx + 1).padStart(2, '0');

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + idx * 0.035, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full"
                    >
                      <Link
                        href={href}
                        onClick={(e) => {
                          handleNavClick(e, href);
                          if (!href.startsWith('/#')) {
                            setIsOpen(false);
                          }
                        }}
                        className="group relative flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] active:bg-brand/15 border border-transparent hover:border-brand/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] w-full overflow-hidden box-border"
                      >
                        {/* Subtle Glowing Accent Bar on hover */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 rounded-full bg-gradient-to-b from-brand-light via-brand to-purple-700 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_12px_rgba(139,92,246,0.9)]" />

                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 pl-1.5 sm:pl-2">
                          {/* Futuristic Number Badge */}
                          <span className="font-mono text-[10px] sm:text-xs font-bold text-brand-light/75 group-hover:text-white bg-brand/10 group-hover:bg-brand border border-brand/25 group-hover:border-brand-light px-2 py-0.5 rounded-lg shrink-0 transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_14px_rgba(139,92,246,0.5)]">
                            {num}
                          </span>

                          {/* Menu Title & Subtitle */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xl sm:text-2xl font-heading font-extrabold uppercase tracking-[0.06em] text-white/90 group-hover:text-white transition-all duration-300 truncate drop-shadow-sm group-hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.6)] group-hover:translate-x-0.5">
                              {item.title}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-white/40 font-sans tracking-normal group-hover:text-white/70 transition-colors truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Arrow Action */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/[0.03] group-hover:bg-brand/20 border border-white/[0.08] group-hover:border-brand/40 flex items-center justify-center text-white/30 group-hover:text-brand-light transition-all duration-300 shrink-0 ml-2 shadow-sm group-hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                      </Link>

                      {/* Subtle Divider (for all except last) */}
                      {idx < menuItems.length - 1 && (
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent my-0.5" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Section: Member Portal Card & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="pt-3 sm:pt-4 space-y-3 mt-auto w-full box-border"
              >
                {/* Subtle gradient divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

                {/* Member Portal Card */}
                {isLoggedIn ? (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#120e24]/90 via-[#0d0b18]/85 to-[#07060e]/95 border border-brand/30 shadow-[0_4px_25px_rgba(139,92,246,0.15)] backdrop-blur-xl relative overflow-hidden group box-border">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between gap-2 relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold shadow-[0_0_8px_rgba(52,211,153,0.2)] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Member
                      </span>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-[10px] sm:text-[11px] font-heading font-bold uppercase tracking-wider text-red-400/90 hover:text-red-300 active:scale-95 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        <LogOut size={11} className={isLoggingOut ? "animate-spin" : ""} />
                        <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                      </button>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.08] group/acc relative z-10"
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <div className="text-sm sm:text-base font-heading font-bold text-white group-hover/acc:text-brand-light transition-colors uppercase tracking-[0.06em] truncate">
                          {user?.name ? user.name : "My Account"}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/50 truncate">
                          Workouts, diet plans & AI scanner
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light group-hover/acc:bg-brand group-hover/acc:text-white transition-all duration-300 shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0">
                        <ArrowRight size={14} className="group-hover/acc:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#120e24]/80 via-[#0d0b18]/75 to-[#07060e]/90 border border-brand/25 shadow-[0_4px_25px_rgba(139,92,246,0.12)] backdrop-blur-xl relative overflow-hidden group box-border">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between gap-2 relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/15 border border-brand/35 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-brand-light shadow-[0_0_10px_rgba(139,92,246,0.2)] shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
                        Member Access
                      </span>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] sm:text-[11px] font-heading font-bold uppercase tracking-wider text-brand-light hover:text-white active:scale-95 px-2.5 py-1 rounded-lg bg-brand/15 border border-brand/30 hover:bg-brand/25 transition-all flex items-center gap-1 shrink-0"
                      >
                        <span>Sign In</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.08] group/portal relative z-10"
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <div className="text-sm sm:text-base font-heading font-bold text-white group-hover/portal:text-brand-light transition-colors uppercase tracking-[0.06em] truncate">
                          Member Portal
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/50 truncate">
                          Workouts, diet plans & AI scanner
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 group-hover/portal:bg-brand group-hover/portal:text-white group-hover/portal:border-brand transition-all duration-300 shadow-sm group-hover/portal:shadow-[0_0_15px_rgba(139,92,246,0.4)] shrink-0">
                        <ArrowRight size={14} className="group-hover/portal:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href="/#contact"
                  onClick={(e) => {
                    handleNavClick(e, '/#contact');
                    setIsOpen(false);
                  }}
                  className="relative group overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand via-purple-600 to-brand-dark hover:from-brand-light hover:via-brand hover:to-purple-700 text-white font-heading font-bold py-3.5 px-5 rounded-2xl text-xs uppercase tracking-[0.14em] transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] border border-brand/50 hover:border-brand-light active:scale-[0.98] cursor-pointer box-border"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <span className="truncate">Get Started Free</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
                </Link>

                {/* Technical Micro Footer */}
                <div className="flex items-center justify-center gap-2 text-[8px] sm:text-[9px] font-mono tracking-widest text-white/30 uppercase pt-0.5">
                  <span>AI POWERED</span>
                  <span>•</span>
                  <span>24/7 ACCESS</span>
                  <span>•</span>
                  <span>ELITE SYSTEM</span>
                </div>
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
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setIsScannerModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-y-auto overscroll-contain box-border"
              data-lenis-prevent="true"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand/10 blur-[100px] pointer-events-none" />

              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="p-2 bg-brand/20 text-brand rounded-lg">
                  <Activity size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-tight">AI Body Scanner</h2>
              </div>
              
              <p className="text-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8 relative z-10">Exclusive Members Only Feature</p>

              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl flex gap-3 sm:gap-4 hover:bg-white/10 transition-colors">
                  <Target className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-1.5">What It Does</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Our advanced AI scanner performs a comprehensive body analysis, detecting your posture, measuring key body metrics, and providing deep fitness insights. In addition, it generates personalized diet plans, calorie recommendations, and customized workout routines tailored specifically to your body and fitness goals.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl flex gap-3 sm:gap-4 hover:bg-white/10 transition-colors">
                  <Camera className="text-purple-400 shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-1.5">How It Works</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Using cutting-edge computer vision through your device&apos;s camera, the AI maps your body structure in real-time. After scanning, it processes your data and instantly creates a complete fitness plan — including what to eat, which exercises to perform, and how to improve step-by-step. No manual input required — just stand in front of the camera.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl flex gap-3 sm:gap-4 hover:bg-white/10 transition-colors">
                  <Activity className="text-green-400 shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-1.5">Benefits For You</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      Get a complete fitness roadmap powered by AI. Know exactly what to eat, when to eat, and which exercises to perform. Track your progress visually, improve posture, prevent injuries, and achieve faster results with fully personalized diet and workout plans designed just for you.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 flex justify-end relative z-10">
                <button 
                  onClick={() => setIsScannerModalOpen(false)}
                  className="bg-brand text-white font-bold uppercase tracking-widest text-xs px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
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
