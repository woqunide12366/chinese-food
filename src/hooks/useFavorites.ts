import { useState, useEffect, useCallback } from "react";

function getStorageKey(phone?: string | null): string {
  if (phone) {
    return `chinese-food-favorites-${phone}`;
  }
  return "chinese-food-favorites-guest";
}

function loadFavorites(phone?: string | null): string[] {
  try {
    const stored = localStorage.getItem(getStorageKey(phone));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useFavorites(phone?: string | null) {
  // 当 phone 变化时，重新加载该用户的收藏数据
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites(phone));

  useEffect(() => {
    setFavorites(loadFavorites(phone));
  }, [phone]);

  // 保存到对应用户的 localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(phone), JSON.stringify(favorites));
  }, [favorites, phone]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
