"use client";

import { notFound, useRouter, useParams } from "next/navigation";
import { trainers } from "@/lib/trainerData";
import { motion } from "framer-motion";
import { Award, BookOpen, Clock, Mail } from "lucide-react";
import Image from "next/image";

export default function TrainerProfile() {
  const router = useRouter();
  const params = useParams();
  const trainer = trainers.find((t) => t.id === params.id);

  if (!trainer) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-zinc-800/50 rounded-3xl overflow-hidden w-full h-auto flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-[10] flex items-center gap-2 px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md text-white border border-zinc-800 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:pl-6 group"
        >
          <motion.span animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>←</motion.span> Go Back
        </button>

        {/* Image Section */}
        <div className="w-full md:w-[45%] h-[50vh] md:h-auto relative shrink-0">
          <Image
            src={trainer.img}
            alt={trainer.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950 hidden md:block"></div>
          
          {/* Visual Accent */}
          <div className="absolute bottom-8 left-8 hidden md:block">
            <div className="w-20 h-1 bg-brand mb-4"></div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">Professional Trainer</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 flex-1 flex flex-col">
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl sm:text-6xl font-heading font-black text-white uppercase tracking-tighter mb-4 leading-none italic">
                {trainer.name}
              </h2>
              <div className="flex items-center gap-4">
                <p className="text-brand font-black uppercase tracking-[0.2em] text-sm">
                  {trainer.role}
                </p>
                <div className="h-px flex-1 bg-zinc-800"></div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-zinc-400 text-lg leading-relaxed italic font-medium">
                &quot;{trainer.bio}&quot;
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h4 className="flex items-center gap-2 text-white font-black mb-4 uppercase tracking-[0.2em] text-xs">
                    <Clock size={14} className="text-brand" /> Experience
                  </h4>
                  <p className="text-2xl text-zinc-200 font-heading font-bold tracking-tight">{trainer.experience}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h4 className="flex items-center gap-2 text-white font-black mb-4 uppercase tracking-[0.2em] text-xs">
                    <Award size={14} className="text-brand" /> Specialization
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trainer.skills.map((skill, i) => (
                      <span key={i} className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-xs font-bold tracking-widest uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <h4 className="flex items-center gap-2 text-white font-black mb-4 uppercase tracking-[0.2em] text-xs">
                    <BookOpen size={14} className="text-brand" /> Certifications
                  </h4>
                  <ul className="space-y-3">
                    {trainer.certifications.map((cert, i) => (
                      <li key={i} className="text-zinc-400 text-xs font-bold flex items-start gap-3 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 group-hover:scale-150 transition-transform"></span> {cert}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-10 border-t border-zinc-900 flex flex-col sm:flex-row gap-4 mt-auto"
            >
              <button onClick={() => router.push('/#contact')} className="flex-1 bg-brand text-black font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-brand/10">
                Book Session
              </button>
              <button onClick={() => router.push('/#contact')} className="flex items-center justify-center gap-3 bg-zinc-900 text-white border border-zinc-800 font-bold uppercase tracking-[0.2em] text-xs py-5 px-8 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all">
                <Mail size={16} /> Contact
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
