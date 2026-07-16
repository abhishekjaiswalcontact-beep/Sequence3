'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Critical Layout Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <span className="text-4xl">⚠️</span>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter italic">
            Something went <span className="text-red-500">wrong</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-all shadow-xl hover:shadow-neon"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
          >
            Go home
          </Link>
        </div>
        
        <p className="text-[10px] text-gray-700 font-mono">
          Ref: {error.digest || 'no-digest'}
        </p>
      </div>
    </div>
  );
}
