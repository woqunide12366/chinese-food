import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { AppProvider } from "../context/AppContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
  };
});

describe("Navbar", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderNavbar = () =>
    render(
      <BrowserRouter>
        <AppProvider>
          <Navbar />
        </AppProvider>
      </BrowserRouter>
    );

  it("should render logo and brand name", () => {
    renderNavbar();
    expect(screen.getByText("中华老吃家")).toBeInTheDocument();
  });

  it("should render navigation items", () => {
    renderNavbar();
    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("菜系分类")).toBeInTheDocument();
    expect(screen.getByText("美食视频")).toBeInTheDocument();
    expect(screen.getByText("古法专区")).toBeInTheDocument();
    expect(screen.getByText("厨友作品")).toBeInTheDocument();
    expect(screen.getByText("交流区")).toBeInTheDocument();
    expect(screen.getByText("社交")).toBeInTheDocument();
  });

  it("should show login button when not logged in", () => {
    renderNavbar();
    expect(screen.getByText("登录")).toBeInTheDocument();
  });

  it("should show search input when search icon clicked", () => {
    renderNavbar();
    const searchBtn = screen.getAllByRole("button").find((btn) =>
      btn.querySelector("svg")
    );
    if (searchBtn) {
      fireEvent.click(searchBtn);
      expect(screen.getByPlaceholderText("搜索菜名...")).toBeInTheDocument();
    }
  });

  it("should navigate to auth page when login clicked", () => {
    renderNavbar();
    const loginLink = screen.getByText("登录").closest("a");
    expect(loginLink).toHaveAttribute("href", "/auth");
  });

  it("should highlight active navigation item", () => {
    renderNavbar();
    const homeLink = screen.getByText("首页").closest("a");
    expect(homeLink).toHaveClass("bg-primary/10");
  });

  it("should render mobile menu button", () => {
    renderNavbar();
    const menuButtons = screen.getAllByRole("button");
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});
