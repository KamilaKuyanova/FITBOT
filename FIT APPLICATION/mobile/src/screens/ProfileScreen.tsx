import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../contexts/ProfileContext";
import { useCloset } from "../contexts/ClosetContext";
import { useAuth } from "../contexts/AuthContext";
import { useImagePicker } from "../hooks/useImagePicker";
import * as FileSystem from "expo-file-system";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, profileError, isProfileLoading, loadProfile, updateProfile, saveProfile } = useProfile();
  const { items } = useCloset();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { pickImageFromLibrary, takePhotoWithCamera, showImagePickerOptions } = useImagePicker();

  // Load profile only when screen is focused (lazy loading)
  useFocusEffect(
    useCallback(() => {
      // Only load if profile is null (first time) - don't reload on every focus if we already have data
      if (!profile && !isProfileLoading) {
        loadProfile();
      }
    }, [profile, isProfileLoading, loadProfile])
  );

  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear auth state (but keep profile/closet data)
            await logout();
            // Navigation will be handled automatically by RootNavigator based on auth state change
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "sparkles-outline",
      label: "AI Settings",
      onPress: () => navigation.navigate("AISettings"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: "lock-closed-outline",
      label: "Privacy",
      onPress: () => navigation.navigate("Privacy"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: "log-out-outline",
      label: "Sign Out",
      danger: true,
      onPress: handleLogout,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChangeAvatar = async () => {
    try {
      const result = await showImagePickerOptions();
      if (!result || result.cancelled) {
        return;
      }

      setIsUploadingAvatar(true);

      // Convert image to base64 for upload
      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // For now, we'll use data URI. In production, you'd upload to a cloud storage service
      // and get back a URL. For simplicity, we'll use the data URI directly.
      const avatarUrl = `data:image/jpeg;base64,${base64}`;

      // Update profile with new avatar URL
      if (profile) {
        updateProfile({
          personalInfo: {
            ...profile.personalInfo,
            avatarUrl: avatarUrl,
          },
        });
      }

      // Save to backend
      await saveProfile();
      
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      Alert.alert("Error", "Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state - only show if loading and no profile exists */}
        {isProfileLoading && !profile && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C8A2C8" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        )}

        {/* Error state - only show if not loading, error exists, and no profile */}
        {!isProfileLoading && profileError && !profile && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#8A8A8A" />
            <Text style={styles.errorText}>{profileError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadProfile}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main profile content - show if profile exists */}
        {profile && (
          <>
            <View style={styles.profileSection}>
              <TouchableOpacity
                onPress={handleChangeAvatar}
                disabled={isUploadingAvatar}
                activeOpacity={0.8}
                style={styles.avatarContainer}
              >
                {isUploadingAvatar ? (
                  <View style={styles.avatarPlaceholder}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                ) : profile?.personalInfo?.avatarUrl ? (
                  <Image
                    source={{ uri: profile.personalInfo.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {getInitials(profile?.personalInfo?.name || "U")}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarEditIcon}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.name}>{profile?.personalInfo?.name || "User"}</Text>
              <Text style={styles.location}>
                {profile?.location?.city || ""}, {profile?.location?.country || ""}
              </Text>
              {profile?.personalInfo?.bio && (
                <Text style={styles.bio}>{profile.personalInfo.bio}</Text>
              )}

              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>42</Text>
                  <Text style={styles.statLabel}>Outfits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{items.length}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
              </View>
            </View>

            {/* Style Preferences Section */}
            <View style={styles.stylePreferencesSection}>
              <Text style={styles.stylePreferencesTitle}>Preferred Style Tags</Text>
              <View style={styles.tagsContainer}>
                {profile?.stylePreferences?.tags?.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                )) || []}
              </View>
            </View>

            <View style={styles.menuSection}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.danger ? "#FF3B30" : "#4A4A4A"}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        item.danger && styles.menuItemTextDanger,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#DAD7CD"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Placeholder state - show if not loading, no error, no profile */}
        {!isProfileLoading && !profileError && !profile && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="person-outline" size={64} color="#DAD7CD" />
            <Text style={styles.placeholderText}>No profile data yet.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadProfile}
            >
              <Text style={styles.retryButtonText}>Load Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#595959",
    textAlign: "left",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F7EDE2",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8A2C8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C8A2C8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#C8A2C8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  location: {
    fontSize: 16,
    color: "#8A8A8A",
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8A8A8A",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
    marginBottom: 24,
  },
  stats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C8A2C8",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  menuItemTextDanger: {
    color: "#FF3B30",
  },
  stylePreferencesSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stylePreferencesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F5DCE7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  placeholderText: {
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
});
