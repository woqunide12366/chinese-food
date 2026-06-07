import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiX,
  FiTrash2,
  FiEye,
  FiShield,
  FiImage,
  FiVideo,
  FiPlay,
  FiMessageSquare,
  FiUser,
  FiClock,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { loadSubmissions as apiLoad, updateSubmissionStatus, deleteSubmission as apiDelete } from "../api";
import type { Submission } from "../types/submission";
import type { Message } from "../types";

const MESSAGES_KEY = "chinese-food-community-messages";

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveMessages(data: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(data));
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdminLoggedIn, adminLogout } = useApp();

  // Tab state
  const [activeTab, setActiveTab] = useState<"works" | "questions">("works");

  // Works data
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Questions data
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionFilter, setQuestionFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  useEffect(() => {
    apiLoad().then((data) => setSubmissions(data));
    setMessages(loadMessages());
  }, []);

  const handleApprove = async (id: string) => {
    await updateSubmissionStatus(id, "approved");
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
    );
  };

  const handleReject = async (id: string) => {
    await updateSubmissionStatus(id, "rejected");
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
  };

  const handleDelete = async (id: string) => {
    await apiDelete(id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
    if (selectedSub?.id === id) setSelectedSub(null);
  };

  // Question handlers
  const handleApproveQuestion = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, status: "approved" as const } : m));
    setMessages(updated);
    saveMessages(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const handleRejectQuestion = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, status: "rejected" as const } : m));
    setMessages(updated);
    saveMessages(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const filteredSubs = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    return (s.status || "approved") === statusFilter;
  });

  const filteredQuestions = messages
    .filter((m) => m.type === "question")
    .filter((m) => {
      if (questionFilter === "all") return true;
      return (m.status || "approved") === questionFilter;
    });

  if (!isAdminLoggedIn) {
    navigate("/admin-login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiShield className="w-6 h-6 text-red-500" />
              管理后台
            </h1>
            <p className="text-gray-500 mt-1">审核用户发布的作品和提问</p>
          </div>
          <button
            onClick={() => {
              adminLogout();
              navigate("/");
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            退出管理
          </button>
        </div>

        {/* Tab Switch */}
        <div className="bg-white rounded-xl p-2 shadow-sm mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("works")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "works"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiImage className="w-4 h-4" />
            审核作品
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {submissions.filter((s) => s.status === "pending").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "questions"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            审核提问
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {messages.filter((m) => m.type === "question" && m.status === "pending").length}
            </span>
          </button>
        </div>

        {/* ====== 审核作品 ====== */}
        {activeTab === "works" && (
          <>
            {/* 审核筛选 */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === f
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {f === "all" ? "全部" : f === "pending" ? "待审核" : f === "approved" ? "已通过" : "已拒绝"}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubs.map((sub) => (
                <div key={sub.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Media */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {sub.images.length > 0 ? (
                      <img
                        src={sub.images[0]}
                        alt={sub.title}
                        className="w-full h-full object-cover"
                      />
                    ) : sub.videos.length > 0 ? (
                      <video
                        src={sub.videos[0]}
                        preload="metadata"
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiImage className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (sub.status || "approved") === "pending"
                            ? "bg-yellow-500 text-white"
                            : (sub.status || "approved") === "approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {(sub.status || "approved") === "pending" ? "审核中" : (sub.status || "approved") === "approved" ? "已通过" : "已拒绝"}
                      </span>
                    </div>
                    {/* Video indicator */}
                    {sub.videos.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FiVideo className="w-3 h-3" />
                        视频
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{sub.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sub.description}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                      <span>作者：{sub.author}</span>
                      <span>{sub.createdAt}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        查看
                      </button>
                      {(sub.status || "approved") === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(sub.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            通过
                          </button>
                          <button
                            onClick={() => handleReject(sub.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                          >
                            <FiX className="w-3.5 h-3.5" />
                            拒绝
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(sub.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSubs.length === 0 && (
              <div className="text-center py-16">
                <FiShield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">暂无{statusFilter === "all" ? "" : statusFilter === "pending" ? "待审核" : statusFilter === "approved" ? "已通过" : "已拒绝"}作品</p>
              </div>
            )}
          </>
        )}

        {/* ====== 审核提问 ====== */}
        {activeTab === "questions" && (
          <>
            {/* 提问筛选 */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setQuestionFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      questionFilter === f
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {f === "all" ? "全部" : f === "pending" ? "待审核" : f === "approved" ? "已通过" : "已拒绝"}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((msg) => (
                <div key={msg.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            <FiUser className="w-3 h-3 text-primary" />
                          </div>
                          <span className="font-medium text-gray-900">{msg.name}</span>
                          {msg.contact && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              实名：{msg.contact}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{msg.createdAt}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              (msg.status || "approved") === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : (msg.status || "approved") === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {(msg.status || "approved") === "pending" ? "待审核" : (msg.status || "approved") === "approved" ? "已通过" : "已拒绝"}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">{msg.content}</p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedMsg(msg)}
                          className="flex items-center justify-center gap-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          查看
                        </button>
                        {(msg.status || "approved") === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveQuestion(msg.id)}
                              className="flex items-center justify-center gap-1 py-2 px-4 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                              通过
                            </button>
                            <button
                              onClick={() => handleRejectQuestion(msg.id)}
                              className="flex items-center justify-center gap-1 py-2 px-4 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                            >
                              <FiX className="w-3.5 h-3.5" />
                              拒绝
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(msg.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-16">
                <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">暂无{questionFilter === "all" ? "" : questionFilter === "pending" ? "待审核" : questionFilter === "approved" ? "已通过" : "已拒绝"}提问</p>
              </div>
            )}
          </>
        )}

        {/* Detail Modal - Works */}
        {selectedSub && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSub(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedSub.title}</h2>
                  <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <span>作者：{selectedSub.author}</span>
                  <span>地区：{selectedSub.region}</span>
                  <span>{selectedSub.createdAt}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    (selectedSub.status || "approved") === "pending" ? "bg-yellow-100 text-yellow-700" :
                    (selectedSub.status || "approved") === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {(selectedSub.status || "approved") === "pending" ? "审核中" : (selectedSub.status || "approved") === "approved" ? "已通过" : "已拒绝"}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{selectedSub.description}</p>
                {selectedSub.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSub.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
                {/* Media display */}
                {selectedSub.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSub.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-32 h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                {selectedSub.videos.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {selectedSub.videos.map((video, i) => (
                      <video key={i} src={video} controls className="w-full rounded-lg" preload="metadata" />
                    ))}
                  </div>
                )}
                {(selectedSub.status || "approved") === "pending" && (
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { handleApprove(selectedSub.id); setSelectedSub(null); }}
                      className="flex-1 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                      <FiCheck className="w-4 h-4 inline mr-1" />通过并发布
                    </button>
                    <button onClick={() => { handleReject(selectedSub.id); setSelectedSub(null); }}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                      <FiX className="w-4 h-4 inline mr-1" />不通过
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal - Questions */}
        {selectedMsg && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMsg(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">提问详情</h2>
                <button onClick={() => setSelectedMsg(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <FiUser className="w-4 h-4" />
                <span>{selectedMsg.name}</span>
                <FiClock className="w-4 h-4 ml-2" />
                <span>{selectedMsg.createdAt}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  (selectedMsg.status || "approved") === "pending" ? "bg-yellow-100 text-yellow-700" :
                  (selectedMsg.status || "approved") === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {(selectedMsg.status || "approved") === "pending" ? "待审核" : (selectedMsg.status || "approved") === "approved" ? "已通过" : "已拒绝"}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">{selectedMsg.content}</p>
              {(selectedMsg.status || "approved") === "pending" && (
                <div className="flex gap-3">
                  <button onClick={() => { handleApproveQuestion(selectedMsg.id); setSelectedMsg(null); }}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                    <FiCheck className="w-4 h-4 inline mr-1" />通过
                  </button>
                  <button onClick={() => { handleRejectQuestion(selectedMsg.id); setSelectedMsg(null); }}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                    <FiX className="w-4 h-4 inline mr-1" />拒绝
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <FiTrash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">确认删除？</h3>
                <p className="text-sm text-gray-500 mb-6">删除后无法恢复</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600">删除</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
