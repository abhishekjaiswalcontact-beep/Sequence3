import Navbar from "@/components/Navbar";
import Image from "next/image";
import DietPlanner from "@/components/DietPlanner";

export const metadata = {
  title: "AI Diet Planner | Pinaka Fitness",
  description: "Generate and customize your macro-precise, AI-powered diet plans at Pinaka Fitness.",
};

export default function DietPage() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-brand/30 pb-16">
      <Navbar />

      {/* Background Graphic */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 opacity-30">
        <Image
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=70&w=1200"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 w-full pt-32 md:pt-36 px-6 container mx-auto">
        <DietPlanner />
      </div>

      <div className="mt-20">

      </div>
    </main>
  );
}
