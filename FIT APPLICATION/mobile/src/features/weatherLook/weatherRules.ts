export type WeatherCondition = "sunny" | "cloudy" | "rain" | "snow" | "windy";

export interface WeatherState {
  tempC: number;
  condition: WeatherCondition;
  isNight?: boolean;
}

export interface OutfitItem {
  type: string;
  label: string;
  icon: string;
  tags: string[];
}

export interface WeatherLookResult {
  outfitTitle: string;
  outfitItems: OutfitItem[];
  tips: string[];
  badges: string[];
}

// Variants for same weather (for "Try another" button)
const getVariantIndex = (tempC: number, condition: WeatherCondition, variant: number): number => {
  const hash = tempC + condition.length + variant;
  return hash % 3; // 0, 1, or 2
};

export function getWeatherOutfitAdvice(
  weather: WeatherState,
  variant: number = 0
): WeatherLookResult {
  const { tempC, condition, isNight } = weather;
  const variantIdx = getVariantIndex(tempC, condition, variant);

  // Base outfit items based on temperature
  let baseItems: OutfitItem[] = [];
  let outfitTitle = "";
  let badges: string[] = [];
  let tips: string[] = [];

  // Temperature-based rules
  if (tempC <= 0) {
    // Very cold
    outfitTitle = "Winter Warmth";
    baseItems = [
      {
        type: "outerwear",
        label: variantIdx === 0 ? "Wool Coat" : variantIdx === 1 ? "Down Jacket" : "Parka",
        icon: "🧥",
        tags: ["warm", "waterproof"],
      },
      {
        type: "base",
        label: variantIdx === 0 ? "Thermal Underwear" : variantIdx === 1 ? "Long Sleeve Base Layer" : "Thermal Shirt",
        icon: "👕",
        tags: ["thermal", "base-layer"],
      },
      {
        type: "bottom",
        label: variantIdx === 0 ? "Warm Jeans" : variantIdx === 1 ? "Fleece-Lined Pants" : "Thermal Leggings + Jeans",
        icon: "👖",
        tags: ["insulated"],
      },
      {
        type: "footwear",
        label: variantIdx === 0 ? "Winter Boots" : variantIdx === 1 ? "Insulated Boots" : "Waterproof Boots",
        icon: "🥾",
        tags: ["insulated", "waterproof"],
      },
      {
        type: "accessory",
        label: variantIdx === 0 ? "Wool Scarf" : variantIdx === 1 ? "Neck Warmer" : "Scarf + Beanie",
        icon: "🧣",
        tags: ["warm"],
      },
    ];
    badges = ["Warm", "Winter-Ready"];
    tips = [
      "Layer up with thermal base layers",
      "Cover extremities (hands, head, neck)",
      "Choose waterproof outer layer",
    ];
  } else if (tempC >= 1 && tempC <= 10) {
    // Cold
    outfitTitle = "Cozy & Comfortable";
    baseItems = [
      {
        type: "outerwear",
        label: variantIdx === 0 ? "Warm Jacket" : variantIdx === 1 ? "Fleece Jacket" : "Denim Jacket + Hoodie",
        icon: "🧥",
        tags: ["warm"],
      },
      {
        type: "top",
        label: variantIdx === 0 ? "Long Sleeve Shirt" : variantIdx === 1 ? "Sweater" : "Hoodie",
        icon: "👕",
        tags: ["warm"],
      },
      {
        type: "bottom",
        label: variantIdx === 0 ? "Jeans" : variantIdx === 1 ? "Corduroy Pants" : "Chinos",
        icon: "👖",
        tags: ["warm"],
      },
      {
        type: "footwear",
        label: variantIdx === 0 ? "Sneakers" : variantIdx === 1 ? "Boots" : "High-Top Sneakers",
        icon: "👟",
        tags: ["comfortable"],
      },
    ];
    badges = ["Warm", "Comfortable"];
    tips = [
      "Layer with a jacket or sweater",
      "Choose closed-toe shoes",
      "Consider a light scarf if windy",
    ];
  } else if (tempC >= 11 && tempC <= 20) {
    // Mild
    outfitTitle = "Light Layers";
    baseItems = [
      {
        type: "outerwear",
        label: variantIdx === 0 ? "Light Jacket" : variantIdx === 1 ? "Cardigan" : "Denim Jacket",
        icon: "🧥",
        tags: ["light"],
      },
      {
        type: "top",
        label: variantIdx === 0 ? "Long Sleeve T-Shirt" : variantIdx === 1 ? "Light Sweater" : "Button-Up Shirt",
        icon: "👕",
        tags: ["breathable"],
      },
      {
        type: "bottom",
        label: variantIdx === 0 ? "Jeans" : variantIdx === 1 ? "Chinos" : "Trousers",
        icon: "👖",
        tags: ["comfortable"],
      },
      {
        type: "footwear",
        label: variantIdx === 0 ? "Sneakers" : variantIdx === 1 ? "Loafers" : "Canvas Shoes",
        icon: "👟",
        tags: ["comfortable"],
      },
    ];
    badges = ["Comfortable", "Versatile"];
    tips = [
      "Perfect for layering",
      "Easy to adjust if temperature changes",
      "Comfortable for all-day wear",
    ];
  } else {
    // Warm/Hot (15+)
    outfitTitle = "Light & Breezy";
    baseItems = [
      {
        type: "top",
        label: variantIdx === 0 ? "T-Shirt" : variantIdx === 1 ? "Tank Top" : "Polo Shirt",
        icon: "👕",
        tags: ["breathable", "light"],
      },
      {
        type: "bottom",
        label: variantIdx === 0 ? "Shorts" : variantIdx === 1 ? "Light Pants" : "Chinos",
        icon: "👖",
        tags: ["light", "breathable"],
      },
      {
        type: "footwear",
        label: variantIdx === 0 ? "Sneakers" : variantIdx === 1 ? "Sandals" : "Canvas Shoes",
        icon: "👟",
        tags: ["breathable"],
      },
    ];
    badges = ["Light", "Breathable"];
    tips = [
      "Choose light, breathable fabrics",
      "Stay hydrated",
      "Wear sun protection if sunny",
    ];
  }

  // Condition-based adjustments
  if (condition === "rain") {
    // Add waterproof layer
    baseItems = baseItems.map((item) => {
      if (item.type === "outerwear") {
        return {
          ...item,
          label: item.label.replace("Jacket", "Rain Jacket").replace("Coat", "Rain Coat"),
          tags: [...item.tags, "waterproof"],
        };
      }
      if (item.type === "footwear") {
        return {
          ...item,
          label: item.label.replace("Sneakers", "Waterproof Sneakers").replace("Shoes", "Rain Boots"),
          tags: [...item.tags, "waterproof"],
        };
      }
      return item;
    });

    // Add umbrella if no waterproof outerwear
    if (!baseItems.some((item) => item.type === "outerwear" && item.tags.includes("waterproof"))) {
      baseItems.push({
        type: "accessory",
        label: "Umbrella",
        icon: "☂️",
        tags: ["essential"],
      });
    }

    badges.push("Rain-Safe");
    tips.unshift("Avoid suede and leather", "Layer waterproof outerwear");
  }

  if (condition === "windy") {
    // Adjust outerwear
    baseItems = baseItems.map((item) => {
      if (item.type === "outerwear") {
        return {
          ...item,
          label: item.label.replace("Jacket", "Windbreaker").replace("Coat", "Wind-Resistant Coat"),
          tags: [...item.tags, "wind-resistant"],
        };
      }
      return item;
    });

    badges.push("Wind-Resistant");
    tips.unshift("Choose tighter-fitting outer layers", "Secure accessories");
  }

  if (condition === "snow") {
    badges.push("Snow-Ready");
    tips.unshift("Waterproof footwear essential", "Wear warm, insulated layers");
  }

  if (condition === "sunny" && tempC >= 15) {
    badges.push("Sun-Protected");
    tips.unshift("Wear sunscreen", "Consider a hat and sunglasses");
  }

  return {
    outfitTitle,
    outfitItems: baseItems,
    tips,
    badges,
  };
}

