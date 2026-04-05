import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { AuthState, LoginRequest, RegisterRequest, User } from "@/types";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "@/services/auth";
import api from "@/services/api";
import {
  setToken,
  getToken,
  setRefreshToken,
  setUserData,
  clearAll,
} from "@/services/storage";

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "RESTORE_SESSION":
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isLoginInProgress = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token = await getToken();

        if (!token) {
          if (isMounted) {
            dispatch({ type: "SET_LOADING", payload: false });
          }
          return;
        }

        try {
          const user = await getCurrentUser();
          if (isMounted) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            dispatch({
              type: "RESTORE_SESSION",
              payload: { user, token },
            });
          }
        } catch {
          await clearAll();
          if (isMounted) dispatch({ type: "LOGOUT" });
        }
      } catch {
        if (isMounted) dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    if (isLoginInProgress.current) return;
    isLoginInProgress.current = true;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await loginUser(credentials);

      await setToken(data.accessToken);
      if (data.refreshToken) {
        await setRefreshToken(data.refreshToken);
      }
      await setUserData(data.user);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.accessToken },
      });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    } finally {
      isLoginInProgress.current = false;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await registerUser(data);
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    await clearAll();
    delete api.defaults.headers.common["Authorization"];
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
