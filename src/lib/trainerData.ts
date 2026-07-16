export interface Trainer {
  id: string;
  name: string;
  role: string;
  img: string;
  experience: string;
  skills: string[];
  certifications: string[];
  achievements: string[];
  bio: string;
  email: string;
}

export const trainers: Trainer[] = [
  {
    id: "alex-mercer",
    name: "Alex Mercer", 
    role: "Head Coach", 
    img: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=500&h=600&fit=crop",
    experience: "10 Years",
    skills: ["Bodybuilding", "Strength Training", "Nutrition"],
    certifications: ["ACE Personal Trainer", "Precision Nutrition L1"],
    achievements: ["National Champion 2018", "Coach of the Year 2021"],
    bio: "Alex is a veteran with over a decade of experience helping clients achieve their dream physiques. His approach combines heavy lifting with strict nutritional science.",
    email: "alex@sequence.fitness"
  },
  {
    id: "sarah-connor",
    name: "Sarah Connor", 
    role: "Strength Specialist", 
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=600&fit=crop",
    experience: "7 Years",
    skills: ["Powerlifting", "Functional Fitness", "Mobility"],
    certifications: ["NASM Personal Trainer", "CrossFit L2 Trainer"],
    achievements: ["State Powerlifting Record Holder", "Rehab Specialist"],
    bio: "Sarah believes that strength is the foundation of a healthy life. She specializes in powerlifting and functional movements, ensuring her clients build resilient bodies.",
    email: "sarah@sequence.fitness"
  },
  {
    id: "david-gogg",
    name: "David Gogg", 
    role: "Endurance & HIIT", 
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=600&fit=crop",
    experience: "12 Years",
    skills: ["HIIT", "Marathon Training", "Mental Toughness"],
    certifications: ["ISSA Personal Trainer", "USA Track & Field Coach"],
    achievements: ["Completed 50+ Ultramarathons", "Elite Conditioning Coach"],
    bio: "David pushes his clients past their perceived limits. Specializing in high-intensity interval training and endurance, he transforms both physical and mental capabilities.",
    email: "david@sequence.fitness"
  },
];
