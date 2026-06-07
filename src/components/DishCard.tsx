import { Link } from "react-router-dom";
import { FiHeart, FiClock, FiBarChart } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import type { Dish } from "../types";

interface DishCardProps {
  dish: Dish;
  variant?: "default" | "ancient";
}

export default function DishCard({ dish, variant = "default" }: DishCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const favorited = isFavorite(dish.id);

  if (variant === "ancient") {
    return (
      <div className="group relative bg-ancient-bg rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-amber-200/50">
        <div className="relative h-48 overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-ancient-primary/90 text-white text-xs px-2.5 py-1 rounded-full">
              {dish.ancientInfo?.dynasty}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(dish.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
          >
            <FiHeart
              className={`w-4 h-4 transition-colors ${
                favorited ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        </div>
        <Link to={`/dish/${dish.id}`} className="block p-4">
          <h3 className="text-lg font-bold text-ancient-text mb-1">
            {dish.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {dish.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {dish.time}
            </span>
            <span className="flex items-center gap-1">
              <FiBarChart className="w-3 h-3" />
              {dish.difficulty}
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(dish.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <FiHeart
            className={`w-4 h-4 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
      <Link to={`/dish/${dish.id}`} className="block p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
            style={{ backgroundColor: getCategoryColor(dish.category) }}
          >
            {dish.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
          {dish.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {dish.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {dish.time}
            </span>
            <span className="flex items-center gap-1">
              <FiBarChart className="w-3 h-3" />
              {dish.difficulty}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <FiHeart className="w-3 h-3" />
            {dish.likes}
          </span>
        </div>
      </Link>
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
