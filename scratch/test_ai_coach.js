const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const SYSTEM_PROMPT = "You are an AI coach.";

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const messages = [
    { sender: "bot", text: "Hello!" },
    { sender: "user", text: "Hi, I need a workout plan" }
  ];

  const lastMessage = messages[messages.length - 1];
  let history = messages.slice(0, -1).map((m) => ({
    role: m.sender === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  while (history.length > 0 && history[0].role !== "user") {
    history.shift();
  }

  try {
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.text);
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
