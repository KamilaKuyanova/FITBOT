import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  const helpItems = [
    {
      icon: "help-circle-outline",
      title: "FAQ",
      description: "Frequently asked questions",
      onPress: () => {
        // Could navigate to FAQ screen or show modal
        console.log("FAQ pressed");
      },
    },
    {
      icon: "mail-outline",
      title: "Contact Support",
      description: "support@fitapplication.com",
      onPress: () => {
        Linking.openURL("mailto:support@fitapplication.com?subject=Support Request");
      },
    },
    {
      icon: "document-text-outline",
      title: "User Guide",
      description: "Learn how to use the app",
      onPress: () => {
        console.log("User guide pressed");
      },
    },
    {
      icon: "shield-checkmark-outline",
      title: "Privacy Policy",
      description: "Read our privacy policy",
      onPress: () => {
        console.log("Privacy policy pressed");
      },
    },
    {
      icon: "document-outline",
      title: "Terms of Service",
      description: "Read our terms of service",
      onPress: () => {
        console.log("Terms of service pressed");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Ionicons name="help-circle" size={48} color="#C8A2C8" />
          <Text style={styles.introTitle}>How can we help?</Text>
          <Text style={styles.introText}>
            Find answers to common questions or contact our support team.
          </Text>
        </View>

        <View style={styles.menuSection}>
          {helpItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#C8A2C8" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#DAD7CD" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionText}>© 2024 Fit Application</Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  introSection: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5DCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  versionSection: {
    alignItems: "center",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  versionText: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 4,
  },
});
