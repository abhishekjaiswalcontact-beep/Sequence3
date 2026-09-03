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

interface FAQItem {
  id: number | string;
  category: string;
  popular?: boolean;
  question: string;
  answer: string;
  videoUrl?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
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
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/public/faqs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0 && isMounted) {
          setFaqs(data);
        }
      })
      .catch((err) => console.error('FAQ dynamic fetch error', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic Categories from FAQ list
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

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
    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, activeCategory]);

  const mostAsked = useMemo(() => faqs.filter(f => f.popular).slice(0, 4), [faqs]);

  const handleFeedback = (id: number | string, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [String(id)]: type }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header & Search */}
      <div className="text-center mb-10 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px 150px 0px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center transform-gpu"
        >
          {/* Level 1: Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)] mb-2.5">
            <HelpCircle size={13} className="text-brand-light" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
              HELP &amp; INTEL
            </span>
          </div>

          {/* Level 2: Main Heading */}
          <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white uppercase tracking-tight leading-tight mb-2.5 max-w-2xl">
            GOT QUESTIONS? <br />
            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-200 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              WE&apos;VE GOT ANSWERS.
            </span>
          </h2>

          {/* Level 3: Supporting Description */}
          <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-lg mx-auto leading-relaxed mb-6">
            Everything you need to know about our memberships, elite training methodology, 24/7 facility access, and AI bio-analytics.
          </p>

          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search by topic, e.g., 'parking', 'refund', 'guest'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand transition-all text-xs sm:text-sm backdrop-blur-md"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Categories */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-4 py-2">Categories</p>
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                    {cat === 'All' ? faqs.length : faqs.filter(f => f.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Support Badge */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-brand/20 text-center lg:text-left">
            <h4 className="text-white font-bold text-sm mb-1 uppercase">Need Human Help?</h4>
            <p className="text-gray-400 text-xs mb-4">Our front desk team is online 24/7 to solve custom queries.</p>
            <Link 
              href="#contact" 
              className="inline-block w-full py-2.5 rounded-xl bg-white/5 hover:bg-brand text-white border border-white/10 hover:border-transparent text-[10px] font-black uppercase tracking-widest text-center transition-all"
            >
              Direct Chat
            </Link>
          </div>
        </div>

        {/* Right Column: FAQ Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Most Asked Preview Grid (Only if on 'All' and no search) */}
          {!searchTerm && activeCategory === 'All' && mostAsked.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 text-brand-light">
                <TrendingUp size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Most Asked Questions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mostAsked.map((faq) => (
                  <div 
                    key={faq.id}
                    onClick={() => {
                      setOpenId(faq.id);
                      document.getElementById(`faq-${faq.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand/40 transition-all cursor-pointer group"
                  >
                    <p className="text-white text-xs font-bold uppercase tracking-tight group-hover:text-brand-light transition-colors line-clamp-1 mb-1">
                      {faq.question}
                    </p>
                    <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accordion FAQ List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openId === faq.id;

                  return (
                    <motion.div
                      key={faq.id}
                      id={`faq-${faq.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isOpen 
                          ? 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] border-brand/40 shadow-xl shadow-brand/5' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-brand text-xs font-mono font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-white text-sm sm:text-base font-bold tracking-tight">
                            {faq.question}
                          </span>
                        </div>
                        <div className={`p-1.5 rounded-full border border-white/10 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand text-white border-brand' : 'text-gray-400'}`}>
                          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                        </div>
                      </button>

                      {/* Content expansion */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="px-6 pb-6 pt-2 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5"
                            >
                              <p className="mb-4">{faq.answer}</p>
                              
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                {/* Video Help Button */}
                                {faq.videoUrl ? (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVideoUrl(faq.videoUrl || null);
                                    }}
                                    className="flex items-center gap-2 text-brand-light hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                                  >
                                    <Video size={14} /> Watch 1-Min Video Guide
                                  </button>
                                ) : <div />}

                                {/* Helpful Feedback */}
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] uppercase font-mono text-gray-500">Helpful?</span>
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFeedback(faq.id, 'up');
                                      }}
                                      aria-label="Thumbs up"
                                      className={`p-2 rounded-lg border transition-all ${
                                        feedback[String(faq.id)] === 'up' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 text-gray-500 hover:text-white'
                                      }`}
                                    >
                                      <ThumbsUp size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFeedback(faq.id, 'down');
                                      }}
                                      aria-label="Thumbs down"
                                      className={`p-2 rounded-lg border transition-all ${
                                        feedback[String(faq.id)] === 'down' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/5 text-gray-500 hover:text-white'
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
                aria-label="Close video explanation"
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
