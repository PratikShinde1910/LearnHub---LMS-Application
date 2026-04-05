import React, { useCallback, useRef, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search courses, instructors...",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(scale, {
      toValue: 1.02,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isFocused ? "#818CF8" : "#64748B"}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          cursorColor="#818CF8"
          returnKeyType="search"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} hitSlop={8}>
            <View style={styles.clearBtn}>
              <Ionicons name="close" size={14} color="#94A3B8" />
            </View>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E293B",
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  containerFocused: {
    borderColor: "#6366F1",
    backgroundColor: "#1A2332",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
});
