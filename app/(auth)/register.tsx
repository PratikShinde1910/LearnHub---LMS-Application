import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/hooks/useRegister";
import { Colors } from "@/constants/theme";

export default function RegisterScreen() {
  const { form, errors, loading, updateField, handleRegister } = useRegister();

  const onSubmit = async () => {
    const success = await handleRegister();
    if (success) {
      Alert.alert(
        "Account Created! 🎉",
        "Your account has been created successfully. Please sign in.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    }
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
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Ionicons
                name="person-add-outline"
                size={38}
                color={Colors.secondary[400]}
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands of learners today
            </Text>
          </View>

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

          <Input
            label="Username"
            value={form.username}
            onChangeText={(text) => updateField("username", text)}
            placeholder="Choose a username"
            error={errors.username}
            autoCapitalize="none"
            autoComplete="username"
            icon="person-outline"
            testID="register-username-input"
          />

          <Input
            label="Email"
            value={form.email}
            onChangeText={(text) => updateField("email", text)}
            placeholder="Enter your email"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="mail-outline"
            testID="register-email-input"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={(text) => updateField("password", text)}
            placeholder="Create a password (min 6 chars)"
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            icon="lock-closed-outline"
            testID="register-password-input"
          />

          <View style={{ marginTop: 16 }}>
            <Button
              title="Create Account"
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              variant="primary"
              testID="register-submit-button"
            />
          </View>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkAction}>Sign In</Text>
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
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
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
