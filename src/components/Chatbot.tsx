"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
const OWNER_EMAIL = "pinakafitnessnoida127@gmail.com";

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
                botResponse = "All our plans include identical premium features (Full access, unlimited classes, personal training, spa & more). We offer duration-based pricing:\n\n• **Monthly**: ₹4999/month\n• **3 Months**: ₹9999 (Save ₹1498)\n• **6 Months**: ₹15999 (Most Popular - Save ₹4995)\n• **Yearly**: ₹21999 (Best Value - Save ₹11989)\n\nWhich duration works best for you?";
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 1. Immediately close/minimize the chatbot window
    setIsOpen(false);

    // 2. Handle internal anchor / hash scrolling
    if (href.startsWith('/#') || href.startsWith('#')) {
      const targetId = href.replace('/#', '').replace('#', '');
      if (typeof window !== 'undefined') {
        if (window.location.pathname === '/') {
          e.preventDefault();
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, '', `/#${targetId}`);
            }
          }, 120);
        } else {
          window.location.href = `/#${targetId}`;
        }
      }
    }
  };

  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      if (!line.trim() && lineIdx !== 0 && lineIdx !== lines.length - 1) {
        return <span key={lineIdx} className="block h-2" />;
      }

      // Tokenize markdown links [text](url) and bold **text**
      const tokens = line.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);

      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {tokens.map((token, tokenIdx) => {
            const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
              const [, linkText, linkHref] = linkMatch;
              return (
                <a
                  key={tokenIdx}
                  href={linkHref}
                  onClick={(e) => handleLinkClick(e, linkHref)}
                  className="inline-flex items-center gap-1 text-brand-light font-bold underline hover:text-white transition-colors cursor-pointer"
                >
                  {linkText}
                </a>
              );
            }

            if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
              return (
                <strong key={tokenIdx} className="text-white font-semibold">
                  {token.slice(2, -2)}
                </strong>
              );
            }

            return <span key={tokenIdx}>{token}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[950] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-20 max-w-[420px] mx-auto max-h-[calc(100dvh-190px)] h-[560px] md:static md:inset-auto md:mb-4 md:w-[400px] md:h-[600px] md:max-h-[calc(100vh-140px)] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.18)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#0c0c0c] border-b border-white/10 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand/20 border border-brand/30 rounded-full flex items-center justify-center backdrop-blur-md overflow-hidden relative shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                  <Image
                    src="/chatbot.png"
                    alt="Chatbot"
                    fill
                    sizes="40px"
                    className="object-cover p-0.5"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg leading-tight tracking-wide">Pinaka Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[11px] font-medium text-white/70">Always Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 active:scale-90 rounded-full transition-all text-white/70 hover:text-white"
                aria-label="Close chatbot"
              >
                <X size={19} />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 overscroll-contain hide-scrollbar"
              data-lenis-prevent
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
                      "px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-brand to-purple-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        : "bg-white/[0.06] border border-white/10 text-zinc-200 rounded-tl-none backdrop-blur-sm"
                    )}
                  >
                    {renderMessageContent(msg.text)}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">
                    {hasMounted && msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start mr-auto max-w-[85%]">
                  <div className="bg-white/[0.06] border border-white/10 text-zinc-300 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs sm:text-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce" />
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
                       className="text-left px-3.5 py-2.5 sm:py-3 bg-white/[0.04] border border-white/10 hover:border-brand/40 hover:bg-brand/10 text-zinc-200 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between group active:scale-[0.99]"
                     >
                       <span>{cat}</span>
                       <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity text-brand-light shrink-0 ml-2" />
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
                    className="px-4 py-2 border border-brand/40 text-brand-light rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand/15 transition-all flex items-center gap-1.5 mx-auto mt-3 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                  >
                   ⬅️ Back to Menu
                  </motion.button>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0c0c0c] shrink-0">
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
                  className="w-full bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-4 pr-11 text-xs sm:text-sm focus:outline-none focus:border-brand/50 transition-colors text-white placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-1 w-8 h-8 rounded-full bg-brand hover:bg-brand-light text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)] active:scale-95"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button with Ambient Active Glow */}
      <div className="relative flex items-center justify-center">
        {!isOpen && (
          <>
            {/* Ambient breathing outer glow */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.7, 0.35],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-2 rounded-full bg-gradient-to-tr from-brand-dark via-brand to-purple-400 blur-md pointer-events-none"
            />
            {/* Soft atmospheric outer aura */}
            <motion.div
              animate={{
                scale: [1.1, 1.45, 1.1],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -inset-3.5 rounded-full bg-brand blur-xl pointer-events-none"
            />
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden relative z-10", 
            isOpen 
              ? "bg-white text-black rotate-90 shadow-2xl" 
              : "bg-gradient-to-tr from-brand-dark via-brand to-purple-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.65)] border border-white/25"
          )}
        >
          {isOpen ? (
            <X size={26} className="md:size-32" />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 relative">
              <Image
                src="/chatbot.png"
                alt="Chatbot"
                fill
                sizes="(max-width: 768px) 32px, 40px"
                className="object-contain"
              />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}

