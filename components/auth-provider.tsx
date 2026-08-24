"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  api,
  ApiError,
  clearTokens,
  getAccessToken,
  setTokens,
} from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      if (!isAuthPage) router.replace("/login");
      return;
    }
    api
      .get<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
        if (!isAuthPage) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [isAuthPage, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>("/auth/login", { email, password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.push("/");
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post<{ success: boolean }>("/auth/logout");
    } catch (err) {
      /* ignore network errors on logout */ void err;
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
    } catch (err) {
      clearTokens();
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };