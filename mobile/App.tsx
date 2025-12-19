import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setNavigationRef } from "./src/utils/logout";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ClosetProvider } from "./src/contexts/ClosetContext";
import { ProfileProvider } from "./src/contexts/ProfileContext";
import { AIChatProvider } from "./src/contexts/AIChatContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { LightTheme } from "./src/contexts/ThemeContext";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MyClosetScreen from "./src/screens/MyClosetScreen";
import OutfitGeneratorScreen from "./src/screens/OutfitGeneratorScreen";
import VirtualTryOnScreen from "./src/screens/VirtualTryOnScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AddClothingScreen from "./src/screens/AddClothingScreen";
import ClothingDetailScreen from "./src/screens/ClothingDetailScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import GlobalStylistScreen from "./src/screens/GlobalStylistScreen";
import AIStyleScreen from "./src/screens/AIStyleScreen";
import AISettingsScreen from "./src/screens/AISettingsScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import HelpSupportScreen from "./src/screens/HelpSupportScreen";
import WeatherLookScreen from "./src/screens/WeatherLookScreen";

export type MainTabParamList = {
  HomeTab: undefined;
  ClosetTab: undefined;
  AIStyleTab: undefined;
  TryOnTab: undefined;
  ProfileTab: undefined;
  ClosetStylist: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AddClothing: undefined;
  ClothingDetail: { itemId: string };
  EditProfile: undefined;
  AISettings: undefined;
  Notifications: undefined;
  Privacy: undefined;
  HelpSupport: undefined;
  WeatherLook: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const OnboardingStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#C8A2C8",
        tabBarInactiveTintColor: "#8A8A8A",
        tabBarStyle: {
          position: "absolute",
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          shadowColor: "transparent",
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        tabBarHideOnKeyboard: true,
      }}
      backBehavior="history"
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ClosetTab" 
        component={MyClosetScreen}
        options={{
          tabBarLabel: "Closet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AIStyleTab" 
        component={AIStyleScreen}
        options={{
          tabBarLabel: "AI Style",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="TryOnTab" 
        component={VirtualTryOnScreen}
        options={{
          tabBarLabel: "Try-On",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple splash screen while loading auth state
function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9F9" }}>
      <Text style={{ fontSize: 18, color: "#8A8A8A" }}>Loading...</Text>
    </View>
  );
}

// Root Navigator - decides which screen to show based on auth state
function RootNavigator() {
  const { isAuthenticated, hasOnboarded, isLoadingAuthState } = useAuth();
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  React.useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log("[Navigation] Auth state:", { isAuthenticated, hasOnboarded, isLoadingAuthState });
  }, [isAuthenticated, hasOnboarded, isLoadingAuthState]);

  // Show splash while loading auth state
  if (isLoadingAuthState) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  // Show onboarding if not onboarded
  if (!hasOnboarded) {
    console.log("[Navigation] Showing Onboarding screen");
    return (
      <NavigationContainer ref={navigationRef} theme={LightTheme}>
        <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
          <OnboardingStack.Screen name="Onboarding">
            {() => {
              const { completeOnboarding } = useAuth();
              return (
                <OnboardingScreen
                  onComplete={async () => {
                    console.log("[Navigation] Onboarding completed, transitioning to Auth");
                    await completeOnboarding();
                  }}
                />
              );
            }}
          </OnboardingStack.Screen>
        </OnboardingStack.Navigator>
      </NavigationContainer>
    );
  }

  // Show auth if not authenticated
  if (!isAuthenticated) {
    console.log("[Navigation] Showing Auth screen");
    return (
      <NavigationContainer ref={navigationRef} theme={LightTheme}>
        <AuthStack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <AuthStack.Screen 
            name="Login" 
            component={AuthScreen}
            options={{ title: "Sign In" }}
          />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  // Show main app if authenticated
  console.log("[Navigation] Showing Main app");
  return (
    <NavigationContainer ref={navigationRef} theme={LightTheme}>
      <ClosetProvider>
        <ProfileProvider>
          <AIChatProvider>
            <MainStack.Navigator screenOptions={{ headerShown: false }}>
              <MainStack.Screen name="MainTabs" component={MainTabs} />
              <MainStack.Screen name="AddClothing" component={AddClothingScreen} />
              <MainStack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
              <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
              <MainStack.Screen name="AISettings" component={AISettingsScreen} />
              <MainStack.Screen name="Notifications" component={NotificationsScreen} />
              <MainStack.Screen name="Privacy" component={PrivacyScreen} />
              <MainStack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <MainStack.Screen name="WeatherLook" component={WeatherLookScreen} />
              <MainStack.Screen name="ClosetStylist" component={OutfitGeneratorScreen} />
            </MainStack.Navigator>
          </AIChatProvider>
        </ProfileProvider>
      </ClosetProvider>
    </NavigationContainer>
  );
}

// Main app navigator that decides which stack to show
function AppNavigator() {
  return <RootNavigator />;
}

// Inner app component that uses auth state
function AppContent() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

// Main App component wrapped with providers
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
