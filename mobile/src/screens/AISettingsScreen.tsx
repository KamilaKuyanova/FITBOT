import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../contexts/ProfileContext";

export default function AISettingsScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile, saveProfile } = useProfile();
  const [assistantName, setAssistantName] = useState(profile.aiSettings.assistantName);
  const [creativity, setCreativity] = useState(profile.aiSettings.creativity);
  const [verbosity, setVerbosity] = useState(profile.aiSettings.verbosity);
  const [learningFrequency, setLearningFrequency] = useState(profile.aiSettings.learningFrequency);
  const [isSaving, setIsSaving] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(assistantName);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProfile({
        aiSettings: {
          assistantName,
          creativity,
          verbosity,
          learningFrequency,
        },
      });
      await saveProfile();
      Alert.alert("Success", "AI settings saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      Alert.alert("Error", "Failed to save AI settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const frequencies = ["Daily", "Weekly", "Monthly", "Never"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Settings</Text>
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
          <Text style={styles.sectionTitle}>Assistant Name</Text>
          <Text style={styles.sectionDescription}>
            Customize the name of your AI style assistant
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputValue}>{assistantName}</Text>
            <TouchableOpacity
              onPress={() => {
                setTempName(assistantName);
                setShowNameModal(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#C8A2C8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creativity Level: {creativity}/10</Text>
          <Text style={styles.sectionDescription}>
            How creative should the AI be with outfit suggestions?
          </Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.sliderDot,
                  creativity >= value && styles.sliderDotActive,
                ]}
                onPress={() => setCreativity(value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verbosity Level: {verbosity}/10</Text>
          <Text style={styles.sectionDescription}>
            How detailed should the AI explanations be?
          </Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.sliderDot,
                  verbosity >= value && styles.sliderDotActive,
                ]}
                onPress={() => setVerbosity(value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Frequency</Text>
          <Text style={styles.sectionDescription}>
            How often should the AI learn from your preferences?
          </Text>
          <View style={styles.chipContainer}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.chip,
                  learningFrequency === freq && styles.chipActive,
                ]}
                onPress={() => setLearningFrequency(freq)}
              >
                <Text
                  style={[
                    styles.chipText,
                    learningFrequency === freq && styles.chipTextActive,
                  ]}
                >
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assistant Name</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter assistant name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  if (tempName.trim()) {
                    setAssistantName(tempName.trim());
                  }
                  setShowNameModal(false);
                }}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputValue: {
    fontSize: 16,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  sliderDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5E5",
  },
  sliderDotActive: {
    backgroundColor: "#C8A2C8",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  chipActive: {
    backgroundColor: "#C8A2C8",
    borderColor: "#C8A2C8",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F9F9F9",
  },
  modalButtonSave: {
    backgroundColor: "#C8A2C8",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
