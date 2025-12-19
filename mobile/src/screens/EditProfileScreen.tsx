import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../contexts/ProfileContext";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile, saveProfile } = useProfile();
  const [name, setName] = useState(profile?.personalInfo?.name || "");
  const [bio, setBio] = useState(profile?.personalInfo?.bio || "");
  const [city, setCity] = useState(profile?.location?.city || "");
  const [country, setCountry] = useState(profile?.location?.country || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.personalInfo?.name || "");
      setBio(profile.personalInfo?.bio || "");
      setCity(profile.location?.city || "");
      setCountry(profile.location?.country || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name.");
      return;
    }

    if (!profile) {
      Alert.alert("Error", "Profile not loaded. Please try again.");
      return;
    }

    setIsSaving(true);
    try {
      updateProfile({
        personalInfo: {
          ...profile.personalInfo,
          name: name.trim(),
          bio: bio.trim(),
        },
        location: {
          ...profile.location,
          city: city.trim(),
          country: country.trim(),
        },
      });
      await saveProfile();
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#8A8A8A"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              placeholderTextColor="#8A8A8A"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#8A8A8A"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor="#8A8A8A"
              value={country}
              onChangeText={setCountry}
            />
          </View>
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
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 56,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
});
