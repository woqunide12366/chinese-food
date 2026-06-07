import { useState, useEffect } from "react";
import { FiHelpCircle, FiSend, FiUser, FiClock, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { messages as initialMessages } from "../data/messages";
import { useApp } from "../context/AppContext";
import type { Message } from "../types";

const STORAGE_KEY = "chinese-food-community-messages";

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((m: Message) => ({
        ...m,
        status: m.status || "approved",
      }));
    }
  } catch { /* ignore */ }
  return initialMessages.map((m) => ({ ...m, status: "approved" as const }));
}

function saveMessages(data: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function Community() {
  const { currentUser, isLoggedIn, userProfile } = useApp();
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // 登录用户自动填入用户名
  useEffect(() => {
    if (isLoggedIn && userProfile?.username) {
      setFormData((prev) => ({ ...prev, name: userProfile.username }));
    }
  }, [isLoggedIn, userProfile]);

  // 只显示已审核通过的提问
  const questionMessages = messages.filter((m) => m.type === "question" && m.status === "approved");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.name.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "question",
      name: isAnonymous ? "匿名用户" : formData.name.trim(),
      content: formData.content,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
      // 匿名提问保留原始用户名在contact中，仅管理员可见
      contact: isAnonymous ? formData.name.trim() : undefined,
    };

    setMessages([newMessage, ...messages]);
    setFormData({ name: isLoggedIn && userProfile?.username ? userProfile.username : "", content: "" });
    setIsAnonymous(false);
    setShowForm(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">提问交流区</h1>
          <p className="text-gray-500">
            提出您在烹饪过程中遇到的问题，与其他美食爱好者一起交流
          </p>
        </div>

        {/* 提交成功提示 */}
        {submitSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <FiCheckCircle className="w-5 h-5" />
            <span>提交成功，等待管理员审核通过后将显示在列表中</span>
          </div>
        )}

        {/* 发布按钮 */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FiSend className="w-4 h-4" />
            {showForm ? "取消发布" : "发布提问"}
          </button>
        </div>

        {/* 表单 */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  您的昵称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoggedIn}
                  className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${isLoggedIn ? "text-gray-500 cursor-not-allowed" : ""}`}
                  placeholder="请输入昵称"
                />
                {isLoggedIn && (
                  <p className="text-xs text-gray-400 mt-1">已自动填入您的用户名</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  问题描述 *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  placeholder="描述您的问题..."
                />
              </div>
              {/* 匿名选项 */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                {isAnonymous ? <FiEyeOff className="w-4 h-4 text-gray-500" /> : <FiEye className="w-4 h-4 text-gray-500" />}
                <span className="text-sm text-gray-600">匿名提问（审核通过后以"匿名用户"显示）</span>
              </label>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                提交后将进入审核，管理员审核通过后所有人可见
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                发布
              </button>
            </form>
          </div>
        )}

        {/* 问题列表 */}
        <div className="space-y-4">
          {questionMessages.length > 0 ? (
            questionMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <FiUser className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{msg.name}</span>
                        <span className="text-xs text-gray-400">{msg.createdAt}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{msg.content}</p>
                    {msg.reply && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-sm text-gray-500 mb-1">管理员回复：</p>
                        <p className="text-gray-700">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <FiHelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无问题</p>
              <p className="text-gray-400 text-sm mt-2">提出第一个烹饪问题吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
