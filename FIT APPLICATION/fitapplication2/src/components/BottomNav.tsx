import { Home, Shirt, Sparkles, Camera, User } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "closet", icon: Shirt, label: "Closet" },
    { id: "ai-style", icon: Sparkles, label: "AI Style" },
    { id: "try-on", icon: Camera, label: "Try-On" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <div className="mx-auto max-w-md">
        <div className="rounded-[24px] bg-white/70 backdrop-blur-md border border-white/40 shadow-lg px-4 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-1 p-2 relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isActive ? "text-[#C8A2C8]" : "text-[#8A8A8A]"
                      }`}
                    />
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A2C8]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
