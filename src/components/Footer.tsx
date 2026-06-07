import { FiHeart } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">中华美食</h3>
            <p className="text-sm leading-relaxed">
              传承千年烹饪智慧，品味中华饮食文化。从家常小菜到古法大菜，让每一道菜都讲述一个故事。
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">快速导航</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-primary transition-colors">
                  菜系分类
                </a>
              </li>
              <li>
                <a href="/ancient" className="hover:text-primary transition-colors">
                  古法专区
                </a>
              </li>
              <li>
                <a href="/community" className="hover:text-primary transition-colors">
                  交流区
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">联系我们</h4>
            <p className="text-sm leading-relaxed">
              欢迎投稿您拿手的中国菜，分享烹饪心得，或提出宝贵建议。
            </p>
            <p className="text-sm mt-2 text-gray-400">
              邮箱：contact@chinesefood.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            用 <FiHeart className="w-3 h-3 text-primary" /> 传承中华美食文化
          </p>
          <p className="mt-1">中华美食 - 品味千年传承</p>
          <p className="mt-3 text-primary font-medium">
            如有问题请联系：12345678999
          </p>
        </div>
      </div>
    </footer>
  );
}
