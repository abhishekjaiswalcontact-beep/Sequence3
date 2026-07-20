"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, History, ArrowRight, LogOut, ShieldCheck, Apple, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import AICoachGate from '@/components/AICoachGate';

export default function DashboardPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [scans, setScans] = useState<Array<{ id: string; feedback?: string; postureScore?: number; createdAt: string | Date; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in — middleware handles this too, but belt-and-suspenders
  useEffect(() => {
     if (typeof document !== 'undefined') {
         
         // Fetch history
         const fetchHistory = async () => {
            try {
               const res = await fetch('/api/scan/history');
               if (res.ok) {
                  const data = await res.json();
                  setScans(data);
               }
            } catch (e) {
               console.error("Failed to load history", e);
            } finally {
               setLoading(false);
            }
         };
         fetchHistory();
     }
  }, [router]);

  const handleLogout = async () => {
    await logout(); // calls /api/auth (logout action) to clear httpOnly cookie
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 container mx-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter">
              Member <span className="text-brand">Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back{user?.name ? `, ${user.name}` : ''}. Let&apos;s conquer your goals today.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
             {user?.isAdmin && (
               <Link href="/admin/users">
                 <button className="px-5 py-2 border border-brand/50 rounded-full text-sm font-medium hover:bg-brand/10 transition-colors flex items-center gap-2 text-brand">
                   <ShieldCheck className="w-4 h-4"/> Admin
                 </button>
               </Link>
             )}
             <button onClick={handleLogout} className="px-5 py-2 border border-surfaceBorder rounded-full text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
                 <LogOut className="w-4 h-4"/> Logout
             </button>
             <Link href="/">
                 <button className="px-5 py-2 border border-surfaceBorder rounded-full text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
                     Home
                 </button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Actions Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Main Action Card: Scanner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-[2rem] overflow-hidden group cursor-pointer border border-brand/30 hover:border-brand/50 shadow-neon-strong bg-brand/10"
              onClick={() => router.push('/scan')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-40">
                <Image 
                   src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=70&w=800" 
                   alt="" 
                   fill
                   sizes="(max-width: 768px) 100vw, 600px"
                   className="object-cover"
                   loading="lazy"
                />
              </div>
              <div className="relative z-20 p-12 h-full flex flex-col justify-end min-h-[360px]">
                 <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-neon">
                   <Activity className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 uppercase">Start Full Body AI Scan</h2>
                 <p className="text-gray-300 max-w-md mb-8 text-sm">
                   Experience our ultra-precise pose detection algorithm to assess posture, estimate body fat, and map muscle symmetry in real time.
                 </p>
                 <button className="self-start px-8 py-3.5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 text-xs">
                   Launch Scanner <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>

            {/* Main Action Card: Diet Planner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-[2rem] overflow-hidden group cursor-pointer border border-brand/30 hover:border-brand/50 shadow-neon bg-brand/5"
              onClick={() => router.push('/diet')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-40">
                <Image 
                   src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=70&w=800" 
                   alt="" 
                   fill
                   sizes="(max-width: 768px) 100vw, 600px"
                   className="object-cover"
                   loading="lazy"
                />
              </div>
              <div className="relative z-20 p-12 h-full flex flex-col justify-end min-h-[360px]">
                 <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-neon">
                   <Apple className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 uppercase">AI Diet Planner</h2>
                 <p className="text-gray-300 max-w-md mb-8 text-sm">
                   Construct a macro-precise nutritional layout suited for your exact biology. Adjust meals dynamically with our sports nutritionist bot.
                 </p>
                 <button className="self-start px-8 py-3.5 bg-brand text-white font-bold uppercase tracking-widest rounded-full hover:bg-brand-light transition-colors flex items-center gap-2 text-xs shadow-lg shadow-brand/35">
                   Plan Nutrition <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>

            {/* Main Action Card: My Membership */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-[2rem] overflow-hidden group cursor-pointer border border-brand/30 hover:border-brand/50 shadow-neon bg-brand/5"
              onClick={() => router.push('/dashboard/membership')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-30">
                <Image 
                   src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=70&w=800" 
                   alt="" 
                   fill
                   sizes="(max-width: 768px) 100vw, 600px"
                   className="object-cover"
                   loading="lazy"
                />
              </div>
              <div className="relative z-20 p-12 h-full flex flex-col justify-end min-h-[360px]">
                 <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-neon">
                   <CreditCard className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 uppercase">My Membership</h2>
                 <p className="text-gray-300 max-w-md mb-8 text-sm">
                   View details about your active subscription, renew plans, access trainer information, and view transaction history.
                 </p>
                 <button className="self-start px-8 py-3.5 bg-brand text-white font-bold uppercase tracking-widest rounded-full hover:bg-brand-light transition-colors flex items-center gap-2 text-xs shadow-lg shadow-brand/35">
                   View Membership <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>

          </div>

          {/* Quick Stats / History Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface/50 border border-surfaceBorder rounded-[2rem] p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
               <History className="w-6 h-6 text-brand" />
               <h3 className="text-xl font-heading font-bold uppercase">Recent Scans</h3>
            </div>

            <div className="flex-1 space-y-4">
               {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                  </div>
               ) : scans.length > 0 ? (
                  scans.map((scan) => (
                    <div key={scan.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-colors cursor-pointer" onClick={() => {
                        sessionStorage.setItem('latestScanData', JSON.stringify({
                            ...scan,
                            postureFeedback: scan.feedback
                        }));
                        router.push('/scan/results');
                    }}>
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500 font-medium">{new Date(scan.createdAt).toLocaleDateString()}</span>
                          <span className="text-brand font-bold text-sm">Score: {scan.postureScore}</span>
                       </div>
                       <div className="text-sm font-bold uppercase truncate">Full Body Analysis</div>
                    </div>
                  ))
               ) : (
                  <div className="flex flex-col justify-center items-center text-center text-gray-500 space-y-4 py-10">
                     <Activity className="w-12 h-12 opacity-20" />
                     <p>No previous scans found.</p>
                     <p className="text-xs">Initiate your first scan to unlock your personalized metrics.</p>
                  </div>
               )}
            </div>
          </motion.div>

        </div>
      </div>

      <AICoachGate
        autoOpen={true}
        greeting={"Welcome back to your Dashboard! 🏆\n\nI'm your **AI Coach** — ready to help you hit your goals today.\n\nAsk me anything about your **workout plan**, **diet**, **recovery**, or anything else. Let's make today count! 💪"}
      />
    </div>
  );
}
