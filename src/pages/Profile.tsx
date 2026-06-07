import { useState, useEffect, useRef } from "react";
import { FiUser, FiMapPin, FiCheck, FiChevronDown, FiHeart, FiImage, FiPlay, FiVideo, FiX, FiCamera } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { getProfile, updateProfile, loadSubmissions as apiLoad, uploadAvatar } from "../api";
import { REGIONS } from "../data/regions";
import type { Submission } from "../types/submission";

const LIKED_KEY = "chinese-food-liked-submissions";

function loadLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

export default function Profile() {
  const { currentUser, isLoggedIn, refreshProfile, userProfile } = useApp();
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");
  const [signature, setSignature] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const regionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // 我喜欢
  const [likedSubmissions, setLikedSubmissions] = useState<Submission[]>([]);
  const [selectedLiked, setSelectedLiked] = useState<Submission | null>(null);

  const filteredRegions = REGIONS.filter((r) =>
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  // 加载资料
  useEffect(() => {
    if (currentUser?.phone) {
      getProfile(currentUser.phone).then((p) => {
        if (p) {
          setUsername(p.username || "");
          setRegion(p.region || "");
          setSignature(p.signature || "");
          setAvatar(p.avatar || "");
        }
      });
    }
  }, [currentUser]);

  // 加载点赞的作品
  useEffect(() => {
    const likedSet = loadLikedSet();
    if (likedSet.size > 0) {
      apiLoad().then((data) => {
        const liked = data.filter((s) => likedSet.has(s.id));
        setLikedSubmissions(liked);
      });
    }
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setShowRegionDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 防抖自动保存
  const saveTimer = useRef<any>(null);
  const autoSave = (field: string, value: string) => {
    if (field === "username") setUsername(value);
    if (field === "region") setRegion(value);
    if (field === "signature") setSignature(value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!currentUser?.phone) return;
      const data: any = {};
      data[field] = value;
      await updateProfile(currentUser.phone, { username: field === "username" ? value : username, region: field === "region" ? value : region, signature: field === "signature" ? value : signature });
      await refreshProfile();
      setMessage("已保存");
      setTimeout(() => setMessage(""), 1500);
    }, 500);
  };

  // 上传头像
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.phone) return;
    setUploading(true);
    try {
      const result = await uploadAvatar(currentUser.phone, file);
      if (result.avatar) {
        setAvatar(result.avatar);
        await updateProfile(currentUser.phone, { avatar: result.avatar });
        await refreshProfile();
        setMessage("头像已更新");
        setTimeout(() => setMessage(""), 1500);
      }
    } catch {
      setMessage("上传失败");
      setTimeout(() => setMessage(""), 1500);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">请先登录</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="text-center mb-8">
            {/* 头像上传 */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-10 h-10 text-primary" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
                title="更换头像"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCamera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">个人信息</h1>
            <p className="text-gray-500 text-sm mt-1">{currentUser?.phone}</p>
          </div>

          {message && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs text-center flex items-center justify-center gap-1">
              <FiCheck className="w-3 h-3" />{message}
            </div>
          )}

          <div className="space-y-5 max-w-lg mx-auto">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={username}
                  onChange={(e) => autoSave("username", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="设置你的用户名" />
              </div>
            </div>

            {/* 地区（可搜索下拉） */}
            <div ref={regionRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input type="text" value={showRegionDropdown ? regionSearch : region}
                  onFocus={() => { setShowRegionDropdown(true); setRegionSearch(""); }}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  placeholder="点击选择地区" />
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {showRegionDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredRegions.length > 0 ? filteredRegions.map((r) => (
                    <button key={r} type="button"
                      onClick={() => { autoSave("region", r); setShowRegionDropdown(false); setRegionSearch(""); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors ${region === r ? "bg-primary/10 text-primary font-medium" : "text-gray-700"}`}>
                      {r}
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-sm text-gray-400">无匹配地区</p>
                  )}
                </div>
              )}
            </div>

            {/* 个性签名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">个性签名</label>
              <textarea value={signature}
                onChange={(e) => autoSave("signature", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="介绍一下自己..." />
            </div>

            <p className="text-xs text-gray-400 text-center">修改后自动保存</p>
          </div>
        </div>

        {/* 我喜欢 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <FiHeart className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">我喜欢</h2>
            <span className="text-sm text-gray-400">({likedSubmissions.length})</span>
          </div>

          {likedSubmissions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {likedSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedLiked(sub)}
                  className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {sub.images.length > 0 ? (
                      <img
                        src={sub.images[0]}
                        alt={sub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                        <FiImage className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {sub.videos.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                        <FiVideo className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{sub.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{sub.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiHeart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">还没有点赞过任何作品</p>
              <p className="text-gray-400 text-sm mt-1">去厨友作品区发现好作品吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* 我喜欢的详情弹窗 */}
      {selectedLiked && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLiked(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gray-900 rounded-t-2xl overflow-hidden">
              {selectedLiked.images.length > 0 ? (
                <img
                  src={selectedLiked.images[0]}
                  alt={selectedLiked.title}
                  className="w-full aspect-video object-contain"
                />
              ) : selectedLiked.videos.length > 0 ? (
                <video src={selectedLiked.videos[0]} controls className="w-full aspect-video" preload="metadata" />
              ) : null}
              <button onClick={() => setSelectedLiked(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLiked.title}</h2>
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                <span>{selectedLiked.author}</span>
                <span>{selectedLiked.region}</span>
                <span>{selectedLiked.createdAt}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{selectedLiked.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
