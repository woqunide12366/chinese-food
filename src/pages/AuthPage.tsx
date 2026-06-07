import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiPhone, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { useApp } from "../context/AppContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const navigate = useNavigate();
  const { login, register } = useApp();

  const validatePhone = (v: string) => {
    if (!v) return "请输入手机号";
    if (!/^\d{11}$/.test(v)) return "手机号必须为11位数字";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "请输入密码";
    if (v.length < 6) return "密码至少6位";
    return "";
  };

  const validateConfirm = (v: string) => {
    if (!v) return "请确认密码";
    if (v !== password) return "两次密码不一致";
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors: Record<string, string> = {};

    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (!password) newErrors.password = "请输入密码";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitError("");
    const result = await login(phone, password);
    if (result.success) {
      navigate("/");
    } else {
      setSubmitError(result.error || "登录失败");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors: Record<string, string> = {};

    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;
    const confirmErr = validateConfirm(confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitError("");
    const result = await register(phone, password);
    if (result.success) {
      navigate("/");
    } else {
      setSubmitError(result.error || "注册失败");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setSubmitError("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <FiUser className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "login" ? "用户登录" : "创建账号"}
            </h1>
            <p className="text-gray-500 mt-1">
              {mode === "login" ? "欢迎回到中华美食" : "加入中华美食大家庭"}
            </p>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setPhone(v); setErrors((prev) => ({ ...prev, phone: "" })); }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.phone ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-200"}`}
                  placeholder="请输入11位手机号"
                />
              </div>
              {errors.phone && (<p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.phone}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.password ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-200"}`}
                  placeholder="请输入密码"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (<p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.password}</p>)}
              {mode === "register" && !errors.password && (<p className="mt-1 text-xs text-gray-400">密码至少6位</p>)}
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "" })); }}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.confirmPassword ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-200"}`}
                    placeholder="请再次输入密码"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (<p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>)}
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] mt-2">
              {mode === "login" ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === "login" ? (
              <p className="text-gray-500">无账号？ <button onClick={switchMode} className="text-primary hover:text-primary-dark font-medium">创建新账号</button></p>
            ) : (
              <p className="text-gray-500">已有账号？ <button onClick={switchMode} className="text-primary hover:text-primary-dark font-medium">去登录</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
