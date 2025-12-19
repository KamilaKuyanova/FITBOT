import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shirt, Cloud, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      title: "AI Outfit Generation",
      description: "Let AI create stunning outfits based on your wardrobe, occasion, and mood.",
      gradient: "from-[#F5DCE7] to-[#E3F0FF]",
    },
    {
      icon: Shirt,
      title: "Smart Wardrobe",
      description: "Organize your clothes with AI-powered categorization and smart tagging.",
      gradient: "from-[#E3F0FF] to-[#E8F5E9]",
    },
    {
      icon: Cloud,
      title: "Weather-Based Looks",
      description: "Get perfect outfit suggestions tailored to today's weather and temperature.",
      gradient: "from-[#E8F5E9] to-[#F7EDE2]",
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className={`w-32 h-32 rounded-[32px] bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center mb-8 shadow-lg`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
            </motion.div>

            <h1 className="mb-4 text-center">{currentSlideData.title}</h1>
            <p className="text-[#8A8A8A] max-w-sm text-center">
              {currentSlideData.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-[#C8A2C8]"
                  : "w-2 bg-[#DAD7CD]"
              }`}
              layoutId={`indicator-${index}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-14 rounded-[20px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] hover:from-[#B892B8] hover:to-[#D3A8D3] text-white shadow-lg transition-all duration-300"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 w-5 h-5" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
}
