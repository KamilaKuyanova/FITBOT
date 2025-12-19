import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/api";
import { useProfile } from "../contexts/ProfileContext";
import type { GlobalOutfit, GlobalOutfitResponse, OutfitPreferences } from "../types/outfit";

const STYLES = ['casual', 'streetwear', 'classic', 'sporty', 'romantic', 'business'] as const;
const OCCASIONS = ['school', 'university', 'office', 'date', 'party', 'travel', 'home', 'general'] as const;
const PALETTES = ['pastel', 'neutral', 'bright', 'monochrome'] as const;
const BUDGET_LEVELS = ['low', 'medium', 'high'] as const;

export default function GlobalStylistContent() {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfits, setOutfits] = useState<GlobalOutfit[]>([]);
  
  // Form state
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other'>(() => {
    const profileGender = profile?.personalInfo?.gender?.toLowerCase();
    if (profileGender?.includes('female')) return 'female';
    if (profileGender?.includes('male')) return 'male';
    return 'female'; // default
  });
  const [style, setStyle] = useState<typeof STYLES[number]>('casual');
  const [occasion, setOccasion] = useState<typeof OCCASIONS[number]>('general');
  const [palette, setPalette] = useState<typeof PALETTES[number]>('neutral');
  const [budgetLevel, setBudgetLevel] = useState<typeof BUDGET_LEVELS[number]>('medium');
  const [temperature, setTemperature] = useState<string>("");
  const [weatherCondition, setWeatherCondition] = useState<'snow' | 'rain' | 'sun' | 'cloudy' | 'clear'>('clear');
  const [preferredColors, setPreferredColors] = useState<string>("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setOutfits([]);

    try {
      const preferences: OutfitPreferences = {
        gender,
        style,
        occasion,
        palette,
        budgetLevel,
        preferredColors: preferredColors
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c.length > 0),
        weather: temperature
          ? {
              temperature: parseInt(temperature, 10),
              condition: weatherCondition,
            }
          : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/ai/outfit-global`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate outfit');
      }

      const data: GlobalOutfitResponse = await response.json();
      
      if (!data.outfits || data.outfits.length === 0) {
        throw new Error('No outfits generated');
      }

      setOutfits(data.outfits);
    } catch (error) {
      console.error('Failed to generate outfit:', error);
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

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Gender Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.chipContainer}>
          {renderChip('Female', 'female', gender === 'female', () => setGender('female'))}
          {renderChip('Male', 'male', gender === 'male', () => setGender('male'))}
          {renderChip('Other', 'non-binary', gender === 'non-binary', () => setGender('non-binary'))}
        </View>
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

      {/* Budget Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Level</Text>
        <View style={styles.chipContainer}>
          {BUDGET_LEVELS.map((b) =>
            renderChip(
              b.charAt(0).toUpperCase() + b.slice(1),
              b,
              budgetLevel === b,
              () => setBudgetLevel(b)
            )
          )}
        </View>
      </View>

      {/* Weather Input (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather (Optional)</Text>
        <View style={styles.weatherRow}>
          <TextInput
            style={styles.temperatureInput}
            placeholder="Temperature (°C)"
            placeholderTextColor="#8A8A8A"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
          />
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

      {/* Preferred Colors (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Colors (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., beige, white, black (comma-separated)"
          placeholderTextColor="#8A8A8A"
          value={preferredColors}
          onChangeText={setPreferredColors}
        />
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
            <Text style={styles.generateButtonText}>Generating your AI outfit…</Text>
          </View>
        ) : (
          <>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate AI Outfit</Text>
          </>
        )}
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
                {outfit.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Text style={styles.itemBullet}>•</Text>
                    <Text style={styles.itemText}>
                      <Text style={styles.itemType}>{item.type}</Text>
                      {' – '}
                      <Text style={styles.itemColor}>{item.color}</Text>
                      {item.details && ` (${item.details})`}
                      {' '}
                      <Text style={styles.itemCategory}>({item.category})</Text>
                    </Text>
                  </View>
                ))}
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
    gap: 12,
  },
  temperatureInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 56,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#4A4A4A",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 56,
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
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemBullet: {
    fontSize: 16,
    color: "#C8A2C8",
    fontWeight: "bold",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 22,
  },
  itemType: {
    fontWeight: "600",
  },
  itemColor: {
    fontWeight: "500",
  },
  itemCategory: {
    fontSize: 13,
    color: "#8A8A8A",
    fontStyle: "italic",
  },
});

