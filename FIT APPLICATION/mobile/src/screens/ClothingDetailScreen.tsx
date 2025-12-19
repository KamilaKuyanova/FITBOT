import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useCloset, ClothingItem } from "../contexts/ClosetContext";
import { useImagePicker } from "../hooks/useImagePicker";

type RouteParams = {
  itemId: string;
};

export default function ClothingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { itemId } = route.params;
  const { items, deleteItem, updateItem } = useCloset();
  const { showImagePickerOptions } = useImagePicker();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedColor, setEditedColor] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const foundItem = items.find((i) => i.id === itemId);
    if (foundItem) {
      setItem(foundItem);
      setEditedName(foundItem.name);
      setEditedCategory(foundItem.category);
      setEditedColor(foundItem.color || "");
      setImageUri(foundItem.image || foundItem.thumbnailUrl || null);
    }
  }, [itemId, items]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(itemId);
            Alert.alert("Success", "Item deleted successfully!");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!item) return;

    if (!editedName.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the item.");
      return;
    }

    setIsSaving(true);
    try {
      updateItem(itemId, {
        name: editedName.trim(),
        category: editedCategory as any,
        color: editedColor.trim(),
        image: imageUri || undefined,
      });
      setIsEditing(false);
      Alert.alert("Success", "Item updated successfully!");
    } catch (error) {
      console.error("Failed to save item:", error);
      Alert.alert("Error", "Failed to save item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeImage = async () => {
    const result = await showImagePickerOptions();
    if (result && !result.cancelled) {
      setImageUri(result.uri);
    }
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C8A2C8" />
          <Text style={styles.loadingText}>Loading item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageSource = imageUri
    ? { uri: imageUri }
    : item.image
    ? { uri: item.image }
    : item.thumbnailUrl
    ? { uri: item.thumbnailUrl }
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Item" : "Item Details"}
        </Text>
        <TouchableOpacity
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          style={styles.saveButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#C8A2C8" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={isEditing ? handleChangeImage : undefined}
          activeOpacity={isEditing ? 0.8 : 1}
          disabled={!isEditing}
        >
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#DAD7CD" />
              {isEditing && (
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              )}
            </View>
          )}
          {isEditing && (
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.imageOverlayText}>Change Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Item name"
              />
            ) : (
              <Text style={styles.value}>{item.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            {isEditing ? (
              <Text style={styles.value}>{editedCategory}</Text>
            ) : (
              <Text style={styles.value}>{item.category}</Text>
            )}
          </View>

          {item.color && (
            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedColor}
                  onChangeText={setEditedColor}
                  placeholder="Color"
                />
              ) : (
                <Text style={styles.value}>{item.color}</Text>
              )}
            </View>
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Item</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C8A2C8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8A8A8A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F7EDE2",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8A8A8A",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imageOverlayText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8A8A8A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  input: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4A4A4A",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#F5DCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
