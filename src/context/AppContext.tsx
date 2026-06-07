import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { apiRegister, apiLogin, getProfile } from "../api";
import {
  saveCurrentUser,
  clearCurrentUser,
  loadCurrentUser,
  ADMIN_CREDENTIALS,
  type CurrentUserInfo,
} from "../store";

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: CurrentUserInfo | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  userProfile: { username: string; region: string; signature: string; avatar?: string } | null;
  // Admin auth
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUserInfo | null>(loadCurrentUser);
  const { favorites, toggleFavorite, isFavorite } = useFavorites(currentUser?.phone);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{ username: string; region: string; signature: string; avatar?: string } | null>(null);

  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin-authenticated") === "true";
  });

  // 刷新后自动恢复登录状态并获取资料
  useEffect(() => {
    const saved = loadCurrentUser();
    if (saved?.phone) {
      getProfile(saved.phone).then((p) => {
        if (p) setUserProfile({ username: p.username || "", region: p.region || "", signature: p.signature || "", avatar: p.avatar || "" });
      });
    }
  }, []);

  const adminLogin = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("admin-authenticated", "true");
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("admin-authenticated");
  }, []);

  const fetchProfile = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`/api/profile/${phone}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile({ username: data.username || "", region: data.region || "", signature: data.signature || "", avatar: data.avatar || "" });
      }
    } catch {}
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const result = await apiLogin(phone, password);
    if (result.success) {
      const info: CurrentUserInfo = { phone };
      saveCurrentUser(info);
      setCurrentUser(info);
      await fetchProfile(phone);
    }
    return result;
  }, [fetchProfile]);

  const register = useCallback(async (phone: string, password: string) => {
    const result = await apiRegister(phone, password);
    if (result.success) {
      const info: CurrentUserInfo = { phone };
      saveCurrentUser(info);
      setCurrentUser(info);
      setUserProfile({ username: `用户${phone.slice(-4)}`, region: "", signature: "" });
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    clearCurrentUser();
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (currentUser?.phone) await fetchProfile(currentUser.phone);
  }, [currentUser, fetchProfile]);

  return (
    <AppContext.Provider
      value={{
        favorites, toggleFavorite, isFavorite,
        searchQuery, setSearchQuery,
        currentUser, isLoggedIn: currentUser !== null,
        login, register, logout,
        refreshProfile, userProfile,
        isAdminLoggedIn, adminLogin, adminLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
