import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should load empty favorites for new user", () => {
    const { result } = renderHook(() => useFavorites("13800138000"));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite("dish-1")).toBe(false);
  });

  it("should toggle favorite on", () => {
    const { result } = renderHook(() => useFavorites("13800138000"));
    act(() => {
      result.current.toggleFavorite("dish-1");
    });
    expect(result.current.favorites).toContain("dish-1");
    expect(result.current.isFavorite("dish-1")).toBe(true);
  });

  it("should toggle favorite off", () => {
    const { result } = renderHook(() => useFavorites("13800138000"));
    act(() => {
      result.current.toggleFavorite("dish-1");
      result.current.toggleFavorite("dish-1");
    });
    expect(result.current.favorites).not.toContain("dish-1");
    expect(result.current.isFavorite("dish-1")).toBe(false);
  });

  it("should persist favorites to localStorage per user", () => {
    const { result: resultA } = renderHook(() => useFavorites("13800138000"));
    act(() => {
      resultA.current.toggleFavorite("dish-1");
    });

    // Verify A's data is saved
    const storedA = localStorage.getItem("chinese-food-favorites-13800138000");
    expect(storedA).toEqual(JSON.stringify(["dish-1"]));

    // B user should have empty favorites
    const { result: resultB } = renderHook(() => useFavorites("13900139000"));
    expect(resultB.current.favorites).toEqual([]);
    expect(resultB.current.isFavorite("dish-1")).toBe(false);
  });

  it("should load existing favorites from localStorage", () => {
    localStorage.setItem(
      "chinese-food-favorites-13800138000",
      JSON.stringify(["dish-1", "dish-2"])
    );
    const { result } = renderHook(() => useFavorites("13800138000"));
    expect(result.current.favorites).toEqual(["dish-1", "dish-2"]);
    expect(result.current.isFavorite("dish-1")).toBe(true);
    expect(result.current.isFavorite("dish-3")).toBe(false);
  });

  it("should switch favorites when phone changes", () => {
    // User A has favorites
    localStorage.setItem(
      "chinese-food-favorites-13800138000",
      JSON.stringify(["dish-a"])
    );
    // User B has different favorites
    localStorage.setItem(
      "chinese-food-favorites-13900139000",
      JSON.stringify(["dish-b"])
    );

    const { result, rerender } = renderHook(
      ({ phone }) => useFavorites(phone),
      { initialProps: { phone: "13800138000" } }
    );

    expect(result.current.favorites).toEqual(["dish-a"]);

    // Switch to user B
    rerender({ phone: "13900139000" });
    expect(result.current.favorites).toEqual(["dish-b"]);
  });

  it("should handle guest user (no phone)", () => {
    const { result } = renderHook(() => useFavorites(null));
    act(() => {
      result.current.toggleFavorite("dish-1");
    });
    const stored = localStorage.getItem("chinese-food-favorites-guest");
    expect(stored).toEqual(JSON.stringify(["dish-1"]));
  });

  it("should handle multiple toggles correctly", () => {
    const { result } = renderHook(() => useFavorites("13800138000"));
    act(() => {
      result.current.toggleFavorite("dish-1");
      result.current.toggleFavorite("dish-2");
      result.current.toggleFavorite("dish-3");
      result.current.toggleFavorite("dish-2"); // remove dish-2
    });
    expect(result.current.favorites).toEqual(["dish-1", "dish-3"]);
  });
});
