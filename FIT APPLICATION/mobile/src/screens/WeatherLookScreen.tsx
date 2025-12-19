import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_WEATHER_PRESETS } from "../data/mockWeather";
import { getWeatherOutfitAdvice, WeatherCondition } from "../features/weatherLook/weatherRules";

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
}

export default function WeatherLookScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [weatherPresetIndex, setWeatherPresetIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [outfitVariant, setOutfitVariant] = useState(0);
  const [expandAnim] = useState(new Animated.Value(0));

  // Get current mock weather preset
  const currentPreset = MOCK_WEATHER_PRESETS[weatherPresetIndex];
  const weatherData: WeatherData = {
    location: currentPreset.city,
    country: "KZ",
    temperature: currentPreset.temp,
    condition: currentPreset.condition,
    description: currentPreset.desc,
    icon: currentPreset.icon,
  };

  // Get outfit advice based on weather
  const weatherState = {
    tempC: currentPreset.temp,
    condition: currentPreset.condition as WeatherCondition,
  };
  const outfitAdvice = getWeatherOutfitAdvice(weatherState, outfitVariant);

  // Animate expand/collapse
  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.timing(expandAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Cycle to next preset on refresh
  const handleRefresh = () => {
    setWeatherPresetIndex((prev) => (prev + 1) % MOCK_WEATHER_PRESETS.length);
    setOutfitVariant(0); // Reset variant when weather changes
    if (isExpanded) {
      setIsExpanded(false);
      expandAnim.setValue(0);
    }
  };

  // Try another outfit variant
  const handleTryAnother = () => {
    setOutfitVariant((prev) => (prev + 1) % 3);
  };

  const handleSaveOutfit = () => {
    console.log("[UI] Save outfit button pressed");
    // In a real app, save to favorites/closet
  };

  const expandedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 700],
  });

  // Get "what to avoid" tips based on weather
  const getAvoidTips = () => {
    const tips: string[] = [];
    if (currentPreset.condition === "rain") {
      tips.push("Avoid suede and leather shoes");
    }
    if (currentPreset.condition === "windy") {
      tips.push("Avoid loose outer layers");
    }
    if (currentPreset.temp <= 5) {
      tips.push("Avoid thin, unlined jackets");
    }
    if (currentPreset.condition === "sunny" && currentPreset.temp >= 15) {
      tips.push("Avoid dark colors in direct sun");
    }
    return tips.length > 0 ? tips : ["No specific items to avoid today"];
  };

  const avoidTips = getAvoidTips();
  const bottomBarHeight = 80;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Look</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#4A4A4A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomBarHeight + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Weather Card */}
        <TouchableOpacity
          style={styles.weatherCard}
          onPress={toggleExpand}
          activeOpacity={0.9}
        >
          <View style={styles.weatherHeader}>
            <View style={styles.weatherHeaderLeft}>
              <Text style={styles.weatherIconEmoji}>{weatherData.icon}</Text>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherLocationCompact}>
                  {weatherData.location}
                </Text>
                <Text style={styles.weatherTempCompact}>
                  {weatherData.temperature > 0 ? "+" : ""}
                  {weatherData.temperature}°C
                </Text>
              </View>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#8A8A8A"
            />
          </View>

          {/* Expanded Content */}
          <Animated.View
            style={[
              styles.expandedContent,
              {
                maxHeight: expandedHeight,
                opacity: expandAnim,
              },
            ]}
          >
            <View style={styles.expandedInner}>
              <Text style={styles.weatherDescription}>
                {weatherData.description} • Feels like{" "}
                {currentPreset.feelsLike > 0 ? "+" : ""}
                {currentPreset.feelsLike}°C
              </Text>

              {/* Badges */}
              <View style={styles.badgesContainer}>
                {outfitAdvice.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>

              {/* Outfit Card */}
              <View style={styles.outfitCard}>
                <Text style={styles.outfitTitle}>{outfitAdvice.outfitTitle}</Text>
                <View style={styles.outfitItemsContainer}>
                  {outfitAdvice.outfitItems.map((item, index) => (
                    <View key={index} style={styles.outfitItemRow}>
                      <Text style={styles.outfitItemIcon}>{item.icon}</Text>
                      <View style={styles.outfitItemInfo}>
                        <Text style={styles.outfitItemLabel}>{item.label}</Text>
                        <Text style={styles.outfitItemType}>{item.type}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Tips */}
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>Quick Tips</Text>
                {outfitAdvice.tips.slice(0, 3).map((tip, index) => (
                  <View key={index} style={styles.tipChip}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#C8A2C8"
                      style={styles.tipIcon}
                    />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Preview Content (always visible) */}
        <View style={styles.previewSection}>
          {/* Today's Outfit Preview */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {isExpanded ? "Today's Outfit" : "Today's Outfit (Preview)"}
              </Text>
              {!isExpanded && (
                <TouchableOpacity onPress={toggleExpand}>
                  <Text style={styles.expandLink}>Expand</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.previewOutfitItems}>
              {outfitAdvice.outfitItems.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.previewItem}>
                  <Text style={styles.previewItemIcon}>{item.icon}</Text>
                  <Text style={styles.previewItemText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Tips Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Quick Tips</Text>
            {outfitAdvice.tips.slice(0, 2).map((tip, index) => (
              <View key={index} style={styles.previewTipRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#C8A2C8"
                  style={styles.previewTipIcon}
                />
                <Text style={styles.previewTipText} numberOfLines={2}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          {/* Style Mood Chips */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Style Mood</Text>
            <View style={styles.moodChipsContainer}>
              {outfitAdvice.badges.map((badge, index) => (
                <View key={index} style={styles.moodChip}>
                  <Text style={styles.moodChipText}>{badge}</Text>
                </View>
              ))}
              <View style={styles.moodChip}>
                <Text style={styles.moodChipText}>Casual</Text>
              </View>
            </View>
          </View>

          {/* Color Palette */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Color Palette for Today</Text>
            <View style={styles.colorPaletteContainer}>
              {["#F5DCE7", "#E3F0FF", "#E8F5E9", "#F7EDE2"].map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorCircle, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>

          {/* What to Avoid */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>What to Avoid Today</Text>
            <View style={styles.avoidTipsContainer}>
              {avoidTips.map((tip, index) => (
                <View key={index} style={styles.avoidTipRow}>
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#8A8A8A"
                    style={styles.avoidTipIcon}
                  />
                  <Text style={styles.avoidTipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleTryAnother}
          activeOpacity={0.8}
        >
          <Ionicons name="shuffle" size={20} color="#4A4A4A" />
          <Text style={styles.secondaryButtonText}>Try Another</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveOutfit}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Save Outfit</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#595959",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  weatherCard: {
    backgroundColor: "#E3F0FF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  weatherIconEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLocationCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  weatherTempCompact: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  expandedContent: {
    overflow: "hidden",
  },
  expandedInner: {
    paddingTop: 20,
  },
  weatherDescription: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: "#C8A2C8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 16,
  },
  outfitItemsContainer: {
    gap: 12,
  },
  outfitItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  outfitItemIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: "center",
  },
  outfitItemInfo: {
    flex: 1,
  },
  outfitItemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 2,
  },
  outfitItemType: {
    fontSize: 13,
    color: "#8A8A8A",
    textTransform: "capitalize",
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 12,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#4A4A4A",
    lineHeight: 20,
  },
  previewSection: {
    gap: 16,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  expandLink: {
    fontSize: 14,
    color: "#C8A2C8",
    fontWeight: "600",
  },
  previewOutfitItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    minWidth: "30%",
  },
  previewItemIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  previewItemText: {
    flex: 1,
    fontSize: 13,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  previewTipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  previewTipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  previewTipText: {
    flex: 1,
    fontSize: 13,
    color: "#4A4A4A",
    lineHeight: 18,
  },
  moodChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moodChip: {
    backgroundColor: "#F5DCE7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodChipText: {
    fontSize: 13,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  colorPaletteContainer: {
    flexDirection: "row",
    gap: 12,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avoidTipsContainer: {
    gap: 8,
  },
  avoidTipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avoidTipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  avoidTipText: {
    flex: 1,
    fontSize: 13,
    color: "#8A8A8A",
    lineHeight: 18,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 12,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8A2C8",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#4A4A4A",
    fontSize: 16,
    fontWeight: "600",
  },
});
