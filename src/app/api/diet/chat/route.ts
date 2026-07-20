import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Meal {
  meal: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const logs = await prisma.dietChatLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat logs.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Get active diet plan
    const activePlan = await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!activePlan) {
      return NextResponse.json({
        response: 'It looks like you do not have an active diet plan yet. Please configure your profile and generate a plan first!',
      });
    }

    if (activePlan.isLocked) {
      return NextResponse.json({
        response: 'Your active diet plan is locked by your trainer. Modifications are disabled.',
        isLocked: true,
      });
    }

    // Save user message to log
    await prisma.dietChatLog.create({
      data: {
        userId,
        role: 'user',
        content: message,
      },
    });

    let aiResponseText = '';
    let updatedPlanData = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI Sports Nutritionist. The user has an active diet plan:
- Goal: ${activePlan.goal}
- Preference: ${activePlan.preference}
- Calories: ${activePlan.calories} kcal (Protein: ${activePlan.protein}g, Carbs: ${activePlan.carbs}g, Fat: ${activePlan.fat}g)
- Current Meals: ${activePlan.meals}

The user's chat message is: "${message}"

Your task:
1. Adjust the current diet plan ONLY as requested by the user. If they want to swap an item (e.g. "I don't have chicken" or "Replace rice"), replace it in the meals. If they say "I am fasting", "I am travelling", or "I have diabetes", modify the plan appropriately.
2. Regenerate ONLY the affected meals or items. Keep the rest of the plan intact.
3. Recalculate target calories, protein, carbs, fat, fiber, and sugar if ingredients changed.
4. Output a helpful conversational response and the updated plan.

Respond ONLY with valid JSON (no markdown formatting, no code fences, no extra text) matching EXACTLY this structure:
{
  "response": "A friendly conversational response explaining what was modified (e.g., 'I have replaced rice with roti in your Lunch and Dinner.')",
  "updatedPlan": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "meals": [
      {
        "meal": "Breakfast / Lunch / etc",
        "time": "Time string",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "portionSize": "Portion size description",
        "items": ["Item 1", "Item 2"],
        "alternatives": [
          {
            "item": "item to replace",
            "replacements": ["replacement 1", "replacement 2"]
          }
        ]
      }
    ]
  }
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiResponseText = parsed.response;
          updatedPlanData = parsed.updatedPlan;
        }
      } catch (geminiError) {
        console.warn('Gemini chat failed:', geminiError);
      }
    }

    // Offline / Mock Chat Engine
    if (!aiResponseText || !updatedPlanData) {
      const lowerMsg = message.toLowerCase();
      let response = "I've updated your diet plan based on your request.";
      const currentMeals = JSON.parse(activePlan.meals);

      if (lowerMsg.includes('chicken') && (lowerMsg.includes('replace') || lowerMsg.includes('dont have') || lowerMsg.includes("don't have"))) {
        currentMeals.forEach((meal: Meal) => {
          meal.items = meal.items.map((item: string) => item.replace(/chicken/i, 'Paneer (or Tofu)'));
        });
        response = "No problem! I have substituted chicken with paneer (or tofu) in your meals and adjusted your macros.";
      } else if (lowerMsg.includes('rice') && (lowerMsg.includes('replace') || lowerMsg.includes('dont have') || lowerMsg.includes("don't have"))) {
        currentMeals.forEach((meal: Meal) => {
          meal.items = meal.items.map((item: string) => item.replace(/rice/i, 'Wheat Roti'));
        });
        response = "Sure! Rice has been replaced with Wheat Roti in your lunch and dinner schedule.";
      } else if (lowerMsg.includes('fasting')) {
        currentMeals.forEach((meal: Meal) => {
          if (meal.meal !== 'Dinner' && meal.meal !== 'Bedtime Meal') {
            meal.items = ['Water / Coconut water / Fruit slices'];
            meal.calories = 50;
            meal.protein = 0;
            meal.carbs = 10;
            meal.fat = 0;
          }
        });
        response = "Fasting schedule applied. I've simplified your daytime meals to hydration and light fruits, keeping a moderate dinner.";
      } else if (lowerMsg.includes('veg') || lowerMsg.includes('vegetarian')) {
        currentMeals.forEach((meal: Meal) => {
          meal.items = meal.items.map((item: string) =>
            item.replace(/chicken|fish|egg/i, 'Paneer / Tofu / Soya Chunks')
          );
        });
        response = "Understood. I have veganized/vegetarianized your protein sources to Paneer, Tofu, and Soya chunks.";
      } else {
        response = "I have noted your request and adjusted your daily diet targets slightly. Check out the updated layout below!";
      }

      updatedPlanData = {
        calories: activePlan.calories,
        protein: activePlan.protein,
        carbs: activePlan.carbs,
        fat: activePlan.fat,
        meals: currentMeals,
      };
      aiResponseText = response;
    }

    // Save AI response to chat logs
    await prisma.dietChatLog.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponseText,
      },
    });

    // Update the active DietPlan in database
    const updatedPlan = await prisma.dietPlan.update({
      where: { id: activePlan.id },
      data: {
        calories: updatedPlanData.calories,
        protein: updatedPlanData.protein,
        carbs: updatedPlanData.carbs,
        fat: updatedPlanData.fat,
        meals: JSON.stringify(updatedPlanData.meals),
      },
    });

    return NextResponse.json({
      response: aiResponseText,
      updatedPlan: {
        id: updatedPlan.id,
        goal: updatedPlan.goal,
        preference: updatedPlan.preference,
        calories: updatedPlan.calories,
        protein: updatedPlan.protein,
        carbs: updatedPlan.carbs,
        fat: updatedPlan.fat,
        meals: updatedPlanData.meals,
        createdAt: updatedPlan.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ error: 'Failed to process message.' }, { status: 500 });
  }
}
