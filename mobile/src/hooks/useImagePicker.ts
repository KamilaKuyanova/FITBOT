import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  cancelled: boolean;
}

export function useImagePicker() {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (mediaType: "camera" | "library"): Promise<boolean> => {
    if (mediaType === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos. Please enable it in your device settings."
        );
        return false;
      }
      return true;
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library permission is required to select images. Please enable it in your device settings."
        );
        return false;
      }
      return true;
    }
  };

  const pickImageFromLibrary = async (): Promise<ImagePickerResult | null> => {
    try {
      setIsLoading(true);
      const hasPermission = await requestPermissions("library");
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return {
          uri: "",
          width: 0,
          height: 0,
          cancelled: true,
        };
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        cancelled: false,
      };
    } catch (error) {
      console.error("Error picking image from library:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhotoWithCamera = async (): Promise<ImagePickerResult | null> => {
    try {
      setIsLoading(true);
      const hasPermission = await requestPermissions("camera");
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return {
          uri: "",
          width: 0,
          height: 0,
          cancelled: true,
        };
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        cancelled: false,
      };
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePickerOptions = (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Select Image",
        "Choose an option",
        [
          {
            text: "Camera",
            onPress: async () => {
              const result = await takePhotoWithCamera();
              resolve(result);
            },
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const result = await pickImageFromLibrary();
              resolve(result);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  };

  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  return {
    pickImageFromLibrary,
    takePhotoWithCamera,
    showImagePickerOptions,
    convertImageToBase64,
    isLoading,
  };
}
