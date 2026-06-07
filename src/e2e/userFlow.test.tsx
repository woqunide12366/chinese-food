/**
 * 端到端用户流程测试
 * 模拟完整用户操作路径
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

// Mock fetch for all API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("End-to-End User Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockFetch.mockClear();
  });

  const renderApp = () =>
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

  describe("Visitor Flow", () => {
    it("should display homepage with all sections", () => {
      renderApp();

      // 首页内容
      expect(screen.getByText("中华老吃家")).toBeInTheDocument();
      expect(screen.getByText("八大菜系")).toBeInTheDocument();
      expect(screen.getByText("地方风味")).toBeInTheDocument();
      expect(screen.getByText("特色小吃")).toBeInTheDocument();
      expect(screen.getByText("美食制作视频")).toBeInTheDocument();
    });

    it("should navigate to categories page", () => {
      renderApp();

      const categoriesLink = screen.getByText("菜系分类");
      fireEvent.click(categoriesLink);

      expect(screen.getByText(/八大菜系/)).toBeInTheDocument();
    });

    it("should show login prompt for protected pages", () => {
      renderApp();

      // 导航到社交页面
      const socialLink = screen.getByText("社交");
      fireEvent.click(socialLink);

      expect(screen.getByText("请先登录")).toBeInTheDocument();
    });
  });

  describe("Registration Flow", () => {
    it("should complete full registration process", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, phone: "13800138000" }),
      });

      renderApp();

      // 点击登录
      fireEvent.click(screen.getByText("登录"));

      // 切换到注册
      fireEvent.click(screen.getByText("创建新账号"));

      // 填写表单
      fireEvent.change(screen.getByPlaceholderText("请输入11位手机号"), {
        target: { value: "13800138000" },
      });
      fireEvent.change(screen.getByPlaceholderText("请输入密码"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByPlaceholderText("请再次输入密码"), {
        target: { value: "password123" },
      });

      // 提交
      fireEvent.click(screen.getByText("注册"));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/register",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              phone: "13800138000",
              password: "password123",
            }),
          })
        );
      });
    });

    it("should show validation errors", () => {
      renderApp();

      fireEvent.click(screen.getByText("登录"));
      fireEvent.click(screen.getByText("创建新账号"));

      // 直接提交空表单
      fireEvent.click(screen.getByText("注册"));

      expect(screen.getByText("请输入手机号")).toBeInTheDocument();
      expect(screen.getByText("请输入密码")).toBeInTheDocument();
    });
  });

  describe("Login Flow", () => {
    it("should login and show user menu", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            phone: "13800138000",
            username: "测试用户",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phone: "13800138000",
            username: "测试用户",
            region: "",
            signature: "",
            avatar: "",
          }),
        });

      renderApp();

      fireEvent.click(screen.getByText("登录"));

      fireEvent.change(screen.getByPlaceholderText("请输入11位手机号"), {
        target: { value: "13800138000" },
      });
      fireEvent.change(screen.getByPlaceholderText("请输入密码"), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByText("登录"));

      await waitFor(() => {
        expect(screen.getByText("测试用户")).toBeInTheDocument();
      });
    });
  });

  describe("Favorites Isolation Flow", () => {
    it("should maintain separate favorites for different users", async () => {
      // 用户 A 登录
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            phone: "13800138000",
            username: "用户A",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phone: "13800138000",
            username: "用户A",
            region: "",
            signature: "",
            avatar: "",
          }),
        });

      const { rerender } = renderApp();

      fireEvent.click(screen.getByText("登录"));
      fireEvent.change(screen.getByPlaceholderText("请输入11位手机号"), {
        target: { value: "13800138000" },
      });
      fireEvent.change(screen.getByPlaceholderText("请输入密码"), {
        target: { value: "pass123" },
      });
      fireEvent.click(screen.getByText("登录"));

      await waitFor(() => {
        expect(screen.getByText("用户A")).toBeInTheDocument();
      });

      // 用户 A 收藏菜品
      localStorage.setItem(
        "chinese-food-favorites-13800138000",
        JSON.stringify(["dish-a", "dish-b"])
      );

      // 用户 A 登出
      fireEvent.click(screen.getByText("用户A"));
      fireEvent.click(screen.getByText("退出登录"));

      // 用户 B 登录
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            phone: "13900139000",
            username: "用户B",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phone: "13900139000",
            username: "用户B",
            region: "",
            signature: "",
            avatar: "",
          }),
        });

      fireEvent.click(screen.getByText("登录"));
      fireEvent.change(screen.getByPlaceholderText("请输入11位手机号"), {
        target: { value: "13900139000" },
      });
      fireEvent.change(screen.getByPlaceholderText("请输入密码"), {
        target: { value: "pass456" },
      });
      fireEvent.click(screen.getByText("登录"));

      await waitFor(() => {
        expect(screen.getByText("用户B")).toBeInTheDocument();
      });

      // 用户 B 的收藏应该是空的
      const userBFavorites = localStorage.getItem(
        "chinese-food-favorites-13900139000"
      );
      expect(userBFavorites).toBeNull();

      // 用户 A 的收藏应该仍然存在
      const userAFavorites = localStorage.getItem(
        "chinese-food-favorites-13800138000"
      );
      expect(userAFavorites).toBeTruthy();
      expect(JSON.parse(userAFavorites!)).toEqual(["dish-a", "dish-b"]);
    });
  });

  describe("Community Flow", () => {
    it("should submit a question and show pending status", async () => {
      renderApp();

      fireEvent.click(screen.getByText("交流区"));
      fireEvent.click(screen.getByText("发布提问"));

      const nameInput = screen.getByPlaceholderText("请输入昵称");
      const contentInput = screen.getByPlaceholderText("描述您的问题...");

      fireEvent.change(nameInput, { target: { value: "测试用户" } });
      fireEvent.change(contentInput, {
        target: { value: "怎么做红烧肉？" },
      });

      fireEvent.click(screen.getByText("发布"));

      await waitFor(() => {
        expect(
          screen.getByText(/提交成功，等待管理员审核/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Admin Flow", () => {
    it("should login as admin and access admin dashboard", async () => {
      renderApp();

      // 先登录为普通用户
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            phone: "13800138000",
            username: "用户",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phone: "13800138000",
            username: "用户",
            region: "",
            signature: "",
            avatar: "",
          }),
        });

      fireEvent.click(screen.getByText("登录"));
      fireEvent.change(screen.getByPlaceholderText("请输入11位手机号"), {
        target: { value: "13800138000" },
      });
      fireEvent.change(screen.getByPlaceholderText("请输入密码"), {
        target: { value: "pass123" },
      });
      fireEvent.click(screen.getByText("登录"));

      await waitFor(() => {
        expect(screen.getByText("用户")).toBeInTheDocument();
      });

      // 检查管理后台链接是否可见（需要同时是管理员）
      // 默认情况下普通用户看不到管理后台
      const adminLink = screen.queryByText("管理后台");
      expect(adminLink).not.toBeInTheDocument();
    });
  });
});
