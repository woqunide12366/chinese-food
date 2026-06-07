import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loadSubmissions,
  createSubmission,
  updateSubmissionStatus,
  deleteSubmission,
  apiRegister,
  apiLogin,
  getProfile,
  updateProfile,
} from "./api";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Module", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Submissions", () => {
    it("should load submissions successfully", async () => {
      const mockData = [
        {
          id: "sub-1",
          author: "测试用户",
          title: "测试作品",
          description: "描述",
          images: [],
          videos: [],
          tags: [],
          region: "四川",
          likes: 0,
          comments: [],
          createdAt: "2024-01-01",
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await loadSubmissions();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith("/api/submissions");
    });

    it("should return empty array on load error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const result = await loadSubmissions();
      expect(result).toEqual([]);
    });

    it("should create submission successfully", async () => {
      const formData = new FormData();
      formData.append("title", "新作品");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: "sub-new" }),
      });

      const result = await createSubmission(formData);
      expect(result.success).toBe(true);
      expect(result.id).toBe("sub-new");
    });

    it("should handle create submission failure", async () => {
      const formData = new FormData();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "创建失败" }),
      });

      const result = await createSubmission(formData);
      expect(result.success).toBe(false);
    });

    it("should update submission status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await updateSubmissionStatus("sub-1", "approved");
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/submissions/sub-1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ status: "approved" }),
        })
      );
    });

    it("should delete submission", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await deleteSubmission("sub-1");
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/submissions/sub-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Authentication", () => {
    it("should register user successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiRegister("13800138000", "password123");
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ phone: "13800138000", password: "password123" }),
        })
      );
    });

    it("should handle registration error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "手机号已注册" }),
      });

      const result = await apiRegister("13800138000", "password123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("手机号已注册");
    });

    it("should login user successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          phone: "13800138000",
          username: "测试用户",
        }),
      });

      const result = await apiLogin("13800138000", "password123");
      expect(result.success).toBe(true);
      expect(result.phone).toBe("13800138000");
      expect(result.username).toBe("测试用户");
    });

    it("should handle login failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "密码错误" }),
      });

      const result = await apiLogin("13800138000", "wrongpass");
      expect(result.success).toBe(false);
      expect(result.error).toBe("密码错误");
    });
  });

  describe("Profile", () => {
    it("should get profile successfully", async () => {
      const mockProfile = {
        phone: "13800138000",
        username: "测试用户",
        region: "四川",
        signature: "爱吃美食",
        avatar: "/uploads/avatar.jpg",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await getProfile("13800138000");
      expect(result).toEqual(mockProfile);
    });

    it("should return null on profile error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const result = await getProfile("13800138000");
      expect(result).toBeNull();
    });

    it("should update profile", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await updateProfile("13800138000", {
        username: "新用户名",
        region: "广东",
      });
      expect(result).toEqual({ success: true });
    });
  });
});
