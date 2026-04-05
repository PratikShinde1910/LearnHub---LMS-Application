import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function AppIndex() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
