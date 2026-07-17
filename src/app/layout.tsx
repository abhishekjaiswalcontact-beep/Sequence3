import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { AudioProvider } from "@/context/AudioContext";

import DisableRightClick from "@/components/DisableRightClick";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import SoundControl from "@/components/SoundControl";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: "Pinaka Fitness | Premium Gym & Fitness Experience",
  description:
    "Experience the next level of fitness at Pinaka Fitness. State-of-the-art equipment, expert trainers, and a premium atmosphere.",

  keywords: [
    "Gym",
    "Fitness",
    "Workout",
    "Bodybuilding",
    "Personal Training",
    "Pinaka Fitness",
  ],

  authors: [
    {
      name: "Pinaka Fitness",
    },
  ],

  openGraph: {
    title: "Pinaka Fitness",
    description:
      "Transform Your Body. Train with the Best Equipment.",

    url: "https://pinakafitness.com",
    siteName: "Pinaka Fitness",

    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pinaka Fitness",
    description:
      "Transform Your Body. Train with the Best Equipment.",
    images: ["/logo1.png"],
  },

  icons: {
    icon: "/logo1.png",
    apple: "/logo1.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} font-sans antialiased overflow-x-hidden bg-[#050505] text-white`}
      >
        <AuthProvider>
          <AudioProvider>
            <SmoothScroll>
              <Preloader />

              <DisableRightClick />

              <SoundControl />

              {children}
            </SmoothScroll>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}