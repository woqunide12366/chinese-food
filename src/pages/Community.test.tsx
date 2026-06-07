import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Community from "./Community";
import { AppProvider } from "../context/AppContext";
import { BrowserRouter } from "react-router-dom";

// Mock AppContext for testing
const mockUserProfile = { username: "测试用户", region: "", signature: "" };

describe("Community", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderCommunity = () =>
    render(
      <BrowserRouter>
        <AppProvider>
          <Community />
        </AppProvider>
      </BrowserRouter>
    );

  it("should render community page with title", () => {
    renderCommunity();
    expect(screen.getByText("提问交流区")).toBeInTheDocument();
    expect(screen.getByText(/提出您在烹饪过程中遇到的问题/)).toBeInTheDocument();
  });

  it("should show publish button", () => {
    renderCommunity();
    expect(screen.getByText("发布提问")).toBeInTheDocument();
  });

  it("should toggle form visibility", () => {
    renderCommunity();
    const publishBtn = screen.getByText("发布提问");

    fireEvent.click(publishBtn);
    expect(screen.getByText("取消发布")).toBeInTheDocument();
    expect(screen.getByText("问题描述")).toBeInTheDocument();

    fireEvent.click(screen.getByText("取消发布"));
    expect(screen.getByText("发布提问")).toBeInTheDocument();
  });

  it("should show empty state when no questions", () => {
    renderCommunity();
    // Clear any initial data
    localStorage.removeItem("chinese-food-community-messages");

    expect(screen.getByText("暂无问题")).toBeInTheDocument();
    expect(screen.getByText("提出第一个烹饪问题吧！")).toBeInTheDocument();
  });

  it("should show anonymous option in form", () => {
    renderCommunity();
    fireEvent.click(screen.getByText("发布提问"));

    expect(
      screen.getByText(/匿名提问（审核通过后以"匿名用户"显示）/)
    ).toBeInTheDocument();
  });

  it("should show pending approval message after submit", async () => {
    renderCommunity();
    fireEvent.click(screen.getByText("发布提问"));

    const nameInput = screen.getByPlaceholderText("请输入昵称");
    const contentInput = screen.getByPlaceholderText("描述您的问题...");
    const submitBtn = screen.getByText("发布");

    fireEvent.change(nameInput, { target: { value: "测试用户" } });
    fireEvent.change(contentInput, { target: { value: "如何做菜？" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/提交成功，等待管理员审核通过后将显示在列表中/)
      ).toBeInTheDocument();
    });
  });

  it("should validate required fields", () => {
    renderCommunity();
    fireEvent.click(screen.getByText("发布提问"));

    const submitBtn = screen.getByText("发布");
    fireEvent.click(submitBtn);

    // HTML5 validation should prevent submission
    expect(screen.getByPlaceholderText("请输入昵称")).toBeRequired();
    expect(screen.getByPlaceholderText("描述您的问题...")).toBeRequired();
  });

  it("should show admin reply if exists", () => {
    // Pre-populate with a message that has a reply
    const messages = [
      {
        id: "msg-1",
        type: "question",
        name: "用户A",
        content: "怎么做红烧肉？",
        createdAt: "2024-01-01",
        status: "approved",
        reply: "先焯水，再炒糖色...",
      },
    ];
    localStorage.setItem("chinese-food-community-messages", JSON.stringify(messages));

    renderCommunity();

    expect(screen.getByText("怎么做红烧肉？")).toBeInTheDocument();
    expect(screen.getByText("管理员回复：")).toBeInTheDocument();
    expect(screen.getByText("先焯水，再炒糖色...")).toBeInTheDocument();
  });
});
