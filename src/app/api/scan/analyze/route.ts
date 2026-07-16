import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const maxDuration = 30; // NextJS serverless timeout config

export async function POST(req: Request) {
  try {
    const { pose, height, weight, goal } = await req.json();

    let resultData;

    if (!process.env.GEMINI_API_KEY) {
       // Mock the response if no Gemini API Key is provided
       const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : "22.5";
       resultData = {
          bodyFat: 14.5,
          muscleMass: 42.8,
          leanBodyMass: (weight ? weight * 0.855 : 60).toFixed(1),
          bmi,
          bodyType: "Mesomorph",
          postureScore: 85,
          weeklyPlan: [
            { day: "Monday",    focus: "Chest & Shoulders", type: "Strength",  exercises: [
              { name: "Bench Press",        sets: 4, reps: "8",   rest: "90s",  tip: "Keep shoulder blades retracted" },
              { name: "Overhead Press",     sets: 3, reps: "10",  rest: "75s",  tip: "Brace core throughout" },
              { name: "Incline DB Flyes",   sets: 3, reps: "12",  rest: "60s",  tip: "Controlled eccentric" },
              { name: "Lateral Raises",     sets: 3, reps: "15",  rest: "45s",  tip: "Lead with elbows" }
            ]},
            { day: "Tuesday",   focus: "Back & Biceps",    type: "Hypertrophy", exercises: [
              { name: "Pull-Ups",           sets: 4, reps: "Max", rest: "90s",  tip: "Full range of motion" },
              { name: "Barbell Rows",       sets: 4, reps: "8",   rest: "90s",  tip: "Drive elbows back" },
              { name: "Lat Pulldown",       sets: 3, reps: "12",  rest: "60s",  tip: "Squeeze lats at bottom" },
              { name: "Hammer Curls",       sets: 3, reps: "12",  rest: "45s",  tip: "Keep wrists neutral" }
            ]},
            { day: "Wednesday", focus: "Active Recovery",  type: "Mobility",   exercises: [
              { name: "Cat-Cow Stretch",    sets: 3, reps: "60s", rest: "30s",  tip: "Sync breath with movement" },
              { name: "Hip Flexor Stretch", sets: 3, reps: "45s", rest: "30s",  tip: "Keep pelvis neutral" },
              { name: "Face Pulls",         sets: 3, reps: "15",  rest: "45s",  tip: "Essential for posture" },
              { name: "Light Walk/Swim",    sets: 1, reps: "20min",rest: "N/A", tip: "Keep heart rate low" }
            ]},
            { day: "Thursday",  focus: "Legs & Glutes",   type: "Strength",   exercises: [
              { name: "Back Squat",         sets: 4, reps: "8",   rest: "120s", tip: "Knees track over toes" },
              { name: "Romanian Deadlift",  sets: 3, reps: "10",  rest: "90s",  tip: "Hinge at hips, long spine" },
              { name: "Leg Press",          sets: 3, reps: "12",  rest: "75s",  tip: "Don't lock knees at top" },
              { name: "Glute Bridges",      sets: 3, reps: "15",  rest: "45s",  tip: "Squeeze hard at top" }
            ]},
            { day: "Friday",    focus: "Core & Cardio",   type: "Conditioning",exercises: [
              { name: "Plank",              sets: 3, reps: "60s", rest: "45s",  tip: "Neutral spine, keep hips down" },
              { name: "Cable Woodchops",    sets: 3, reps: "12",  rest: "45s",  tip: "Rotate from thoracic spine" },
              { name: "Hanging Leg Raises", sets: 3, reps: "10",  rest: "60s",  tip: "Slow and controlled" },
              { name: "HIIT Sprints",       sets: 6, reps: "20s on / 40s off", rest: "N/A", tip: "Max effort each sprint" }
            ]},
            { day: "Saturday",  focus: "Full Body Power", type: "Hypertrophy", exercises: [
              { name: "Deadlift",           sets: 4, reps: "6",   rest: "120s", tip: "Bar close to shins" },
              { name: "Push Press",         sets: 3, reps: "8",   rest: "90s",  tip: "Slight knee dip for power" },
              { name: "Dumbbell Lunges",    sets: 3, reps: "10ea",rest: "60s",  tip: "Upright torso" },
              { name: "Farmer's Carry",     sets: 4, reps: "30m", rest: "60s",  tip: "Tall posture, big grip" }
            ]},
            { day: "Sunday",    focus: "Rest & Recharge", type: "Recovery",   exercises: [
              { name: "Foam Rolling",       sets: 1, reps: "10min",rest: "N/A", tip: "Target quads, lats, calves" },
              { name: "Deep Breathing",     sets: 1, reps: "5min", rest: "N/A", tip: "Box breathing method" }
            ]}
          ],
          vegDiet: {
            calories: 2200,
            protein: 140,
            carbs: 250,
            fat: 65,
            meals: [
              { meal: "Breakfast",    items: ["Oats with banana & chia seeds", "Paneer bhurji (100g)", "Green tea"] },
              { meal: "Mid-Morning", items: ["Greek yogurt (150g)", "Mixed nuts (30g)", "1 apple"] },
              { meal: "Lunch",       items: ["Brown rice (1 cup)", "Dal tadka (1 cup)", "Sautéed vegetables", "Curd/Raita"] },
              { meal: "Pre-Workout", items: ["Banana + peanut butter", "Whey protein shake (plant-based)"] },
              { meal: "Post-Workout",items: ["Paneer (150g) + salad", "Beetroot juice"] },
              { meal: "Dinner",      items: ["Multigrain roti (2)", "Palak tofu curry", "Lentil soup"] },
              { meal: "Before Bed",  items: ["Warm turmeric milk", "Soaked almonds (10)"] }
            ]
          },
          nonVegDiet: {
            calories: 2400,
            protein: 180,
            carbs: 230,
            fat: 70,
            meals: [
              { meal: "Breakfast",    items: ["4 whole eggs (scrambled)", "Oats with honey", "Black coffee"] },
              { meal: "Mid-Morning", items: ["Boiled chicken breast (100g)", "1 banana", "Almonds (30g)"] },
              { meal: "Lunch",       items: ["Grilled chicken (200g)", "Brown rice (1 cup)", "Broccoli & spinach salad", "Olive oil dressing"] },
              { meal: "Pre-Workout", items: ["Whey protein shake", "Apple or banana"] },
              { meal: "Post-Workout",items: ["Tuna/Salmon (150g)", "Sweet potato", "Electrolyte drink"] },
              { meal: "Dinner",      items: ["Grilled fish (200g)", "Quinoa (1 cup)", "Stir-fried vegetables"] },
              { meal: "Before Bed",  items: ["Greek yogurt with casein protein", "Chamomile tea"] }
            ]
          },
          dietPlan: "High Protein plan tailored to your goal.",
          postureFeedback: "Slight shoulder rounding detected. Recommend adding Face Pulls and Thoracic mobility exercises to your routine.",
          estimatedTime: "12 weeks",
          userMetrics: { height, weight, goal }
       };
    } else {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

         const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : null;
         const prompt = `
You are an Elite Certified Personal Trainer, Sports Nutritionist, and AI Body Analyst.

User Profile:
- Height: ${height} cm
- Weight: ${weight} kg
- BMI (calculated): ${bmi}
- Fitness Goal: ${goal}
- Pose Data: ${pose?.keypoints ? JSON.stringify(pose.keypoints).substring(0, 500) : "Not available"}

Based on the above, generate a COMPLETE, DETAILED, and HIGHLY PERSONALIZED fitness report.

Respond ONLY with valid JSON (no markdown, no code fences) matching EXACTLY this structure:
{
  "bodyFat": number,
  "muscleMass": number,
  "leanBodyMass": number,
  "bmi": number,
  "bodyType": "Ectomorph" | "Mesomorph" | "Endomorph",
  "postureScore": number,
  "postureFeedback": string,
  "estimatedTime": string,
  "userMetrics": { "height": string, "weight": string, "goal": string },
  "weeklyPlan": [
    {
      "day": string,
      "focus": string,
      "type": "Strength" | "Hypertrophy" | "Conditioning" | "Mobility" | "Recovery",
      "exercises": [
        { "name": string, "sets": number, "reps": string, "rest": string, "tip": string }
      ]
    }
  ],
  "vegDiet": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "meals": [
      { "meal": string, "items": [string] }
    ]
  },
  "nonVegDiet": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "meals": [
      { "meal": string, "items": [string] }
    ]
  },
  "dietPlan": string
}

Rules:
- weeklyPlan must have 7 days (Monday–Sunday), Sunday = Rest/Recovery
- Each training day must have 4 exercises minimum with realistic sets, reps, rest, and a practical coaching tip
- vegDiet and nonVegDiet must each have 7 meals (Breakfast, Mid-Morning, Lunch, Pre-Workout, Post-Workout, Dinner, Before Bed)
- Diet macros must match the user's goal (fat loss = calorie deficit, muscle gain = surplus)
- Be specific with Indian-friendly food options for vegetarian and global options for non-veg
- postureFeedback must reference the user's actual scan goal and give actionable corrections
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI returned invalid structure");
        resultData = JSON.parse(jsonMatch[0]);
        
        // Ensure user metrics are present
        resultData.userMetrics = { height, weight, goal };
    }

    // PERSISTENCE LOGIC
    try {
      const session = await getSession();

      if (session && session.sub) {
         const userIdNum = parseInt(session.sub);
         if (!isNaN(userIdNum)) {
           await prisma.scanResult.create({
              data: {
                 userId: userIdNum,
                 bodyFat: resultData.bodyFat,
                 muscleMass: resultData.muscleMass,
                 postureScore: resultData.postureScore,
                 workoutPlan: JSON.stringify(resultData.workoutPlan),
                 dietPlan: resultData.dietPlan,
                 feedback: resultData.postureFeedback
              }
           });
         }
      }
    } catch (dbError) {
      console.error("Failed to save scan to database:", dbError);
      // We don't throw here, instead we proceed so the user gets their results!
    }

    return NextResponse.json(resultData);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to generate body analysis plan." }, 
      { status: 500 }
    );
  }
}
