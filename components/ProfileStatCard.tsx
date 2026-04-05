import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileStatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function ProfileStatCard({ label, value, icon, color }: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
