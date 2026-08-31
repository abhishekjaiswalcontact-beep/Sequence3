'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { trainers } from "@/lib/trainerData";

export default function Trainers() {
  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {trainers.map((t, idx) => (
          <motion.div 
            key={idx} 
            layoutId={`trainer-${t.name}`}
            onClick={() => router.push(`/trainer/${t.id}`)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-surface cursor-pointer shadow-xl hover:shadow-brand/20 transition-shadow duration-500"
          >
            <Image 
              src={t.img} 
              alt={t.name} 
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <motion.h3 
                layoutId={`trainer-name-${t.name}`} 
                className="text-2xl sm:text-3xl font-heading font-black text-white mb-1.5 uppercase tracking-tight translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
              >
                {t.name}
              </motion.h3>
              <motion.p 
                layoutId={`trainer-role-${t.name}`} 
                className="text-brand-light font-bold uppercase tracking-[0.2em] text-xs sm:text-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              >
                {t.role}
              </motion.p>
              
              <div className="mt-6 overflow-hidden h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                <button className="text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/btn">
                  View Profile <motion.span className="inline-block" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
