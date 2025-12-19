import React, { createContext, useContext, type ReactNode } from "react";
import {
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

// Simple light theme colors only
export const lightColors = {
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#4A4A4A",
  textSecondary: "#8A8A8A",
  border: "#E5E5E5",
  primary: "#C8A2C8",
  primaryText: "#FFFFFF",
  chipBackground: "#FFFFFF",
  chipText: "#4A4A4A",
  chipSelectedBackground: "#C8A2C8",
  chipSelectedText: "#FFFFFF",
  inputBackground: "#FFFFFF",
  inputText: "#4A4A4A",
  inputBorder: "#E5E5E5",
  shadowColor: "#000000",
};

// Navigation theme (light only)
export const LightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.primary,
  },
};

interface ThemeContextType {
  colors: typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children?: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
