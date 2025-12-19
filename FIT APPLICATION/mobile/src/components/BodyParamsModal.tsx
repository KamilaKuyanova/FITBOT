import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface BodyParams {
  heightCm: number | null;
  weightKg: number | null;
  bodyType: string | null;
}

interface BodyParamsModalProps {
  visible: boolean;
  onSave: (params: BodyParams) => void;
  onSkip: () => void;
  initialParams?: BodyParams;
}

const BODY_TYPES = [
  "Petite",
  "Average",
  "Tall",
  "Curvy",
  "Athletic",
  "Plus-size",
] as const;

export default function BodyParamsModal({
  visible,
  onSave,
  onSkip,
  initialParams,
}: BodyParamsModalProps) {
  const [heightCm, setHeightCm] = useState<string>(
    initialParams?.heightCm?.toString() || ""
  );
  const [weightKg, setWeightKg] = useState<string>(
    initialParams?.weightKg?.toString() || ""
  );
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(
    initialParams?.bodyType || null
  );

  const handleSave = () => {
    const params: BodyParams = {
      heightCm: heightCm ? parseFloat(heightCm) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      bodyType: selectedBodyType,
    };

    // Allow saving even if empty (user can skip later)
    onSave(params);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Body Parameters</Text>
              <Text style={styles.subtitle}>
                Help AI generate better outfit recommendations
              </Text>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Height Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 170"
                  placeholderTextColor="#8A8A8A"
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                />
              </View>

              {/* Weight Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 65"
                  placeholderTextColor="#8A8A8A"
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                />
              </View>

              {/* Body Type Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Body Type</Text>
                <View style={styles.chipContainer}>
                  {BODY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        selectedBodyType === type && styles.chipSelected,
                      ]}
                      onPress={() =>
                        setSelectedBodyType(
                          selectedBodyType === type ? null : type
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedBodyType === type && styles.chipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save & Continue</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 56,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  chipSelected: {
    backgroundColor: "#C8A2C8",
    borderColor: "#C8A2C8",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8A8A8A",
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8A2C8",
    shadowColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

