import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: { id: string; email: string } | null;
  authToken: string | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  isLoadingAuthState: boolean;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, userData: { id: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "user";
const HAS_ONBOARDED_KEY = "hasOnboarded";

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoadingAuthState, setIsLoadingAuthState] = useState(true);

  // Restore auth state from AsyncStorage on mount
  useEffect(() => {
    restoreAuthState();
  }, []);

  const restoreAuthState = async () => {
    try {
      setIsLoadingAuthState(true);
      const [token, userData, onboarded] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(HAS_ONBOARDED_KEY),
      ]);

      if (onboarded === "true") {
        setHasOnboarded(true);
      }

      if (token && userData) {
        setAuthToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
    } finally {
      setIsLoadingAuthState(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setHasOnboarded(true);
      await AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // For now, create a simple auth token
      // In production, this would call your backend auth API
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: `user_${Date.now()}`,
        email: email,
      };

      await loginWithToken(token, userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithToken = async (token: string, userData: { id: string; email: string }) => {
    try {
      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
        AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true"), // Mark onboarding as complete on login
      ]);

      // Update state
      setAuthToken(token);
      setUser(userData);
      setHasOnboarded(true); // Ensure hasOnboarded is set
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear auth-related data from AsyncStorage (but keep hasOnboarded)
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);

      // Clear state
      setAuthToken(null);
      setUser(null);
      // Note: We do NOT clear hasOnboarded, so user won't see onboarding again after logout
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isAuthenticated: !!authToken && !!user,
        hasOnboarded,
        isLoadingAuthState,
        completeOnboarding,
        login,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
