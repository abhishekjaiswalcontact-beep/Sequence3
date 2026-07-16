import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are the AI Assistant for Pinaka Fitness, a premium high-end gym located in Sector 127. 
Your goal is to be helpful, professional, and motivating.

Gym Details:
- Name: Pinaka Fitness
- Location: Sector 127
- Programs: Strength Training, Cardio, HIIT (High-Intensity Interval Training), and Yoga.
- Services: Personal Training, Corporate Memberships, Free Trials, and Group Classes.
- Vibe: Premium, state-of-the-art equipment, luxury facilities, and elite trainers.

Guidelines:
1. Always be polite and encouraging.
2. If someone asks about pricing, mention that we have various plans and suggest they "Book A Free Trial" or "Contact Us" for a personalized quote.
3. If someone asks about programs, highlight our Strength, Cardio, HIIT, and Yoga offerings.
4. Keep responses concise but informative (max 3-4 sentences unless more detail is requested).
5. If you don't know something, suggest they contact our front desk at the gym in Sector 127.
6. Encourage users to achieve their fitness goals.

You are representing the brand, which is sophisticated and high-performance. Avoid using too many emojis, but a few (like 💪, 🧘, ⚡) are fine to keep it friendly.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to your .env file." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT 
    });

    const lastMessage = messages[messages.length - 1];
    
    // Format the history for Gemini (excluding the system prompt which is set above)
    const chatHistory =  messages.slice(0, -1).map((m: { sender: string; text: string }) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Gemini strictly requires the history to start with a user message.
    while (chatHistory.length > 0 && chatHistory[0].role !== "user") {
      chatHistory.shift();
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(lastMessage.text);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
