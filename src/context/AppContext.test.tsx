import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AppProvider, useApp } from "./AppContext";
import type { ReactNode } from "react";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("AppContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockFetch.mockClear();
  });

  it("should provide default values", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isAdminLoggedIn).toBe(false);
    expect(result.current.searchQuery).toBe("");
  });

  it("should toggle favorite", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.toggleFavorite("dish-1");
    });

    expect(result.current.favorites).toContain("dish-1");
    expect(result.current.isFavorite("dish-1")).toBe(true);
  });

  it("should remove favorite when toggled again", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.toggleFavorite("dish-1");
      result.current.toggleFavorite("dish-1");
    });

    expect(result.current.favorites).not.toContain("dish-1");
    expect(result.current.isFavorite("dish-1")).toBe(false);
  });

  it("should update search query", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.setSearchQuery("红烧肉");
    });

    expect(result.current.searchQuery).toBe("红烧肉");
  });

  it("should handle admin login", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      const success = result.current.adminLogin("admin", "abc123");
      expect(success).toBe(true);
    });

    expect(result.current.isAdminLoggedIn).toBe(true);
  });

  it("should reject wrong admin credentials", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      const success = result.current.adminLogin("admin", "wrongpass");
      expect(success).toBe(false);
    });

    expect(result.current.isAdminLoggedIn).toBe(false);
  });

  it("should handle admin logout", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.adminLogin("admin", "abc123");
      result.current.adminLogout();
    });

    expect(result.current.isAdminLoggedIn).toBe(false);
  });

  it("should persist admin login in sessionStorage", () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.adminLogin("admin", "abc123");
    });

    expect(sessionStorage.getItem("admin-authenticated")).toBe("true");
  });

  it("should handle user login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        phone: "13800138000",
        username: "测试用户",
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        phone: "13800138000",
        username: "测试用户",
        region: "",
        signature: "",
        avatar: "",
      }),
    });

    const { result } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      const loginResult = await result.current.login("13800138000", "password123");
      expect(loginResult.success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.currentUser?.phone).toBe("13800138000");
  });

  it("should handle user logout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        phone: "13800138000",
        username: "测试用户",
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        phone: "13800138000",
        username: "测试用户",
        region: "",
        signature: "",
        avatar: "",
      }),
    });

    const { result } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      await result.current.login("13800138000", "password123");
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  it("should persist user login in localStorage", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        phone: "13800138000",
        username: "测试用户",
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        phone: "13800138000",
        username: "测试用户",
        region: "",
        signature: "",
        avatar: "",
      }),
    });

    const { result } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      await result.current.login("13800138000", "password123");
    });

    const stored = localStorage.getItem("chinese-food-current-user");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).phone).toBe("13800138000");
  });

  it("should isolate favorites between users", async () => {
    // Login as user A
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        phone: "13800138000",
        username: "用户A",
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        phone: "13800138000",
        username: "用户A",
        region: "",
        signature: "",
        avatar: "",
      }),
    });

    const { result, rerender } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      await result.current.login("13800138000", "pass123");
    });

    act(() => {
      result.current.toggleFavorite("dish-a");
    });

    expect(result.current.favorites).toContain("dish-a");

    // Logout
    act(() => {
      result.current.logout();
    });

    // Login as user B
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        phone: "13900139000",
        username: "用户B",
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        phone: "13900139000",
        username: "用户B",
        region: "",
        signature: "",
        avatar: "",
      }),
    });

    await act(async () => {
      await result.current.login("13900139000", "pass456");
    });

    // User B should not see A's favorites
    expect(result.current.favorites).not.toContain("dish-a");
    expect(result.current.isFavorite("dish-a")).toBe(false);
  });
});
