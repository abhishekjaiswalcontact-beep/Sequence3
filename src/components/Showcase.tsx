'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Workout', 'Trainers', 'Equipment'];

const showcaseItems = [
  {
    id: 1,
    category: 'Workout',
    title: 'Strength Squats',
    src: '/showcase/workout1.png',
    caption: 'Master your form with professional-grade squat racks.'
  },
  {
    id: 2,
    category: 'Trainers',
    title: 'Personal Coaching',
    src: '/showcase/trainer1.png',
    caption: 'Expert guidance tailored to your fitness goals.'
  },
  {
    id: 3,
    category: 'Equipment',
    title: 'Precision Dumbbells',
    src: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800&q=80',
    caption: 'High-quality iron for consistent strength gains.'
  },
  {
    id: 4,
    category: 'Workout',
    title: 'Core Stability',
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    caption: 'Build a solid foundation with core-focused exercises.'
  },
  {
    id: 5,
    category: 'Trainers',
    title: 'Athlete Mentorship',
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    caption: 'Train like a pro with our elite coaching staff.'
  },
  {
    id: 6,
    category: 'Equipment',
    title: 'Cardio Elite',
    src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    caption: 'State-of-the-art treadmills for endurance training.'
  },
  {
    id: 7,
    category: 'Workout',
    title: 'Heavy Deadlifts',
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    caption: 'Push your limits with our heavy lifting zones.'
  },
  {
    id: 8,
    category: 'Equipment',
    title: 'Functional Rig',
    src: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80',
    caption: 'Versatile equipment for dynamic functional movements.'
  },
  {
    id: 9,
    category: 'Trainers',
    title: 'Nutrition Support',
    src: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80',
    caption: 'Holistic wellness including dietary planning.'
  },
  {
    id: 10,
    category: 'Workout',
    title: 'Yoga & Mobility',
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    caption: 'Balance your intensity with flexibility sessions.'
  },
  {
    id: 11,
    category: 'Equipment',
    title: 'Cable Machines',
    src: 'https://images.unsplash.com/photo-1591940746466-3cbf5317770b?w=800&q=80',
    caption: 'Smooth resistance for isolated muscle targeting.'
  },
  {
    id: 12,
    category: 'Workout',
    title: 'HIIT Sprints',
    src: 'https://images.unsplash.com/photo-1434596954654-286b43d24269?w=800&q=80',
    caption: 'Burn maximum calories in minimum time.'
  }
];

import { useLenis } from 'lenis/react';

export default function Showcase() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const lenis = useLenis();

  // Memoize filtered items — avoids recompute on every render
  const filteredItems = useMemo(
    () => showcaseItems.filter(item => activeFilter === 'All' || item.category === activeFilter),
    [activeFilter]
  );

  const openLightbox = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Lenis Scroll Lock
  useEffect(() => {
    if (selectedImage !== null) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [selectedImage, lenis]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredItems.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredItems]);

  return (
    <section id="showcase" className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 -z-1" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg md:text-xl uppercase tracking-[0.5em] text-brand font-black mb-6">Our Gallery</h2>
            <h3 className="text-4xl md:text-6xl font-heading font-black text-white uppercase italic tracking-tighter">
              Experience the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Pinaka Standard</span>
            </h3>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  setVisibleCount(6);
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  activeFilter === cat 
                    ? 'bg-brand text-white shadow-neon scale-105' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredItems.slice(0, visibleCount).map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => openLightbox(idx)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl bg-surface border border-white/5 aspect-[4/5] md:aspect-square"
              >
                {/* Image — Next.js Image for lazy loading + WebP */}
                <div className="absolute inset-0">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="overflow-hidden">
                    <motion.p className="text-brand uppercase text-xs font-black tracking-[0.3em] mb-2">
                      {item.category}
                    </motion.p>
                    <h4 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-white/60 text-sm md:text-base line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {item.caption}
                    </p>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View More */}
        {filteredItems.length > visibleCount && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="group flex flex-col items-center gap-4"
            >
              <span className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold group-hover:text-brand transition-colors">
                Discover More
              </span>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand/50 transition-all group-hover:scale-110 bg-white/5">
                <ChevronDown className="text-white group-hover:text-brand animate-bounce" size={20} />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors z-[210] p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Navigation - now visible on mobile too but more subtle */}
            <button 
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[210] p-3 bg-white/5 rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[210] p-3 bg-white/5 rounded-full"
              onClick={nextImage}
            >
              <ChevronRight size={32} />
            </button>

            <motion.div 
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={filteredItems[selectedImage].src} 
                alt={filteredItems[selectedImage].title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/5"
              />
              
              <div className="mt-8 text-center max-w-2xl px-4">
                <span className="text-brand uppercase tracking-[0.3em] text-xs font-black mb-4 block">
                  {filteredItems[selectedImage].category}
                </span>
                <h4 className="text-3xl md:text-5xl font-heading font-black text-white uppercase italic mb-4">
                  {filteredItems[selectedImage].title}
                </h4>
                <p className="text-white/60 text-lg leading-relaxed">
                  {filteredItems[selectedImage].caption}
                </p>
                
                <div className="mt-8 flex items-center justify-center gap-4">
                  <span className="text-white/20 text-sm font-bold">
                    {selectedImage + 1} / {filteredItems.length}
                  </span>
                </div>

                {/* Mobile-only Explicit Close Button */}
                <button
                  onClick={closeLightbox}
                  className="mt-10 md:hidden px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 flex items-center gap-2 transition-all active:scale-95"
                >
                  <X size={18} />
                  Back to Gallery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

