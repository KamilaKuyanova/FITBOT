import { NavigationContainerRef } from "@react-navigation/native";

// Navigation ref for logout functionality
export let navigationRef: NavigationContainerRef<any> | null = null;

export function setNavigationRef(ref: NavigationContainerRef<any> | null) {
  navigationRef = ref;
}

export function navigateToAuth() {
  // Navigate to Auth screen using navigation reset
  if (navigationRef?.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  }
}

export function navigateToMain() {
  // Navigate to Main app using navigation reset
  if (navigationRef?.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  }
}
