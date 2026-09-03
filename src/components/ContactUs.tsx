'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle2, MapPin, Phone, Clock, AlertCircle, MessageCircle, ExternalLink, Navigation, Bookmark } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function ContactUs() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    botField: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [contactInfo, setContactInfo] = useState({
    gymName: "Pinaka Fitness Noida",
    addressLine1: "Pinaka Fitness, Sector 127 Near Shani Mandir",
    addressLine2: "Noida, UP 201301",
    phone1: "+91-783-587-0089",
    phone2: "+91-783-587-0082",
    email: "pinakafitnessnoidasec127@gmail.com",
    hoursHeadline: "Open 18/7",
    hoursNote: "*Staff 5AM-10PM",
    mapsUrl: "https://www.google.com/maps/place/PINAKA+FITNESS/@28.5332574,77.3542702,851m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390ce7d06cfc41ad:0x5136f01d684bb5c3!8m2!3d28.5332574!4d77.3542702!16s%2Fg%2F11zd49g43c?entry=ttu",
    instagramUrl: "https://www.instagram.com/pinakafitnessnoida127/?hl=en",
    youtubeUrl: "#",
    facebookUrl: "#",
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/public/content?section=contact')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && isMounted) {
          setContactInfo((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Contact content fetch error', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', botField: '' });

      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
      setStatus('idle');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section id="contact" className="relative bg-[#050505] overflow-hidden">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "150px 0px 150px 0px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div variants={itemVariants}>
              {/* Level 1: Eyebrow */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)] mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
                  DIRECT CONCIERGE
                </span>
              </div>

              {/* Level 2: Main Heading */}
              <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white uppercase tracking-tight leading-tight mb-2.5">
                GET IN <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-indigo-200 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">TOUCH</span>
              </h2>

              {/* Level 3: Supporting Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-sm leading-relaxed">
                Start your elite transformation. Reach out to our dedicated concierge team or visit our flagship facility today.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Card */}
              <motion.a 
                href={contactInfo.mapsUrl || "https://maps.google.com/?q=Sector+127,+Noida"} 
                target="_blank" 
                rel="noreferrer"
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[160px] backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand/20 rounded-full blur-xl group-hover:bg-brand/40 transition-colors" />
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4 text-brand" />
                </div>
                <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">Our Location <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></h5>
                <p className="text-gray-400 text-xs leading-relaxed">{contactInfo.addressLine1}<br />{contactInfo.addressLine2}</p>
              </motion.a>

              {/* Phone Card */}
              <motion.div 
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[160px] backdrop-blur-sm shadow-lg hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors" />
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Phone className="w-4 h-4 text-brand" />
                </div>
                <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Call Us</h5>
                <a href={`tel:${contactInfo.phone1.replace(/\s+/g, '')}`} className="text-gray-400 hover:text-white text-xs leading-relaxed block transition-colors mb-1">{contactInfo.phone1}</a>
                <a href={`tel:${contactInfo.phone2.replace(/\s+/g, '')}`} className="text-gray-400 hover:text-white text-xs leading-relaxed block transition-colors">{contactInfo.phone2}</a>
              </motion.div>

              {/* Email Card */}
              <motion.div 
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[160px] backdrop-blur-sm shadow-lg hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand/20 rounded-full blur-xl group-hover:bg-brand/40 transition-colors" />
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4 text-brand" />
                </div>
                <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Email Us</h5>
                <p className="text-gray-400 text-xs font-mono mb-3">{contactInfo.email}</p>
                <a href={`mailto:${contactInfo.email}`} className="mt-auto text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-light w-max">
                  Send Email <Navigation className="w-3 h-3 rotate-90" />
                </a>
              </motion.div>

              {/* Hours Card */}
              <motion.div 
                variants={itemVariants}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[160px] backdrop-blur-sm shadow-lg hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors" />
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4 text-brand" />
                </div>
                <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Hours</h5>
                <p className="text-brand font-black text-sm uppercase tracking-widest mb-1">{contactInfo.hoursHeadline}</p>
                <p className="text-gray-500 text-[10px] italic">{contactInfo.hoursNote}</p>
              </motion.div>
            </div>

            {/* Socials & Embed */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-2">
              <a href={contactInfo.instagramUrl || "https://www.instagram.com/pinakafitnessnoida127/?hl=en"} aria-label="Pinaka Fitness on Instagram" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:border-[#E1306C] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(225,48,108,0.4)]">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href={`mailto:${contactInfo.email}`} aria-label="Email Pinaka Fitness" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(37,211,102,0.4)]">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={contactInfo.youtubeUrl || "#"} aria-label="Pinaka Fitness on YouTube" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(255,0,0,0.4)]">
                <YoutubeIcon className="w-5 h-5" />
              </a>
              
              {/* Optional: Tiny Google Map Preview visual */}
              <a 
                href={contactInfo.mapsUrl || "https://www.google.com/maps/place/PINAKA+FITNESS/@28.5332574,77.3542702,851m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390ce7d06cfc41ad:0x5136f01d684bb5c3!8m2!3d28.5332574!4d77.3542702!16s%2Fg%2F11zd49g43c?entry=ttu"}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Pinaka Fitness location in Google Maps"
                className="ml-auto w-24 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group hover:border-brand/50 transition-colors"
                title="Open in Maps"
              >
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Sector+127,Noida&zoom=14&size=200x100&sensor=false&style=feature:all|element:labels|visibility:off&style=feature:water|color:0x1a1a1a&style=feature:landscape|color:0x000000&style=feature:road|color:0x333333&style=feature:poi|visibility:off')] bg-cover bg-center opacity-50 group-hover:opacity-100 transition-opacity mix-blend-luminosity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                  <MapPin className="w-4 h-4 text-white drop-shadow-md group-hover:text-brand transition-colors" />
                </div>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Premium Form */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0c0c0e]/80 border border-white/10 p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none" />

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center text-center py-16"
                  >
                    <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mb-8 border border-brand/30 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative group">
                      <div className="absolute inset-0 rounded-full animate-ping bg-brand/20 opacity-75"></div>
                      <CheckCircle2 className="w-12 h-12 text-brand relative z-10" />
                    </div>
                    <h3 className="text-3xl font-heading font-black text-white mb-4 uppercase tracking-tighter shadow-sm">Message Delivered</h3>
                    <p className="text-gray-400 max-w-sm mb-8">
                      Your inquiry has been secured. Our elite support team will initiate contact within 24 hours.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-6 py-3 rounded-full border border-brand/50 text-brand hover:bg-brand hover:text-white font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10"
                  >
                    <h3 className="text-2xl font-heading font-bold text-white mb-2 uppercase tracking-wide flex items-center gap-3">
                      Drop a Message
                    </h3>
                    <p className="text-gray-400 text-sm mb-8">Fill out the form below and we will get back to you.</p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      {/* Honeypot field for spam prevention */}
                      <input
                        type="text"
                        name="botField"
                        value={formData.botField}
                        onChange={handleChange}
                        className="hidden"
                        style={{ display: 'none' }}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="group relative">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className={`peer w-full bg-black/40 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} focus:border-brand rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:bg-white/5 transition-all duration-300 placeholder-transparent disabled:opacity-50`}
                            placeholder="Name"
                          />
                          <label className="absolute left-5 -top-2.5 bg-[#050505] px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 peer-focus:text-brand peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:tracking-widest transition-all">
                            Name
                          </label>
                          <User className="absolute right-5 top-4 w-4 h-4 text-gray-600 peer-focus:text-brand transition-colors" />
                          {errors.name && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.name}</p>}
                        </div>

                        {/* Phone Field */}
                        <div className="group relative">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className={`peer w-full bg-black/40 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} focus:border-brand rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:bg-white/5 transition-all duration-300 placeholder-transparent disabled:opacity-50`}
                            placeholder="Phone"
                          />
                          <label className="absolute left-5 -top-2.5 bg-[#050505] px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 peer-focus:text-brand peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:tracking-widest transition-all">
                            Phone
                          </label>
                          <Phone className="absolute right-5 top-4 w-4 h-4 text-gray-600 peer-focus:text-brand transition-colors" />
                          {errors.phone && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="group relative mt-8">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          className={`peer w-full bg-black/40 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} focus:border-brand rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:bg-white/5 transition-all duration-300 placeholder-transparent disabled:opacity-50`}
                          placeholder="Email"
                        />
                        <label className="absolute left-5 -top-2.5 bg-[#050505] px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 peer-focus:text-brand peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:tracking-widest transition-all">
                          Email Address
                        </label>
                        <Mail className="absolute right-5 top-4 w-4 h-4 text-gray-600 peer-focus:text-brand transition-colors" />
                        {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.email}</p>}
                      </div>

                      {/* Subject Field */}
                      <div className="group relative mt-8">
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          className="peer w-full bg-black/40 border border-white/10 focus:border-brand rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:bg-white/5 transition-all duration-300 placeholder-transparent disabled:opacity-50"
                          placeholder="Subject"
                        />
                        <label className="absolute left-5 -top-2.5 bg-[#050505] px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 peer-focus:text-brand peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:tracking-widest transition-all">
                          Subject / Inquiry Type
                        </label>
                        <Bookmark className="absolute right-5 top-4 w-4 h-4 text-gray-600 peer-focus:text-brand transition-colors" />
                      </div>

                      {/* Message Field */}
                      <div className="group relative mt-8">
                        <textarea
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          className={`peer w-full bg-black/40 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} focus:border-brand rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:bg-white/5 transition-all duration-300 placeholder-transparent disabled:opacity-50 resize-none`}
                          placeholder="Message"
                        ></textarea>
                        <label className="absolute left-5 -top-2.5 bg-[#050505] px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 peer-focus:text-brand peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:uppercase peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:tracking-widest transition-all">
                          Your Message
                        </label>
                        <MessageSquare className="absolute right-5 top-4 w-4 h-4 text-gray-600 peer-focus:text-brand transition-colors" />
                        {errors.message && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.message}</p>}
                      </div>

                      {errors.submit && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.submit}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full relative group/btn py-4 rounded-xl font-heading font-extrabold uppercase tracking-widest text-xs transition-all overflow-hidden bg-brand text-white hover:bg-brand-light shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:opacity-50"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {status === 'submitting' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Transmitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Transmission
                            </>
                          )}
                        </span>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
