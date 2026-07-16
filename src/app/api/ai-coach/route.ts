import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────────────────────────────────────────────────────────────
   SYSTEM PROMPT — shared across all AI providers
───────────────────────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `
You are an advanced AI Coach. Your primary rule is to strictly understand the user's intent and respond ONLY to what is being asked.

🧠 INTENT DETECTION (CRITICAL)
Before answering, classify the user query into one of these:
- Question (e.g., “Is gym good or bad?”)
- Request (e.g., “Create a workout plan”)
- Advice (e.g., “How to lose fat?”)
- General conversation

Then respond accordingly:
- If it's a question → give a direct, relevant answer
- If it's a request → generate the full output
- If it's advice → explain + guide

🚨 NEVER give a workout plan unless the user explicitly asks for it.

❗ STRICT RESPONSE RULE
Your answer must be 100% relevant to the user’s question
Do NOT use pre-written or cached templates blindly
Do NOT assume the user wants a workout plan unless clearly stated

🧾 RESPONSE STYLE
Keep answers:
- Clear
- Direct
- Context-aware
Avoid over-formatting when not needed

Example:
User: “Gym is good or bad?”
✅ Correct Response:
Gym is generally very beneficial if done correctly.
It helps with:
- Muscle strength
- Fat loss
- Mental health
However, it can be harmful if:
- You use wrong form
- Overtrain
- Ignore recovery
Overall, gym is good when done with proper guidance and consistency.

❌ Wrong Response:
(Giving a workout plan)

🚫 STRICTLY AVOID:
- Irrelevant answers
- Copy-paste responses
- Giving same saved output for different questions

⚙️ TECHNICAL BEHAVIOR:
- Always generate a fresh response
- Use conversation context correctly
- Do NOT override user intent with default templates

🎯 FINAL GOAL:
Make the AI behave like ChatGPT:
Understand → Think → Answer correctly
Not: Recognize keyword → Dump template
If the response is not directly answering the user’s query, it is WRONG.
`.trim();

/* ─────────────────────────────────────────────────────────────────────────────
   TIER 1 — Google Gemini (package already installed)
───────────────────────────────────────────────────────────────────────────── */
async function askGemini(messages: { sender: string; text: string }[]): Promise<string> {
  // Dynamic import so it doesn't crash if package is missing
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.6, topP: 0.9, maxOutputTokens: 1024 },
  });

  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((m) => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  // Gemini strictly requires the history to start with a user message.
  while (history.length > 0 && history[0].role !== "user") {
    history.shift();
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.text);
  return result.response.text();
}

/* ─────────────────────────────────────────────────────────────────────────────
   TIER 2 — OpenAI GPT (if openai package installed + key present)
───────────────────────────────────────────────────────────────────────────── */
async function askOpenAI(messages: { sender: string; text: string }[]): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    temperature: 0.6,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content ?? "";
}

/* ─────────────────────────────────────────────────────────────────────────────
   TIER 3 — Smart Built-in Knowledge Engine (always works, no API key needed)
───────────────────────────────────────────────────────────────────────────── */
function smartAnswer(userText: string): string {
  const q = userText.toLowerCase().trim();

  // ── Greetings ──
  if (/^(hi|hello|hey|howdy|hola|sup|yo|what'?s up|greetings)/i.test(q)) {
    return "Hello! I am your AI Coach. How can I help you with your fitness journey today?";
  }

  // ── Quick Prompts Handling ──
  if (q.includes("workout plan")) {
    return `Here is a solid **4-Day Split**:
**Day 1:** Upper Body (Bench Press, Rows, Overhead Press)
**Day 2:** Lower Body (Squats, Leg Press, Calf Raises)
**Day 3:** Rest / Active Recovery
**Day 4:** Push & Pull (Incline Dumbbell Press, Pull-ups, Lateral Raises)
**Day 5:** Legs & Core (Deadlifts, Lunges, Planks)

*Ensure you progressively overload and eat enough protein!*`;
  }

  if (q.includes("breakfast") || q.includes("high-protein")) {
    return `Here are some **high-protein breakfast ideas**:
- **Oats with Whey:** 1 scoop whey, oats, peanut butter, and a banana.
- **Eggs & Toast:** 3 whole eggs + 2 egg whites scrambled on whole wheat toast.
- **Greek Yogurt Bowl:** Greek yogurt topped with berries, chia seeds, and almonds.
- **Protein Pancakes:** Made with protein powder, egg whites, and oats.`;
  }

  if (q.includes("deadlift")) {
    return `**Tips to improve your deadlift form:**
1. Keep the bar close to your shins.
2. Brace your core tight before lifting.
3. Push the floor away with your legs, rather than just pulling with your back.
4. Keep your spine neutral (don't round your lower back).
5. Squeeze your glutes at the top.`;
  }

  if (q.includes("fat") || q.includes("lose body fat")) {
    return `**The best way to lose body fat:**
1. **Caloric Deficit:** Consume fewer calories than you burn.
2. **High Protein:** Eat 1.6-2.2g of protein per kg of body weight to preserve muscle.
3. **Strength Training:** Lift weights 3-5 times a week to build/maintain muscle mass.
4. **Cardio:** Add 2-3 sessions of moderate cardio or HIIT.
5. **Sleep:** Get 7-9 hours of sleep per night for optimal hormones.`;
  }

  if (q.includes("creatine")) {
    return `**When to take creatine:**
Timing doesn't matter as much as consistency! Take **3-5 grams per day**, every day. 
You can mix it with your post-workout shake or drink it anytime. There is no need to do a loading phase unless you want faster saturation.`;
  }

  // ── Fallback ──
  return "I'm currently running in basic offline mode. To get an advanced, personalized answer, please ensure your AI API keys (like GEMINI_API_KEY) are configured in the `.env` file. If you'd like a generic 4-day workout plan, just ask me to 'Create a 4-day workout plan'!";
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN API HANDLER — tries all tiers, always returns an answer
───────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ text: "Hey! Ask me anything 😊" });
    }

    // ── TIER 1: Google Gemini ──
    if (process.env.GEMINI_API_KEY) {
      try {
        const text = await askGemini(messages);
        if (text && text.trim().length > 0) {
          return NextResponse.json({ text });
        }
      } catch (e) {
        console.warn("Gemini failed, trying next tier:", e);
      }
    }

    // ── TIER 2: OpenAI GPT ──
    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await askOpenAI(messages);
        if (text && text.trim().length > 0) {
          return NextResponse.json({ text });
        }
      } catch (e) {
        console.warn("OpenAI failed, using built-in engine:", e);
      }
    }

    // ── TIER 3: Smart Built-in Engine (always works) ──
    const lastMessage = messages[messages.length - 1];
    const text = smartAnswer(lastMessage.text || "");
    return NextResponse.json({ text });

  } catch (error: unknown) {
    console.error("AI Coach critical error:", error);
    // Even on critical error — return something helpful
    return NextResponse.json({
      text: "Hey! I'm here and ready to help. Ask me anything about fitness, diet, recovery, or your workout plan! 💪",
    });
  }
}
