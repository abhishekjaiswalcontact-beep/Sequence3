"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


const CATEGORIES = [
  "Gym Membership",
  "Gym Program",
  "Book A Free Trial",
  "I Want Personal Training",
  "Bulk Corporate Membership",
  "Raise A Complaint",
  "Other Requirements",
];

const CONTACT_LINK = "/#contact";
const OWNER_EMAIL = "info@pinakafitness.com";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  isInitial?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      text: "Welcome to Pinaka Fitness! How can we help you today?",
      sender: "bot",
      timestamp: new Date(),
      isInitial: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [showMainOptions, setShowMainOptions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading, showMainOptions]);

  const handleSend = async (text: string, sender: "bot" | "user" = "user") => {
    if (!text.trim() || (sender === "user" && isLoading)) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (sender === "user") {
        setInputValue("");
        setShowMainOptions(false);
        setIsLoading(true);
        
        // INTERCEPT CATEGORIES
        setTimeout(() => {
            let botResponse = "";
            let recognized = true;

            const lowerText = text.toLowerCase();

            if (lowerText.includes("gym membership")) {
                botResponse = "All our plans include identical premium features (Full access, unlimited classes, personal training, spa & more). We offer duration-based pricing:\n\n• **Monthly**: ₹2499/month\n• **3 Months**: ₹5999 (Save ₹1498)\n• **6 Months**: ₹9999 (Most Popular - Save ₹4995)\n• **Yearly**: ₹17999 (Best Value - Save ₹11989)\n\nWhich duration works best for you?";
            } else if (lowerText.includes("gym program")) {
                botResponse = `Explore our elite training programs here:\n[🏋️ View Gym Programs](/#programs)`;
            } else if (lowerText.includes("free trial")) {
                botResponse = `You can book your free trial from here:\n[📅 Book Free Trial](${CONTACT_LINK})`;
            } else if (lowerText.includes("personal training")) {
                botResponse = `To get personal training, please contact us here:\n[💪 Contact Personal Trainers](${CONTACT_LINK})`;
            } else if (lowerText.includes("corporate membership")) {
                botResponse = `For corporate membership inquiries, please email us at:\n**${OWNER_EMAIL}**\n\nOur team will get back to you shortly.`;
            } else if (lowerText.includes("complaint")) {
                botResponse = `We're sorry for the inconvenience. Please send your complaint to:\n**${OWNER_EMAIL}**`;
            } else if (lowerText.includes("other requirements")) {
                botResponse = `For any other queries, please reach out here:\n[📩 Send Inquiry](${CONTACT_LINK})`;
            } else if (lowerText.includes("back to menu")) {
                botResponse = "What else can I help you with?";
                setShowMainOptions(true);
            } else {
                recognized = false;
            }

            if (recognized) {
                const botMsg: Message = {
                    id: Math.random().toString(36).substring(7),
                    text: botResponse,
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsLoading(false);
            } else {
                // Fallback to API for general queries
                fetchAIResponse(text, [...messages, newMessage]);
            }
        }, 600);
    }
  };

  const fetchAIResponse = async (text: string, history: Message[]) => {
    try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        const data = await response.json();
        const botMessage: Message = {
          id: Math.random().toString(36).substring(7),
          text: data.text || "I'm happy to help! Would you like to check our membership options?",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch {
        setMessages((prev) => [...prev, {
            id: "error",
            text: "I'm having a bit of trouble. Please select an option from the menu below.",
            sender: "bot",
            timestamp: new Date()
        }]);
      } finally {
        setIsLoading(false);
      }
  };

  const resetToMenu = () => {
    handleSend("Back to Menu", "user");
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-black border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md overflow-hidden">
                  <img src="/chatbot.png" alt="Chatbot" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg leading-tight">Pinaka Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/80">Always Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                      msg.sender === "user"
                        ? "bg-brand text-white rounded-tr-none shadow-neon"
                        : "bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none"
                    )}
                  >
                    {msg.text.includes("[") ? (
                        <div>
                            {msg.text.split("\n").map((line, i) => {
                                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                                return (
                                    <p key={i}>
                                        {match ? (
                                            <a href={match[2]} className="text-brand font-bold underline hover:text-brand-light">
                                                {match[1]}
                                            </a>
                                        ) : line}
                                    </p>
                                );
                            })}
                        </div>
                    ) : msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">
                    {hasMounted && msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start mr-auto max-w-[85%]">
                  <div className="bg-white/5 border border-white/10 text-zinc-300 px-4 py-2.5 rounded-2xl rounded-tl-none text-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Main Menu Options */}
              {!isLoading && showMainOptions && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-2 mt-2"
                 >
                   {CATEGORIES.map((cat) => (
                     <button
                       key={cat}
                       onClick={() => handleSend(cat, "user")}
                       className="text-left px-4 py-3 bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 text-zinc-300 rounded-xl text-sm transition-all flex items-center justify-between group"
                     >
                       {cat}
                       <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity text-brand" />
                     </button>
                   ))}
                 </motion.div>
              )}

              {/* Persistent "Back to Menu" button after any Bot response when NOT in main menu */}
              {!isLoading && !showMainOptions && messages[messages.length - 1].sender === "bot" && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={resetToMenu}
                    className="px-4 py-2 border border-brand/30 text-brand rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand/10 transition-all flex items-center gap-2 mx-auto mt-4"
                  >
                   ⬅️ Back to Menu
                  </motion.button>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/10 bg-black">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-12 text-sm focus:outline-none focus:border-brand/50 transition-colors text-white placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-1 p-2 bg-brand text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-neon-strong transition-all duration-300 overflow-hidden",
          isOpen ? "bg-white text-black rotate-90" : "bg-brand text-white"
        )}
      >
        {isOpen ? <X size={28} className="md:size-36" /> : <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 md:w-10 md:h-10 object-contain" />}
      </motion.button>
    </div>
  );
}

