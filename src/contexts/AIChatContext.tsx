/// <reference types="../vite-env" />
import React, { createContext, useContext, useState, type ReactNode } from "react";
import { ChatMessage } from "../components/AIChatPanel";

interface AIChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  sendMessage: (userMessage: string, closetData?: any) => Promise<void>;
  clearMessages: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

// Mock AI response generator - context-aware
function generateAIResponse(userMessage: string, closetData?: any): string {
  const message = userMessage.toLowerCase();
  
  // Default values if no closet data
  let items: any[] = [];
  let getItemsByCategory: any = () => [];
  let tops: any[] = [];
  let bottoms: any[] = [];
  let shoes: any[] = [];
  let accessories: any[] = [];

  if (closetData) {
    items = closetData.items || [];
    getItemsByCategory = closetData.getItemsByCategory || (() => []);
    tops = getItemsByCategory("tops") || [];
    bottoms = getItemsByCategory("bottoms") || [];
    shoes = getItemsByCategory("shoes") || [];
    accessories = getItemsByCategory("accessories") || [];
  }

  // Style preferences (mock data - can be enhanced)
  const stylePreferences = ["Casual", "Chic", "Minimalist"];
  const totalItems = items.length;
  const totalOutfits = 42; // Mock data

  // Context-aware responses
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return `Hello! I'm your AI style assistant. I can see you have ${totalItems} items in your wardrobe and ${totalOutfits} saved outfits. Your style preferences include ${stylePreferences.join(", ")}. How can I help you today?`;
  }

  if (message.includes("white") && (message.includes("top") || message.includes("shirt"))) {
    const whiteTops = tops.filter(item => 
      item.name.toLowerCase().includes("white") || 
      item.tag?.toLowerCase().includes("minimalist")
    );
    if (whiteTops.length > 0) {
      return `I found ${whiteTops.length} white/minimalist tops in your wardrobe: ${whiteTops.map(t => t.name).join(", ")}. Would you like me to suggest outfit combinations with these?`;
    }
    return "I don't see any white minimalist tops in your wardrobe. Would you like to add some?";
  }

  if (message.includes("outfit") && (message.includes("create") || message.includes("make") || message.includes("suggest"))) {
    const eventType = message.includes("evening") ? "evening" : 
                     message.includes("business") ? "business" :
                     message.includes("casual") ? "casual" : "general";
    
    if (eventType === "evening" && message.includes("chic")) {
      return `For a chic evening event, I recommend pairing one of your elegant pieces with accessories. Based on your ${totalItems} items, I suggest: a sophisticated top from your collection, paired with statement accessories. Would you like me to show you specific combinations?`;
    }
    return `I can help you create a ${eventType} outfit! You have ${tops.length} tops, ${bottoms.length} bottoms, and ${shoes.length} pairs of shoes to work with. What's the occasion?`;
  }

  if (message.includes("what should i wear") || message.includes("recommend")) {
    if (message.includes("business casual") || message.includes("meeting")) {
      return `For a business casual meeting, I recommend: a professional top (you have ${tops.length} options), paired with tailored bottoms (${bottoms.length} available), and comfortable yet polished shoes. Your minimalist style preference works perfectly for this!`;
    }
    return `Based on your ${totalItems} items and ${stylePreferences.join(", ")} style preferences, I can suggest several options. What's the occasion or weather like today?`;
  }

  if (message.includes("match") || message.includes("pair")) {
    return `I can help you match items! You have ${tops.length} tops, ${bottoms.length} bottoms, and ${shoes.length} pairs of shoes. Which item would you like to match? For example, "Match my blue shirt" or "What goes with my white sneakers?"`;
  }

  if (message.includes("inventory") || message.includes("items") || message.includes("wardrobe")) {
    return `Your wardrobe summary:\n• ${tops.length} Tops\n• ${bottoms.length} Bottoms\n• ${shoes.length} Pairs of Shoes\n• ${accessories.length} Accessories\n• Total: ${totalItems} Items\n• ${totalOutfits} Saved Outfits\n\nYour style: ${stylePreferences.join(", ")}\n\nWhat would you like to know about your wardrobe?`;
  }

  if (message.includes("style") && message.includes("tip")) {
    return `Here's a style tip based on your preferences:\n\nSince you love ${stylePreferences.join(" and ")}, try mixing textures and subtle patterns. With ${totalItems} items, you can create ${totalOutfits}+ unique combinations. Remember: less is more with minimalist style - focus on quality pieces that work together!`;
  }

  // Default responses
  const defaultResponses = [
    `I understand you're asking about "${userMessage}". Based on your wardrobe of ${totalItems} items and your ${stylePreferences.join(", ")} style, I can help you with outfit suggestions, item matching, or style advice. What specifically would you like help with?`,
    `Great question! With ${totalItems} items in your closet and ${totalOutfits} saved outfits, you have plenty of options. Would you like me to suggest a specific outfit combination or help you find items that match?`,
    `I'm here to help with your style! You have ${tops.length} tops, ${bottoms.length} bottoms, and ${shoes.length} pairs of shoes. Try asking me to "create an outfit for [occasion]" or "show me my [color/style] items".`,
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export function AIChatProvider({ children }: { children?: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = async (userMessage: string, closetData?: any): Promise<void> => {
    const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001';
    const useBackend = import.meta.env.VITE_USE_AI_BACKEND === 'true';

    try {
      let aiResponse: string;

      if (useBackend && closetData) {
        // Use backend API
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            context: {
              totalItems: closetData.items?.length || 0,
              totalOutfits: 42, // Mock - can be enhanced
              categories: {
                tops: closetData.getItemsByCategory?.('tops')?.length || 0,
                bottoms: closetData.getItemsByCategory?.('bottoms')?.length || 0,
                shoes: closetData.getItemsByCategory?.('shoes')?.length || 0,
                accessories: closetData.getItemsByCategory?.('accessories')?.length || 0,
              },
              stylePreferences: ['Casual', 'Chic', 'Minimalist'], // Mock - can be enhanced
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        aiResponse = data.response;
      } else {
        // Use local mock response
        await new Promise((resolve) => setTimeout(resolve, 500));
        aiResponse = generateAIResponse(userMessage, closetData);
      }

      // Add AI response
      addMessage({
        role: 'assistant',
        content: aiResponse,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local response on error
      const fallbackResponse = generateAIResponse(userMessage, closetData);
      addMessage({
        role: 'assistant',
        content: fallbackResponse,
      });
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AIChatContext.Provider
      value={{ messages, addMessage, sendMessage, clearMessages }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
}

