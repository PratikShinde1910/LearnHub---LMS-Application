import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchProducts,
  fetchInstructors,
  mapCourseData,
  type MappedCourse,
} from "@/services/courseService";

interface CourseState {
  courses: MappedCourse[];
  instructorPool: any[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

type CourseAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { courses: MappedCourse[]; hasMore: boolean; page: number } }
  | { type: "FETCH_MORE_SUCCESS"; payload: { courses: MappedCourse[]; hasMore: boolean; page: number } }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_SUCCESS"; payload: { courses: MappedCourse[]; hasMore: boolean } }
  | { type: "SET_COURSES"; payload: MappedCourse[] };

const CACHE_KEY = "lms_course_cache";

const initialState: CourseState = {
  courses: [],
  instructorPool: [],
  loading: true,
  refreshing: false,
  error: null,
  hasMore: true,
  page: 1,
};

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        courses: action.payload.courses,
        loading: false,
        error: null,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
      };
    case "FETCH_MORE_SUCCESS":
      return {
        ...state,
        courses: [...state.courses, ...action.payload.courses],
        loading: false,
        error: null,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, refreshing: false, error: action.payload };
    case "REFRESH_START":
      return { ...state, refreshing: true, error: null };
    case "REFRESH_SUCCESS":
      return {
        ...state,
        courses: action.payload.courses,
        refreshing: false,
        error: null,
        hasMore: action.payload.hasMore,
        page: 1,
      };
    case "SET_COURSES":
      return { ...state, courses: action.payload, loading: false };
    default:
      return state;
  }
}

interface CourseContextValue extends CourseState {
  fetchCourses: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  loadMoreCourses: () => Promise<void>;
  getCoursesByDomain: (domain: string) => MappedCourse[];
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);
  const instructorsRef = useRef<any[]>([]);
  const isFetchingRef = useRef(false);

  const cacheCourses = useCallback(async (courses: MappedCourse[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(courses));
    } catch {
    }
  }, []);

  const loadCachedCourses = useCallback(async (): Promise<MappedCourse[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? (JSON.parse(cached) as MappedCourse[]) : [];
    } catch {
      return [];
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    dispatch({ type: "FETCH_START" });

    try {
      const [productResult, userResult] = await Promise.all([
        fetchProducts(1, 20),
        fetchInstructors(30),
      ]);

      instructorsRef.current = userResult;

      const courses = productResult.products.map((p, i) =>
        mapCourseData(p, userResult[i % userResult.length])
      );

      dispatch({
        type: "FETCH_SUCCESS",
        payload: { courses, hasMore: productResult.hasMore, page: 1 },
      });
      await cacheCourses(courses);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load courses";
      const cached = await loadCachedCourses();
      if (cached.length > 0) {
        dispatch({ type: "SET_COURSES", payload: cached });
      } else {
        dispatch({ type: "FETCH_ERROR", payload: message });
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [cacheCourses, loadCachedCourses]);

  const refreshCourses = useCallback(async () => {
    dispatch({ type: "REFRESH_START" });
    try {
      const [productResult, userResult] = await Promise.all([
        fetchProducts(1, 20),
        fetchInstructors(30),
      ]);
      
      instructorsRef.current = userResult;
      const courses = productResult.products.map((p, i) => 
        mapCourseData(p, userResult[i % userResult.length])
      );

      dispatch({
        type: "REFRESH_SUCCESS",
        payload: { courses, hasMore: productResult.hasMore },
      });
      await cacheCourses(courses);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refresh failed";
      dispatch({ type: "FETCH_ERROR", payload: message });
    }
  }, [cacheCourses]);

  const loadMoreCourses = useCallback(async () => {
    if (!state.hasMore || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const nextPage = state.page + 1;
      const productResult = await fetchProducts(nextPage, 20);
      
      const users = instructorsRef.current.length > 0 ? instructorsRef.current : await fetchInstructors(30);
      if (instructorsRef.current.length === 0) instructorsRef.current = users;

      const newCourses = productResult.products.map((p, i) => 
        mapCourseData(p, users[i % users.length])
      );

      dispatch({
        type: "FETCH_MORE_SUCCESS",
        payload: { courses: newCourses, hasMore: productResult.hasMore, page: nextPage },
      });
      const allCourses = [...state.courses, ...newCourses];
      await cacheCourses(allCourses);
    } catch {
    } finally {
      isFetchingRef.current = false;
    }
  }, [state.hasMore, state.page, state.courses, cacheCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getCoursesByDomain = useCallback((domain: string) => {
    let domainCourses = state.courses.filter((c) => c.domain === domain);

    if (domainCourses.length < 5) {
      let needed = 5 - domainCourses.length;
      const otherCourses = state.courses.filter((c) => c.domain !== domain);

      const relatedDomain = 
        domain === "Technology" ? "Design" :
        domain === "Design" ? "Technology" :
        domain === "Lifestyle" ? "Health" : "Lifestyle";
        
      const closest = otherCourses.filter((c) => c.domain === relatedDomain).slice(0, needed);
      domainCourses = [...domainCourses, ...closest];
      
      if (domainCourses.length < 5) {
        needed = 5 - domainCourses.length;
        const randoms = otherCourses
          .filter((c) => !domainCourses.some((d) => d.id === c.id))
          .slice(0, needed);
        domainCourses = [...domainCourses, ...randoms];
      }
    }
    
    return domainCourses.slice(0, 5);
  }, [state.courses]);

  const value = useMemo<CourseContextValue>(
    () => ({
      ...state,
      fetchCourses,
      refreshCourses,
      loadMoreCourses,
      getCoursesByDomain,
    }),
    [state, fetchCourses, refreshCourses, loadMoreCourses, getCoursesByDomain]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return ctx;
}
