import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ButtonVariant, ButtonSize } from "@/types";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

const sizePaddings: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeStyle = sizePaddings[size];

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        testID={testID}
        style={[
          { opacity: isDisabled ? 0.6 : 1 },
          fullWidth && styles.fullWidth,
        ]}
      >
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonInner,
            {
              paddingVertical: sizeStyle.paddingVertical,
              paddingHorizontal: sizeStyle.paddingHorizontal,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.contentRow}>
              {icon}
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: sizeStyle.fontSize },
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        testID={testID}
        style={[
          styles.buttonInner,
          styles.outlineButton,
          {
            opacity: isDisabled ? 0.6 : 1,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
          },
          fullWidth && styles.fullWidth,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#818CF8" />
        ) : (
          <View style={styles.contentRow}>
            {icon}
            <Text
              style={[
                styles.buttonText,
                { fontSize: sizeStyle.fontSize, color: "#818CF8" },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Ghost / secondary
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={[
        styles.buttonInner,
        {
          opacity: isDisabled ? 0.6 : 1,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor:
            variant === "secondary" ? "#10B981" : "transparent",
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#CBD5E1" />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: sizeStyle.fontSize,
                color: variant === "secondary" ? "#FFFFFF" : "#CBD5E1",
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#6366F1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
