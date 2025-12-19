/**
 * API Configuration
 * 
 * Base URL for all API endpoints
 * Must be set via EXPO_PUBLIC_API_URL environment variable in .env file
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Log API base URL in development (only once on import)
if (__DEV__) {
  console.log("[UI] API Base URL:", API_BASE_URL);
}

// Weather API endpoint (uses same base URL)
export const WEATHER_API_URL = API_BASE_URL;

// Profile API endpoint
export const PROFILE_API_URL = API_BASE_URL;

// AI Chat API endpoint
export const AI_CHAT_API_URL = API_BASE_URL;
