import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "../contexts/AuthContext";

export default function AuthScreen() {
  const { login, loginWithToken, isLoadingAuthState } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter your password.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // Navigation will be handled automatically by RootNavigator based on auth state
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Error", "Failed to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Not Available", "Apple Sign In is only available on iOS.");
      return;
    }

    try {
      setIsSubmitting(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create user info from Apple credential
      const userEmail = credential.email || `apple_${credential.user}@privaterelay.appleid.com`;
      const userName = credential.fullName
        ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
        : "Apple User";

      // Use the auth context loginWithToken function with Apple credentials
      // In a real app, you'd send the credential to your backend for verification
      const token = credential.identityToken || `apple_token_${credential.user}`;
      const userData = {
        id: credential.user,
        email: userEmail,
      };
      await loginWithToken(token, userData);
      // Navigation will be handled automatically by AppNavigator based on auth state
    } catch (error: any) {
      if (error.code === "ERR_CANCELED") {
        // User canceled, don't show error
        return;
      }
      console.error("Apple sign-in error:", error);
      Alert.alert("Apple Sign In Error", "Failed to sign in with Apple. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);

      // Configure Google OAuth
      // Note: In production, you need to configure your Google OAuth credentials
      // For Expo, you can use AuthSession with discovery document
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      
      // This is a simplified version. In production, configure your Google OAuth client IDs
      // via app.json or environment variables
      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        revocationEndpoint: "https://oauth2.googleapis.com/revoke",
      };

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === "success") {
        // Exchange token for user info
        // In a real app, you'd verify the token with your backend
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${result.params.access_token}`
        );
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          const token = result.params.access_token;
          const userData = {
            id: userInfo.id,
            email: userInfo.email,
          };
          await loginWithToken(token, userData);
          // Navigation will be handled automatically by AppNavigator based on auth state
        } else {
          throw new Error("Failed to fetch user info");
        }
      } else if (result.type === "error") {
        throw new Error(result.error?.message || "Google sign-in failed");
      }
      // User canceled - no error needed
    } catch (error: any) {
      if (error.message?.includes("canceled") || error.message?.includes("dismiss")) {
        return; // User canceled
      }
      console.error("Google sign-in error:", error);
      Alert.alert(
        "Google Sign In Error",
        error.message || "Failed to sign in with Google. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <LinearGradient
              colors={["#F5DCE7", "#E3F0FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoContainer}
            >
              <Ionicons name="sparkles" size={40} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.title}>AI Wardrobe</Text>
            <Text style={styles.subtitle}>Your personal AI stylist</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#8A8A8A"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#8A8A8A"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#8A8A8A"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#8A8A8A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#8A8A8A"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#8A8A8A"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, (isSubmitting || isLoadingAuthState) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting || isLoadingAuthState}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    activeOpacity={0.8}
                    onPress={handleAppleSignIn}
                    disabled={isSubmitting || isLoadingAuthState}
                  >
                    <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={handleGoogleSignIn}
                  disabled={isSubmitting || isLoadingAuthState}
                >
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                style={styles.switchButton}
              >
                <Text style={styles.switchButtonText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.switchButtonLink}>
                    {isLogin ? "Sign up" : "Sign in"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A8A8A",
    marginBottom: 48,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#4A4A4A",
  },
  submitButton: {
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DAD7CD",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#8A8A8A",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 48,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  switchButton: {
    alignItems: "center",
  },
  switchButtonText: {
    color: "#8A8A8A",
    fontSize: 14,
    textAlign: "center",
  },
  switchButtonLink: {
    color: "#C8A2C8",
    fontWeight: "600",
  },
});
