import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

interface EnrollButtonProps {
  isEnrolled: boolean;
  onEnroll: () => void;
  onStartCourse: () => void;
  loading?: boolean;
  justEnrolled?: boolean;
}

function EnrollButtonComponent({
  isEnrolled,
  onEnroll,
  onStartCourse,
  loading = false,
  justEnrolled = false,
}: EnrollButtonProps) {
  return (
    <View style={styles.container}>
      {isEnrolled ? (
        <Button
          title={justEnrolled ? "Enrolled 🎉" : "Continue Learning"}
          onPress={onStartCourse}
          variant="secondary"
          disabled={justEnrolled}
          icon={<Ionicons name={justEnrolled ? "checkmark-circle" : "play"} size={18} color="#FFFFFF" />}
        />
      ) : (
        <Button
          title="Enroll Now"
          onPress={onEnroll}
          loading={loading}
          disabled={loading}
          icon={<Ionicons name="school-outline" size={18} color="#FFFFFF" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
});

export const EnrollButton = memo(EnrollButtonComponent);
