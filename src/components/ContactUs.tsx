'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle2, MapPin, Phone, Clock, AlertCircle, MessageCircle, ExternalLink, Navigation } from 'lucide-react';

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
    message: '',
    botField: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
      setFormData({ name: '', email: '', phone: '', message: '', botField: '' });

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.15, ease: 'easeOut' }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <>
      <div className="relative bg-black overflow-hidden" id="contact">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] mix-blend-screen" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10"
        >
          {/* Left Column: Info & Cards */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-3 uppercase tracking-tighter">
                Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Touch</span>
              </h2>
              <p className="text-gray-400 max-w-sm text-balance leading-relaxed">
                Start your elite transformation. Reach out to our team or visit our flagship facility today.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Card */}
              <motion.a 
                href="https://maps.google.com/?q=Sector+127,+Noida" 
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
                <p className="text-gray-400 text-xs leading-relaxed">Pinaka Fitness, Sector 127<br />Noida, UP 201301</p>
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
                <a href="tel:+918004963569" className="text-gray-400 hover:text-white text-xs leading-relaxed block transition-colors mb-1">+91-783-587-0089</a>
                <a href="tel:+911204567890" className="text-gray-400 hover:text-white text-xs leading-relaxed block transition-colors">+91-783-587-0082</a>
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
                <p className="text-gray-400 text-xs font-mono mb-3">pinakafitnessnoidasec127@gmail.com</p>
                <a href="mailto:pinakafitnessnoidasec127@gmail.com" className="mt-auto text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-light w-max">
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
                <p className="text-brand font-black text-sm uppercase tracking-widest mb-1">Open 24/7</p>
                <p className="text-gray-500 text-[10px] italic">*Staff 5AM-10PM</p>
              </motion.div>
            </div>

            {/* Socials & Embed */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-2">
              <a href="https://www.instagram.com/pinakafitnessnoida127/?hl=en" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:border-[#E1306C] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(225,48,108,0.4)]">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="pinakafitnessnoidasec127@gmail.com" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(37,211,102,0.4)]">
                <MessageCircle className="w-5 h-5" /> {/* WhatsApp stand-in */}
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] text-gray-400 hover:text-white transition-all transform hover:scale-110 shadow-lg hover:shadow-[0_5px_15px_rgba(255,0,0,0.4)]">
                <YoutubeIcon className="w-5 h-5" />
              </a>
              
              {/* Optional: Tiny Google Map Preview visual */}
              <a 
                href="https://www.google.com/maps/place/PINAKA+FITNESS/@28.5332574,77.3542702,851m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390ce7d06cfc41ad:0x5136f01d684bb5c3!8m2!3d28.5332574!4d77.3542702!16s%2Fg%2F11zd49g43c?entry=ttu&g_ep=EgoyMDI2MDcyMS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
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
            <div className="bg-[#050505]/80 backdrop-blur-md relative rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] p-8 lg:p-12 h-full">
              {/* Gradient overlay inside form box */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/30 blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-blue-500 to-brand" />

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
                        {errors.message && <p className="text-red-500 text-xs mt-1 absolute -bottom-3 left-1">{errors.message}</p>}
                      </div>

                      <AnimatePresence>
                        {errors.submit && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-500 text-sm mt-4"
                          >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{errors.submit}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'submitting'}
                        className="group relative w-full py-4 mt-6 bg-brand text-white font-bold rounded-xl overflow-hidden transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {status === 'submitting' ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Transmitting...
                            </>
                          ) : (
                            <>
                              Send Message
                              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-brand to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Live Chat Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", bounce: 0.5 }}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-tr from-brand to-blue-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group"
        aria-label="Live Chat"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-brand/40 opacity-75"></div>
        <MessageSquare className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
      </motion.button>
    </>
  );
}
