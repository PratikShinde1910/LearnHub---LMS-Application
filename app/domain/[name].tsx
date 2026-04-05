import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '@/store/courseStore';
import { useBookmarksContext } from '@/store/bookmarkStore';
import { CourseCard } from '@/components/CourseCard';
import { EmptyState } from '@/components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

const DOMAINS = [
  { id: "Technology", label: "Technology", icon: "hardware-chip" as const, colors: ["#4F46E5", "#6366F1"] as readonly [string, string] },
  { id: "Design", label: "Design", icon: "color-palette" as const, colors: ["#F59E0B", "#FCD34D"] as readonly [string, string] },
  { id: "Lifestyle", label: "Lifestyle", icon: "leaf" as const, colors: ["#10B981", "#34D399"] as readonly [string, string] },
  { id: "Health", label: "Health", icon: "fitness" as const, colors: ["#EC4899", "#F472B6"] as readonly [string, string] },
];

export default function DomainScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { getCoursesByDomain } = useCourses();
  const { toggleBookmark, isBookmarked } = useBookmarksContext();

  const domainCourses = useMemo(() => {
    return getCoursesByDomain(name || "Lifestyle");
  }, [getCoursesByDomain, name]);
  
  const domainInfo = DOMAINS.find(d => d.id === name) || DOMAINS[2];

  const renderHeader = () => (
    <LinearGradient colors={domainInfo.colors} style={styles.headerGradient}>
       <SafeAreaView edges={['top']}>
         <View style={styles.headerContent}>
           <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
             <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
           </Pressable>
           <Ionicons name={domainInfo.icon} size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
           <Text style={styles.headerTitle}>{domainInfo.label} Courses</Text>
         </View>
       </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={domainCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={(c) => router.push({ pathname: "/course/[id]", params: { id: c.id } })}
            onBookmark={(id) => toggleBookmark(id)}
            isBookmarked={isBookmarked(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState 
             icon="book-outline" 
             title="No Courses" 
             message={`We couldn't find any courses for ${name}.`} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  }
});
