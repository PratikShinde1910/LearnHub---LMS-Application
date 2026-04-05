import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  icon,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const togglePassword = useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );

  const borderColor = error
    ? "#EF4444"
    : isFocused
      ? "#6366F1"
      : "#334155";

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? "#818CF8" : "#94A3B8"}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor="#64748B"
          cursorColor="#818CF8"
          {...rest}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePassword} hitSlop={8}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#94A3B8"
            />
          </Pressable>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={14}
            color="#EF4444"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1E293B",
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 14,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
  },
});
