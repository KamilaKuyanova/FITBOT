import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =======================
   TYPES & CONSTANTS
   ======================= */

export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "shoes"
  | "accessories"
  | "outerwear"
  | "dresses"
  | "activewear"
  | "swimwear"
  | "underwear"
  | "other"
  | "outfits";

export const CATEGORY_TYPES: Record<ClothingCategory, string[]> = {
  tops: [
    "T-shirt",
    "Blouse",
    "Shirt",
    "Sweater",
    "Tank Top",
    "Hoodie",
    "Cardigan",
    "Crop Top",
    "Polo",
    "Tunic",
  ],
  bottoms: [
    "Jeans",
    "Pants",
    "Shorts",
    "Skirt",
    "Leggings",
    "Trousers",
    "Capris",
    "Joggers",
    "Sweatpants",
  ],
  shoes: [
    "Sneakers",
    "Boots",
    "Heels",
    "Flats",
    "Sandals",
    "Loafers",
    "Oxfords",
    "Slippers",
    "Athletic",
  ],
  accessories: [
    "Bag",
    "Belt",
    "Hat",
    "Scarf",
    "Jewelry",
    "Watch",
    "Sunglasses",
    "Gloves",
    "Tie",
  ],
  outerwear: [
    "Jacket",
    "Coat",
    "Blazer",
    "Vest",
    "Parka",
    "Trench Coat",
    "Windbreaker",
    "Bomber",
  ],
  dresses: [
    "Casual Dress",
    "Formal Dress",
    "Sundress",
    "Maxi Dress",
    "Midi Dress",
    "Mini Dress",
    "Wrap Dress",
  ],
  activewear: [
    "Sports Bra",
    "Athletic Top",
    "Athletic Shorts",
    "Yoga Pants",
    "Gym Leggings",
    "Athletic Jacket",
  ],
  swimwear: [
    "Swimsuit",
    "Bikini",
    "One-Piece",
    "Swim Trunks",
    "Cover-up",
    "Rash Guard",
  ],
  underwear: ["Bra", "Underwear", "Undershirt", "Socks", "Tights", "Shapewear"],
  other: ["Other"],
  outfits: ["Outfit"],
};

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  type?: string;

  imageBase64?: string;
  image?: string;
  images?: string[];
  thumbnailUrl?: string;

  // Basic details
  brand?: string;
  purchaseDate?: string;
  price?: number;
  currency?: string;
  size?: string;
  color?: string; // HEX
  material?: string;
  condition?: "New" | "Excellent" | "Good" | "Fair" | "Poor";

  // Tags & attributes
  tag?: string;
  tags?: string[];
  pattern?: string;
  fit?: "Slim" | "Regular" | "Loose" | "Oversized";
  occasion?: string[];
  weatherCompatibility?: string[];
  seasons?: string[];

  // Usage & preferences
  frequencyOfWear?: "Daily" | "Weekly" | "Monthly" | "Rarely" | "Never";
  comfortRating?: number; // 1-5
  isFavorite?: boolean;
  notes?: string;

  // Metadata
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastWornDate?: string;
  wearCount?: number;
  isArchived?: boolean;
}

export interface ItemFilters {
  category?: ClothingCategory;
  tags?: string[];
  color?: string;
  season?: string[];
  condition?: string[];
  priceRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  searchQuery?: string;
}

export interface ClosetContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, item: Partial<ClothingItem>) => void;
  deleteItem: (id: string) => void;
  archiveItem: (id: string, archived: boolean) => void;
  logWear: (id: string) => void;
  getItemsByCategory: (category: ClothingCategory) => ClothingItem[];
  searchItems: (query: string) => ClothingItem[];
  filterItems: (filters: ItemFilters) => ClothingItem[];
}

/* =======================
   CONTEXT
   ======================= */

const ClosetContext = createContext<ClosetContextType | undefined>(undefined);

/* =======================
   HELPERS
   ======================= */

const STORAGE_KEY = "wardrobeItems";

function getDefaultItems(): ClothingItem[] {
  return [
    {
      id: "1",
      name: "White T-Shirt",
      category: "tops",
      image:
        "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDc2MDA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Casual",
      color: "#F9F9F9",
    },
    {
      id: "2",
      name: "Pink Blouse",
      category: "tops",
      image:
        "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDc2MDA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Chic",
      color: "#F5DCE7",
    },
    {
      id: "3",
      name: "Blue Shirt",
      category: "tops",
      image:
        "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDc2MDA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Workwear",
      color: "#E3F0FF",
    },
    {
      id: "4",
      name: "Green Tank",
      category: "tops",
      image:
        "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDc2MDA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Sport",
      color: "#E8F5E9",
    },
    {
      id: "5",
      name: "Blue Jeans",
      category: "bottoms",
      image:
        "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGRlbmltJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjQ3ODQ1NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Casual",
      color: "#E3F0FF",
    },
    {
      id: "6",
      name: "Black Pants",
      category: "bottoms",
      image:
        "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGRlbmltJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjQ3ODQ1NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Workwear",
      color: "#DAD7CD",
    },
    {
      id: "7",
      name: "White Sneakers",
      category: "shoes",
      image:
        "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjQ4MTU5MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Casual",
      color: "#F9F9F9",
    },
    {
      id: "8",
      name: "Pink Heels",
      category: "shoes",
      image:
        "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NjQ4MTU5MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tag: "Chic",
      color: "#F5DCE7",
    },
  ];
}

async function loadInitialItems(): Promise<ClothingItem[]> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load wardrobeItems from AsyncStorage:", error);
  }

  return getDefaultItems();
}

/* =======================
   PROVIDER
   ======================= */

export function ClosetProvider({
  children,
}: {
  children?: ReactNode;
}): React.JSX.Element {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items on mount
  useEffect(() => {
    loadInitialItems().then((loadedItems) => {
      setItems(loadedItems);
      setIsLoaded(true);
    });
  }, []);

  // Save to AsyncStorage when items change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save wardrobeItems to AsyncStorage:", error);
      }
    }
  }, [items, isLoaded]);

  /* --------- helpers внутри провайдера --------- */

  const searchItems = (query: string): ClothingItem[] => {
    const trimmed = query.trim();
    if (!trimmed) {
      return items.filter((item) => !item.isArchived);
    }

    const lower = trimmed.toLowerCase();

    return items.filter((item) => {
      if (item.isArchived) return false;

      const tagsCombined = [
        ...(item.tags || []),
        ...(item.tag ? [item.tag] : []),
      ];

      return (
        item.name.toLowerCase().includes(lower) ||
        item.brand?.toLowerCase().includes(lower) ||
        tagsCombined.some((t) => t.toLowerCase().includes(lower)) ||
        item.color?.toLowerCase().includes(lower) ||
        item.material?.toLowerCase().includes(lower) ||
        item.notes?.toLowerCase().includes(lower) ||
        item.type?.toLowerCase().includes(lower)
      );
    });
  };

  const filterItems = (filters: ItemFilters): ClothingItem[] => {
    let filtered = items.filter((item) => !item.isArchived);

    if (filters.category) {
      filtered = filtered.filter(
        (item) => item.category === filters.category
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((item) => {
        const itemTags = [
          ...(item.tags || []),
          ...(item.tag ? [item.tag] : []),
        ];
        return filters.tags!.some((tag) => itemTags.includes(tag));
      });
    }

    if (filters.color) {
      filtered = filtered.filter((item) => item.color === filters.color);
    }

    if (filters.season && filters.season.length > 0) {
      filtered = filtered.filter((item) =>
        item.seasons?.some((s) => filters.season!.includes(s))
      );
    }

    if (filters.condition && filters.condition.length > 0) {
      filtered = filtered.filter(
        (item) =>
          item.condition && filters.condition!.includes(item.condition)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter((item) => {
        if (item.price == null) return false;
        return (
          item.price >= filters.priceRange!.min &&
          item.price <= filters.priceRange!.max
        );
      });
    }

    if (filters.searchQuery) {
      const searched = searchItems(filters.searchQuery);
      filtered = filtered.filter((item) =>
        searched.some((s) => s.id === item.id)
      );
    }

    return filtered;
  };

  const addItem = (
    item: Omit<ClothingItem, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date().toISOString();
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      createdAt: now,
      updatedAt: now,
      wearCount: 0,
      isArchived: false,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ClothingItem>) => {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: now } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const archiveItem = (id: string, archived: boolean) => {
    updateItem(id, { isArchived: archived });
  };

  const logWear = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              wearCount: (item.wearCount || 0) + 1,
              lastWornDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const getItemsByCategory = (category: ClothingCategory) => {
    return items.filter((item) => item.category === category && !item.isArchived);
  };

  return (
    <ClosetContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        logWear,
        getItemsByCategory,
        searchItems,
        filterItems,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
}

/* =======================
   HOOK
   ======================= */

export function useCloset(): ClosetContextType {
  const context = useContext(ClosetContext);
  if (context === undefined) {
    throw new Error("useCloset must be used within a ClosetProvider");
  }
  return context;
}
