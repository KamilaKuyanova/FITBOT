import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PROFILE_API_URL } from "../config/api";
import { useAuth } from "./AuthContext";

const AUTH_TOKEN_KEY = "authToken";

export interface UserProfile {
  personalInfo: {
    name: string;
    bio: string;
    gender: string;
    avatarUrl: string;
  };
  measurements: {
    height: { value: number; unit: "cm" | "in" };
    weight: { value: number; unit: "kg" | "lbs" };
    bodyType: string;
    sizeSystem: string;
    clothingSizes: {
      shirt: string;
      pants: string;
      shoes: string;
      dress: string;
    };
  };
  location: {
    city: string;
    country: string;
    coordinates: { lat: number; lon: number };
    timezone: string;
  };
  weatherPreferences: {
    unit: "celsius" | "fahrenheit";
    enabled: boolean;
    notifications: boolean;
    sensitivity: number; // 1-10
  };
  stylePreferences: {
    tags: string[];
    colorPalette: string[];
    patterns: string[];
    formalityLevel: number; // 1-10
  };
  aiSettings: {
    assistantName: string;
    creativity: number; // 1-10
    verbosity: number; // 1-10
    learningFrequency: string;
  };
  notifications: {
    enabled: boolean;
    emailEnabled: boolean;
    types: string[];
    quietHours: { start: string; end: string };
  };
  privacy: {
    shareData: boolean;
    publicOutfits: boolean;
  };
}

export const defaultProfile: UserProfile = {
  personalInfo: {
    name: "Kamila Martinez",
    bio: "",
    gender: "Prefer not to say",
    avatarUrl: "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  measurements: {
    height: { value: 165, unit: "cm" },
    weight: { value: 60, unit: "kg" },
    bodyType: "Hourglass",
    sizeSystem: "US",
    clothingSizes: {
      shirt: "M",
      pants: "M",
      shoes: "8",
      dress: "M",
    },
  },
  location: {
    city: "New York",
    country: "United States",
    coordinates: { lat: 40.7128, lon: -74.0060 },
    timezone: "America/New_York",
  },
  weatherPreferences: {
    unit: "celsius",
    enabled: true,
    notifications: true,
    sensitivity: 5,
  },
  stylePreferences: {
    tags: ["Casual", "Chic", "Minimalist"],
    colorPalette: ["#F5DCE7", "#E3F0FF", "#E8F5E9", "#C8A2C8"],
    patterns: ["Solids"],
    formalityLevel: 5,
  },
  aiSettings: {
    assistantName: "Style Assistant",
    creativity: 6,
    verbosity: 5,
    learningFrequency: "Daily",
  },
  notifications: {
    enabled: true,
    emailEnabled: true,
    types: ["outfit_suggestions", "weather_alerts"],
    quietHours: { start: "22:00", end: "08:00" },
  },
  privacy: {
    shareData: false,
    publicOutfits: false,
  },
};

interface ProfileContextType {
  profile: UserProfile | null;
  profileError: string | null;
  isProfileLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
  resetProfile: () => void;
  hasUnsavedChanges: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = "userProfile";

export function ProfileProvider({ children }: { children?: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);

  // Check for unsaved changes (only when both profile and initialProfile exist)
  useEffect(() => {
    if (profile && initialProfile) {
      setHasUnsavedChanges(JSON.stringify(profile) !== JSON.stringify(initialProfile));
    } else {
      setHasUnsavedChanges(false);
    }
  }, [profile, initialProfile]);

  const loadProfile = async () => {
    // Prevent multiple parallel requests
    if (isProfileLoading) {
      console.log("[UI] Profile load already in progress, skipping");
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);

    let hasCachedData = false;
    let abortController: AbortController | null = null;

    try {
      // Try to load from AsyncStorage first for instant display
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log("[UI] Profile loaded from AsyncStorage");
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setInitialProfile(parsed);
        hasCachedData = true;
        // Continue to API to refresh if available
      }

      // Get auth token for API request
      const authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Create timeout controller for request timeout (10 seconds)
      abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortController) {
          abortController.abort();
        }
      }, 10000); // 10 second timeout

      // Try to load from API (will overwrite AsyncStorage data if successful)
      const profileUrl = `${PROFILE_API_URL}/api/profile`;
      console.log("[UI] Loading profile from API:", profileUrl);
      console.log("[UI] API Base URL:", PROFILE_API_URL);
      const response = await fetch(profileUrl, {
        method: "GET",
        headers,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      console.log("[UI] Profile API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[UI] Profile data received:", data);
        const loadedProfile = data.userProfile || data;
        setProfile(loadedProfile);
        setInitialProfile(loadedProfile);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedProfile));
        setProfileError(null); // Clear any previous errors
      } else if (response.status === 401 || response.status === 403) {
        // Unauthenticated - use default profile as guest user
        console.warn("[UI] Profile API returned unauthenticated:", response.status);
        if (!hasCachedData) {
          console.log("[UI] Using default profile as fallback (unauthorized - guest mode)");
          setProfile(defaultProfile);
          setInitialProfile(defaultProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
          setProfileError(null); // No error, guest profile is shown
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[UI] Profile API response error:", errorData);
        console.warn("[UI] Profile API status code:", response.status);
        // If API fails (404, 500, etc.) and no cached data, use default profile
        if (!hasCachedData) {
          console.log("[UI] Using default profile as fallback");
          setProfile(defaultProfile);
          setInitialProfile(defaultProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
          setProfileError(null); // No error, we have a fallback profile
        }
      }
    } catch (error: any) {
      // Handle abort/timeout - prevents infinite loading
      if (error?.name === "AbortError" || error?.message?.includes("timeout") || error?.message?.includes("aborted")) {
        console.warn("[UI] Profile request timed out or aborted");
        if (!hasCachedData) {
          console.log("[UI] Using default profile as fallback (timeout)");
          setProfile(defaultProfile);
          setInitialProfile(defaultProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
          setProfileError(null); // No error, we have a fallback profile
        }
      } else if (error?.message?.includes("Network request failed") || error?.message?.includes("fetch") || error?.message?.includes("network")) {
        console.warn("[UI] Profile network error:", error?.message);
        if (!hasCachedData) {
          console.log("[UI] Using default profile as fallback (network error)");
          setProfile(defaultProfile);
          setInitialProfile(defaultProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
          setProfileError(null); // No error, we have a fallback profile
        }
      } else {
        // Always log the error but handle gracefully
        console.warn("[UI] Failed to load profile:", error?.message ?? String(error));
        // If no cached data, use default profile as fallback
        if (!hasCachedData) {
          console.log("[UI] Using default profile as fallback (general error)");
          setProfile(defaultProfile);
          setInitialProfile(defaultProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
          setProfileError(null); // No error, we have a fallback profile
        }
      }
      // DO NOT rethrow - error is handled, loading state will be cleared in finally
    } finally {
      // Always clear loading state, even on error - CRITICAL: prevents infinite loading spinner
      setIsProfileLoading(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      ...updates,
      personalInfo: { ...profile.personalInfo, ...(updates.personalInfo || {}) },
      measurements: { ...profile.measurements, ...(updates.measurements || {}) },
      location: { ...profile.location, ...(updates.location || {}) },
      weatherPreferences: {
        ...profile.weatherPreferences,
        ...(updates.weatherPreferences || {}),
      },
      stylePreferences: {
        ...profile.stylePreferences,
        ...(updates.stylePreferences || {}),
      },
      aiSettings: { ...profile.aiSettings, ...(updates.aiSettings || {}) },
      notifications: { ...profile.notifications, ...(updates.notifications || {}) },
      privacy: { ...profile.privacy, ...(updates.privacy || {}) },
    });
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    console.log("[UI] Save profile button pressed");
    try {
      // Clear any previous errors
      setProfileError(null);
      
      // Save to AsyncStorage immediately
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      console.log("[UI] Profile saved to AsyncStorage");

      // Try to save to API
      console.log("[UI] Saving profile to API:", `${PROFILE_API_URL}/api/profile/update`);
      const response = await fetch(`${PROFILE_API_URL}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile }),
      });

      console.log("[UI] Profile save API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[UI] Profile save API response error:", errorData);
        setProfileError("Failed to save profile to server. Profile saved locally only.");
        // Still update initial profile even if API fails (AsyncStorage saved)
        setInitialProfile(profile);
        setHasUnsavedChanges(false);
        return;
      }

      const data = await response.json();
      console.log("[UI] Profile saved successfully:", data);
      setInitialProfile(profile);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.warn("[UI] Failed to save profile:", error?.message ?? String(error));
      setProfileError("Failed to save profile to server. Profile saved locally only.");
      // Still update initial profile even if API fails (AsyncStorage saved)
      setInitialProfile(profile);
      setHasUnsavedChanges(false);
    }
  };

  const resetProfile = () => {
    if (initialProfile) {
      setProfile(initialProfile);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileError,
        isProfileLoading,
        updateProfile,
        saveProfile,
        loadProfile,
        resetProfile,
        hasUnsavedChanges,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
