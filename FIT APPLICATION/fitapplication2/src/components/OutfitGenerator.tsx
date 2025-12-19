import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Heart, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OutfitGeneratorProps {
  onNavigate: (screen: string) => void;
}

export function OutfitGenerator({ onNavigate }: OutfitGeneratorProps) {
  const [step, setStep] = useState<"setup" | "results">("setup");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const occasions = [
    { id: "casual", label: "Casual", gradient: "from-[#F7EDE2] to-[#E8F5E9]" },
    { id: "work", label: "Work", gradient: "from-[#E3F0FF] to-[#DAD7CD]" },
    { id: "party", label: "Party", gradient: "from-[#F5DCE7] to-[#E3B8E3]" },
    { id: "sport", label: "Sport", gradient: "from-[#E8F5E9] to-[#C8E8C9]" },
  ];

  const moods = [
    { id: "confident", label: "Confident", emoji: "💪" },
    { id: "playful", label: "Playful", emoji: "🎨" },
    { id: "elegant", label: "Elegant", emoji: "✨" },
    { id: "relaxed", label: "Relaxed", emoji: "☁️" },
  ];

  const colorPalettes = [
    { id: "pastel", label: "Pastels", colors: ["#F5DCE7", "#E3F0FF", "#E8F5E9"] },
    { id: "neutral", label: "Neutrals", colors: ["#F7EDE2", "#DAD7CD", "#F9F9F9"] },
    { id: "bold", label: "Bold", colors: ["#C8A2C8", "#E3B8E3", "#F5DCE7"] },
  ];

  const generatedOutfits = [
    {
      id: 1,
      name: "Chic Casual",
      description: "Perfect for weekend brunch",
      image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      name: "Minimal Elegance",
      description: "Sophisticated and timeless",
      image: "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      name: "Cozy Comfort",
      description: "Relaxed yet stylish",
      image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const toggleColor = (paletteId: string) => {
    setSelectedColors(prev =>
      prev.includes(paletteId)
        ? prev.filter(c => c !== paletteId)
        : [...prev, paletteId]
    );
  };

  const handleGenerate = () => {
    setStep("results");
  };

  return (
    <div className="min-h-screen pb-28 px-6 pt-8">
      <AnimatePresence mode="wait">
        {step === "setup" ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2>AI Outfit Generator</h2>
              <p className="text-[#8A8A8A]">Create your perfect look</p>
            </div>

            <div className="space-y-4">
              <h3>Occasion</h3>
              <div className="grid grid-cols-2 gap-3">
                {occasions.map((occasion) => (
                  <motion.button
                    key={occasion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedOccasion(occasion.id)}
                    className={`rounded-[20px] bg-gradient-to-br ${occasion.gradient} p-6 shadow-lg transition-all ${
                      selectedOccasion === occasion.id
                        ? "ring-2 ring-[#C8A2C8] ring-offset-2"
                        : ""
                    }`}
                  >
                    <p className="text-white">{occasion.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3>Mood</h3>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`rounded-[20px] bg-white/60 backdrop-blur-md border border-white/40 p-6 shadow-lg transition-all ${
                      selectedMood === mood.id
                        ? "ring-2 ring-[#C8A2C8] ring-offset-2 bg-white"
                        : ""
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <p className="text-[#4A4A4A]">{mood.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3>Color Palette</h3>
              <div className="space-y-3">
                {colorPalettes.map((palette) => (
                  <motion.button
                    key={palette.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleColor(palette.id)}
                    className={`w-full rounded-[20px] bg-white/60 backdrop-blur-md border border-white/40 p-4 shadow-lg transition-all ${
                      selectedColors.includes(palette.id)
                        ? "ring-2 ring-[#C8A2C8] ring-offset-2 bg-white"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[#4A4A4A]">{palette.label}</p>
                      <div className="flex gap-2">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedOccasion || !selectedMood || selectedColors.length === 0}
              className="w-full h-14 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] hover:from-[#B892B8] hover:to-[#D3A8D3] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Generate Outfits
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2>Your AI Outfits</h2>
                <p className="text-[#8A8A8A]">Generated just for you</p>
              </div>
              <button
                onClick={() => setStep("setup")}
                className="w-12 h-12 rounded-[14px] bg-white/60 backdrop-blur-md border border-white/40 shadow-md flex items-center justify-center hover:bg-white transition-all"
              >
                <RefreshCw className="w-5 h-5 text-[#C8A2C8]" />
              </button>
            </div>

            <div className="space-y-4">
              {generatedOutfits.map((outfit, index) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#F7EDE2] to-[#E8F5E9] relative">
                    <ImageWithFallback
                      src={outfit.image}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md"
                      >
                        <Heart className="w-5 h-5 text-[#8A8A8A]" />
                      </motion.button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm">
                        <p className="text-[#C8A2C8]">AI Generated</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3>{outfit.name}</h3>
                      <p className="text-[#8A8A8A]">{outfit.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onNavigate("try-on")}
                        className="flex-1 h-12 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-md hover:shadow-lg transition-all"
                      >
                        Try On
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 px-6 rounded-[16px] bg-white/80 border border-white/60 hover:bg-white transition-all"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              variant="outline"
              className="w-full h-14 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white"
            >
              <RefreshCw className="mr-2 w-5 h-5" />
              Regenerate Outfits
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
