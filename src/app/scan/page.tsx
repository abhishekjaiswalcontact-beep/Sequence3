"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const WebcamPoseEstimator = dynamic(
  () => import('@/components/Scanner/WebcamPoseEstimator'),
  { ssr: false, loading: () => (
    <div className="w-full max-w-lg mx-auto bg-black rounded-[2.5rem] border border-white/10 flex aspect-[3/4] justify-center items-center">
       <div className="text-center text-white p-6">
         <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
         <span className="font-heading tracking-[0.2em] text-xs uppercase text-brand/80">Loading Scanner Core</span>
       </div>
    </div>
  )}
);

export default function ScanPage() {
  const router = useRouter();
  
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'ANALYZING'>('IDLE');


  const { isAuthenticated, isHydrated } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
        router.push('/login?redirect=/scan');
    }
  }, [isAuthenticated, isHydrated, router]);



  const handleScanComplete = useCallback(async (result: { image: string, pose: unknown, height: string, weight: string, goal: string }) => {
    setScanState('ANALYZING');
    
    try {
      // Send the pose, image and body metrics to backend for analysis
      const res = await fetch('/api/scan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pose: result.pose, 
          image: result.image,
          height: result.height,
          weight: result.weight,
          goal: result.goal
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('latestScanData', JSON.stringify(data));
        router.push('/scan/results');
      } else {
        alert("Failed to analyze scan.");
        setScanState('IDLE');
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting analysis server.");
      setScanState('IDLE');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand/30 pb-20">
       <div className="p-6">
         <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
         </Link>
       </div>

       <div className="container mx-auto px-4 mt-4 flex flex-col items-center max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">
              AI Body <span className="text-brand">Scanner</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
               Ensure your full body is visible in the frame. Stand tall. We will map your joints and assess your fitness metrics.
            </p>
          </div>

          {/* Scanner Area */}
          <div className="w-full relative">
            <WebcamPoseEstimator 
               onScanComplete={handleScanComplete}
            />

            {/* AI Processing Overlay */}
            <AnimatePresence>
               {scanState === 'ANALYZING' && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
                 >
                    <Activity className="w-16 h-16 text-brand animate-pulse mb-6" />
                    <h2 className="text-3xl font-heading font-black uppercase tracking-widest mb-2">AI Processing</h2>
                    <p className="text-gray-400">Analyzing body landmarks & generating personalized plan...</p>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          
          {/* Posture Guidelines */}
          <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
             <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4 text-brand font-bold">1</div>
                <h3 className="font-heading font-bold mb-2">Well Lit Space</h3>
                <p className="text-sm text-gray-400">Make sure you are clearly visible against the background.</p>
             </div>
             <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4 text-brand font-bold">2</div>
                <h3 className="font-heading font-bold mb-2">Full Body View</h3>
                <p className="text-sm text-gray-400">Position the camera so your head and feet are visible.</p>
             </div>
             <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4 text-brand font-bold">3</div>
                <h3 className="font-heading font-bold mb-2">Stand Straight</h3>
                <p className="text-sm text-gray-400">Face the camera squarely with arms slightly apart.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
