import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiSliders } from "react-icons/fi";
import { categories } from "../data/categories";
import { dishes } from "../data/dishes";
import { useApp } from "../context/AppContext";
import DishCard from "../components/DishCard";

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("cat") || ""
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 读取 URL 中的 search 参数（从首页跳转过来）
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
      // 清除 URL 参数，避免刷新时重复设置
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchCategory = selectedCategory
        ? dish.categoryId === selectedCategory
        : true;
      const matchDifficulty = selectedDifficulty
        ? dish.difficulty === selectedDifficulty
        : true;
      const matchSearch = searchQuery
        ? dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
          dish.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.author?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchCategory && matchDifficulty && matchSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory("");
      setSearchParams({});
    } else {
      setSelectedCategory(catId);
      setSearchParams({ cat: catId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">菜品分类</h1>
          <p className="text-gray-500">按菜系浏览或搜索，覆盖全中国各地区美味</p>
        </div>

        {/* 搜索提示&筛选 */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-primary">
              搜索 "{searchQuery}" 的结果（{filteredDishes.length} 个菜品）
            </span>
            <button onClick={() => setSearchQuery("")} className="text-xs text-primary hover:underline">
              清除搜索
            </button>
          </div>
        )}

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || selectedDifficulty
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FiSliders className="w-4 h-4" />
              <span className="hidden sm:inline">筛选</span>
            </button>
          </div>

          {/* 筛选条件 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-500">难度：</span>
                {["简单", "中等", "困难"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() =>
                      setSelectedDifficulty(
                        selectedDifficulty === diff ? "" : diff
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedDifficulty === diff
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 分类标签 - 八大菜系 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">八大菜系</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory(""); setSearchParams({}); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              全部
            </button>
            {categories.filter(c=>c.group==="八大菜系").map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id ? "text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 分类标签 - 地方菜系 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">地方菜系</h3>
          <div className="flex flex-wrap gap-2">
            {categories.filter(c=>c.group==="地方菜系").map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id ? "text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <FiSearch className="w-4 h-4" />
              <span>
                {filteredDishes.length > 0
                  ? `搜索 "${searchQuery}" 找到 ${filteredDishes.length} 道菜品`
                  : `搜索 "${searchQuery}" 未找到相关菜品`}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* 结果统计（非搜索时显示） */}
        {!searchQuery && (
          <div className="mb-4 text-sm text-gray-500">
            共找到 {filteredDishes.length} 道菜品
          </div>
        )}

        {/* 菜品网格 */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {searchQuery ? `未找到 "${searchQuery}" 相关菜品` : "没有找到匹配的菜品"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery
                ? "建议：检查拼写、尝试更简短的关键词、或搜索食材名称"
                : "试试调整筛选条件"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                清除搜索
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
