import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiArrowLeft, FiTrash2, FiUser } from "react-icons/fi";
import { dishes } from "../data/dishes";
import { useApp } from "../context/AppContext";
import DishCard from "../components/DishCard";

export default function Favorites() {
  const { favorites, toggleFavorite, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const favoriteDishes = dishes.filter((d) => favorites.includes(d.id));

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">请先登录</p>
          <p className="text-gray-400 text-sm mb-6">登录后才能查看您的收藏</p>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 页面标题 */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">返回</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiHeart className="w-7 h-7 text-red-500" />
              我的收藏
            </h1>
            <p className="text-gray-500 mt-1">
              共收藏 {favoriteDishes.length} 道菜品
            </p>
          </div>
        </div>

        {/* 收藏列表 */}
        {favoriteDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteDishes.map((dish) => (
              <div key={dish.id} className="relative group">
                <DishCard dish={dish} variant={dish.isAncient ? "ancient" : "default"} />
                <button
                  onClick={() => toggleFavorite(dish.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  title="取消收藏"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg mb-2">还没有收藏任何菜品</p>
            <p className="text-gray-400 text-sm mb-6">
              浏览菜品时点击爱心图标即可收藏
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              去浏览菜品
            </Link>
          </div>
        )}

        {/* 推荐菜品 */}
        {favoriteDishes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              猜您喜欢
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dishes
                .filter(
                  (d) =>
                    !favorites.includes(d.id) &&
                    favoriteDishes.some(
                      (fd) => fd.categoryId === d.categoryId
                    )
                )
                .slice(0, 4)
                .map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
