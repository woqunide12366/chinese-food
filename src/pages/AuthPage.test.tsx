import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AuthPage from "./AuthPage";
import { AppProvider } from "../context/AppContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AuthPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderAuthPage = () =>
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthPage />
        </AppProvider>
      </BrowserRouter>
    );

  describe("Login Mode", () => {
    it("should render login form by default", () => {
      renderAuthPage();
      expect(screen.getByText("用户登录")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("请输入11位手机号")).toBeInTheDocument();
      expect(screen.getByText("登录")).toBeInTheDocument();
    });

    it("should show error for invalid phone number", async () => {
      renderAuthPage();
      const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
      const submitBtn = screen.getByText("登录");

      fireEvent.change(phoneInput, { target: { value: "123" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("手机号必须为11位数字")).toBeInTheDocument();
      });
    });

    it("should show error for empty password", async () => {
      renderAuthPage();
      const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
      const submitBtn = screen.getByText("登录");

      fireEvent.change(phoneInput, { target: { value: "13800138000" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("请输入密码")).toBeInTheDocument();
      });
    });

    it("should switch to register mode", () => {
      renderAuthPage();
      const switchBtn = screen.getByText("创建新账号");
      fireEvent.click(switchBtn);

      expect(screen.getByText("创建账号")).toBeInTheDocument();
      expect(screen.getByText("注册")).toBeInTheDocument();
    });

    it("should clear form when switching modes", () => {
      renderAuthPage();
      const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
      fireEvent.change(phoneInput, { target: { value: "13800138000" } });

      fireEvent.click(screen.getByText("创建新账号"));
      fireEvent.click(screen.getByText("去登录"));

      expect(phoneInput).toHaveValue("");
    });
  });

  describe("Register Mode", () => {
    it("should render register form", () => {
      renderAuthPage();
      fireEvent.click(screen.getByText("创建新账号"));

      expect(screen.getByText("创建账号")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("请再次输入密码")).toBeInTheDocument();
    });

    it("should show error for password mismatch", async () => {
      renderAuthPage();
      fireEvent.click(screen.getByText("创建新账号"));

      const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
      const passwordInput = screen.getByPlaceholderText("请输入密码");
      const confirmInput = screen.getByPlaceholderText("请再次输入密码");
      const submitBtn = screen.getByText("注册");

      fireEvent.change(phoneInput, { target: { value: "13800138000" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmInput, { target: { value: "password456" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("两次密码不一致")).toBeInTheDocument();
      });
    });

    it("should show error for short password", async () => {
      renderAuthPage();
      fireEvent.click(screen.getByText("创建新账号"));

      const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
      const passwordInput = screen.getByPlaceholderText("请输入密码");
      const submitBtn = screen.getByText("注册");

      fireEvent.change(phoneInput, { target: { value: "13800138000" } });
      fireEvent.change(passwordInput, { target: { value: "123" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("密码至少6位")).toBeInTheDocument();
      });
    });
  });

  describe("Password Visibility", () => {
    it("should toggle password visibility", () => {
      renderAuthPage();
      const passwordInput = screen.getByPlaceholderText("请输入密码");

      expect(passwordInput).toHaveAttribute("type", "password");

      // Find and click the eye button
      const eyeButton = screen.getAllByRole("button").find((btn) =>
        btn.querySelector("svg")
      );
      if (eyeButton) {
        fireEvent.click(eyeButton);
        expect(passwordInput).toHaveAttribute("type", "text");
      }
    });
  });
});
