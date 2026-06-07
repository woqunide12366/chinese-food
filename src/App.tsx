import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import DishDetail from "./pages/DishDetail";
import AncientZone from "./pages/AncientZone";
import Videos from "./pages/Videos";
import Community from "./pages/Community";
import Submissions from "./pages/Submissions";
import MyWorks from "./pages/MyWorks";
import Favorites from "./pages/Favorites";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import Profile from "./pages/Profile";
import Social from "./pages/Social";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useApp();
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/dish/:id" element={<DishDetail />} />
            <Route path="/ancient" element={<AncientZone />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/community" element={<Community />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/my-works" element={<MyWorks />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/social" element={<Social />} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
