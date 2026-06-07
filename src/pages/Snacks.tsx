import { useState, useMemo } from "react";
import { FiMapPin, FiHeart, FiX, FiCoffee, FiSearch } from "react-icons/fi";
import { snacks } from "../data/snacks";
import type { Snack } from "../types";

const regions = Array.from(new Set(snacks.map((s) => s.region)));
const cities = Array.from(new Set(snacks.map((s) => s.city)));

const regionColors: Record<string, string> = {
  "川菜": "#C62828", "粤菜": "#E65100", "湘菜": "#AD1457", "苏菜": "#00695C",
  "浙菜": "#2E7D32", "湖北菜/鄂菜": "#1565C0", "广西菜/桂菜": "#388E3C",
  "云南菜": "#4E342E", "陕西菜": "#D84315", "天津菜": "#37474F",
  "上海菜/本帮菜": "#283593", "北京菜/京菜": "#B71C1C", "台湾菜": "#00838F",
  "港澳菜": "#880E4F", "东北菜": "#BF360C",
};

export default function Snacks() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [likedSnacks, setLikedSnacks] = useState<Set<string>>(new Set());
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSnacks = useMemo(() => {
    return snacks.filter((s) => {
      return selectedRegion ? s.regionId === selectedRegion || s.region === selectedRegion : true;
    });
  }, [selectedRegion]);

  const uniqueRegionIds = Array.from(new Set(snacks.map((s) => s.regionId)));

  const toggleLike = (id: string) => {
    setLikedSnacks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 sm:p-12 text-white overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">特色小吃</h1>
              <p className="text-white/90 text-lg max-w-xl">
                走遍大江南北，尝遍各地风味。从长沙臭豆腐到天津煎饼果子，每一口都是不同城市的记忆。
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-sm text-white/80">
                <span>全国</span><span>·</span>
                <span>{regions.length}个地区</span><span>·</span>
                <span>{snacks.length}种风味小吃</span>
              </div>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-15 select-none">
              🍜
            </div>
          </div>
        </div>

        {/* Region filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedRegion("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedRegion ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部地区
          </button>
          {uniqueRegionIds.map((rid) => {
            const regionSnack = snacks.find((s) => s.regionId === rid);
            if (!regionSnack) return null;
            const isSelected = selectedRegion === rid;
            return (
              <button
                key={rid}
                onClick={() => setSelectedRegion(selectedRegion === rid ? "" : rid)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isSelected ? (regionColors[regionSnack.region] || "#F59E0B") : "",
                  color: isSelected ? "white" : "",
                }}
              >
                {regionSnack.region}
              </button>
            );
          })}
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <FiSearch className="w-4 h-4" />
              <span>
                {filteredSnacks.length > 0
                  ? `搜索 "${searchQuery}" 找到 ${filteredSnacks.length} 种小吃`
                  : `搜索 "${searchQuery}" 未找到相关小吃`}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-amber-600 hover:text-amber-800 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* Result count */}
        {!searchQuery && (
          <div className="mb-4 text-sm text-gray-500">
            共找到 {filteredSnacks.length} 种特色小吃
          </div>
        )}

        {/* Snacks grid */}
        {filteredSnacks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSnacks.map((snack) => (
              <SnackCard key={snack.id} snack={snack} isLiked={likedSnacks.has(snack.id)} onToggleLike={toggleLike} onClick={() => setSelectedSnack(snack)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {searchQuery ? `未找到 "${searchQuery}" 相关小吃` : "没有找到匹配的小吃"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery
                ? "建议：检查拼写、尝试更简短的关键词、或搜索城市名称"
                : "试试其他城市或关键词"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
              >
                清除搜索
              </button>
            )}
          </div>
        )}
      </div>

      {/* 小吃详情弹窗 */}
      {selectedSnack && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedSnack(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-gray-900">
              <img src={selectedSnack.image} alt={selectedSnack.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedSnack(null)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-2xl font-bold text-white">{selectedSnack.name}</h2>
                <p className="text-white/80 text-sm mt-1">
                  <FiMapPin className="inline w-3.5 h-3.5 mr-1" />{selectedSnack.city} · {selectedSnack.region}
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed mb-4">{selectedSnack.description}</p>
              {selectedSnack.history && (
                <div className="bg-amber-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">{selectedSnack.history}</p>
                </div>
              )}
              {selectedSnack.recipe && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <FiCoffee className="w-5 h-5 text-amber-500" />
                    家庭做法
                  </h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">食材清单</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSnack.recipe.ingredients.map((ing, i) => (
                        <span key={i} className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">制作步骤</h4>
                    <div className="space-y-3">
                      {selectedSnack.recipe.steps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <p className="text-sm text-gray-600 pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedSnack.recipe.tips && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 {selectedSnack.recipe.tips}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SnackCard({ snack, isLiked, onToggleLike, onClick }: { snack: Snack; isLiked: boolean; onToggleLike: (id: string) => void; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={snack.image}
          alt={snack.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            <FiMapPin className="w-3 h-3" />
            {snack.city}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(snack.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <FiHeart
            className={`w-4 h-4 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>
        {snack.recipe && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <FiCoffee className="w-3 h-3" />
            有做法
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{snack.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{snack.description}</p>
        {snack.history && (
          <div className="bg-amber-50 rounded-lg p-2.5 mb-3">
            <p className="text-xs text-amber-700 line-clamp-2">{snack.history}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {snack.features.map((f, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {snack.city}
          </span>
          <span className="text-xs text-gray-400">
            ❤️ {snack.likes}
          </span>
        </div>
      </div>
    </div>
  );
}
