import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[400],
        tabBarInactiveTintColor: Colors.dark[500],
        tabBarStyle: {
          backgroundColor: Colors.dark[900],
          borderTopColor: Colors.dark[800],
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide index redirect from tabs
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && (
                <View
                  className="absolute -top-2 w-6 h-1 rounded-full"
                  style={{ backgroundColor: Colors.primary[400] }}
                />
              )}
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && (
                <View
                  className="absolute -top-2 w-6 h-1 rounded-full"
                  style={{ backgroundColor: Colors.primary[400] }}
                />
              )}
              <Ionicons
                name={focused ? "bookmark" : "bookmark-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              {focused && (
                <View
                  className="absolute -top-2 w-6 h-1 rounded-full"
                  style={{ backgroundColor: Colors.primary[400] }}
                />
              )}
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
