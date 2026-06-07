import { useState, useRef, useMemo, useEffect } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiMapPin,
  FiTag,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiImage,
  FiVideo,
  FiPlus,
  FiTrash2,
  FiClock,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { loadSubmissions as apiLoad, createSubmission, deleteSubmission as apiDelete } from "../api";
import type { Submission } from "../types/submission";

const regions = ["四川", "广东", "江苏", "浙江", "福建", "湖南", "山东", "其他"];

export default function MyWorks() {
  const { currentUser, isLoggedIn } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    region: "四川",
    tags: "",
    previewImages: [] as string[],
    previewVideos: [] as string[],
  });

  const fileRefs = useRef<{ images: File[]; videos: File[] }>({ images: [], videos: [] });

  useEffect(() => {
    apiLoad().then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, []);

  const maskedPhone = currentUser?.phone
    ? currentUser.phone.slice(0, 3) + "****" + currentUser.phone.slice(-4)
    : "";

  const myWorks = useMemo(() => {
    return submissions.filter((s) => s.userId && s.userId === currentUser?.phone);
  }, [submissions, currentUser]);

  const statusLabel = (status?: string) => {
    if (status === "pending") return "审核中";
    if (status === "rejected") return "未通过";
    return "已通过";
  };

  const statusColor = (s?: string) => {
    if (s === "pending") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  const statusBadge = (s?: string) => {
    if (s === "pending") return "bg-yellow-500 text-white";
    if (s === "rejected") return "bg-red-500 text-white";
    return "bg-green-500 text-white";
  };

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
    if (!uploadForm.title.trim() || !uploadForm.description.trim()) return;

    const formData = new FormData();
    formData.append("author", maskedPhone || "匿名厨友");
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("region", uploadForm.region);
    formData.append("tags", uploadForm.tags);
    formData.append("userId", currentUser?.phone || "");
    formData.append("isAnonymous", "false");
    formData.append("isUserCreated", "true");

    fileRefs.current.images.forEach((file) => formData.append("images", file));
    fileRefs.current.videos.forEach((file) => formData.append("videos", file));

    await createSubmission(formData);

    fileRefs.current = { images: [], videos: [] };
    const data = await apiLoad();
    setSubmissions(data);
    setUploadForm({ title: "", description: "", region: "四川", tags: "", previewImages: [], previewVideos: [] });
    setShowUpload(false);
  };

  const handleDelete = async (id: string) => {
    await apiDelete(id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
    if (selectedSubmission?.id === id) setSelectedSubmission(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">请先登录后查看我的作品</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">我的作品</h1>
          <p className="text-white/80">{maskedPhone}的作品集（共 {myWorks.length} 件）</p>
          <button onClick={() => setShowUpload(true)} className="mt-6 inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-95">
            <FiPlus className="w-5 h-5" />上传新作品
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myWorks.map((sub) => (
            <div key={sub.id} onClick={() => openDetail(sub)} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {sub.images.length > 0 ? (
                  <img src={sub.images[0]} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-100"><FiImage className="w-12 h-12 text-gray-300" /></div>
                )}
                {sub.videos.length > 0 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><FiVideo className="w-3 h-3" />视频</div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge(sub.status)}`}>
                    <FiClock className="w-3 h-3" />{statusLabel(sub.status)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{sub.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{sub.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{sub.region}</span>
                  <span>{sub.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="flex items-center gap-1 text-xs"><FiHeart className="w-3.5 h-3.5" />{sub.likes}</span>
                    <span className="flex items-center gap-1 text-xs"><FiMessageCircle className="w-3.5 h-3.5" />{sub.comments.length}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(sub.id); }} className="p-1 hover:bg-red-50 rounded transition-colors" title="删除">
                    <FiTrash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {myWorks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><FiImage className="w-10 h-10 text-gray-300" /></div>
            <p className="text-gray-500 text-lg font-medium">还没有作品</p>
            <p className="text-gray-400 text-sm mt-2">点击上方按钮上传你的第一个作品吧！</p>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gray-900 rounded-t-2xl overflow-hidden">
              {selectedSubmission.images.length > 0 ? (
                <div className="relative aspect-video">
                  <img src={selectedSubmission.images[imageIndex]} alt={selectedSubmission.title} className="w-full h-full object-contain" />
                  {selectedSubmission.images.length > 1 && (<>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><FiChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><FiChevronRight className="w-5 h-5" /></button>
                  </>)}
                </div>
              ) : selectedSubmission.videos.length > 0 ? (
                <video src={selectedSubmission.videos[0]} controls className="w-full aspect-video" />
              ) : null}
              <button onClick={closeDetail} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(selectedSubmission.status)}`}>{statusLabel(selectedSubmission.status)}</span>
              </div>
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                <span>{selectedSubmission.author}</span>
                <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{selectedSubmission.region}</span>
                <span>{selectedSubmission.createdAt}</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{selectedSubmission.description}</p>
              {selectedSubmission.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSubmission.tags.map((tag) => (<span key={tag} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full flex items-center gap-1"><FiTag className="w-3 h-3" />{tag}</span>))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <FiTrash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">确认删除？</h3>
              <p className="text-sm text-gray-500 mb-6">删除后无法恢复</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600">删除</button>
              </div>
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
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发布者</label>
                  <input type="text" disabled value={maskedPhone} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作品标题 *</label>
                  <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="给作品起个名字" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
                  <select value={uploadForm.region} onChange={(e) => setUploadForm({ ...uploadForm, region: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述 *</label>
                  <textarea required rows={3} value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg resize-none" placeholder="分享你的烹饪心得..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input type="text" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="用逗号分隔，如：川菜,家常菜" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上传图片/视频</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50"><FiImage className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">选择图片</span></button>
                    <button type="button" onClick={() => videoInputRef.current?.click()} className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50"><FiVideo className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">选择视频</span></button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
                  <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
                  {(uploadForm.previewImages.length > 0 || uploadForm.previewVideos.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadForm.previewImages.map((url, i) => (<div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /></div>))}
                      {uploadForm.previewVideos.map((url, i) => (<div key={`v-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center"><FiPlay className="w-6 h-6 text-white" /></div>))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">* 提交后将进入审核，管理员审核通过后所有人可见</p>
                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold">发布作品</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
