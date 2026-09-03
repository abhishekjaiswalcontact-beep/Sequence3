import { prisma } from "@/lib/prisma";

export const DEFAULT_TRAINERS = [
  {
    slug: "alex-mercer",
    name: "Alex Mercer",
    role: "Head Coach",
    img: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=600&q=75&auto=format&fit=crop",
    experience: "10 Years",
    skills: JSON.stringify(["Bodybuilding", "Strength Training", "Nutrition"]),
    certifications: JSON.stringify(["ACE Personal Trainer", "Precision Nutrition L1"]),
    achievements: JSON.stringify(["National Champion 2018", "Coach of the Year 2021"]),
    bio: "Alex is a veteran with over a decade of experience helping clients achieve their dream physiques. His approach combines heavy lifting with strict nutritional science.",
    email: "alex@sequence.fitness",
    phone: "+91-783-587-0089",
    socialLinks: JSON.stringify({ instagram: "https://instagram.com", twitter: "https://twitter.com" }),
    order: 0,
    isActive: true,
  },
  {
    slug: "sarah-connor",
    name: "Sarah Connor",
    role: "Strength Specialist",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format&fit=crop",
    experience: "7 Years",
    skills: JSON.stringify(["Powerlifting", "Functional Fitness", "Mobility"]),
    certifications: JSON.stringify(["NASM Personal Trainer", "CrossFit L2 Trainer"]),
    achievements: JSON.stringify(["State Powerlifting Record Holder", "Rehab Specialist"]),
    bio: "Sarah believes that strength is the foundation of a healthy life. She specializes in powerlifting and functional movements, ensuring her clients build resilient bodies.",
    email: "sarah@sequence.fitness",
    phone: "+91-783-587-0082",
    socialLinks: JSON.stringify({ instagram: "https://instagram.com" }),
    order: 1,
    isActive: true,
  },
  {
    slug: "david-gogg",
    name: "David Gogg",
    role: "Endurance & HIIT",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=75&auto=format&fit=crop",
    experience: "12 Years",
    skills: JSON.stringify(["HIIT", "Marathon Training", "Mental Toughness"]),
    certifications: JSON.stringify(["ISSA Personal Trainer", "USA Track & Field Coach"]),
    achievements: JSON.stringify(["Completed 50+ Ultramarathons", "Elite Conditioning Coach"]),
    bio: "David pushes his clients past their perceived limits. Specializing in high-intensity interval training and endurance, he transforms both physical and mental capabilities.",
    email: "david@sequence.fitness",
    phone: "+91-783-587-0089",
    socialLinks: JSON.stringify({ instagram: "https://instagram.com", youtube: "https://youtube.com" }),
    order: 2,
    isActive: true,
  },
];

export const DEFAULT_GALLERY = [
  {
    category: "Workout",
    title: "Strength Squats",
    src: "/showcase/workout1.png",
    caption: "Master your form with professional-grade squat racks.",
    order: 0,
    isActive: true,
  },
  {
    category: "Trainers",
    title: "Personal Coaching",
    src: "/showcase/trainer1.png",
    caption: "Expert guidance tailored to your fitness goals.",
    order: 1,
    isActive: true,
  },
  {
    category: "Equipment",
    title: "Precision Dumbbells",
    src: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=600&q=75&auto=format",
    caption: "High-quality iron for consistent strength gains.",
    order: 2,
    isActive: true,
  },
  {
    category: "Workout",
    title: "Core Stability",
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=75&auto=format",
    caption: "Build a solid foundation with core-focused exercises.",
    order: 3,
    isActive: true,
  },
  {
    category: "Trainers",
    title: "Athlete Mentorship",
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format",
    caption: "Train like a pro with our elite coaching staff.",
    order: 4,
    isActive: true,
  },
  {
    category: "Equipment",
    title: "Cardio Elite",
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=75&auto=format",
    caption: "State-of-the-art treadmills for endurance training.",
    order: 5,
    isActive: true,
  },
  {
    category: "Workout",
    title: "Heavy Deadlifts",
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75&auto=format",
    caption: "Push your limits with our heavy lifting zones.",
    order: 6,
    isActive: true,
  },
  {
    category: "Equipment",
    title: "Functional Rig",
    src: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=75&auto=format",
    caption: "Versatile equipment for dynamic functional movements.",
    order: 7,
    isActive: true,
  },
  {
    category: "Trainers",
    title: "Nutrition Support",
    src: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=75&auto=format",
    caption: "Holistic wellness including dietary planning.",
    order: 8,
    isActive: true,
  },
  {
    category: "Workout",
    title: "Yoga & Mobility",
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=75&auto=format",
    caption: "Balance your intensity with flexibility sessions.",
    order: 9,
    isActive: true,
  },
  {
    category: "Equipment",
    title: "Cable Machines",
    src: "https://images.unsplash.com/photo-1591940746466-3cbf5317770b?w=600&q=75&auto=format",
    caption: "Smooth resistance for isolated muscle targeting.",
    order: 10,
    isActive: true,
  },
  {
    category: "Workout",
    title: "HIIT Sprints",
    src: "https://images.unsplash.com/photo-1434596954654-286b43d24269?w=600&q=75&auto=format",
    caption: "Burn maximum calories in minimum time.",
    order: 11,
    isActive: true,
  },
];

export const DEFAULT_PRICING_PLANS = [
  {
    planId: "monthly",
    title: "Monthly",
    price: "4999",
    period: "month",
    subtitle: "Flexible commitment",
    savings: "",
    popular: false,
    badge: "",
    gradient: "from-gray-600 to-gray-800",
    buttonText: "Join Now",
    buttonLink: "/#contact",
    order: 0,
    isActive: true,
  },
  {
    planId: "quarterly",
    title: "3 Months",
    price: "9999",
    period: "3 months",
    subtitle: "Strong foundation",
    savings: "Save ₹4998",
    popular: false,
    badge: "",
    gradient: "from-blue-600 to-blue-900",
    buttonText: "Join Now",
    buttonLink: "/#contact",
    order: 1,
    isActive: true,
  },
  {
    planId: "half_yearly",
    title: "6 Months",
    price: "15999",
    period: "6 months",
    subtitle: "Serious transformation",
    savings: "Save ₹13995",
    popular: true,
    badge: "Most Popular",
    gradient: "from-brand to-purple-900",
    buttonText: "Get Started",
    buttonLink: "/#contact",
    order: 2,
    isActive: true,
  },
  {
    planId: "yearly",
    title: "Yearly",
    price: "21999",
    period: "year",
    subtitle: "The elite lifestyle",
    savings: "Save ₹37989",
    popular: false,
    badge: "Best Value",
    gradient: "from-amber-500 to-orange-700",
    buttonText: "Join Now",
    buttonLink: "/#contact",
    order: 3,
    isActive: true,
  },
];

export const DEFAULT_FAQS = [
  {
    category: "General",
    popular: true,
    question: "What are your operating hours?",
    answer: "We are open 24/7 for all Elite and Pro members. Basic members have access from 5 AM to 11 PM daily. Our staff is always on-site during peak hours (6 AM - 10 PM) for any assistance.",
    videoUrl: "https://www.youtube.com/embed/dg08vAn-lU8",
    order: 0,
    isActive: true,
  },
  {
    category: "Membership",
    popular: true,
    question: "Can I freeze my membership?",
    answer: "Yes, you can freeze your membership for up to 3 months per year for a small administrative fee. This is perfect for when you're traveling or need a medical break. You can manage this directly from your member dashboard.",
    videoUrl: "",
    order: 1,
    isActive: true,
  },
  {
    category: "Trainers",
    popular: true,
    question: "Are personal trainers included?",
    answer: "Pro members get 1 complimentary session per month, and Elite members get 4 weekly sessions included in their plan. Basic members can book sessions individually starting at $50/hour.",
    videoUrl: "https://www.youtube.com/embed/U9ENCvpkadY",
    order: 2,
    isActive: true,
  },
  {
    category: "General",
    popular: true,
    question: "Do you offer a free trial?",
    answer: "Absolutely! We offer a 3-day full-access pass for all first-time visitors. This includes a complimentary fitness assessment and one group class of your choice.",
    videoUrl: "",
    order: 3,
    isActive: true,
  },
  {
    category: "Pricing",
    popular: false,
    question: "How do I upgrade my plan?",
    answer: "Upgrading is instant! Simply go to your Account Settings > Subscription and select your new tier. Your billing will be prorated, and you'll get immediate access to the new benefits.",
    videoUrl: "",
    order: 4,
    isActive: true,
  },
  {
    category: "Workout",
    popular: false,
    question: "Is there a limit to how many classes I can take?",
    answer: "Elite members have unlimited access to all classes. Pro members can attend 3 classes per week, and Basic members can join 1 class per week. You can always purchase 'Drop-in' passes for extra sessions.",
    videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI",
    order: 5,
    isActive: true,
  },
  {
    category: "Membership",
    popular: false,
    question: "Is there an age limit for joining?",
    answer: "The minimum age is 16. Members aged 16-17 must have a parent or guardian sign the waiver and be present during their first orientation session.",
    videoUrl: "",
    order: 6,
    isActive: true,
  },
  {
    category: "Pricing",
    popular: false,
    question: "Do you have student or corporate discounts?",
    answer: "Yes! We offer a 15% discount for full-time students and 20% for employees of our corporate partners. Please bring a valid ID to the front desk to verify your status.",
    videoUrl: "",
    order: 7,
    isActive: true,
  },
  {
    category: "Trainers",
    popular: false,
    question: "Can I choose my own trainer?",
    answer: "Yes, you can browse trainer profiles in our app, check their specialties (Strength, Yoga, HIIT, etc.), and book based on your preference and their availability.",
    videoUrl: "",
    order: 8,
    isActive: true,
  },
  {
    category: "Workout",
    popular: false,
    question: "What should I bring for my first workout?",
    answer: "Bring a water bottle, a small towel, and appropriate athletic footwear. We provide locker service (bring your own lock) and complimentary shower towels for Elite members.",
    videoUrl: "",
    order: 9,
    isActive: true,
  },
];

export const DEFAULT_SECTION_CONTENTS: Record<string, unknown> = {
  hero: {
    telemetryStatus: "AI CORE V3.8 ACTIVE",
    telemetryAccuracy: "99.4% BIO-CALIBRATION",
    kickerBadge: "✦ NEXT-GEN AI FITNESS PLATFORM",
    mainHeadlineLine1: "YOUR FITNESS.",
    mainHeadlineLine2: "POWERED BY AI.",
    subheadline: "Where elite biomechanical coaching meets real-time AI computer vision. Experience dynamic adaptive workouts, instant posture correction, and precision nutrition.",
    primaryCtaText: "START YOUR JOURNEY",
    primaryCtaLink: "#contact",
    secondaryCtaText: "EXPLORE PINAKA",
    secondaryCtaLink: "#programs",
    ratingText: "4.9/5 Rating",
    ratingCount: "30,000+ FITNESS JOURNEYS",
    aiFeatures: [
      {
        id: "scan",
        title: "AI BODY SCAN",
        metric: "99.4% Biomechanical Accuracy",
        desc: "Real-time posture & joint angle tracking",
        badge: "LIVE COMPUTER VISION",
        color: "from-purple-500/20 to-brand/10",
        detail1: "CALIBRATION: 0.04s",
        detail2: "AI SCANNER V2.4",
      },
      {
        id: "diet",
        title: "AI DIET PLANNER",
        metric: "Macro-Calibrated Metabolic Protocols",
        desc: "Dynamic daily nutrient adaptation",
        badge: "ADAPTIVE SCIENCE",
        color: "from-blue-500/20 to-cyan-500/10",
        detail1: "TARGET: 2,850 KCAL",
        detail2: "DYNAMIC FUEL",
      },
      {
        id: "workouts",
        title: "SMART WORKOUTS",
        metric: "Adaptive Load & Cadence Sync",
        desc: "Intelligent progressive overload engine",
        badge: "REAL-TIME OPTIMIZED",
        color: "from-indigo-500/20 to-purple-500/10",
        detail1: "EFFICIENCY: +34%",
        detail2: "HYPERTROPHY V4",
      },
      {
        id: "personalized",
        title: "PERSONALIZED FITNESS",
        metric: "100% Customized Biometric Path",
        desc: "Tailored to DNA, composition & goals",
        badge: "INDIVIDUALIZED",
        color: "from-cyan-500/20 to-blue-500/10",
        detail1: "GOAL: PEAK HYBRID",
        detail2: "DNA PROTOCOL",
      },
    ],
  },
  programs: [
    {
      slug: "strength",
      title: "Strength",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format",
      desc: "Build muscle and power with our free weights and machines.",
      accentColor: "#f59e0b",
      glowColor: "rgba(245,158,11,0.35)",
      emoji: "🏋️",
      tag: "5 Exercises",
      badge: "Most Popular",
    },
    {
      slug: "cardio",
      title: "Cardio",
      image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=75&auto=format",
      desc: "Improve endurance with top-tier treadmills and bikes.",
      accentColor: "#ef4444",
      glowColor: "rgba(239,68,68,0.35)",
      emoji: "❤️",
      tag: "5 Exercises",
      badge: "Fat Burner",
    },
    {
      slug: "hiit",
      title: "HIIT",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75&auto=format",
      desc: "High-intensity interval training to burn fat fast.",
      accentColor: "#f97316",
      glowColor: "rgba(249,115,22,0.35)",
      emoji: "🔥",
      tag: "5 Exercises",
      badge: "Intense",
    },
    {
      slug: "yoga",
      title: "Yoga",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=75&auto=format",
      desc: "Enhance flexibility and mindfulness in our calm studio.",
      accentColor: "#a78bfa",
      glowColor: "rgba(167,139,250,0.35)",
      emoji: "🧘",
      tag: "5 Exercises",
      badge: "Mind & Body",
    },
  ],
  contact: {
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
    twitterUrl: "#",
  },
  amenities: [
    { name: "Full Gym Access", icon: "Dumbbell" },
    { name: "Certified Trainers", icon: "Users" },
    { name: "Clean Changing Room", icon: "Activity" },
    { name: "Steam & Shower", icon: "Sparkles" },
    { name: "World-Class Equipment", icon: "Zap" },
    { name: "Parking Space", icon: "Shield" },
  ],
  footer: {
    tagline: "We don't just build bodies; we build character. A premium sanctuary dedicated to absolute physical and mental transformation.",
    membersCount: "500+",
    equipmentQuality: "Top 1%",
    whyChooseUs: [
      "Advanced AI Posture Analysis",
      "Olympic Weightlifting Zone",
      "Biomechanically Perfect Equipment",
      "Exclusive Recovery Lounge",
      "Personalized Diet Counseling",
    ],
  },
};

/**
 * Ensures the database has initial data for all website sections.
 */
export async function seedWebsiteDataIfEmpty() {
  try {
    // 1. Seed Trainers
    const trainerCount = await prisma.websiteTrainer.count();
    if (trainerCount === 0) {
      for (const t of DEFAULT_TRAINERS) {
        await prisma.websiteTrainer.create({ data: t });
      }
    }

    // 2. Seed Gallery
    const galleryCount = await prisma.websiteGalleryItem.count();
    if (galleryCount === 0) {
      for (const g of DEFAULT_GALLERY) {
        await prisma.websiteGalleryItem.create({ data: g });
      }
    }

    // 3. Seed Pricing Plans
    const pricingCount = await prisma.websitePricingPlan.count();
    if (pricingCount === 0) {
      for (const p of DEFAULT_PRICING_PLANS) {
        await prisma.websitePricingPlan.create({ data: p });
      }
    }

    // 4. Seed FAQs
    const faqCount = await prisma.websiteFAQ.count();
    if (faqCount === 0) {
      for (const f of DEFAULT_FAQS) {
        await prisma.websiteFAQ.create({ data: f });
      }
    }

    // 5. Seed Section Contents
    for (const [sectionKey, contentObj] of Object.entries(DEFAULT_SECTION_CONTENTS)) {
      const existing = await prisma.websiteSectionContent.findUnique({ where: { sectionKey } });
      if (!existing) {
        await prisma.websiteSectionContent.create({
          data: {
            sectionKey,
            content: JSON.stringify(contentObj),
          },
        });
      }
    }
  } catch (error) {
    console.error("Website auto-seeder error (ignored to avoid blocking startup):", error);
  }
}
