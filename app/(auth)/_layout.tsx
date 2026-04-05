import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark[900] },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
