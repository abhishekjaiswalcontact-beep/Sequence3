import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Programs from "@/components/Programs";
import Trainers from "@/components/Trainers";
import Pricing from "@/components/Pricing";
import Showcase from "@/components/Showcase";
import ContactUs from "@/components/ContactUs";
import SupportFAQ from "@/components/SupportFAQ";
import Chatbot from "@/components/Chatbot";


export default function Home() {
  return (
    <main className="relative bg-black text-white selection:bg-brand/30">
      <Navbar />

      {/* Background/Hero Section */}
      <HeroSection />

      {/* Global Background Image */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e"
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full">
        <section id="programs" className="py-24 px-6 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Our Programs</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Programs />
        </section>

        <section id="trainers" className="py-24 px-6 container mx-auto bg-black/50 backdrop-blur-sm rounded-[3rem] border border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter text-white">Elite Trainers</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Trainers />
        </section>

        <section id="showcase" className="py-24">
          <Showcase />
        </section>

        <section id="pricing" className="py-24 px-6 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Membership Plans</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <Pricing />
        </section>

        <section id="faq" className="py-24 px-6 container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 uppercase tracking-tighter">Help & FAQ</h2>
            <div className="w-20 h-1 bg-brand mx-auto" />
          </div>
          <SupportFAQ />
        </section>

        <section id="contact" className="py-24 px-6">
          <ContactUs />
        </section>
      </div>

      <Footer />
      <Chatbot />
    </main>

  );
}
