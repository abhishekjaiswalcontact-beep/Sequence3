'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Minus, 
  ThumbsUp, 
  ThumbsDown, 
  Video, 
  HelpCircle,
  TrendingUp,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useLenis } from 'lenis/react';

const CATEGORIES = ['All', 'Membership', 'Pricing', 'Trainers', 'Workout', 'General'];

const faqData = [
  {
    id: 1,
    category: 'General',
    popular: true,
    question: "What are your operating hours?",
    answer: "We are open 24/7 for all Elite and Pro members. Basic members have access from 5 AM to 11 PM daily. Our staff is always on-site during peak hours (6 AM - 10 PM) for any assistance.",
    videoUrl: 'https://www.youtube.com/embed/dg08vAn-lU8'
  },
  {
    id: 2,
    category: 'Membership',
    popular: true,
    question: "Can I freeze my membership?",
    answer: "Yes, you can freeze your membership for up to 3 months per year for a small administrative fee. This is perfect for when you're traveling or need a medical break. You can manage this directly from your member dashboard.",
  },
  {
    id: 3,
    category: 'Trainers',
    popular: true,
    question: "Are personal trainers included?",
    answer: "Pro members get 1 complimentary session per month, and Elite members get 4 weekly sessions included in their plan. Basic members can book sessions individually starting at $50/hour.",
    videoUrl: 'https://www.youtube.com/embed/U9ENCvpkadY'
  },
  {
    id: 4,
    category: 'General',
    popular: true,
    question: "Do you offer a free trial?",
    answer: "Absolutely! We offer a 3-day full-access pass for all first-time visitors. This includes a complimentary fitness assessment and one group class of your choice.",
  },
  {
    id: 5,
    category: 'Pricing',
    popular: false,
    question: "How do I upgrade my plan?",
    answer: "Upgrading is instant! Simply go to your Account Settings > Subscription and select your new tier. Your billing will be prorated, and you'll get immediate access to the new benefits.",
  },
  {
    id: 6,
    category: 'Workout',
    popular: false,
    question: "Is there a limit to how many classes I can take?",
    answer: "Elite members have unlimited access to all classes. Pro members can attend 3 classes per week, and Basic members can join 1 class per week. You can always purchase 'Drop-in' passes for extra sessions.",
    videoUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI'
  },
  {
    id: 7,
    category: 'Membership',
    popular: false,
    question: "Is there an age limit for joining?",
    answer: "The minimum age is 16. Members aged 16-17 must have a parent or guardian sign the waiver and be present during their first orientation session.",
  },
  {
    id: 8,
    category: 'Pricing',
    popular: false,
    question: "Do you have student or corporate discounts?",
    answer: "Yes! We offer a 15% discount for full-time students and 20% for employees of our corporate partners. Please bring a valid ID to the front desk to verify your status.",
  },
  {
    id: 9,
    category: 'Trainers',
    popular: false,
    question: "Can I choose my own trainer?",
    answer: "Yes, you can browse trainer profiles in our app, check their specialties (Strength, Yoga, HIIT, etc.), and book based on your preference and their availability.",
  },
  {
    id: 10,
    category: 'Workout',
    popular: false,
    question: "What should I bring for my first workout?",
    answer: "Bring a water bottle, a small towel, and appropriate athletic footwear. We provide locker service (bring your own lock) and complimentary shower towels for Elite members.",
  }
];

export default function SupportFAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const lenis = useLenis();

  // Scroll lock when video is open
  useEffect(() => {
    if (videoUrl) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [videoUrl, lenis]);

  // Filtering Logic
  const filteredFaqs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const mostAsked = useMemo(() => faqData.filter(f => f.popular).slice(0, 4), []);

  const handleFeedback = (id: number, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header & Search */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest mb-6"
        >
          <HelpCircle size={14} />
          Help Center
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-heading font-black text-white uppercase italic tracking-tighter mb-8 shadow-neon/10">
          Got Questions? <br /><span className="text-brand">We&apos;ve Got Answers.</span>
        </h2>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-0 bg-brand/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-brand/50 transition-all backdrop-blur-md">
            <Search className="ml-4 text-gray-500" size={24} />
            <input
              type="text"
              placeholder="Search for questions (e.g. membership, price, trainer...)"
              className="w-full bg-transparent border-none focus:ring-0 text-white p-4 placeholder:text-gray-600 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Categories */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 px-4">Categories</p>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all text-left ${
                  activeCategory === cat ? 'bg-brand text-white shadow-neon' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-9 space-y-12">
          {/* Most Asked Grid */}
          {searchTerm === '' && activeCategory === 'All' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-brand" />
                <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">Most Asked Questions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mostAsked.map(faq => (
                  <button
                    key={faq.id}
                    onClick={() => setOpenId(faq.id)}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-brand/50 transition-all hover:bg-white/[0.08] group"
                  >
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand mb-2">{faq.category}</p>
                    <h4 className="text-white font-bold group-hover:text-white mb-2">{faq.question}</h4>
                    <span className="text-xs text-brand/60 font-bold uppercase tracking-widest flex items-center gap-1">
                      View Answer <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Accordions */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <motion.div
                      key={faq.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group"
                    >
                      <div className={`bg-[#121212]/80 border transition-all duration-300 rounded-3xl overflow-hidden ${
                         isOpen ? 'border-brand/50 shadow-neon-strong' : 'border-white/5 hover:border-white/20'
                      }`}>
                        <button
                          onClick={() => setOpenId(isOpen ? null : faq.id)}
                          className="w-full px-8 py-7 flex justify-between items-center text-left"
                        >
                          <div className="flex-1 pr-8">
                            <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-2 block">{faq.category}</span>
                            <h3 className="text-lg md:text-xl font-heading font-bold text-white tracking-wide">{faq.question}</h3>
                          </div>
                          <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-brand text-white rotate-180' : 'bg-white/5 text-gray-500'}`}>
                            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                              <div className="px-8 pb-8 pt-2">
                                <div className="h-px w-full bg-white/5 mb-6" />
                                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                  {faq.answer}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                                  {/* Video CTA */}
                                  {faq.videoUrl && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVideoUrl(faq.videoUrl!);
                                      }}
                                      className="flex items-center gap-2 text-sm font-bold text-brand uppercase tracking-widest hover:text-brand-light transition-colors group"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Video size={14} />
                                      </div>
                                      Watch Video Explanation
                                    </button>
                                  )}

                                  {/* Feedback */}
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">Was this helpful?</span>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFeedback(faq.id, 'up');
                                      }}
                                      className={`p-2 rounded-lg border transition-all ${
                                        feedback[faq.id] === 'up' ? 'border-brand bg-brand/10 text-brand' : 'border-white/5 text-gray-500 hover:text-white'
                                      }`}
                                    >
                                      <ThumbsUp size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFeedback(faq.id, 'down');
                                      }}
                                      className={`p-2 rounded-lg border transition-all ${
                                        feedback[faq.id] === 'down' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/5 text-gray-500 hover:text-white'
                                      }`}
                                    >
                                      <ThumbsDown size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <Search size={48} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-2">No answers found</p>
                  <p className="text-gray-600 text-sm">Try searching for other keywords like &quot;membership&quot; or &quot;trainer&quot;.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Footer */}
          <div className="rounded-3xl p-10 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:translate-x-1/3 transition-transform" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight mb-2">Still have questions?</h3>
                <p className="text-gray-400">Can&apos;t find what you&apos;re looking for? Our elite support team is ready to help.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="#contact"
                  className="px-10 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-all shadow-xl hover:shadow-neon flex items-center justify-center gap-2"
                >
                  Contact Us
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Integration */}
      <AnimatePresence>
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
            onClick={() => setVideoUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-brand/20"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setVideoUrl(null)}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white/70 hover:text-white rounded-full transition-colors border border-white/10"
              >
                <XCircle size={24} />
              </button>
              <iframe 
                src={`${videoUrl}?autoplay=1`} 
                className="w-full h-full" 
                allow="autoplay; fullscreen"
                title="FAQ Video Explanation"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
