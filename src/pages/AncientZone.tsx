import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiClock } from "react-icons/fi";
import { dishes } from "../data/dishes";
import DishCard from "../components/DishCard";

export default function AncientZone() {
  const [selectedDynasty, setSelectedDynasty] = useState("");
  const ancientDishes = dishes.filter((d) => d.isAncient);

  const dynasties = Array.from(
    new Set(ancientDishes.map((d) => d.ancientInfo?.dynasty).filter((d): d is string => Boolean(d)))
  );

  const filteredDishes = selectedDynasty
    ? ancientDishes.filter((d) => d.ancientInfo?.dynasty === selectedDynasty)
    : ancientDishes;

  return (
    <div className="min-h-screen bg-ancient-bg">
      {/* 古风 Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541696432-82c6da8ce7ea?w=1200"
          alt="古法菜系"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ancient-primary/60 via-ancient-primary/40 to-ancient-bg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-wider">
              古法菜系
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              穿越千年时光，品味历史的味道
              <br />
              每一道古法菜，都是一段流传至今的美食传奇
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* 介绍区 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 mb-10 border border-amber-200/50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-ancient-primary/10 rounded-lg flex-shrink-0">
              <FiBookOpen className="w-6 h-6 text-ancient-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ancient-text mb-2">
                关于古法菜系
              </h2>
              <p className="text-gray-600 leading-relaxed">
                古法菜系是指传承自古代的经典菜肴，它们承载着深厚的历史文化底蕴。
                这些菜品在现代社会中依然可以在特色餐厅品尝到，同时经过改良后也适合家庭制作。
                从东坡肉到叫花鸡，从佛跳墙到北京烤鸭，每一道菜背后都有动人的故事。
              </p>
            </div>
          </div>
        </div>

        {/* 朝代筛选 */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-ancient-text font-medium">朝代筛选：</span>
          <button
            onClick={() => setSelectedDynasty("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedDynasty
                ? "bg-ancient-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            全部
          </button>
          {dynasties.map((dynasty) => (
            <button
              key={dynasty}
              onClick={() =>
                setSelectedDynasty(
                  selectedDynasty === dynasty ? "" : dynasty
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDynasty === dynasty
                  ? "bg-ancient-accent text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {dynasty}
            </button>
          ))}
        </div>

        {/* 菜品网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} variant="ancient" />
          ))}
        </div>

        {/* 古法文化介绍 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-ancient-text mb-8 text-center">
            古法烹饪的特点
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-200/50">
              <div className="w-14 h-14 bg-ancient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-7 h-7 text-ancient-primary" />
              </div>
              <h3 className="text-lg font-bold text-ancient-text mb-2">
                慢工细火
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                古法菜讲究火候与时间，文火慢炖、武火爆炒，让食材的味道充分释放与融合。
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-200/50">
              <div className="w-14 h-14 bg-ancient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBookOpen className="w-7 h-7 text-ancient-primary" />
              </div>
              <h3 className="text-lg font-bold text-ancient-text mb-2">
                药食同源
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                传统烹饪注重食材搭配的药理作用，追求美味与养生的平衡，体现中医食疗智慧。
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-200/50">
              <div className="w-14 h-14 bg-ancient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiArrowRight className="w-7 h-7 text-ancient-primary" />
              </div>
              <h3 className="text-lg font-bold text-ancient-text mb-2">
                因时而食
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                遵循二十四节气，不时不食，选用当季最新鲜的食材，体现人与自然的和谐。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
