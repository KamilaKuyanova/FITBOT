import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/api";
import { useCloset } from "../contexts/ClosetContext";

export default function OutfitGeneratorScreen() {
  const navigation = useNavigation<any>();
  const { items } = useCloset();
  const [currentOutfit, setCurrentOutfit] = useState<{
    id: number;
    name: string;
    description: string;
    image: string;
  }>({
    id: 1,
    name: "Casual Chic",
    description: "Perfect for brunch or shopping",
    image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateOutfit = async () => {
    console.log("[UI] Regenerate outfit button pressed");
    setIsGenerating(true);

    try {
      // Try to call backend API for outfit generation
      // For now, use mock data since backend endpoint may not exist
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // Mock regeneration
      const outfits = [
        {
          id: 1,
          name: "Casual Chic",
          description: "Perfect for brunch or shopping",
          image: "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: 2,
          name: "Minimal Elegance",
          description: "Sophisticated and timeless",
          image: "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ];
      const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
      setCurrentOutfit(randomOutfit);
      Alert.alert("Success", "New outfit generated!");
    } catch (error) {
      console.error("[UI] Failed to generate outfit:", error);
      Alert.alert(
        "Outfit Error",
        "Could not generate outfit. This feature is coming soon!"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryOn = () => {
    console.log("[UI] Try On button pressed (Outfit Generator)");
    navigation.navigate("TryOnTab");
  };

  const handleSave = () => {
    console.log("[UI] Save outfit button pressed (Outfit Generator)");
    Alert.alert("Success", "Outfit saved to your favorites!");
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
        <Text style={styles.title}>Outfits from My Wardrobe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.outfitCard}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitTitle}>Today's Outfit</Text>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={regenerateOutfit}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#C8A2C8" />
              ) : (
                <Ionicons name="refresh" size={20} color="#C8A2C8" />
              )}
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: currentOutfit.image }}
            style={styles.outfitImage}
            resizeMode="cover"
          />

          <View style={styles.outfitInfo}>
            <Text style={styles.outfitName}>{currentOutfit.name}</Text>
            <Text style={styles.outfitDescription}>{currentOutfit.description}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI Generated</Text>
            </View>

            {isGenerating ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="large" color="#C8A2C8" />
                <Text style={styles.generatingText}>Generating outfit...</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  activeOpacity={0.8}
                  onPress={handleTryOn}
                >
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Try On</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  activeOpacity={0.8}
                  onPress={handleSave}
                >
                  <Ionicons name="heart-outline" size={20} color="#C8A2C8" />
                  <Text style={styles.secondaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="sparkles" size={24} color="#C8A2C8" />
            <Text style={styles.tipText}>
              Try pairing your blue denim jacket with white sneakers
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="cloud-outline" size={24} color="#C8A2C8" />
            <Text style={styles.tipText}>
              Weather's great for your floral dress today
            </Text>
          </View>
        </View>

        {/* Link to Global AI Stylist */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("AIStyleTab")}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>
            No time to add clothes? → Use Global AI Stylist instead
          </Text>
        </TouchableOpacity>
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
    color: "#4A4A4A",
    textAlign: "left",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  regenerateButton: {
    padding: 8,
  },
  outfitImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#F7EDE2",
  },
  outfitInfo: {
    padding: 24,
  },
  outfitName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  outfitDescription: {
    fontSize: 16,
    color: "#8A8A8A",
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200, 162, 200, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C8A2C8",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  secondaryButtonText: {
    color: "#C8A2C8",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: "#4A4A4A",
    lineHeight: 24,
  },
  generatingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  generatingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8A8A8A",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton: {
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#C8A2C8",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
