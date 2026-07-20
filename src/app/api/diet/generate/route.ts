import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function calculateMetrics(weight: number, height: number, age: number, gender: string, activityLevel: string, fitnessGoal: string) {
  // BMI
  const bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(1));

  // BMR (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // TDEE Multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Goal adjustments
  let targetCalories = tdee;
  if (fitnessGoal === 'weight-loss' || fitnessGoal === 'fat-loss') {
    targetCalories -= 500;
  } else if (fitnessGoal === 'muscle-gain' || fitnessGoal === 'lean-bulk') {
    targetCalories += 300;
  } else if (fitnessGoal === 'body-recomp') {
    targetCalories -= 200;
  }
  if (targetCalories < 1200) targetCalories = 1200;

  // Water Intake: weight * 35 ml + activity factor
  let targetWater = weight * 35;
  if (activityLevel === 'active') {
    targetWater += 1000;
  } else if (activityLevel === 'moderate') {
    targetWater += 500;
  }
  targetWater = Number((targetWater / 1000).toFixed(2)); // in Liters

  return { bmi, bmr, tdee, targetCalories, targetWater };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    const userId = parseInt(session.sub);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user session.' }, { status: 401 });
    }

    // Check if the user has a locked active plan
    const activePlan = await prisma.dietPlan.findFirst({
      where: { userId, isLocked: true },
    });
    if (activePlan) {
      return NextResponse.json({ error: 'Your current diet plan is locked by a trainer/admin and cannot be regenerated.' }, { status: 403 });
    }

    const body = await req.json();

    // Pull profile from db if not fully provided in request body
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const height = body.height || profile?.height;
    const weight = body.weight || profile?.currentWeight;
    const age = body.age || profile?.age;
    const gender = body.gender || profile?.gender;
    const goal = body.goal || profile?.fitnessGoal;
    const preference = body.preference || profile?.preference;
    const activityLevel = body.activityLevel || profile?.activityLevel;
    const allergies = body.allergies || profile?.allergies;
    const healthConditions = body.healthConditions || profile?.healthConditions;
    const restrictions = body.restrictions || profile?.restrictions;
    const excludedFoods = body.excludedFoods || profile?.excludedFoods;
    const budget = body.budget || profile?.budget || 'no-limit';
    
    // Meal timings
    const timings = {
      wakeUp: body.wakeUpTime || profile?.wakeUpTime || '06:00 AM',
      breakfast: body.breakfastTime || profile?.breakfastTime || '08:30 AM',
      midMorning: body.midMorningTime || profile?.midMorningTime || '11:00 AM',
      lunch: body.lunchTime || profile?.lunchTime || '01:30 PM',
      eveningSnack: body.eveningSnackTime || profile?.eveningSnackTime || '05:30 PM',
      dinner: body.dinnerTime || profile?.dinnerTime || '08:30 PM',
      bedtimeMeal: body.bedtimeMealTime || profile?.bedtimeMealTime || '10:00 PM',
    };

    if (!height || !weight || !age || !gender || !goal || !preference || !activityLevel) {
      return NextResponse.json({ error: 'Please set up your fitness profile first.' }, { status: 400 });
    }

    const { targetCalories, targetWater } = calculateMetrics(
      parseFloat(weight),
      parseFloat(height),
      parseInt(age),
      gender,
      activityLevel,
      goal
    );

    // Baseline macros
    const targetProtein = Math.round(parseFloat(weight) * (goal.includes('gain') ? 2.0 : 1.7));
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    const targetCarbs = Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);

    let dietResult;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an Elite Sports Nutritionist and AI Diet Planner specializing in Indian-friendly macro-precise diets.
Generate a highly customized diet plan based on the user's details:
- Height: ${height} cm
- Weight: ${weight} kg
- Age: ${age} years old
- Gender: ${gender}
- Goal: ${goal} (target: ${targetCalories} kcal)
- Diet Preference: ${preference} (e.g. veg, vegan, eggitarian, non-veg)
- Activity Level: ${activityLevel}
- Health Conditions to consider: ${healthConditions || 'None'}
- Allergies: ${allergies || 'None'}
- Dietary Restrictions: ${restrictions || 'None'}
- Foods strictly excluded: ${excludedFoods || 'None'}
- Daily Budget Limit: ${budget === 'no-limit' ? 'No Limit' : `₹${budget}/day`}
- Meal Timings:
  * Wake Up Time: ${timings.wakeUp}
  * Breakfast: ${timings.breakfast}
  * Mid-Morning Snack: ${timings.midMorning}
  * Lunch: ${timings.lunch}
  * Evening Snack: ${timings.eveningSnack}
  * Dinner: ${timings.dinner}
  * Bedtime Meal: ${timings.bedtimeMeal}

Respond ONLY with valid JSON (no markdown formatting, no code fences, no extra text) matching EXACTLY this structure:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "micronutrients": {
    "iron": "mg or percentage text",
    "calcium": "mg or percentage text",
    "vitaminD": "mcg or IU text",
    "vitaminB12": "mcg text",
    "magnesium": "mg text",
    "zinc": "mg text",
    "potassium": "mg text"
  },
  "meals": [
    {
      "meal": "Wake Up Time / Breakfast / Mid-Morning Snack / Lunch / Evening Snack / Dinner / Bedtime Meal",
      "time": "Time string matching user timing",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "portionSize": "Portion size (e.g. 100g, 2 pieces)",
      "items": [
        "Food item 1 details (e.g. 3 Boiled Egg Whites)",
        "Food item 2 details (e.g. 50g Oats cooked in water)"
      ],
      "alternatives": [
        {
          "item": "exact item name from items array to replace (e.g., Boiled Egg Whites)",
          "replacements": ["Paneer cubes", "Tofu", "Soya Chunks", "Greek Yogurt"]
        }
      ]
    }
  ],
  "groceryList": {
    "vegetables": ["item 1", "item 2"],
    "fruits": ["item 1"],
    "protein": ["item 1"],
    "dairy": ["item 1"],
    "grains": ["item 1"],
    "supplements": ["item 1"]
  },
  "supplementRecommendations": {
    "items": ["Whey Protein", "Creatine", "Fish Oil", "Multivitamin", "Vitamin D", "Electrolytes"],
    "disclaimer": "Supplement recommendations are suggestions and users should consult a healthcare professional before starting."
  }
}

Rules:
- Generate realistic, practical, Indian-friendly meal plans using common local foods (e.g., dal, paneer, roti, rice, eggs, oats, chicken, salad).
- Strictly adhere to budget, health conditions (e.g., lower carbs for Diabetes, monitor fats for Cholesterol, etc.), and food preferences.
- Ensure the meal timeline includes all user timing slots and labels.
- Calculate realistic values for fiber and sugar.
- Ensure that for each key protein/carb item, alternative replacement items are provided in "alternatives".
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Invalid JSON format returned from Gemini');
        }
        dietResult = JSON.parse(jsonMatch[0]);
      } catch (geminiError) {
        console.warn('Gemini generation failed, falling back to mock generator:', geminiError);
      }
    }

    // Fallback Mock Diet Plan Generator
    if (!dietResult) {
      const activeTimingMeals = [
        { meal: 'Wake Up Time', time: timings.wakeUp, calories: 50, protein: 1, carbs: 10, fat: 0, portionSize: '1 glass', items: ['Lemon warm water with honey', '5 soaked almonds'], alternatives: [] },
        { meal: 'Breakfast', time: timings.breakfast, calories: 450, protein: 25, carbs: 55, fat: 12, portionSize: '1 plate', items: preference === 'veg' ? ['Oats cooked in milk (50g)', '1 scoop Whey Protein', '1 banana'] : ['3 Egg white scramble', '2 slices Whole wheat bread', '1 orange'], alternatives: [{ item: preference === 'veg' ? 'Whey Protein' : 'Egg white scramble', replacements: ['Paneer bhurji', 'Greek Yogurt', 'Tofu scramble', 'Soya chunks stir-fry'] }] },
        { meal: 'Mid-Morning Snack', time: timings.midMorning, calories: 150, protein: 10, carbs: 15, fat: 5, portionSize: '1 bowl', items: ['1 apple', '100g low fat paneer or boiled chicken pieces'], alternatives: [{ item: 'low fat paneer', replacements: ['Roasted Chana', 'Tofu cubes', 'Peanut butter toast'] }] },
        { meal: 'Lunch', time: timings.lunch, calories: 600, protein: 35, carbs: 75, fat: 15, portionSize: 'Regular', items: preference === 'veg' ? ['2 multigrain rotis', '1 cup dal tadka', '150g paneer subji', 'Big bowl of green salad'] : ['1 cup brown rice', '150g grilled chicken breast', '1 cup mixed vegetable subji', 'Cucumber salad'], alternatives: [{ item: preference === 'veg' ? 'paneer subji' : 'chicken breast', replacements: ['Tofu curry', 'Boiled soya chunks', 'Fish fillet', 'Lentil salad'] }] },
        { meal: 'Evening Snack', time: timings.eveningSnack, calories: 200, protein: 15, carbs: 20, fat: 5, portionSize: '1 cup', items: ['Green tea', '50g roasted makhana', '1 scoop Whey protein shake'], alternatives: [] },
        { meal: 'Dinner', time: timings.dinner, calories: 500, protein: 30, carbs: 60, fat: 12, portionSize: 'Regular', items: preference === 'veg' ? ['1 cup quinoa', '150g grilled tofu', 'Steamed broccoli and mushrooms'] : ['2 rotis', '150g grilled fish', 'Steamed asparagus and zucchini'], alternatives: [{ item: preference === 'veg' ? 'grilled tofu' : 'grilled fish', replacements: ['Paneer tikka', 'Egg white omelet', 'Soya chunks stir-fry'] }] },
        { meal: 'Bedtime Meal', time: timings.bedtimeMeal, calories: 100, protein: 8, carbs: 5, fat: 5, portionSize: '1 glass', items: ['Warm turmeric milk (no sugar)', '4 walnuts'], alternatives: [] },
      ];

      dietResult = {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        fiber: 30,
        sugar: 15,
        micronutrients: {
          iron: '18 mg',
          calcium: '1000 mg',
          vitaminD: '600 IU',
          vitaminB12: '2.4 mcg',
          magnesium: '400 mg',
          zinc: '11 mg',
          potassium: '3500 mg',
        },
        meals: activeTimingMeals,
        groceryList: {
          vegetables: ['Broccoli', 'Mushrooms', 'Cucumber', 'Lemon', 'Spinach'],
          fruits: ['Banana', 'Apple', 'Orange'],
          protein: preference === 'veg' ? ['Low-fat Paneer', 'Tofu', 'Soya Chunks'] : ['Chicken Breast', 'Fish', 'Eggs'],
          dairy: ['Milk', 'Yogurt'],
          grains: ['Oats', 'Multigrain Flour', 'Brown Rice', 'Quinoa'],
          supplements: ['Whey Protein', 'Multivitamin'],
        },
        supplementRecommendations: {
          items: ['Whey Protein', 'Creatine', 'Fish Oil', 'Multivitamin'],
          disclaimer: 'Supplement recommendations are suggestions and users should consult a healthcare professional before starting.',
        },
      };
    }

    // Set other plans for this user to active: false
    await prisma.dietPlan.updateMany({
      where: { userId },
      data: { isLocked: false }, // unlock previously created plans if any, only one active
    });

    // Save Diet Plan to DB
    const savedPlan = await prisma.dietPlan.create({
      data: {
        userId,
        goal,
        preference,
        calories: dietResult.calories,
        protein: dietResult.protein,
        carbs: dietResult.carbs,
        fat: dietResult.fat,
        fiber: dietResult.fiber || null,
        sugar: dietResult.sugar || null,
        meals: JSON.stringify(dietResult.meals),
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        activityLevel,
        allergies: allergies || null,
        budget,
        waterGoal: targetWater,
        groceryList: JSON.stringify(dietResult.groceryList),
        supplementRecommendations: JSON.stringify(dietResult.supplementRecommendations),
        micronutrients: JSON.stringify(dietResult.micronutrients),
      },
    });

    return NextResponse.json({
      id: savedPlan.id,
      ...dietResult,
      createdAt: savedPlan.createdAt,
    });
  } catch (error: unknown) {
    console.error('Diet Generation API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate diet plan.' },
      { status: 500 }
    );
  }
}
