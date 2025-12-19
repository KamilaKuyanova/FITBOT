import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/api";
import { useCloset, ClothingItem } from "../contexts/ClosetContext";
import { useProfile } from "../contexts/ProfileContext";

const STYLES = ['casual', 'streetwear', 'classic', 'sporty', 'romantic', 'business'] as const;
const OCCASIONS = ['school', 'university', 'office', 'date', 'party', 'travel', 'home', 'general'] as const;
const PALETTES = ['pastel', 'neutral', 'bright', 'monochrome', 'dark'] as const;

interface ClosetOutfitItem {
  source: 'closet';
  itemId: string;
}

interface ClosetOutfit {
  id: string;
  name: string;
  description: string;
  items: ClosetOutfitItem[];
}

interface ClosetOutfitResponse {
  outfits: ClosetOutfit[];
}

export default function ClosetStylistScreen() {
  const navigation = useNavigation<any>();
  const { items } = useCloset();
  const { profile } = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfits, setOutfits] = useState<ClosetOutfit[]>([]);
  const [closetItemsMap, setClosetItemsMap] = useState<Map<string, ClothingItem>>(new Map());

  // Form state
  const [style, setStyle] = useState<typeof STYLES[number]>('casual');
  const [occasion, setOccasion] = useState<typeof OCCASIONS[number]>('general');
  const [palette, setPalette] = useState<typeof PALETTES[number]>('neutral');
  const [temperature, setTemperature] = useState<string>("");
  const [weatherCondition, setWeatherCondition] = useState<'snow' | 'rain' | 'sun' | 'cloudy' | 'clear'>('clear');

  // Build map of closet items for quick lookup
  useEffect(() => {
    const map = new Map<string, ClothingItem>();
    items.forEach(item => {
      if (!item.isArchived) {
        map.set(item.id, item);
      }
    });
    setClosetItemsMap(map);
  }, [items]);

  // Sync closet to backend
  useEffect(() => {
    const syncClosetToBackend = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/closet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default', // In production, get from auth
            items: items.filter(item => !item.isArchived),
          }),
        });
      } catch (error) {
        console.error('Failed to sync closet to backend:', error);
      }
    };
    syncClosetToBackend();
  }, [items]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setOutfits([]);

    try {
      // Check if we have enough items
      const activeItems = items.filter(item => !item.isArchived);
      if (activeItems.length < 3) {
        Alert.alert(
          "Not Enough Items",
          "You need at least 3 items in your closet to generate outfits. Add more clothing items first.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add Clothing",
              onPress: () => navigation.navigate("AddClothing"),
            },
          ]
        );
        setIsGenerating(false);
        return;
      }

      const filters: any = {
        occasion,
        style,
        palette,
      };

      if (temperature) {
        filters.weather = {
          temperature: parseInt(temperature, 10),
          condition: weatherCondition,
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/outfit-from-closet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default', // In production, get from auth
          filters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (errorData.error === 'not_enough_items') {
          Alert.alert(
            "Not Enough Items",
            errorData.message || "Add more items to your closet to generate full outfits.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Add Clothing",
                onPress: () => navigation.navigate("AddClothing"),
              },
            ]
          );
          setIsGenerating(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate outfit');
      }

      const data: ClosetOutfitResponse = await response.json();
      
      if (!data.outfits || data.outfits.length === 0) {
        throw new Error('No outfits generated');
      }

      setOutfits(data.outfits);
    } catch (error) {
      console.error('Failed to generate outfit from closet:', error);
      Alert.alert(
        'AI Error',
        error instanceof Error ? error.message : 'Could not generate outfit. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderChip = (
    label: string,
    value: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={value}
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getClosetItem = (itemId: string): ClothingItem | undefined => {
    return closetItemsMap.get(itemId);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#4A4A4A" />
        <Text style={styles.infoText}>
          Generate outfits using items from your closet. Make sure you have at least 3 items added.
        </Text>
      </View>

      {/* Style Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style</Text>
        <View style={styles.chipContainer}>
          {STYLES.map((s) =>
            renderChip(
              s.charAt(0).toUpperCase() + s.slice(1),
              s,
              style === s,
              () => setStyle(s)
            )
          )}
        </View>
      </View>

      {/* Occasion Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Occasion</Text>
        <View style={styles.chipContainer}>
          {OCCASIONS.map((o) =>
            renderChip(
              o.charAt(0).toUpperCase() + o.slice(1),
              o,
              occasion === o,
              () => setOccasion(o)
            )
          )}
        </View>
      </View>

      {/* Color Palette */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Palette</Text>
        <View style={styles.chipContainer}>
          {PALETTES.map((p) =>
            renderChip(
              p.charAt(0).toUpperCase() + p.slice(1),
              p,
              palette === p,
              () => setPalette(p)
            )
          )}
        </View>
      </View>

      {/* Weather Input (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather (Optional)</Text>
        <View style={styles.weatherRow}>
          <View style={styles.temperatureInputContainer}>
            <Text style={styles.inputLabel}>Temperature (°C)</Text>
            <View style={styles.temperatureInputWrapper}>
              <TextInput
                style={styles.temperatureInput}
                placeholder="e.g., 15"
                placeholderTextColor="#8A8A8A"
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.conditionContainer}>
            <Text style={styles.inputLabel}>Condition</Text>
            <View style={styles.chipContainer}>
              {(['sun', 'rain', 'cloudy', 'snow', 'clear'] as const).map((cond) =>
                renderChip(
                  cond.charAt(0).toUpperCase() + cond.slice(1),
                  cond,
                  weatherCondition === cond,
                  () => setWeatherCondition(cond)
                )
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
        activeOpacity={0.8}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Building outfit from your wardrobe…</Text>
          </View>
        ) : (
          <>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Outfit from My Closet</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Link to Global AI */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          // Navigate back to global tab would need parent component
          // For now, just show message
          Alert.alert(
            "Switch to Global AI",
            "Use the tabs above to switch to 'Global AI' mode for outfits without using your closet."
          );
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>
          No time to add clothes? → Use Global AI Stylist instead
        </Text>
      </TouchableOpacity>

      {/* Results */}
      {outfits.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Generated Outfits</Text>
          {outfits.map((outfit, index) => (
            <View key={outfit.id || index} style={styles.outfitCard}>
              <Text style={styles.outfitTitle}>{outfit.name}</Text>
              <Text style={styles.outfitDescription}>{outfit.description}</Text>
              <View style={styles.itemsContainer}>
                {outfit.items.map((item, itemIndex) => {
                  const closetItem = getClosetItem(item.itemId);
                  if (!closetItem) {
                    return (
                      <View key={itemIndex} style={styles.itemRow}>
                        <Text style={styles.itemText}>Item not found (ID: {item.itemId})</Text>
                      </View>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={itemIndex}
                      style={styles.itemRow}
                      onPress={() => navigation.navigate("ClothingDetail", { itemId: item.itemId })}
                      activeOpacity={0.7}
                    >
                      {closetItem.image || closetItem.thumbnailUrl ? (
                        <Image
                          source={{ uri: closetItem.image || closetItem.thumbnailUrl || "" }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.itemImagePlaceholder}>
                          <Ionicons name="shirt-outline" size={24} color="#8A8A8A" />
                        </View>
                      )}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{closetItem.name}</Text>
                        <Text style={styles.itemCategory}>
                          {closetItem.category} • {closetItem.type || 'Item'}
                          {closetItem.color && ` • ${closetItem.color}`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#E3F0FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#4A4A4A",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 12,
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
    backgroundColor: "#FFFFFF",
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
  },
  weatherRow: {
    gap: 16,
  },
  temperatureInputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  temperatureInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  temperatureInput: {
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    height: 56,
  },
  conditionContainer: {
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  linkButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  linkText: {
    fontSize: 14,
    color: "#C8A2C8",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 16,
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  outfitDescription: {
    fontSize: 16,
    color: "#8A8A8A",
    marginBottom: 16,
    lineHeight: 24,
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F7EDE2",
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F7EDE2",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 22,
  },
});

