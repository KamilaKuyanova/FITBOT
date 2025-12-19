import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Minimize2, Maximize2, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCloset } from "../contexts/ClosetContext";
import { useAIChat } from "../contexts/AIChatContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AIChatPanel({ isMinimized = false, onToggleMinimize }: AIChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, sendMessage } = useAIChat();
  const closetData = useCloset();
  const { items } = closetData;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
    });

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(async () => {
      await sendMessage(userMessage, closetData);
      setIsSending(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        onClick={onToggleMinimize}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-24 right-6 z-40 w-80 h-[600px] max-h-[calc(100vh-120px)] rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl flex flex-col overflow-hidden max-w-[calc(100vw-48px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/40 bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold">AI Style Assistant</h3>
        </div>
        <button
          onClick={onToggleMinimize}
          className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-[#F9F9F9]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#4A4A4A] font-medium mb-2">Hello! I'm your style assistant.</p>
            <p className="text-[#8A8A8A] text-sm">
              You have {items.length} items in your wardrobe. How can I help you today?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-[16px] p-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] text-white"
                    : "bg-white/60 backdrop-blur-sm border border-white/40 text-[#4A4A4A]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-white/70" : "text-[#8A8A8A]"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-[16px] p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#C8A2C8] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#C8A2C8] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#C8A2C8] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/40 bg-white/60 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about style..."
            className="flex-1 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-md hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

