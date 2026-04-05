import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Colors } from "@/constants/theme";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.85)" }}
    >
      <View
        className="items-center rounded-2xl p-8"
        style={{ backgroundColor: Colors.dark[800] }}
      >
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text className="text-dark-300 text-sm mt-4">{message}</Text>
      </View>
    </View>
  );
}
