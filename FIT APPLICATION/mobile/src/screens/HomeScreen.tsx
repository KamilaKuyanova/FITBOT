import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useProfile } from "../contexts/ProfileContext";
import { WEATHER_API_URL } from "../config/api";

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  recommendation?: string;
}

const staticWeather = {
  emoji: "☀️",
  condition: "Sunny",
  temp: 24,
  description: "Sunny",
};

export default function HomeScreen() {
  const { profile } = useProfile();
  const navigation = useNavigation<any>();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastWeatherFetch, setLastWeatherFetch] = useState<number>(0);
  const [currentOutfit, setCurrentOutfit] = useState({
    id: 1,
    name: "Casual Chic",
    description: "Perfect for brunch or shopping",
    image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  });

  useEffect(() => {
    // Only fetch on mount if profile is available, don't show error alerts on initial load (silent fail)
    if (profile?.location?.coordinates) {
      fetchWeather(profile.location.coordinates.lat, profile.location.coordinates.lon, false);
    }
  }, [profile?.location?.coordinates]); // Run when profile location is available

  const fetchWeather = async (lat: number, lon: number, showError = true) => {
    // Debounce: Only fetch if last fetch was more than 10 seconds ago
    const now = Date.now();
    if (now - lastWeatherFetch < 10000) {
      console.log("[UI] Weather fetch skipped (debounced)");
      return;
    }

    console.log("[UI] Fetching weather for coordinates:", lat, lon);
    console.log("[UI] Weather API URL:", `${WEATHER_API_URL}/weather/current`);
    setIsLoading(true);
    setWeatherError(null);
    setLastWeatherFetch(now);

    try {
      // Create timeout controller for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${WEATHER_API_URL}/weather/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("[UI] Weather response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("[UI] Weather data received:", data);
        setWeatherData(data);
        setWeatherError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[UI] Weather response error:", errorData);
        const errorMessage = errorData.error || "Failed to load weather data.";
        setWeatherError("Unable to fetch weather. Check your connection.");
      }
    } catch (err: any) {
      // Check if it's a timeout or network error
      if (err.name === 'AbortError' || err.name === 'TimeoutError' || err.message?.includes('Network request failed')) {
        console.warn("[UI] Weather fetch timeout/network error:", err?.message ?? String(err));
        setWeatherError("Unable to fetch weather. Check your connection.");
      } else {
        console.warn("[UI] Weather fetch error:", err?.message ?? String(err));
        setWeatherError("Unable to fetch weather. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationClick = async () => {
    console.log("[UI] Location button pressed");
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("[UI] Location permission denied");
        setIsLoading(false);
        Alert.alert(
          "Location Permission",
          "Location permission is required to get weather for your current location."
        );
        return;
      }

      console.log("[UI] Getting current location...");
      const location = await Location.getCurrentPositionAsync({});
              console.log("[UI] Location received:", location.coords);
              await fetchWeather(location.coords.latitude, location.coords.longitude, true);
    } catch (err) {
      console.error("[UI] Location error:", err);
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    console.log(`[UI] Quick action pressed: ${actionId}`);
    switch (actionId) {
      case "ai-style":
        navigation.navigate("AIStyleTab");
        break;
      case "try-on":
        navigation.navigate("TryOnTab");
        break;
      case "closet":
        navigation.navigate("AddClothing");
        break;
      case "weather":
        navigation.navigate("WeatherLook");
        break;
      default:
        console.log(`[UI] Unknown action: ${actionId}`);
    }
  };

  const quickActions = [
    { 
      id: "ai-style", 
      icon: "sparkles", 
      label: "Generate Outfit", 
      color: "#F5DCE7" 
    },
    { 
      id: "try-on", 
      icon: "camera", 
      label: "Virtual Try-On", 
      color: "#E3F0FF" 
    },
    { 
      id: "closet", 
      icon: "add-circle", 
      label: "Add Clothing", 
      color: "#E8F5E9" 
    },
    { 
      id: "weather", 
      icon: "cloud", 
      label: "Weather Look", 
      color: "#F7EDE2" 
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hi, {profile?.personalInfo?.name?.split(" ")[0] || "there"}! 👋
          </Text>
          <Text style={styles.subtitle}>Ready to style today?</Text>
        </View>

        <TouchableOpacity
          style={styles.weatherCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("WeatherLook")}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.weatherLoadingContainer}>
              <ActivityIndicator size="small" color="#C8A2C8" />
              <Text style={styles.weatherLoading}>Loading weather...</Text>
            </View>
          ) : weatherData ? (
            <View style={styles.weatherContent}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherEmoji}>
                  {weatherData.condition === "Clear" || weatherData.condition === "Sunny"
                    ? "☀️"
                    : weatherData.condition === "Clouds" || weatherData.condition === "Cloudy"
                    ? "☁️"
                    : weatherData.condition === "Rain" || weatherData.condition.includes("rain")
                    ? "🌧️"
                    : weatherData.condition === "Snow" || weatherData.condition.includes("snow")
                    ? "❄️"
                    : "🌤️"}
                </Text>
                <Text style={styles.weatherMain}>
                  {weatherData.temperature}°C
                </Text>
                <Text style={styles.weatherCondition}>
                  {weatherData.description || weatherData.condition}
                </Text>
              </View>
              <View style={styles.weatherRight}>
                <TouchableOpacity
                  style={styles.weatherLocationRow}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLocationClick();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location" size={16} color="#8A8A8A" />
                  <Text style={styles.weatherLocationText} numberOfLines={1}>
                    {weatherData.location}, {weatherData.country}
                  </Text>
                </TouchableOpacity>
                {weatherData.feelsLike && (
                  <Text style={styles.weatherDetail}>
                    Feels like {weatherData.feelsLike}°C
                  </Text>
                )}
                {weatherData.recommendation && (
                  <Text style={styles.weatherDetailSmall} numberOfLines={1}>
                    {weatherData.recommendation}
                  </Text>
                )}
                <Text style={styles.weatherDetailSmall}>Tap for full forecast</Text>
              </View>
            </View>
          ) : (
            <View style={styles.weatherContent}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherEmoji}>{staticWeather.emoji}</Text>
                <Text style={styles.weatherMain}>{staticWeather.temp}°C</Text>
                <Text style={styles.weatherCondition}>{staticWeather.condition}</Text>
              </View>
              <View style={styles.weatherRight}>
                <View style={styles.weatherLocationRow}>
                  <Ionicons name="location" size={16} color="#8A8A8A" />
                  <Text style={styles.weatherLocationText}>Default location</Text>
                </View>
                {weatherError ? (
                  <Text style={styles.weatherDetailSmall}>
                    {weatherError}
                  </Text>
                ) : (
                  <Text style={styles.weatherDetailSmall}>Tap to update weather</Text>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: action.color }]}
                activeOpacity={0.8}
                onPress={() => handleQuickAction(action.id)}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon as any} size={24} color="#C8A2C8" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outfit of the Day</Text>
          <View style={styles.outfitCard}>
            <Image
              source={{ uri: currentOutfit.image }}
              style={styles.outfitImage}
              resizeMode="cover"
            />
            <View style={styles.outfitContent}>
              <Text style={styles.outfitName}>{currentOutfit.name}</Text>
              <Text style={styles.outfitDescription}>{currentOutfit.description}</Text>
              <View style={styles.outfitButtons}>
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("TryOnTab")}
                >
                  <Text style={styles.primaryButtonText}>Try On</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  activeOpacity={0.8}
                  onPress={() => Alert.alert("Success", "Outfit saved to your favorites!")}
                >
                  <Text style={styles.secondaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#595959",
  },
  subtitle: {
    fontSize: 16,
  },
  weatherCard: {
    backgroundColor: "#E0F2FF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherContent: {
    flexDirection: "row",
    gap: 24,
  },
  weatherLeft: {
    flex: 1,
    gap: 8,
  },
  weatherRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  weatherEmoji: {
    fontSize: 48,
    lineHeight: 52,
  },
  weatherMain: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 42,
  },
  weatherCondition: {
    fontSize: 16,
    fontWeight: "500",
  },
  weatherLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  weatherLocationText: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: 120,
  },
  weatherDetail: {
    fontSize: 14,
    fontWeight: "500",
  },
  weatherDetailSmall: {
    fontSize: 12,
    marginTop: 4,
  },
  weatherLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  weatherLoading: {
    fontSize: 16,
    color: "#8A8A8A",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    borderRadius: 24,
    padding: 20,
    marginBottom: 0,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.92)",
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outfitImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#F7EDE2",
  },
  outfitContent: {
    padding: 24,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4A4A4A",
  },
  outfitDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: "#8A8A8A",
  },
  outfitButtons: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  secondaryButtonText: {
    color: "#4A4A4A",
    fontSize: 16,
    fontWeight: "600",
  },
});
