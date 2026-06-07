import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiShield, FiMessageSquare } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { dishes } from "../data/dishes";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { setSearchQuery, currentUser, isLoggedIn, logout, userProfile, isAdminLoggedIn } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "首页" },
    { path: "/categories", label: "菜系分类" },
    { path: "/videos", label: "美食视频" },
    { path: "/ancient", label: "古法专区" },
    { path: "/submissions", label: "厨友作品" },
    { path: "/community", label: "交流区" },
    { path: "/social", label: "社交" },
  ];

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = localSearch.trim();
    if (!q) return;

    const exactDish = dishes.find(
      (d) => d.name === q || d.name.toLowerCase() === q.toLowerCase()
    );
    if (exactDish) {
      setSearchQuery("");
      setLocalSearch("");
      setSearchOpen(false);
      navigate(`/dish/${exactDish.id}`);
      return;
    }

    setSearchQuery(q);
    setLocalSearch("");
    setSearchOpen(false);
    navigate(`/categories?search=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              中华老吃家
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiSearch className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="relative">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <FiUser className="w-5 h-5 text-primary" />
                    <span className="hidden sm:inline text-xs text-gray-600 max-w-[100px] truncate">
                      {userProfile?.username || (currentUser?.phone ? currentUser.phone.slice(0, 3) + "****" + currentUser.phone.slice(-4) : "")}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">个人信息</Link>
                      <Link to="/my-works" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">我的作品</Link>
                      {isAdminLoggedIn && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <FiShield className="w-3.5 h-3.5" />
                          管理后台
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FiLogOut className="w-3.5 h-3.5" />
                        退出登录
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/auth"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <FiUser className="w-5 h-5 text-gray-600" />
                  <span className="hidden sm:inline text-xs text-gray-500">登录</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? (
                <FiX className="w-5 h-5 text-gray-600" />
              ) : (
                <FiMenu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索菜名..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
                title="搜索"
              >
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-200">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
