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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useImagePicker } from "../hooks/useImagePicker";
import { API_BASE_URL } from "../config/api";
import { useProfile } from "../contexts/ProfileContext";
import BodyParamsModal from "../components/BodyParamsModal";

interface OutfitItem {
  category: string;
  type: string;
  color: string;
  details?: string;
}

interface Outfit {
  name: string;
  description: string;
  items: OutfitItem[];
}

interface PhotoOutfitResponse {
  analysis: string;
  outfits: Outfit[];
}

// Recent outfits with full data structure
interface RecentOutfit {
  id: string;
  imageUri: string;
  name?: string;
  description?: string;
  items?: OutfitItem[];
  generatedAt?: string;
}

const recentOutfitsData: RecentOutfit[] = [
  {
    id: "1",
    imageUri:
      "https://images.unsplash.com/photo-1692651763085-e72e2bd7ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=400",
    name: "Casual Chic Look",
    description: "Perfect for brunch or shopping",
  },
  {
    id: "2",
    imageUri:
      "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=400",
    name: "Pastel Streetwear",
    description: "Relaxed and comfortable",
  },
  {
    id: "3",
    imageUri:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=400",
    name: "Minimalist Elegance",
    description: "Sophisticated and timeless",
  },
  {
    id: "4",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0JTIwc3R5bGVkfGVufDF8fHx8MTc2NDg1NjEwOHww&ixlib=rb-4.1.0&q=80&w=400",
    name: "Boho Summer",
    description: "Light and breezy for warm days",
  },
];

export default function VirtualTryOnScreen() {
  const navigation = useNavigation<any>();
  const { showImagePickerOptions, pickImageFromLibrary, takePhotoWithCamera, convertImageToBase64, isLoading: imageLoading } = useImagePicker();
  const { profile } = useProfile();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [outfitData, setOutfitData] = useState<PhotoOutfitResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecentOutfit, setSelectedRecentOutfit] = useState<RecentOutfit | null>(null);
  const [showBodyParamsModal, setShowBodyParamsModal] = useState(false);
  const [bodyParams, setBodyParams] = useState<{
    heightCm: number | null;
    weightKg: number | null;
    bodyType: string | null;
  } | null>(null);

  const handleImageSelected = async (uri: string) => {
    setSelectedImage(uri);
    setOutfitData(null); // Clear previous outfit data
    // Convert to base64 for API
    const base64 = await convertImageToBase64(uri);
    if (base64) {
      setImageBase64(base64);
      // Show body parameters modal after image is selected
      setShowBodyParamsModal(true);
    }
  };

  const handleUploadPhoto = async () => {
    const result = await pickImageFromLibrary();
    if (result && !result.cancelled) {
      await handleImageSelected(result.uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhotoWithCamera();
    if (result && !result.cancelled) {
      await handleImageSelected(result.uri);
    }
  };

  const handleImagePicker = async () => {
    const result = await showImagePickerOptions();
    if (result && !result.cancelled) {
      await handleImageSelected(result.uri);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!imageBase64 || !selectedImage) {
      Alert.alert("No Photo", "Please select or take a photo first.");
      return;
    }

    if (!profile) {
      Alert.alert("Error", "Profile not loaded. Please try again.");
      return;
    }

    setIsGenerating(true);
    try {
      const requestBody: any = {
        imageBase64,
        gender: profile.personalInfo.gender || "female",
        style: profile.stylePreferences.tags[0]?.toLowerCase() || "casual",
        occasion: "daily",
      };

      // Add body parameters if available
      if (bodyParams) {
        requestBody.bodyProfile = {
          heightCm: bodyParams.heightCm,
          weightKg: bodyParams.weightKg,
          bodyType: bodyParams.bodyType,
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/outfit-from-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate outfit");
      }

      const data: PhotoOutfitResponse = await response.json();
      setOutfitData(data);
    } catch (error: any) {
      console.error("Failed to generate outfit from photo:", error);
      Alert.alert("Error", error.message || "Could not generate outfit from your photo. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Try-On</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                  disabled={isGenerating}
                >
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateOutfit}
                  activeOpacity={0.8}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>Generate Outfit</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera" size={64} color="#E5E5E5" />
              <Text style={styles.placeholderText}>Upload or Take Photo</Text>
              <Text style={styles.placeholderSubtext}>
                Upload a photo or take one with your camera to try on outfits virtually
              </Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonLabel}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleUploadPhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="image-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonLabel}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Outfit Results */}
          {outfitData && (
            <View style={styles.outfitResults}>
              <Text style={styles.analysisTitle}>Photo Analysis</Text>
              <Text style={styles.analysisText}>{outfitData.analysis}</Text>

              <Text style={styles.outfitsTitle}>Suggested Outfits</Text>
              {outfitData.outfits.map((outfit, index) => (
                <View key={index} style={styles.outfitCard}>
                  <Text style={styles.outfitName}>{outfit.name}</Text>
                  <Text style={styles.outfitDescription}>{outfit.description}</Text>
                  <View style={styles.itemsList}>
                    {outfit.items.map((item, itemIndex) => (
                      <Text key={itemIndex} style={styles.outfitItem}>
                        • {item.category} – {item.type} – {item.color}
                        {item.details && ` (${item.details})`}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C8A2C8" />
              <Text style={styles.loadingText}>Analyzing your photo and generating outfits…</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Outfits</Text>
          <View style={styles.outfitGrid}>
            {recentOutfitsData.length > 0 ? (
              recentOutfitsData.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.outfitThumbnail}
                  activeOpacity={0.8}
                  onPress={() => setSelectedRecentOutfit(outfit)}
                >
                  <Image
                    source={{ uri: outfit.imageUri }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyRecentOutfits}>
                <Ionicons name="images-outline" size={48} color="#E5E5E5" />
                <Text style={styles.emptyRecentOutfitsText}>
                  No recent outfits yet
                </Text>
                <Text style={styles.emptyRecentOutfitsSubtext}>
                  Try generating an outfit from your photo!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Outfit Detail Modal */}
        <Modal
          visible={selectedRecentOutfit !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRecentOutfit(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedRecentOutfit && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedRecentOutfit.name || "Recent Outfit"}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedRecentOutfit(null)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close" size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    <Image
                      source={{ uri: selectedRecentOutfit.imageUri }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    {selectedRecentOutfit.description && (
                      <Text style={styles.modalDescription}>{selectedRecentOutfit.description}</Text>
                    )}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.wearAgainButton}
                      onPress={() => {
                        // Apply the outfit - reuse the outfit data
                        if (selectedRecentOutfit.items) {
                          // If we have items, create a mock outfit response
                          const mockOutfitData: PhotoOutfitResponse = {
                            analysis: "Applying your saved outfit",
                            outfits: [
                              {
                                name: selectedRecentOutfit.name || "Recent Outfit",
                                description: selectedRecentOutfit.description || "",
                                items: selectedRecentOutfit.items,
                              },
                            ],
                          };
                          setOutfitData(mockOutfitData);
                        }
                        setSelectedRecentOutfit(null);
                        // Scroll to outfit results if available
                        Alert.alert("Outfit Applied", "The outfit has been applied! Check the results above.");
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="shirt-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.wearAgainButtonText}>Wear this outfit again</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Body Parameters Modal */}
        <BodyParamsModal
          visible={showBodyParamsModal}
          onSave={(params) => {
            setBodyParams(params);
            setShowBodyParamsModal(false);
          }}
          onSkip={() => {
            setShowBodyParamsModal(false);
          }}
          initialParams={bodyParams || undefined}
        />
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
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#595959",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  photoSection: {
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 64,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    marginBottom: 24,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 0.75,
  },
  imageActions: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    gap: 12,
  },
  changePhotoButton: {
    backgroundColor: "rgba(200, 162, 200, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  generateButton: {
    backgroundColor: "rgba(74, 74, 74, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#8A8A8A",
  },
  outfitResults: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    color: "#4A4A4A",
    marginBottom: 24,
    lineHeight: 24,
  },
  outfitsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#4A4A4A",
  },
  outfitCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4A4A4A",
  },
  outfitDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    color: "#8A8A8A",
  },
  itemsList: {
    gap: 8,
  },
  outfitItem: {
    fontSize: 14,
    lineHeight: 20,
    color: "#8A8A8A",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8A2C8",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A4A4A",
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#4A4A4A",
  },
  placeholderSubtext: {
    fontSize: 16,
    textAlign: "center",
    color: "#8A8A8A",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#4A4A4A",
  },
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  outfitThumbnail: {
    width: "47%",
    aspectRatio: 0.75,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F7EDE2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  emptyRecentOutfits: {
    width: "100%",
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRecentOutfitsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecentOutfitsSubtext: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#F7EDE2",
  },
  modalDescription: {
    fontSize: 16,
    color: "#8A8A8A",
    padding: 24,
    lineHeight: 24,
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  wearAgainButton: {
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  wearAgainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
