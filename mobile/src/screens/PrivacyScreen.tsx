import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../contexts/ProfileContext";

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile, saveProfile } = useProfile();
  const [shareData, setShareData] = useState(profile.privacy.shareData);
  const [publicOutfits, setPublicOutfits] = useState(profile.privacy.publicOutfits);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProfile({
        privacy: {
          shareData: shareData,
          publicOutfits: publicOutfits,
        },
      });
      await saveProfile();
      Alert.alert("Success", "Privacy settings saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#C8A2C8" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Share Data</Text>
              <Text style={styles.settingDescription}>
                Allow anonymized data to be used for improving the service
              </Text>
            </View>
            <Switch
              value={shareData}
              onValueChange={setShareData}
              trackColor={{ false: "#E5E5E5", true: "#C8A2C8" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Public Outfits</Text>
              <Text style={styles.settingDescription}>
                Allow your outfits to be visible to other users
              </Text>
            </View>
            <Switch
              value={publicOutfits}
              onValueChange={setPublicOutfits}
              trackColor={{ false: "#E5E5E5", true: "#C8A2C8" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={24} color="#8A8A8A" />
          <Text style={styles.infoText}>
            Your personal information is always kept private and secure. These settings only control
            what data can be used for service improvement and whether your outfit posts are visible
            to others.
          </Text>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C8A2C8",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#E3F0FF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#4A4A4A",
    lineHeight: 20,
  },
});
