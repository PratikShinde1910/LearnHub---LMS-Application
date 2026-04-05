import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

interface ProfileAvatarProps {
  user: {
    username?: string;
    avatar?: { url?: string };
  } | null;
}

const AVATAR_URI_KEY = "profile_picture_uri";

export function ProfileAvatar({ user }: ProfileAvatarProps) {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    const loadLocalAvatar = async () => {
      const uri = await AsyncStorage.getItem(AVATAR_URI_KEY);
      if (uri) setLocalUri(uri);
    };
    loadLocalAvatar();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo access to update your avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalUri(uri);
      await AsyncStorage.setItem(AVATAR_URI_KEY, uri);
    }
  };

  const initial = user?.username?.charAt(0).toUpperCase() || "U";
  const displayUri = localUri || user?.avatar?.url;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            style={styles.placeholder}
          >
            <Text style={styles.initial}>{initial}</Text>
          </LinearGradient>
        )}

        <Pressable style={styles.editBadge} onPress={pickImage}>
          <Ionicons name="camera" size={14} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4F46E5",
    position: "relative",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0F172A",
  },
});
