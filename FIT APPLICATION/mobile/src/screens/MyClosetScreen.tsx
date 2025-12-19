import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useCloset, ClothingCategory } from "../contexts/ClosetContext";

const categories: { id: ClothingCategory; label: string }[] = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "outerwear", label: "Outerwear" },
  { id: "dresses", label: "Dresses" },
];

export default function MyClosetScreen() {
  const navigation = useNavigation<any>();
  const { items, getItemsByCategory } = useCloset();
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>("tops");
  const categoryItems = getItemsByCategory(activeCategory);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id })}
    >
      <Image
        source={{
          uri:
            item.image ||
            item.thumbnailUrl ||
            (item.imageBase64 ? `data:image/jpeg;base64,${item.imageBase64}` : undefined) ||
            "https://images.unsplash.com/photo-1626160200951-fc4b4f8d4de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDc2MDA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.tag && (
        <Text style={styles.itemTag} numberOfLines={1}>
          {item.tag}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Closet</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddClothing")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(category.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={categoryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.listRow}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={64} color="#E5E5E5" />
            <Text style={styles.emptyText}>No items in this category</Text>
            <TouchableOpacity 
              style={styles.emptyButton} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate("AddClothing")}
            >
              <Text style={styles.emptyButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
    color: "#595959",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8A2C8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 24,
    paddingVertical: 0,
    gap: 8,
  },
  categoryChip: {
    height: 44,
    minWidth: 110,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#C8A2C8",
    borderColor: "#C8A2C8",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
    color: "#6B7280",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 100,
  },
  listRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  itemCard: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F7EDE2",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    padding: 12,
    color: "#4A4A4A",
  },
  itemTag: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    color: "#8A8A8A",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    color: "#8A8A8A",
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8A2C8",
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
