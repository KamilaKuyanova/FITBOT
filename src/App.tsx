import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { AuthScreen } from "./components/AuthScreen";
import { HomeScreen } from "./components/HomeScreen";
import { VirtualTryOn } from "./components/VirtualTryOn";
import { MyCloset } from "./components/MyCloset";
import { OutfitGenerator } from "./components/OutfitGenerator";
import { ProfileSettings } from "./components/ProfileSettings";
import { AIModelSettings } from "./components/AIModelSettings";
import { EditProfileSettings } from "./components/EditProfileSettings";
import { BottomNav } from "./components/BottomNav";
import { ClosetProvider } from "./contexts/ClosetContext";
import { AIChatProvider } from "./contexts/AIChatContext";
import { ProfileProvider } from "./contexts/ProfileContext";

type AppState = "onboarding" | "auth" | "app";
type Screen = "home" | "closet" | "ai-style" | "try-on" | "profile" | "weather" | "ai-settings" | "edit-profile";

export default function App() {
  const [appState, setAppState] = useState<AppState>("onboarding");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const handleOnboardingComplete = () => {
    setAppState("auth");
  };

  const handleLogin = () => {
    setAppState("app");
    setCurrentScreen("home");
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onNavigate={handleNavigation} />;
      case "closet":
        return <MyCloset />;
      case "ai-style":
        return <OutfitGenerator onNavigate={handleNavigation} />;
      case "try-on":
        return <VirtualTryOn />;
      case "profile":
        return <ProfileSettings onNavigate={handleNavigation} />;
      case "edit-profile":
        return <EditProfileSettings onBack={() => handleNavigation("profile")} />;
      case "ai-settings":
        return <AIModelSettings onBack={() => handleNavigation("profile")} />;
      case "weather":
        return <OutfitGenerator onNavigate={handleNavigation} />;
      default:
        return <HomeScreen onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans antialiased">
      <div className="mx-auto max-w-md min-h-screen bg-[#F9F9F9] relative">
        <AnimatePresence mode="wait">
          {appState === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {appState === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuthScreen onLogin={handleLogin} />
            </motion.div>
          )}

          {appState === "app" && (
            <ClosetProvider>
              <ProfileProvider>
                <AIChatProvider>
                  {(() => {
                    return (
                      <motion.div
                        key="app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentScreen}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {renderScreen()}
                          </motion.div>
                        </AnimatePresence>
                        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigation} />
                      </motion.div>
                    );
                  })()}
                </AIChatProvider>
              </ProfileProvider>
            </ClosetProvider>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
