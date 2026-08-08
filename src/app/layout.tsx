import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import DisableRightClick from "@/components/DisableRightClick";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: {
    default: "Pinaka Fitness",
    template: "%s | PINAKA FITNESS",
  },
  description: "Experience the next level of fitness at Pinaka Fitness. State-of-the-art equipment, expert trainers, and a premium atmosphere to transform your body and mind.",
  keywords: ["Gym", "Fitness", "Training", "Bodybuilding", "Pinaka Fitness", "Premium Gym"],
  authors: [{ name: "Pinaka Fitness" }],
  openGraph: {
    title: "Pinaka Fitness",
    description: "Transform Your Body. Train with the Best Equipment.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://pinakafitness.com",
    siteName: "Pinaka Fitness",
    images: [{ url: "/logo1.png", width: 800, height: 600 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinaka Fitness",
    description: "Transform Your Body. Train with the Best Equipment.",
    images: ["/logo1.png"],
  },
  icons: {
    icon: "/logo1.png",
    apple: "/logo1.png",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pinakafitness.com"),
};

import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <AuthProvider>
            <SmoothScroll>
              <Preloader />
              <DisableRightClick />
              {children}
            </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
