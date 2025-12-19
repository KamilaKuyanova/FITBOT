/// <reference types="../vite-env" />
import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";

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

const defaultProfile: UserProfile = {
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
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
  resetProfile: () => void;
  hasUnsavedChanges: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children?: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProfile, setInitialProfile] = useState<UserProfile>(defaultProfile);

  // Load profile from localStorage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(profile) !== JSON.stringify(initialProfile));
  }, [profile, initialProfile]);

  const loadProfile = async () => {
    try {
      // Try to load from localStorage first
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setInitialProfile(parsed);
      } else {
        // Try to load from API
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const response = await fetch(`${API_BASE_URL}/api/profile`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.userProfile);
          setInitialProfile(data.userProfile);
          localStorage.setItem("userProfile", JSON.stringify(data.userProfile));
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Use default profile
      setProfile(defaultProfile);
      setInitialProfile(defaultProfile);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      personalInfo: { ...prev.personalInfo, ...(updates.personalInfo || {}) },
      measurements: { ...prev.measurements, ...(updates.measurements || {}) },
      location: { ...prev.location, ...(updates.location || {}) },
      weatherPreferences: {
        ...prev.weatherPreferences,
        ...(updates.weatherPreferences || {}),
      },
      stylePreferences: {
        ...prev.stylePreferences,
        ...(updates.stylePreferences || {}),
      },
      aiSettings: { ...prev.aiSettings, ...(updates.aiSettings || {}) },
      notifications: { ...prev.notifications, ...(updates.notifications || {}) },
      privacy: { ...prev.privacy, ...(updates.privacy || {}) },
    }));
  };

  const saveProfile = async () => {
    try {
      // Save to localStorage immediately
      localStorage.setItem("userProfile", JSON.stringify(profile));

      // Try to save to API
      const API_BASE_URL = (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setInitialProfile(profile);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      // Still update initial profile even if API fails (localStorage saved)
      setInitialProfile(profile);
      setHasUnsavedChanges(false);
      throw error;
    }
  };

  const resetProfile = () => {
    setProfile(initialProfile);
    setHasUnsavedChanges(false);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
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

