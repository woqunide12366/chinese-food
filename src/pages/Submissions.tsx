import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiMapPin,
  FiTag,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiSend,
  FiImage,
  FiVideo,
  FiPlus,
  FiTrash2,
  FiFlag,
  FiThumbsDown,
  FiEyeOff,
  FiClock,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { loadSubmissions as apiLoad, createSubmission, deleteSubmission as apiDelete, getProfile } from "../api";
import type { Submission, Comment } from "../types/submission";

const regions = ["全部", "四川", "广东", "江苏", "浙江", "福建", "湖南", "山东", "其他"];
const LIKED_KEY = "chinese-food-liked-submissions";
const DISLIKED_KEY = "chinese-food-disliked-submissions";
const REPORTED_KEY = "chinese-food-reported-submissions";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export default function Submissions() {
  const { currentUser, isLoggedIn } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("全部");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentImages, setCommentImages] = useState<string[]>([]);
  const [commentIsAnonymous, setCommentIsAnonymous] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(() => loadSet(LIKED_KEY));
  const [dislikedSet, setDislikedSet] = useState<Set<string>>(() => loadSet(DISLIKED_KEY));
  const [reportedSet, setReportedSet] = useState<Set<string>>(() => loadSet(REPORTED_KEY));
  const [showReportConfirm, setShowReportConfirm] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const commentImageRef = useRef<HTMLInputElement>(null);
  const fileRefs = useRef<{ images: File[]; videos: File[] }>({ images: [], videos: [] });

  const [uploadForm, setUploadForm] = useState({
    author: "",
    title: "",
    description: "",
    region: "四川",
    tags: "",
    previewImages: [] as string[],
    previewVideos: [] as string[],
    isAnonymous: false,
  });

  // 用户头像缓存
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});

  // 从服务器加载作品
  useEffect(() => {
    apiLoad().then((data) => {
      setSubmissions(data);
      setLoading(false);
      // 加载作品作者头像
      const phones = new Set<string>();
      data.forEach((s) => { if (s.userId) phones.add(s.userId); });
      phones.forEach((phone) => {
        getProfile(phone).then((p) => {
          if (p?.avatar) {
            setUserAvatars((prev) => ({ ...prev, [phone]: p.avatar }));
          }
        });
      });
    });
  }, []);

  // 持久化 liked/disliked/reported
  useEffect(() => { saveSet(LIKED_KEY, likedSet); }, [likedSet]);
  useEffect(() => { saveSet(DISLIKED_KEY, dislikedSet); }, [dislikedSet]);
  useEffect(() => { saveSet(REPORTED_KEY, reportedSet); }, [reportedSet]);

  // 过滤：已通过的/审核中所有用户可见，已拒绝仅投稿者自己可见
  const filtered = useMemo(() => {
    let result = submissions.filter((s) => {
      // 已通过和审核中 -> 所有人可见
      if (s.status === "approved" || s.status === "pending" || !s.status) return true;
      // 已拒绝 -> 仅投稿者自己可见
      if (s.status === "rejected" && s.userId && s.userId === currentUser?.phone) return true;
      // 旧数据（无userId）且为 rejected 也隐藏
      if (s.status === "rejected" && !s.userId) return false;
      return false;
    });

    if (selectedRegion !== "全部") {
      result = result.filter((s) => s.region === selectedRegion);
    }
    return result;
  }, [submissions, selectedRegion, currentUser]);

  const handleLike = useCallback((id: string) => {
    const isLiked = likedSet.has(id);
    const isDisliked = dislikedSet.has(id);
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        let delta = 0;
        if (isLiked) delta = -1;
        else delta = 1 + (isDisliked ? 1 : 0);
        return { ...s, likes: Math.max(0, s.likes + delta) };
      })
    );
    setLikedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isDisliked) {
      setDislikedSet((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [likedSet, dislikedSet]);

  const handleDislike = useCallback((id: string) => {
    const isDisliked = dislikedSet.has(id);
    const isLiked = likedSet.has(id);
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        let delta = 0;
        if (isDisliked) delta = 0;
        else if (isLiked) delta = -1;
        return { ...s, likes: Math.max(0, s.likes + delta) };
      })
    );
    setDislikedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isLiked) {
      setLikedSet((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [dislikedSet, likedSet]);

  const handleReport = useCallback((id: string, reason: string) => {
    if (!reason.trim()) return;
    setReportedSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setShowReportConfirm(null);
    setReportReason("");
    alert("举报已提交，感谢您的反馈！");
  }, []);

  const openDetail = (sub: Submission) => {
    setSelectedSubmission(sub);
    setImageIndex(0);
    setCommentText("");
  };

  const closeDetail = () => setSelectedSubmission(null);

  const nextImage = () => {
    if (selectedSubmission && selectedSubmission.images.length > 1) {
      setImageIndex((i) => (i + 1) % selectedSubmission.images.length);
    }
  };

  const prevImage = () => {
    if (selectedSubmission && selectedSubmission.images.length > 1) {
      setImageIndex((i) => (i - 1 + selectedSubmission.images.length) % selectedSubmission.images.length);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedSubmission) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: commentIsAnonymous ? "匿名用户" : "美食爱好者",
      content: commentText.trim(),
      images: commentImages.length > 0 ? commentImages : undefined,
      createdAt: new Date().toISOString().split("T")[0],
      isAnonymous: commentIsAnonymous,
    };
    const updated = {
      ...selectedSubmission,
      comments: [...selectedSubmission.comments, newComment],
    };
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    setSelectedSubmission(updated);
    setCommentText("");
    setCommentImages([]);
    setCommentIsAnonymous(false);
  };

  const handleCommentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 3).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCommentImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCommentImage = (index: number) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    const urls = fileArray.map((file) => URL.createObjectURL(file));
    if (type === "image") {
      fileRefs.current.images = [...fileRefs.current.images, ...fileArray];
      setUploadForm((f) => ({ ...f, previewImages: [...f.previewImages, ...urls] }));
    } else {
      fileRefs.current.videos = [...fileRefs.current.videos, ...fileArray];
      setUploadForm((f) => ({ ...f, previewVideos: [...f.previewVideos, ...urls] }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const displayAuthor = uploadForm.isAnonymous ? "匿名厨友" : uploadForm.author;
    if (!displayAuthor || !uploadForm.title.trim() || !uploadForm.description.trim()) return;

    const formData = new FormData();
    formData.append("author", displayAuthor);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("region", uploadForm.region);
    formData.append("tags", uploadForm.tags);
    formData.append("userId", currentUser?.phone || "");
    formData.append("isAnonymous", String(uploadForm.isAnonymous));
    formData.append("isUserCreated", "true");

    fileRefs.current.images.forEach((file) => formData.append("images", file));
    fileRefs.current.videos.forEach((file) => formData.append("videos", file));

    const result = await createSubmission(formData);
    if (result.success) {
      // 重新加载列表
      const data = await apiLoad();
      setSubmissions(data);
    }

    fileRefs.current = { images: [], videos: [] };
    setUploadForm({
      author: "",
      title: "",
      description: "",
      region: "四川",
      tags: "",
      previewImages: [],
      previewVideos: [],
      isAnonymous: false,
    });
    setShowUpload(false);
  };

  const handleDelete = async (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (sub?.userId && sub.userId !== currentUser?.phone) {
      alert("只能删除自己的作品");
      return;
    }
    await apiDelete(id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null);
    }
  };

  const canDelete = (sub: Submission) => {
    if (sub.userId && sub.userId === currentUser?.phone) return true;
    if (sub.isUserCreated && !sub.userId) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部横幅 */}
      <div className="relative bg-gradient-to-br from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">厨友作品秀</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            分享你的烹饪作品，与全国各地的美食爱好者交流心得
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-8 inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              上传我的作品
            </button>
          ) : (
            <p className="mt-6 text-white/70 text-sm">请先登录后再上传作品</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 地区筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRegion === r
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 作品网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => openDetail(sub)}
              className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              {/* 媒体区域 */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {sub.images.length > 0 ? (
                  <img
                    src={sub.images[0]}
                    alt={sub.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : sub.videos.length > 0 ? (
                  <div className="relative w-full h-full">
                    <video
                      src={sub.videos[0]}
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiPlay className="w-12 h-12 text-white/70" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FiImage className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {sub.videos.length > 0 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <FiVideo className="w-3 h-3" />
                    视频
                  </div>
                )}

                {/* 审核状态标签 */}
                {(sub.status || "approved") !== "approved" && (
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      sub.status === "pending" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      <FiClock className="w-3 h-3" />
                      {sub.status === "pending" ? "审核中" : "未通过"}
                    </span>
                  </div>
                )}
              </div>

              {/* 内容区域 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{sub.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{sub.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {sub.region}
                  </span>
                  <span>{sub.createdAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-medium overflow-hidden">
                      {sub.userId && userAvatars[sub.userId] ? (
                        <img src={userAvatars[sub.userId]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        sub.author[0]
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{sub.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(sub.id);
                      }}
                      className={`flex items-center gap-1 text-xs p-1 rounded transition-all duration-200 ${likedSet.has(sub.id) ? "text-red-500 scale-105" : "hover:text-red-500"}`}
                      title="点赞"
                    >
                      <FiHeart className={`w-3.5 h-3.5 transition-all duration-200 ${likedSet.has(sub.id) ? "fill-red-500 scale-110" : ""}`} />
                      <span className={`transition-all duration-200 ${likedSet.has(sub.id) ? "text-red-500 font-semibold" : ""}`}>{sub.likes}</span>
                    </button>
                    <span className="flex items-center gap-1 text-xs">
                      <FiMessageCircle className="w-3.5 h-3.5" />
                      {sub.comments.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDislike(sub.id);
                      }}
                      className={`p-1 rounded transition-colors ${dislikedSet.has(sub.id) ? "text-blue-500" : "hover:text-blue-500"}`}
                      title="不喜欢"
                    >
                      <FiThumbsDown className={`w-3.5 h-3.5 ${dislikedSet.has(sub.id) ? "fill-blue-500" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReportConfirm(sub.id);
                      }}
                      className={`p-1 rounded transition-colors ${reportedSet.has(sub.id) ? "text-orange-500" : "hover:text-orange-500"}`}
                      title="举报"
                    >
                      <FiFlag className={`w-3.5 h-3.5 ${reportedSet.has(sub.id) ? "fill-orange-500" : ""}`} />
                    </button>
                    {canDelete(sub) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(sub.id);
                        }}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <FiTrash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">加载中...</p>
          </div>
        ) : filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiImage className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">暂无作品</p>
            <p className="text-gray-400 text-sm mt-2">成为第一个投稿的人吧！</p>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gray-900 rounded-t-2xl overflow-hidden">
              {selectedSubmission.images.length > 0 ? (
                <div className="relative aspect-video">
                  <img
                    src={selectedSubmission.images[imageIndex]}
                    alt={selectedSubmission.title}
                    className="w-full h-full object-contain"
                  />
                  {selectedSubmission.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedSubmission.images.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === imageIndex ? "bg-white" : "bg-white/40"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : selectedSubmission.videos.length > 0 ? (
                <video src={selectedSubmission.videos[0]} controls className="w-full aspect-video" />
              ) : null}
              <button onClick={closeDetail} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h2>
                    {/* Detail status badge */}
                    {(selectedSubmission.status || "approved") !== "approved" && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedSubmission.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {selectedSubmission.status === "pending" ? "审核中" : "未通过"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 overflow-hidden">
                        {selectedSubmission.userId && userAvatars[selectedSubmission.userId] ? (
                          <img src={userAvatars[selectedSubmission.userId]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          selectedSubmission.author[0]
                        )}
                      </div>
                      {selectedSubmission.author}
                    </span>
                    <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{selectedSubmission.region}</span>
                    <span>{selectedSubmission.createdAt}</span>
                  </div>
                </div>
                <button onClick={() => handleLike(selectedSubmission.id)} className={`flex items-center gap-1 transition-colors ${likedSet.has(selectedSubmission.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}>
                  <FiHeart className={`w-5 h-5 ${likedSet.has(selectedSubmission.id) ? "fill-current" : ""}`} /><span className="text-sm">{selectedSubmission.likes}</span>
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">{selectedSubmission.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSubmission.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1">
                    <FiTag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>

              {/* 评论区 */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiMessageCircle className="w-4 h-4" />评论 ({selectedSubmission.comments.length})
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      placeholder="写下你的评论..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                    <button onClick={() => commentImageRef.current?.click()} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg" title="添加图片">
                      <FiImage className="w-5 h-5" />
                    </button>
                    <button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                  <input ref={commentImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCommentImageUpload} />
                  {commentImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {commentImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeCommentImage(i)} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center">
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="comment-anonymous" checked={commentIsAnonymous} onChange={(e) => setCommentIsAnonymous(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500" />
                    <label htmlFor="comment-anonymous" className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer"><FiEyeOff className="w-3 h-3" />匿名评论</label>
                  </div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedSubmission.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 overflow-hidden">
                        {c.isAnonymous ? "匿" : c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : c.author[0]}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">{c.author}</span>
                          <span className="text-xs text-gray-400">{c.createdAt}</span>
                        </div>
                        <p className="text-sm text-gray-600">{c.content}</p>
                        {c.images && c.images.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {c.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" loading="lazy" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedSubmission.comments.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">暂无评论，来说两句吧</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除？</h3>
              <p className="text-sm text-gray-500 mb-6">删除后无法恢复，确定要删除这个作品吗？</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">取消</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">删除</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 举报确认弹窗 */}
      {showReportConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowReportConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">举报原因</h3>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
              placeholder="请描述举报原因..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowReportConfirm(null); setReportReason(""); }} className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={() => handleReport(showReportConfirm, reportReason)} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600">提交举报</button>
            </div>
          </div>
        </div>
      )}

      {/* 上传弹窗 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">上传作品</h2>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">昵称 *</label>
                  <input
                    type="text" required
                    disabled={uploadForm.isAnonymous}
                    value={uploadForm.isAnonymous ? "匿名厨友" : uploadForm.author}
                    onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${uploadForm.isAnonymous ? "text-gray-400 cursor-not-allowed" : ""}`}
                    placeholder="你的昵称"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="upload-anonymous" checked={uploadForm.isAnonymous} onChange={(e) => setUploadForm({ ...uploadForm, isAnonymous: e.target.checked, author: "" })}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500" />
                    <label htmlFor="upload-anonymous" className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer"><FiEyeOff className="w-3 h-3" />匿名发布</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作品标题 *</label>
                  <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    placeholder="给作品起个名字" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
                  <select value={uploadForm.region} onChange={(e) => setUploadForm({ ...uploadForm, region: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                    {regions.filter((r) => r !== "全部").map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述 *</label>
                  <textarea required rows={3} value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                    placeholder="分享你的烹饪心得..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input type="text" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    placeholder="用逗号分隔，如：川菜,家常菜,辣" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上传图片/视频</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50">
                      <FiImage className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">选择图片</span>
                    </button>
                    <button type="button" onClick={() => videoInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50">
                      <FiVideo className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">选择视频</span>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
                  <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
                  {(uploadForm.previewImages.length > 0 || uploadForm.previewVideos.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadForm.previewImages.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /></div>
                      ))}
                      {uploadForm.previewVideos.map((url, i) => (
                        <div key={`v-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center"><FiPlay className="w-6 h-6 text-white" /></div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">* 提交后将进入审核，管理员审核通过后所有人可见</p>
                <button type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                  发布作品
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
