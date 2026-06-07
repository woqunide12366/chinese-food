import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiPlay, FiClock } from "react-icons/fi";
import { categories } from "../data/categories";
import { dishes } from "../data/dishes";
import { snacks } from "../data/snacks";
import { videos } from "../data/videos";
import type { Video } from "../data/videos";
import { loadSubmissionsData } from "../store";
import { submissions as initialSubmissions } from "../data/submissions";
import DishCard from "../components/DishCard";

const banners = [
  {
    image: "/images/yuecai/czpg.jpg",
    title: "品味千年中华美食",
    subtitle: "从家常小菜到古法大菜，从东北到新疆，探索中国饮食文化的无穷魅力",
  },
  {
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200",
    title: "八大菜系 百菜百味",
    subtitle: "川鲁粤苏闽浙湘徽，每一道菜都是地域文化的缩影",
  },
  {
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1200",
    title: "地方风味 各有千秋",
    subtitle: "东北炖菜、新疆烤肉、潮汕卤水……走遍南北尝遍各地风味",
  },
];

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const ancientDishes = dishes.filter((d) => d.isAncient).slice(0, 6);
  const latestDishes = dishes.filter((d) => !d.isAncient).slice(0, 8);
  const featuredSnacks = snacks.slice(0, 4);
  const featuredVideos = videos.slice(0, 4);
  const majorCuisines = categories.filter((c) => c.group === "八大菜系");
  const regionalCuisines = categories.filter((c) => c.group === "地方菜系");
  const latestSubmissions = loadSubmissionsData("chinese-food-submissions", initialSubmissions)
    .filter((s) => (s.status || "approved") === "approved")
    .slice(0, 3);

  return (
    <div>
      {/* Banner 轮播 + 搜索 */}
      <section className="relative h-[560px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="max-w-xl text-white">
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-shadow">
                    {banner.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-8">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
        >
          <FiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() =>
            setCurrentBanner((prev) => (prev + 1) % banners.length)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
        >
          <FiChevronRight className="w-6 h-6 text-white" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 八大菜系入口 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">八大菜系</h2>
            <p className="text-gray-500">探索中国传统八大菜系，品味百菜百味</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {majorCuisines.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories?cat=${cat.id}`}
                className="group relative rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 地方菜系 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">地方风味</h2>
              <p className="text-gray-500">东北豪迈、新疆浓香、潮汕精细……走遍大江南北的地道风味</p>
            </div>
            <Link
              to="/categories"
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              浏览全部地区
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {regionalCuisines.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories?cat=${cat.id}`}
                className="group bg-white rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: cat.color }}>
                  {cat.name.charAt(0)}
                </div>
                <h4 className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">{cat.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{cat.region}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特色小吃 */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">特色小吃</h2>
              <p className="text-gray-500">长沙臭豆腐、天津煎饼果子……一口尝遍大江南北</p>
            </div>
            <Link
              to="/snacks"
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors font-medium"
            >
              查看全部小吃
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredSnacks.map((snack) => (
              <Link
                key={snack.id}
                to="/snacks"
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={snack.image}
                    alt={snack.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 text-sm">{snack.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{snack.city} · {snack.likes}人喜欢</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 美食制作视频 */}
      <section className="py-16 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">美食制作视频</h2>
              <p className="text-gray-500">跟着视频学做菜，手把手教你复刻各地名菜</p>
            </div>
            <Link
              to="/videos"
              className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-medium"
            >
              查看全部视频
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map((video) => (
              <HomeVideoCard key={video.id} video={video} />
            ))}
          </div>
          {featuredVideos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <FiPlay className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">还没有添加视频</p>
              <p className="text-gray-400 text-sm mb-4">
                打开 <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">src/data/videos.ts</code> 添加美食制作视频
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 古法专区推荐 */}
      <section className="py-16 bg-ancient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-ancient-text mb-2">
                古法菜系
              </h2>
              <p className="text-gray-600">传承经典，品味历史的味道</p>
            </div>
            <Link
              to="/ancient"
              className="flex items-center gap-1 text-ancient-primary hover:text-ancient-accent transition-colors font-medium"
            >
              查看更多
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ancientDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} variant="ancient" />
            ))}
          </div>
        </div>
      </section>

      {/* 最新菜品 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">精选菜品</h2>
              <p className="text-gray-500">热门推荐，值得一试的美味</p>
            </div>
            <Link
              to="/categories"
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              查看全部
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </section>

      {/* 最新投稿 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">厨友投稿</h2>
            <p className="text-gray-500">来自美食爱好者的分享与创意</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestSubmissions.map((sub) => (
              <Link
                key={sub.id}
                to="/submissions"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {sub.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sub.author}</p>
                    <p className="text-xs text-gray-400">{sub.createdAt}</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {sub.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {sub.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
            >
              去交流区看看
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// 辅助函数：判断是否为本地视频
function isHomeLocalVideo(url: string): boolean {
  return url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
}

// 首页视频卡片（支持本地视频 hover 自动播放）
function HomeVideoCard({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLocal = isHomeLocalVideo(video.url);

  const handleMouseEnter = () => {
    if (isLocal && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (isLocal && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <a
      key={video.id}
      href={video.url}
      target={isLocal ? "_self" : "_blank"}
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-44 bg-gray-800 overflow-hidden">
        {isLocal ? (
          <video
            ref={videoRef}
            src={video.url}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-orange-500">
            <FiPlay className="w-10 h-10 text-white/80 mb-2" />
            <span className="text-white/70 text-sm">{video.category}</span>
          </div>
        )}
        {!isLocal && (
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <FiPlay className="w-5 h-5 text-red-600 ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {video.duration}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{video.source}</span>
          <span>{video.author}</span>
        </div>
        {video.dishName && (
          <p className="text-xs text-red-500 mt-1">关联菜品：{video.dishName}</p>
        )}
      </div>
    </a>
  );
}
