import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useCourseProgress } from "@/store/progressStore";
import { getCourseHtmlTemplate, Chapter } from "@/templates/courseHtmlTemplate";

export default function CourseWebViewScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    instructor: string;
    category?: string;
    chapters?: string; // Expect stringified JSON array
  }>();

  const id = params.id;
  const title = params.title || "Course Reader";
  const instructor = params.instructor || "Unknown Instructor";
  const category = params.category || "Development";

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { setProgress } = useCourseProgress();

  const chapters: Chapter[] = useMemo(() => {
    if (params.chapters) {
      try {
        return JSON.parse(params.chapters);
      } catch (e) {
        console.warn("Failed to parse chapters param", e);
      }
    }
    // Fallback dummy data if not provided (per prompt request)
    return [
      { id: 1, title: "Introduction", content: "Welcome to the course. In this chapter, you will learn the basics of iOS development and set up your environment." },
      { id: 2, title: "Swift Basics", content: "Learn Swift syntax, variables, constants, loops, and functions. Swift is the primary language for iOS apps." },
      { id: 3, title: "UIKit & Views", content: "Understand UIViewController, UIView, Auto Layout, and how to build interfaces programmatically and with Storyboard." },
      { id: 4, title: "Final Project", content: "Build a complete mini-app using everything you've learned. Submit your project for review." }
    ];
  }, [params.chapters]);

  // Generate HTML string directly with template literals using our abstracted template logic
  const htmlContent = useMemo(() => {
    return getCourseHtmlTemplate({
      courseTitle: title,
      instructorName: instructor,
      category: category,
      chapters: chapters,
    });
  }, [title, instructor, chapters]);

  // Handle messages from Web -> React Native
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case "CHAPTER_COMPLETE":
          const chapterCompleted = chapters.find(c => c.id === data.chapterId);
          console.log(`Chapter "${chapterCompleted?.title}" marked complete!`);
          
          const progressPercent = Math.round((data.completedCount / data.totalCount) * 100);
          setProgress(id, progressPercent);

          if (progressPercent === 100) {
            setTimeout(() => {
              Alert.alert("Congratulations! 🏆", "You have completed this entire course.", [
                { text: "Awesome!", onPress: () => router.back() }
              ]);
            }, 500);
          }
          break;
        case "LOG":
          console.log("[WebView Log]", data.payload);
          break;
      }
    } catch (e) {
      console.warn("Failed to parse message from WebView:", e);
    }
  }, [id, setProgress, chapters]);

  if (!id) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#64748B" />
        <Text style={styles.errorText}>Invalid Course ID</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.circleButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.circleButton}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* WebView */}
      {error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#475569" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>
            Something went wrong while loading the course content.
          </Text>
          <Pressable
            onPress={() => {
              setError(false);
              setLoading(true);
              webViewRef.current?.reload();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onMessage={handleMessage}
            style={styles.webview}
            bounces={false}
            javaScriptEnabled={true}
            startInLoadingState={true}
            
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error:", nativeEvent);
              setError(true);
              setLoading(false);
            }}

            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (nativeEvent.statusCode >= 400) {
                console.warn("WebView HTTP error:", nativeEvent.statusCode);
                setError(true);
              }
              setLoading(false);
            }}

            renderError={(errorDomain, errorCode, errorDesc) => (
              <WebViewErrorFallback
                errorCode={errorCode}
                errorDescription={errorDesc}
                onRetry={() => {
                  setError(false);
                  setLoading(true);
                  webViewRef.current?.reload();
                }}
              />
            )}

            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading course player...</Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function WebViewErrorFallback({
  errorCode,
  errorDescription,
  onRetry,
}: {
  errorCode: number;
  errorDescription: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorFallback}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>📡</Text>
      <Text style={styles.errorTitle}>Could not load content</Text>
      <Text style={styles.errorDescription}>
        {errorDescription || "Something went wrong loading this lesson."}
      </Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Reload Lesson</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#0F172A",
  },
  errorText: {
    color: "#94A3B8",
    fontSize: 18,
    marginTop: 16,
  },
  errorTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  errorMessage: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  linkText: {
    color: "#818CF8",
    fontSize: 14,
    fontWeight: "bold",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#6366F1",
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerTitle: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 16,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 12,
  },
  errorFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    padding: 32,
  },
  errorDescription: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
});
