/**
 * Development Helper: Reset Onboarding Flag
 * 
 * Use this function to reset the onboarding completion flag for testing.
 * This allows you to see the onboarding screen again without clearing all app data.
 * 
 * Usage in dev console:
 * import { resetOnboardingFlag } from './src/utils/resetOnboarding';
 * resetOnboardingFlag();
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_ONBOARDED_KEY = "hasOnboarded";

export async function resetOnboardingFlag() {
  try {
    await AsyncStorage.removeItem(HAS_ONBOARDED_KEY);
    console.log("✅ Onboarding flag reset. Restart the app to see onboarding again.");
    return true;
  } catch (error) {
    console.error("Failed to reset onboarding flag:", error);
    return false;
  }
}

/**
 * Reset all app state (onboarding + auth) for complete fresh start
 */
export async function resetAllAppState() {
  try {
    await AsyncStorage.clear();
    console.log("✅ All app state cleared. Restart the app for a fresh start.");
    return true;
  } catch (error) {
    console.error("Failed to reset app state:", error);
    return false;
  }
}

