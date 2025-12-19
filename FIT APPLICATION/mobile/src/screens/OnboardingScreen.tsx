import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: "sparkles",
    title: "AI Outfit Generation",
    description: "Let AI create stunning outfits based on your wardrobe, occasion, and mood.",
    gradient: ["#F5DCE7", "#E3F0FF"],
  },
  {
    icon: "shirt",
    title: "Smart Wardrobe",
    description: "Organize your clothes with AI-powered categorization and smart tagging.",
    gradient: ["#E3F0FF", "#E8F5E9"],
  },
  {
    icon: "cloud",
    title: "Weather-Based Looks",
    description: "Get perfect outfit suggestions tailored to today's weather and temperature.",
    gradient: ["#E8F5E9", "#F7EDE2"],
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextIndex = currentSlide + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentSlide(nextIndex);
    } else {
      onComplete();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons
            name={item.icon as any}
            size={64}
            color="#FFFFFF"
          />
        </LinearGradient>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={true}
      />

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlide && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
          </Text>
          {currentSlide < slides.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          )}
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    alignItems: "center",
  },
  slideContainer: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#595959",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
    maxWidth: width - 64,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 24,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DAD7CD",
  },
  indicatorActive: {
    width: 32,
    backgroundColor: "#C8A2C8",
  },
  button: {
    backgroundColor: "#C8A2C8",
    borderRadius: 24,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    shadowColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
