import { useParams, Link } from "react-router-dom";
import { FiHeart, FiClock, FiBarChart, FiShare2, FiArrowLeft, FiPlay } from "react-icons/fi";
import { dishes } from "../data/dishes";
import { useApp } from "../context/AppContext";

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useApp();
  const dish = dishes.find((d) => d.id === id);

  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">菜品不存在</p>
          <Link
            to="/categories"
            className="text-primary hover:text-primary-dark mt-4 inline-block"
          >
            返回分类页
          </Link>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(dish.id);
  const relatedDishes = dishes
    .filter((d) => d.categoryId === dish.categoryId && d.id !== dish.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部大图 */}
      <div className="relative h-[400px] sm:h-[500px]">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link
            to="/categories"
            className="flex items-center gap-1 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            返回
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block text-white text-sm px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: getCategoryColor(dish.category) }}
            >
              {dish.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-shadow">
              {dish.name}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">{dish.description}</p>
            <div className="flex items-center gap-6 mt-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                {dish.time}
              </span>
              <span className="flex items-center gap-1">
                <FiBarChart className="w-4 h-4" />
                {dish.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <FiHeart className="w-4 h-4" />
                {dish.likes} 人喜欢
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 操作按钮 */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => toggleFavorite(dish.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              favorited
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiHeart
              className={`w-5 h-5 ${favorited ? "fill-red-500" : ""}`}
            />
            {favorited ? "已收藏" : "收藏"}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
            <FiShare2 className="w-5 h-5" />
            分享
          </button>
        </div>

        {/* 古法信息 */}
        {dish.isAncient && dish.ancientInfo && (
          <div className="bg-ancient-bg rounded-xl p-6 mb-8 border border-amber-200/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-ancient-primary text-white text-xs px-2.5 py-1 rounded-full">
                {dish.ancientInfo.dynasty}
              </span>
              <span className="text-ancient-accent text-sm">
                {dish.ancientInfo.origin}
              </span>
            </div>
            <h3 className="text-lg font-bold text-ancient-text mb-2">
              历史典故
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {dish.ancientInfo.story}
            </p>
          </div>
        )}

        {/* 食材清单 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">食材清单</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dish.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-gray-700">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 视频区域 */}
        {dish.video && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">制作视频</h2>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                src={dish.video}
                controls
                className="w-full h-full"
                poster={dish.image}
              />
            </div>
          </div>
        )}

        {/* 制作步骤 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">制作步骤</h2>
          <div className="space-y-6">
            {dish.steps.map((step) => (
              <div key={step.order} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {step.order}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={`步骤${step.order}`}
                      className="mt-3 rounded-lg w-full max-w-md"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 小贴士 */}
        {dish.tips && (
          <div className="bg-amber-50 rounded-xl p-6 mb-8 border border-amber-100">
            <h3 className="text-lg font-bold text-amber-800 mb-2">
              小贴士
            </h3>
            <p className="text-amber-700">{dish.tips}</p>
          </div>
        )}

        {/* 相关推荐 */}
        {relatedDishes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              同类推荐
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedDishes.map((d) => (
                <Link
                  key={d.id}
                  to={`/dish/${d.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {d.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    川菜: "#C62828",
    粤菜: "#E65100",
    鲁菜: "#1565C0",
    苏菜: "#00695C",
    浙菜: "#2E7D32",
    闽菜: "#6A1B9A",
    湘菜: "#AD1457",
    徽菜: "#4E342E",
  };
  return colors[category] || "#E64A19";
}
