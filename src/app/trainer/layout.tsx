import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-20 lg:pt-24 min-h-screen bg-zinc-950">
        {children}
      </div>
      <Footer />
    </>
  );
}
