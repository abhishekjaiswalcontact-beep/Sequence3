'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, ArrowRight, Dumbbell, Users, Target, Phone, Quote } from 'lucide-react';


const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
  );
  const TwitterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
  );
  const YoutubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
  );
  const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const relatedSearches = [
    'Gym Near Me', "Pinaka Fitness Noida", 'Corporate Wellness Program',
    'Personal Training Program', 'Gym Memberships Near Me', 'Fitness Near Me',
    'Pinaka Fitness Near Me', 'Personal Training Near Me', 'Gyms In Noida sector 127 ',
    'Gyms In Greater Noida', 'Gym Workout Routine', 'Weight Training for Weight Loss'
  ];

  const exploreLinks = [
    { title: 'Programs', href: '/#programs' },
    { title: 'Elite Trainers', href: '/#trainers' },
    { title: 'Corporate Wellness', href: '/#corporate' },
    { title: 'Careers', href: '/careers' },
    { title: 'Franchise', href: '/#contact' },
    { title: 'Sitemap', href: '#' },
  ];

  const whyChooseUs = [
    'Advanced AI Posture Analysis',
    'Olympic Weightlifting Zone',
    'Biomechanically Perfect Equipment',
    'Exclusive Recovery Lounge',
    'Personalized Diet Counseling'
  ];

  const socialIcons = [
    { Icon: FacebookIcon, href: '#' },
    { Icon: TwitterIcon, href: '#' },
    { Icon: YoutubeIcon, href: '#' },
    { Icon: InstagramIcon, href: '#' },
  ];

  return (
    <footer className="relative bg-[#050505] text-white border-t border-white/5 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-brand/10 to-transparent blur-3xl pointer-events-none opacity-50" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Elite Banner (CTA) */}
      <div className="border-b border-white/5 relative z-10 w-full bg-gradient-to-r from-black via-brand/5 to-black">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tighter mb-4">
                    Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">The Elite.</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-xl text-balance">
                    Join Pinaka Fitness today and experience the pinnacle of discipline, strength, and transformation.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <Link 
                    href="/login" 
                    className="px-8 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/20 hover:border-white/50 hover:bg-white/5 text-white"
                >
                    Member Portal
                </Link>
                <Link 
                    href="/#contact" 
                    className="group relative px-8 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <span className="relative z-10 text-white">Join Pinaka Elite</span>
                    <ArrowRight className="w-5 h-5 relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">

          {/* Column 1: Brand & Location (4 spans) */}
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" className="mb-8 block h-20 w-auto relative">
                <Image
                  src="/logo0.png"
                  alt="Pinaka Fitness"
                  width={180}
                  height={80}
                  className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  loading="lazy"
                />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md">
               We don&apos;t just build bodies; we build character. A premium sanctuary dedicated to absolute physical and mental transformation.
            </p>
            
            {/* Location & Contact Focus */}
            <div className="space-y-5 mb-10">
                <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 group-hover:border-brand/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <MapPin className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">Pinaka Fitness Noida</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sector 127, Noida<br/>
                            Uttar Pradesh, India
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 group-hover:border-brand/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <Phone className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            +91 78358 70089 <br/>
                            +91 78358 70082
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 group-hover:border-brand/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <Mail className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm leading-relaxed hover:text-white transition-colors cursor-pointer">
                            pinakafitnessnoida127@gmail.com
                        </p>
                    </div>
                </div>
            </div>

            {/* Gym Stats */}
            <div className="flex gap-6 border-t border-white/10 pt-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand">
                        <Users className="w-5 h-5"/>
                    </div>
                    <div>
                        <div className="font-heading font-black text-white">500+</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Members</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Dumbbell className="w-5 h-5"/>
                    </div>
                    <div>
                        <div className="font-heading font-black text-white">Top 1%</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Equipment</div>
                    </div>
                </div>
            </div>
          </div>

          {/* Column 2: Why Choose Us (3 spans) */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-white font-heading font-bold text-xl mb-8 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-5 h-5 text-brand" /> Why Pinaka
            </h3>
            <ul className="space-y-4">
                {whyChooseUs.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand group-hover:shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-shadow shrink-0" />
                        <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{reason}</span>
                    </li>
                ))}
            </ul>
          </div>

          {/* Column 3: Explore (2 spans) */}
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-white font-heading font-bold text-xl mb-8 uppercase tracking-widest">Explore</h3>
            <ul className="space-y-4">
                {exploreLinks.map((link) => (
                    <li key={link.title}>
                        <Link href={link.href} className="text-gray-400 text-sm hover:text-brand transition-colors inline-block hover:translate-x-1 transform duration-300">
                            {link.title}
                        </Link>
                    </li>
                ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Social (3 spans) */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[50px] -mr-10 -mt-10 pointer-events-none group-hover:bg-brand/30 transition-colors" />
                <h3 className="text-white font-heading font-bold text-lg mb-2 uppercase tracking-wide">The Elite Dispatch</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                    Weekly nutrition tips, AI training insights, and exclusive gym offers direct to your inbox.
                </p>
                
                <form onSubmit={handleSubscribe} className="relative mb-6">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 peer-focus:text-brand transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-full py-3.5 pl-11 pr-14 outline-none text-white text-sm placeholder:text-gray-600 focus:border-brand/50 focus:bg-white/5 transition-all shadow-inner"
                    />
                    <button 
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
                        disabled={isSubscribed}
                    >
                        {isSubscribed ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Quote */}
                <div className="relative pl-6 pt-2 border-l border-white/10">
                    <Quote className="absolute left-0 top-0 w-3 h-3 text-brand opacity-50 -translate-x-1.5 bg-[#0a0a0a]" />
                    <p className="text-gray-400 text-[11px] italic leading-relaxed">
                        &quot;Discipline is the bridge between goals and accomplishment. See you on the floor.&quot;
                    </p>
                </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
                {socialIcons.map(({ Icon, href }, i) => (
                    <Link key={i} href={href} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand hover:border-brand transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[0_5px_20px_rgba(139,92,246,0.4)]">
                        <Icon />
                    </Link>
                ))}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

        {/* Related Searches */}
        <div className="mb-12 text-center max-w-5xl mx-auto">
            <h4 className="font-bold mb-3 text-white/50 uppercase text-[10px] tracking-[0.3em]">Related Searches</h4>
            <p className="text-gray-500/70 text-[11px] leading-relaxed font-medium">
                {relatedSearches.join(' • ')}
            </p>
        </div>

        {/* Bottom Legal Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium tracking-wide">
          <span>&copy; {new Date().getFullYear()} Pinaka Fitness. All Rights Reserved.</span>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
