import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApiError } from "@/types/api";

interface ErrorViewProps {
  error: ApiError;
  onRetry: () => void;
  compact?: boolean; // smaller version for inline use
}

export function ErrorView({ error, onRetry, compact = false }: ErrorViewProps) {
  const isAuthError = error.type === "AUTH";

  const getIcon = () => {
    switch (error.type) {
      case "NETWORK":
      case "TIMEOUT":
        return "cloud-offline-outline";
      case "SERVER":
        return "cloud-offline-outline";
      case "AUTH":
        return "lock-closed-outline";
      case "NOT_FOUND":
        return "search-outline";
      default:
        return "alert-circle-outline";
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case "NETWORK":
        return "No Connection";
      case "TIMEOUT":
        return "Connection Timed Out";
      case "SERVER":
        return "Server Error";
      case "AUTH":
        return "Session Expired";
      case "NOT_FOUND":
        return "Not Found";
      default:
        return "Oops!";
    }
  };

  const handleAction = () => {
    if (isAuthError) {
      router.replace("/(auth)/login");
    } else {
      onRetry();
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={getIcon()} size={20} color="#EF4444" />
        <Text style={styles.compactMessage} numberOfLines={1}>
          {error.message}
        </Text>
        <Pressable onPress={handleAction} style={styles.compactRetry}>
          <Text style={styles.retryText}>{isAuthError ? "Login" : "Retry"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name={getIcon()} size={48} color="#6366F1" />
      </View>
      <Text style={styles.fullTitle}>{getTitle()}</Text>
      <Text style={styles.fullMessage}>{error.message}</Text>
      
      <Pressable onPress={handleAction} style={styles.fullButton}>
        <Text style={styles.fullButtonText}>
          {isAuthError ? "Log In Again" : "Try Again"}
        </Text>
      </Pressable>
      
      {!isAuthError && (
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#0F172A",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  fullTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  fullMessage: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  fullButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fullButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  compactMessage: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 13,
    marginLeft: 10,
    marginRight: 10,
  },
  compactRetry: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#6366F1",
    borderRadius: 6,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
