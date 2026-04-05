import "../global.css";
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/store/AuthContext";
import { CourseProvider } from "@/store/courseStore";
import { BookmarkProvider } from "@/store/bookmarkStore";
import { EnrollmentProvider } from "@/store/enrolledStore";
import { ProgressProvider } from "@/store/progressStore";
import { useAuth } from "@/hooks/useAuth";
import * as Notifications from 'expo-notifications';
import { useRef } from "react";
import {
  requestNotificationPermissions as handleRequestPermissions,
  scheduleReEngagementNotification as handleScheduleReEngagement,
  updateLastOpenedAt,
  handleNotificationResponse
} from '../services/notificationService';

// Set global notification handler:
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors — splash screen may not be available
});

function AppLayout() {
  const { loading } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore
      });
    }

    // Initialize notifications
    // @ts-ignore
    handleRequestPermissions();
    // @ts-ignore
    handleScheduleReEngagement();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          updateLastOpenedAt();
          // @ts-ignore
          handleScheduleReEngagement();
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.remove();
    };
  }, [loading]);

  // Show a loading indicator with pure inline styles (not NativeWind)
  // so it always renders regardless of styling setup
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="course/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="course/webview"
          options={{
            animation: "slide_from_right",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <CourseProvider>
          <EnrollmentProvider>
            <ProgressProvider>
              <AppLayout />
            </ProgressProvider>
          </EnrollmentProvider>
        </CourseProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
});
