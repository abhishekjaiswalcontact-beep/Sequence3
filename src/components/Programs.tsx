'use client';


import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Dumbbell, HeartPulse, Flame, PersonStanding, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const programs = [
  {
    slug: 'strength',
    title: 'Strength',
    icon: Dumbbell,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    desc: 'Build muscle and power with our free weights and machines.',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.35)',
    emoji: '🏋️',
    tag: '5 Exercises',
    badge: 'Most Popular',
  },
  {
    slug: 'cardio',
    title: 'Cardio',
    icon: HeartPulse,
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
    desc: 'Improve endurance with top-tier treadmills and bikes.',
    accentColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.35)',
    emoji: '❤️',
    tag: '5 Exercises',
    badge: 'Fat Burner',
  },
  {
    slug: 'hiit',
    title: 'HIIT',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    desc: 'High-intensity interval training to burn fat fast.',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.35)',
    emoji: '🔥',
    tag: '5 Exercises',
    badge: 'Intense',
  },
  {
    slug: 'yoga',
    title: 'Yoga',
    icon: PersonStanding,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    desc: 'Enhance flexibility and mindfulness in our calm studio.',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.35)',
    emoji: '🧘',
    tag: '5 Exercises',
    badge: 'Mind & Body',
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Programs() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleProgramClick = (slug: string) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/program/' + slug);
      return;
    }
    router.push(`/program/${slug}`);
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      {programs.map((prog) => {
        const Icon = prog.icon;
        return (
          <motion.div key={prog.slug} variants={cardVariants}>
            <div 
              onClick={() => handleProgramClick(prog.slug)} 
              className="block h-full cursor-pointer"
            >
              <motion.div
                className="relative h-full rounded-2xl flex flex-col items-center text-center overflow-hidden group"
                style={{
                  background: 'rgba(18, 18, 18, 0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}
                whileHover={{
                  scale: 1.04,
                  borderColor: prog.accentColor + '60',
                  boxShadow: `0 0 30px ${prog.glowColor}, 0 0 60px ${prog.glowColor.replace('0.35', '0.12')}`,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {/* Image Section */}
                <div className="relative w-full h-48 overflow-hidden">
                  <motion.img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <div
                    className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md z-20"
                    style={{
                      color: prog.accentColor,
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${prog.accentColor}40`,
                    }}
                  >
                    {prog.badge}
                  </div>
                </div>

                <div className="p-7 flex flex-col items-center flex-1">
                  {/* Top glow background */}
                  <motion.div
                    className="absolute top-48 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                    style={{ background: prog.accentColor }}
                  />

                  {/* Icon Circle */}
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 -mt-16 relative z-10"
                    style={{
                      background: 'rgba(18,18,18,0.9)',
                      border: `1.5px solid ${prog.accentColor}35`,
                      backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.4 } }}
                  >
                    <Icon
                      size={28}
                      style={{ color: prog.accentColor }}
                    />
                  </motion.div>

                  {/* Title */}
                  <h3
                    className="text-2xl font-heading font-extrabold uppercase tracking-wider mb-1 relative z-10 transition-colors duration-200"
                    style={{ color: 'white' }}
                  >
                    {prog.title}
                  </h3>

                  {/* Tag */}
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 relative z-10" style={{ color: prog.accentColor }}>
                    {prog.tag}
                  </p>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10 flex-1">
                    {prog.desc}
                  </p>

                  {/* CTA Row */}
                  <motion.div
                    className="flex items-center gap-1.5 mt-5 text-sm font-bold relative z-10"
                    style={{ color: prog.accentColor }}
                    initial={{ opacity: 0.6, x: 0 }}
                    whileHover={{ opacity: 1, x: 4 }}
                  >
                    <span>View Program</span>
                    <ArrowRight size={15} />
                  </motion.div>
                </div>

                {/* Bottom accent bar */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
                  style={{ background: `linear-gradient(to right, transparent, ${prog.accentColor}, transparent)` }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileHover={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.25 }}
                />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
