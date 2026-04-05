import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { User } from "@/types";

// ─── Token Storage ──────────────────────────────────────────────────────────

const TOKEN_KEY = "lms_auth_token";
const REFRESH_TOKEN_KEY = "lms_refresh_token";

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(`secure_${key}`, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(`secure_${key}`);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(`secure_${key}`);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function setToken(token: string): Promise<void> {
  await secureSet(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  try {
    return await secureGet(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await secureDelete(TOKEN_KEY);
  } catch {
    // Ignore errors when deleting
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  await secureSet(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await secureGet(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function removeRefreshToken(): Promise<void> {
  try {
    await secureDelete(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore errors when deleting
  }
}

// ─── Async Storage (App Data) ───────────────────────────────────────────────

const USER_KEY = "lms_user_data";
const BOOKMARKS_KEY = "lms_bookmarks";

export async function setUserData(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUserData(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? (JSON.parse(data) as User) : null;
  } catch {
    return null;
  }
}

export async function removeUserData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch {
    // Ignore
  }
}

export async function getBookmarks(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return data ? (JSON.parse(data) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setBookmarks(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
}

// ─── Clear All ──────────────────────────────────────────────────────────────

export async function clearAll(): Promise<void> {
  try {
    await Promise.all([
      removeToken(),
      removeRefreshToken(),
      removeUserData(),
    ]);
  } catch {
    // Ignore errors during cleanup
  }
}
