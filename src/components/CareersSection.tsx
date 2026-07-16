"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";

const jobs = [
  {
    title: "Senior Personal Trainer",
    location: "Mumbai, MH",
    type: "Full-Time",
    salary: "₹6L - ₹10L PA",
    description: "Looking for an elite trainer with 5+ years experience in bodybuilding and functional training.",
  },
  {
    title: "Front Desk Associate",
    location: "Pune, MH",
    type: "Full-Time",
    salary: "₹3L - ₹5L PA",
    description: "Provide exceptional customer service and manage gym memberships and guest relations.",
  },
  {
    title: "Gym Operations Manager",
    location: "Mumbai, MH",
    type: "Full-Time",
    salary: "₹8L - ₹12L PA",
    description: "Oversee day-to-day operations, staff management, and facility maintenance for our flagship club.",
  },
  {
    title: "Sales Consultant",
    location: "Bangalore, KA",
    type: "Full-Time",
    salary: "₹4L - ₹7L PA + Incentives",
    description: "Drive membership sales and corporate partnerships through proactive outreach and club tours.",
  },
];

export default function CareersSection() {
  return (
    <div className="space-y-6">
      {jobs.map((job, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="group relative bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-8 hover:border-brand/30 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand/20">
                  {job.type}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                  <MapPin size={14} />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                  <Clock size={14} />
                  Recently Posted
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white group-hover:text-brand transition-colors duration-300">
                  {job.title}
                </h3>
                <p className="text-zinc-400 mt-2 max-w-2xl text-sm leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="text-zinc-300 font-medium text-sm">
                Expected Salary: <span className="text-white">{job.salary}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="#resume" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-brand hover:text-white transition-all duration-300 flex items-center gap-2 group/btn">
                Apply Now
                <ArrowUpRight size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
