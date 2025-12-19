import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Camera, PlusCircle, Cloud, Sun, MapPin, Loader2, Check, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LocationPickerModal } from "./LocationPickerModal";
import { AIChatPanel } from "./AIChatPanel";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  recommendation: string;
}

// Weather response type for API
type WeatherResponse = {
  temp_c: number;
  description: string;
  icon?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isOutfitSaved, setIsOutfitSaved] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState({
    id: 1,
    name: "Casual Chic",
    description: "Perfect for brunch or shopping",
    image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  });

  // Fetch default weather on mount (New York coordinates)
  useEffect(() => {
    fetchWeather(40.7128, -74.0060);
  }, []);

  // Check if current outfit is already saved on mount
  useEffect(() => {
    const savedOutfits = JSON.parse(localStorage.getItem("savedOutfits") || "[]");
    const isSaved = savedOutfits.some((outfit: any) => outfit.id === currentOutfit.id);
    setIsOutfitSaved(isSaved);
  }, [currentOutfit.id]);

  const fetchWeather = async (lat: number, lon: number) => {
    setIsLoading(true);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/weather/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to fetch weather";
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        } else {
          // If not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            // If text parsing fails, use default message
          }
        }
        
        throw new Error(errorMessage);
      }

      // Ensure response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      setWeatherData(data);
      
      // Map to WeatherResponse format
      setWeather({
        temp_c: data.temperature,
        description: data.description || data.condition,
        icon: data.icon,
      });
    } catch (err: any) {
      // Silently fail and use static weather data instead
      console.error("Weather fetch error:", err);
      // Don't set error state - just use static weather
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleLocationClick = () => {
    setLoading(true);
    setIsLoading(true);

    if (!navigator.geolocation) {
      // Silently fail and use static weather data instead
      setLoading(false);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(`${API_BASE_URL}/weather/current`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: latitude,
              lon: longitude,
            }),
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Weather API error");
          }

          // Parse response once
          const data = await res.json();
          
          // Update weatherData (full format from backend)
          setWeatherData(data);
          
          // Map to WeatherResponse format
          setWeather({
            temp_c: data.temperature,
            description: data.description || data.condition,
            icon: data.icon,
          });
        } catch (err: any) {
          // Silently fail and use static weather data instead
          console.error(err);
          // Don't set error state - just use static weather
        } finally {
          setLoading(false);
          setIsLoading(false);
        }
      },
      (err) => {
        // Silently fail and use static weather data instead
        console.error(err);
        // Don't set error state - just use static weather
        setLoading(false);
        setIsLoading(false);
      }
    );
  };

  // Static weather data options
  const staticWeatherOptions = [
    { emoji: '☀️', condition: 'Sunny', temp: 24, description: 'Sunny' },
    { emoji: '⛅', condition: 'Partly Cloudy', temp: 19, description: 'Partly Cloudy' },
    { emoji: '🌦️', condition: 'Light Rain', temp: 16, description: 'Light Rain' },
    { emoji: '☁️', condition: 'Cloudy', temp: 20, description: 'Cloudy' },
    { emoji: '🌤️', condition: 'Mostly Sunny', temp: 23, description: 'Mostly Sunny' },
  ];

  // Get static weather (default to first option)
  const getStaticWeather = () => {
    return staticWeatherOptions[0]; // Default: ☀️ Sunny, 24°C
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return Sun;
    }
    return Cloud;
  };

  // Use static weather if no real data available
  const staticWeather = getStaticWeather();
  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.condition) : Sun;

  // Outfit generation options
  const outfitOptions = [
    {
      id: 1,
      name: "Casual Chic",
      description: "Perfect for brunch or shopping",
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
    {
      id: 4,
      name: "Bold Statement",
      description: "Make a fashion statement",
      image: "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  // Try On Outfit function
  const tryOnOutfit = async () => {
    console.log("Try On clicked for outfit:", currentOutfit.name);
    setIsTryingOn(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to Virtual Try-On screen
    onNavigate("try-on");
    
    setIsTryingOn(false);
  };

  // Save Outfit function
  const saveOutfit = async () => {
    console.log("Save clicked for outfit:", currentOutfit.name);
    
    // Save to localStorage (in production, this would be an API call)
    const savedOutfits = JSON.parse(localStorage.getItem("savedOutfits") || "[]");
    const outfitToSave = {
      ...currentOutfit,
      savedAt: new Date().toISOString(),
    };
    
    // Check if already saved
    const isAlreadySaved = savedOutfits.some((outfit: any) => outfit.id === currentOutfit.id);
    
    if (!isAlreadySaved) {
      savedOutfits.push(outfitToSave);
      localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));
      setIsOutfitSaved(true);
      
      // Show confirmation message
      console.log("Outfit saved to your collection!");
    } else {
      console.log("Outfit already saved!");
    }
  };

  // Regenerate Outfit function
  const regenerateOutfit = async () => {
    console.log("Regenerate clicked");
    setIsRegenerating(true);
    setIsOutfitSaved(false); // Reset saved state when regenerating
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get random outfit from options
    const randomOutfit = outfitOptions[Math.floor(Math.random() * outfitOptions.length)];
    setCurrentOutfit(randomOutfit);
    
    console.log("New outfit generated:", randomOutfit.name);
    setIsRegenerating(false);
  };

  const quickActions = [
    { id: "ai-style", icon: Sparkles, label: "Generate Outfit", gradient: "from-[#F5DCE7] to-[#E3B8E3]" },
    { id: "try-on", icon: Camera, label: "Virtual Try-On", gradient: "from-[#E3F0FF] to-[#C8D8F0]" },
    { id: "closet", icon: PlusCircle, label: "Add Clothing", gradient: "from-[#E8F5E9] to-[#D0E8D1]" },
    { id: "weather", icon: Cloud, label: "Weather Look", gradient: "from-[#F7EDE2] to-[#E8DED2]" },
  ];

  return (
    <div className="min-h-screen pb-28 px-6 pt-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h2>Hi, Kamila! 👋</h2>
          <p className="text-[#8A8A8A]">Ready to style today?</p>
        </div>

        <motion.div
          className="w-full rounded-[24px] bg-gradient-to-br from-[#E3F0FF] to-[#F5DCE7] p-6 shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Today's Weather</h3>
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors"
                  aria-label="Get current location weather"
                  disabled={loading}
                >
                  <MapPin className="w-4 h-4 text-[#8A8A8A] hover:text-[#C8A2C8]" />
                </button>
              </div>

              {loading && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C8A2C8]" />
                  <p className="text-[#8A8A8A]">Loading...</p>
                </div>
              )}

              {!loading && weatherData && (
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-[#4A4A4A]">{weatherData.temperature}°C</p>
                  <p className="text-[#8A8A8A] mt-1">{weatherData.description || weatherData.condition}</p>
                  <p className="text-[#8A8A8A] text-sm mt-1">
                    {weatherData.location}, {weatherData.country}
                  </p>
                </div>
              )}

              {!loading && !weatherData && (
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-[#4A4A4A]">
                    {staticWeather.emoji} {staticWeather.condition}, {staticWeather.temp}°C
                  </p>
                  <p className="text-[#8A8A8A] mt-1">{staticWeather.description}</p>
                </div>
              )}
            </div>
            <div className="w-16 h-16 rounded-[16px] bg-white/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-[#C8A2C8] animate-spin" />
              ) : (
                <WeatherIcon className="w-8 h-8 text-[#C8A2C8]" />
              )}
            </div>
          </div>
        </motion.div>

        {showLocationPicker && (
          <LocationPickerModal
            onClose={() => setShowLocationPicker(false)}
            onSelect={(lat, lon) => {
              setShowLocationPicker(false);
              fetchWeather(lat, lon);
            }}
          />
        )}

        <div>
          <h3 className="mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(action.id)}
                  className={`rounded-[20px] bg-gradient-to-br ${action.gradient} p-6 shadow-lg text-left group`}
                >
                  <div className="w-12 h-12 rounded-[14px] bg-white/40 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/60 transition-all">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white">{action.label}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Outfit of the Day</h3>
            <motion.button
              onClick={regenerateOutfit}
              disabled={isRegenerating}
              className="text-[#C8A2C8] flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate
            </motion.button>
          </div>
          
          <motion.div
            className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            key={currentOutfit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-[#F7EDE2] to-[#E8F5E9] relative overflow-hidden">
              <ImageWithFallback
                src={currentOutfit.image}
                alt={currentOutfit.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm">
                  <p className="text-[#C8A2C8]">AI Generated</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4>{currentOutfit.name}</h4>
                <p className="text-[#8A8A8A]">{currentOutfit.description}</p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={tryOnOutfit}
                  disabled={isTryingOn}
                  className="flex-1 h-12 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98, opacity: 0.8 }}
                >
                  {isTryingOn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Trying on...</span>
                    </>
                  ) : (
                    "Try On"
                  )}
                </motion.button>
                <motion.button
                  onClick={saveOutfit}
                  disabled={isOutfitSaved}
                  className={`h-12 px-6 rounded-[16px] border transition-all flex items-center justify-center gap-2 ${
                    isOutfitSaved
                      ? "bg-gradient-to-r from-[#E8F5E9] to-[#D0E8D1] border-[#E8F5E9] text-[#4A4A4A]"
                      : "bg-white/80 border-white/60 hover:bg-white"
                  }`}
                  whileHover={{ scale: isOutfitSaved ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98, opacity: 0.8 }}
                >
                  {isOutfitSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved</span>
                    </>
                  ) : (
                    "Save"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="mb-4">AI Suggestions</h3>
          <div className="space-y-3">
            {[
              { text: "Try pairing your blue denim jacket with white sneakers", icon: Sparkles },
              { text: "Weather's great for your floral dress today", icon: Cloud },
            ].map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center flex-shrink-0">
                  <suggestion.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[#4A4A4A] flex-1">{suggestion.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Chat Panel */}
      <AIChatPanel
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />
    </div>
  );
}
