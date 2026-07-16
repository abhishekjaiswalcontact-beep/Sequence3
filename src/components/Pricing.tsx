'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Crown, Dumbbell, Activity, Users } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'monthly',
    title: 'Monthly',
    price: '4999',
    period: 'month',
    subtitle: 'Flexible commitment',
    savings: '',
    popular: false,
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: 'quarterly',
    title: '3 Months',
    price: '9999',
    period: '3 months',
    subtitle: 'Strong foundation',
    savings: 'Save ₹3998',
    popular: false,
    gradient: 'from-blue-600 to-blue-900',
  },
  {
    id: 'half_yearly',
    title: '6 Months',
    price: '15999',
    period: '6 months',
    subtitle: 'Serious transformation',
    savings: 'Save ₹8995',
    popular: true,
    badge: 'Most Popular',
    gradient: 'from-brand to-purple-900',
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: '21999',
    period: 'year',
    subtitle: 'The elite lifestyle',
    savings: 'Save ₹25989',
    popular: false,
    badge: 'Best Value',
    gradient: 'from-amber-500 to-orange-700',
  }
];

const features = [
  { name: 'Full Gym Access', icon: Dumbbell },
  { name: 'Certified Trainers', icon: Users },
  { name: 'Clean Changing Room', icon: Activity },
  { name: 'Steam & Shower', icon: Sparkles },
  { name: 'World-Class Equipment', icon: Zap },
  { name: 'Parking Space', icon: Shield },
];

export default function Pricing() {
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
      {/* Duration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative group rounded-3xl p-[1px] bg-gradient-to-b ${plan.popular ? plan.gradient : 'from-white/10 to-transparent'}`}
          >
            {/* Badge - Positioned relative to outer container for full visibility */}
            {plan.badge && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 whitespace-nowrap`}>
                {plan.badge}
              </div>
            )}

            {/* Background glow on hover - Contained within border bounds */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />
            </div>

            <div className="relative h-full flex flex-col bg-[#050505]/95 backdrop-blur-xl rounded-[23px] p-8 z-10">

              <div className="text-center mb-6 pt-2">
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">{plan.title}</h3>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-white/70">₹</span>
                  <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br ${plan.popular ? plan.gradient : 'from-white to-gray-400'}`}>
                    {plan.price}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">/ {plan.period}</div>
              </div>

              <div className="text-center mb-8 flex-grow">
                <p className="text-sm text-gray-300 font-medium mb-2">{plan.subtitle}</p>
                {plan.savings ? (
                  <p className="text-xs text-green-400 font-bold bg-green-400/10 inline-block px-3 py-1 rounded-full">{plan.savings}</p>
                ) : (
                  <p className="text-xs text-transparent select-none">&nbsp;</p>
                )}
              </div>

              <Link href="/#contact" className={`relative w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all overflow-hidden group/btn block text-center ${plan.popular ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.popular ? plan.gradient : 'from-white/5 to-white/10'} group-hover/btn:opacity-80 transition-opacity`} />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10">{plan.popular ? 'Get Started' : 'Join Now'}</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shared Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-5xl mx-auto rounded-[2.5rem] bg-[#050505] border border-white/5 relative overflow-hidden p-8 lg:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] group hover:border-brand/30 transition-colors duration-500"
      >
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand/20 transition-colors" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-colors" />

        <div className="relative z-10">
          <div className="text-center mb-10 flex flex-col items-center">
            <Crown className="w-8 h-8 text-brand mb-4 opacity-80" />
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-wide">All Elite Plans Include</h3>
            <p className="text-gray-400 mt-2 text-sm max-w-md">Experience the absolute peak of fitness luxury, completely uncompromised regardless of your membership duration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-brand/30 transition-all p-4 rounded-2xl cursor-default group/feat">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-white/10 group-hover/feat:scale-110 group-hover/feat:border-brand/50 transition-all shadow-inner">
                    <Icon className="w-5 h-5 text-gray-400 group-hover/feat:text-brand transition-colors" />
                  </div>
                  <span className="text-gray-300 font-medium group-hover/feat:text-white transition-colors">{feature.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
