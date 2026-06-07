import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCurrentUser,
  loadCurrentUser,
  clearCurrentUser,
  saveUsers,
  loadUsers,
  findUser,
  registerUser,
  verifyLogin,
  ADMIN_CREDENTIALS,
} from "./store";

describe("Store - User Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Current User", () => {
    it("should save and load current user", () => {
      saveCurrentUser({ phone: "13800138000" });
      const user = loadCurrentUser();
      expect(user).toEqual({ phone: "13800138000" });
    });

    it("should return null when no current user", () => {
      expect(loadCurrentUser()).toBeNull();
    });

    it("should clear current user", () => {
      saveCurrentUser({ phone: "13800138000" });
      clearCurrentUser();
      expect(loadCurrentUser()).toBeNull();
    });
  });

  describe("User Registration", () => {
    it("should register a new user", () => {
      const result = registerUser("13800138000", "password123");
      expect(result.success).toBe(true);
      expect(findUser("13800138000")).toBeDefined();
    });

    it("should reject duplicate registration", () => {
      registerUser("13800138000", "password123");
      const result = registerUser("13800138000", "password456");
      expect(result.success).toBe(false);
      expect(result.error).toBe("该手机号已注册");
    });

    it("should store user with createdAt", () => {
      registerUser("13800138000", "password123");
      const user = findUser("13800138000");
      expect(user?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("User Login Verification", () => {
    it("should verify correct credentials", () => {
      registerUser("13800138000", "password123");
      const result = verifyLogin("13800138000", "password123");
      expect(result.success).toBe(true);
    });

    it("should reject non-existent user", () => {
      const result = verifyLogin("13800138000", "password123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("无该账号，请先注册");
    });

    it("should reject wrong password", () => {
      registerUser("13800138000", "password123");
      const result = verifyLogin("13800138000", "wrongpassword");
      expect(result.success).toBe(false);
      expect(result.error).toBe("密码错误");
    });
  });

  describe("Admin Credentials", () => {
    it("should have correct admin credentials", () => {
      expect(ADMIN_CREDENTIALS.username).toBe("admin");
      expect(ADMIN_CREDENTIALS.password).toBe("abc123");
    });
  });

  describe("User List", () => {
    it("should load and save users", () => {
      const users = [
        { phone: "13800138000", password: "pass1", createdAt: "2024-01-01" },
        { phone: "13900139000", password: "pass2", createdAt: "2024-01-02" },
      ];
      saveUsers(users);
      expect(loadUsers()).toEqual(users);
    });

    it("should find user by phone", () => {
      registerUser("13800138000", "password123");
      const user = findUser("13800138000");
      expect(user?.phone).toBe("13800138000");
    });

    it("should return undefined for non-existent user", () => {
      expect(findUser("99999999999")).toBeUndefined();
    });
  });
});
