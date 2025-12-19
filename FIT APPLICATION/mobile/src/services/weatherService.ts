import AsyncStorage from "@react-native-async-storage/async-storage";

const WEATHER_CACHE_KEY = "weather_cache";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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
}

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  lat: number;
  lon: number;
}

// Transform OpenWeatherMap API response to app format
function transformWeatherData(data: any): WeatherData {
  return {
    location: data.name || "Unknown",
    country: data.sys?.country || "",
    temperature: Math.round(data.main?.temp || 0),
    condition: data.weather?.[0]?.main || "Unknown",
    description: data.weather?.[0]?.description || "",
    icon: data.weather?.[0]?.icon || "01d",
    feelsLike: Math.round(data.main?.feels_like || 0),
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
  };
}

// Get cached weather if available and fresh
async function getCachedWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const cachedData: CachedWeatherData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is for same location and still valid
    if (
      Math.abs(cachedData.lat - lat) < 0.01 &&
      Math.abs(cachedData.lon - lon) < 0.01 &&
      now - cachedData.timestamp < CACHE_DURATION
    ) {
      console.log("[Weather] Using cached weather data");
      return cachedData.data;
    }
  } catch (error) {
    console.warn("[Weather] Failed to read cache:", error);
  }
  return null;
}

// Save weather to cache
async function cacheWeather(data: WeatherData, lat: number, lon: number): Promise<void> {
  try {
    const cacheData: CachedWeatherData = {
      data,
      timestamp: Date.now(),
      lat,
      lon,
    };
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("[Weather] Failed to cache weather:", error);
  }
}

// Get current weather from OpenWeatherMap API
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  // Check cache first
  const cached = await getCachedWeather(lat, lon);
  if (cached) {
    return cached;
  }

  // Get API key from environment
  const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

  if (!API_KEY) {
    console.error("[Weather] EXPO_PUBLIC_OPENWEATHER_API_KEY not set");
    throw new Error("Weather API key not configured. Please set EXPO_PUBLIC_OPENWEATHER_API_KEY in .env");
  }

  // Build API URL
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`;

  console.log("[Weather] Fetching weather from OpenWeatherMap API");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(API_URL, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid OpenWeatherMap API key");
      }
      if (response.status === 404) {
        throw new Error("Location not found");
      }
      const errorText = await response.text();
      throw new Error(`Weather API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const weatherData = transformWeatherData(data);

    // Cache the result
    await cacheWeather(weatherData, lat, lon);

    console.log("[Weather] Weather data received:", weatherData);
    return weatherData;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Weather request timed out");
    }
    console.error("[Weather] Fetch error:", error);
    throw error;
  }
}

