import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/useLogin";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const { form, errors, loading, updateField, handleLogin } = useLogin();

  const onSubmit = async () => {
    await handleLogin();
  };

  return (
    <LinearGradient
      colors={[Colors.dark[950], Colors.dark[900], Colors.dark[800]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Ionicons
                name="book-outline"
                size={40}
                color={Colors.primary[400]}
              />
            </View>
            <Text style={styles.title}>LearnHub</Text>
            <Text style={styles.subtitle}>
              Welcome back! Sign in to continue
            </Text>
          </View>

          {/* Error Message */}
          {errors.general && (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={Colors.error}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {/* Form */}
          <Input
            label="Username"
            value={form.username}
            onChangeText={(text) => updateField("username", text)}
            placeholder="Enter your username"
            error={errors.username}
            autoCapitalize="none"
            autoComplete="username"
            icon="person-outline"
            testID="login-username-input"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={(text) => updateField("password", text)}
            placeholder="Enter your password"
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            icon="lock-closed-outline"
            testID="login-password-input"
          />

          {/* Login Button */}
          <View style={{ marginTop: 16 }}>
            <Button
              title="Sign In"
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              testID="login-submit-button"
            />
          </View>

          {/* Register Link */}
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>
              Don&apos;t have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.linkAction}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "rgba(79, 70, 229, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 16,
    marginTop: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.19)",
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    flex: 1,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  linkText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  linkAction: {
    color: "#818CF8",
    fontSize: 14,
    fontWeight: "bold",
  },
});
