import { useRef, useEffect, useState } from "react";
import { videos, type Video } from "../data/videos";
import { Play, Clock, User, Tag } from "lucide-react";

// 取第一个本地视频作为横幅背景
const bannerVideo = videos.find(
  (v) => (v.url.endsWith(".mp4") || v.url.endsWith(".webm") || v.url.endsWith(".mov")) && v.source === "本地"
);

export default function Videos() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const openVideo = (video: Video) => {
    if (video.source === "本地") {
      setSelectedVideo(video);
    } else {
      window.open(video.url, "_blank");
    }
  };

  const closeModal = () => setSelectedVideo(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部视频横幅 - 占屏幕高度45% */}
      <div className="relative w-full" style={{ height: "45vh" }}>
        {bannerVideo ? (
          <video
            ref={videoRef}
            src={bannerVideo.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
            <p>还没有添加本地视频</p>
          </div>
        )}
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        {/* 横幅标题 */}
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">美食视频</h1>
          <p className="text-white/80">探索中华美食的制作奥秘</p>
        </div>
      </div>

      {/* 视频卡片列表 */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">精选视频</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => openVideo(video)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group"
            >
              {/* 缩略图区域 */}
              <div className="relative aspect-video bg-gray-200">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Play className="w-12 h-12 text-white/50 group-hover:text-white/80 transition-colors" />
                  </div>
                )}
                {/* 时长标签 */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>
                {/* 来源标签 */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  {video.source}
                </div>
              </div>

              {/* 信息区域 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {video.author}
                  </span>
                  <span>{video.createdAt}</span>
                </div>
                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 本地视频播放弹窗 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-black rounded-lg overflow-hidden max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
              <h3 className="text-white font-medium truncate">{selectedVideo.title}</h3>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full aspect-video"
            />
          </div>
        </div>
      )}
    </div>
  );
}
