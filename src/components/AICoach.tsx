"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface AICoachProps {
  autoOpen?: boolean;
  greeting?: string;
}

const QUICK_PROMPTS = [
  "🏋️ Create a 4-day workout plan",
  "🥗 Best high-protein breakfast ideas",
  "🧘 How to improve my deadlift form?",
  "🔥 Best way to lose body fat fast?",
  "🥤 When should I take creatine?",
];

function formatText(text: string) {
  // Render **bold**, numbered lists, and bullet points
  const lines = text.split("\n");
  return lines.map((line, i) => {
    let content = line.trim();
    if (!content && line !== "") content = line; // Preserve spacing

    // Check if it's a bullet point or numbered list
    const isBullet = content.startsWith("- ") || content.startsWith("* ") || content.startsWith("• ");
    const isNumbered = /^\d+\.\s/.test(content);
    
    // Remove prefix if needed
    let displayContent = content;
    let prefix: React.ReactNode = null;

    if (isBullet) {
      displayContent = content.replace(/^[-*•]\s/, '');
      prefix = <span className="text-purple-400 mt-2 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />;
    } else if (isNumbered) {
      const match = content.match(/^(\d+\.)\s/);
      const numPrefix = match ? match[1] : '';
      displayContent = content.replace(/^\d+\.\s/, '');
      prefix = <span className="text-purple-400 font-bold shrink-0 min-w-[18px]">{numPrefix}</span>;
    }

    // Bold processing on the displayContent
    const parts = displayContent.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });

    if (isBullet || isNumbered) {
      return (
        <div key={i} className="flex gap-2 mb-2 ml-1">
          {prefix}
          <p className="leading-relaxed flex-1">{rendered}</p>
        </div>
      );
    }

    return (
      <p key={i} className={line === "" ? "h-2" : "leading-relaxed mb-2"}>
        {rendered}
      </p>
    );
  });
}

export default function AICoach({ autoOpen = false, greeting }: AICoachProps) {
  const defaultGreeting = greeting ||
    "Hey! I'm your **AI Fitness Coach** 🧠💪\n\nI can help you with **personalized workout plans**, **nutrition advice**, **posture correction**, **recovery tips**, and much more — how can I help you crush your goals today?";

  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: defaultGreeting,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [typingDots, setTypingDots] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // Scroll immediately
    scrollToBottom();
    
    // Also scroll after a tiny delay to catch any layout shifts or animations
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Animated typing dots
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTypingDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: Math.random().toString(36).substring(7),
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setShowPrompts(false);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
          }),
        });

        const data = await response.json();
        const botMsg: Message = {
          id: Math.random().toString(36).substring(7),
          text:
            data.text ||
            "I'm having a moment — could you rephrase that? I want to give you the best answer! 🙏",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: "error-" + Date.now(),
            text: "Oops! Something went wrong on my end. Please try again in a moment.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        text: defaultGreeting,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setShowPrompts(true);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100]" style={{ fontFamily: "var(--font-sans, Inter, sans-serif)" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ai-coach-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[90vw] sm:w-[400px] h-[580px] max-h-[82vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #0d0d0d 0%, #111118 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 40px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.6)",
              transformOrigin: "bottom right",
              willChange: "transform, opacity",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.10) 100%)",
                borderBottom: "1px solid rgba(139,92,246,0.20)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* AI Brain Icon */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center relative"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                >
                  <Sparkles size={18} className="text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] leading-tight tracking-tight">
                    AI Coach
                  </h3>
                  <p className="text-[11px] text-purple-300/80">Smart · Fast · Helpful</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={resetChat}
                  title="Reset conversation"
                  className="p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
                >
                  <RotateCcw size={15} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain hide-scrollbar"
              data-lenis-prevent
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.sender === "bot" && (
                    <div
                      className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                    >
                      <Sparkles size={12} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed`}
                    style={
                      msg.sender === "user"
                        ? {
                            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                            color: "white",
                            borderBottomRightRadius: "6px",
                            boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.88)",
                            borderBottomLeftRadius: "6px",
                          }
                    }
                  >
                    <div className="space-y-0.5">{formatText(msg.text)}</div>
                    <div
                      className="mt-1.5 text-[10px] opacity-40"
                      style={{ textAlign: msg.sender === "user" ? "right" : "left" }}
                    >
                      {hasMounted &&
                        msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                  >
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderBottomLeftRadius: "6px",
                      minWidth: "64px",
                    }}
                  >
                    <span className="text-purple-300/70 text-xs">
                      Thinking{".".repeat(typingDots)}
                    </span>
                    <span className="inline-flex gap-1 ml-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400"
                          style={{
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Quick Prompt Chips */}
              {showPrompts && !isLoading && messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2 space-y-2"
                >
                  <p className="text-[11px] text-white/30 text-center uppercase tracking-widest font-semibold">
                    Quick starters
                  </p>
                  {QUICK_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left text-xs px-4 py-2.5 rounded-xl text-white/70 hover:text-white transition-all"
                      style={{
                        background: "rgba(139,92,246,0.07)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Input Bar ── */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm text-white placeholder-white/30 py-2.5 px-4 rounded-2xl outline-none transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    boxShadow: inputValue.trim() ? "0 4px 16px rgba(139,92,246,0.4)" : "none",
                  }}
                >
                  <Send size={16} className="text-white" />
                </motion.button>
              </form>
              <p className="text-center text-[10px] text-white/20 mt-2">
                AI Coach · Powered by GPT-4o
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle FAB ── */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-xl transition-all"
        style={{
          background: isOpen
            ? "rgba(30,30,40,0.95)"
            : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          border: "1px solid rgba(139,92,246,0.4)",
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(139,92,246,0.45)",
        }}
      >
        {isOpen ? (
          <>
            <ChevronDown size={16} className="text-white/70" />
            <span className="text-white/70">Close</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Sparkles size={18} className="text-white" />
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "rgba(139,92,246,0.4)", animationDuration: "2s" }}
              />
            </div>
            <span>AI Coach</span>
            <span
              className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-wide"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
            >
              LIVE
            </span>
          </>
        )}
      </motion.button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
