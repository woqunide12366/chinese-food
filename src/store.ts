// 统一 localStorage 数据管理

export interface StoredUser {
  phone: string;
  password: string;
  createdAt: string;
}

const USERS_KEY = "chinese-food-users";
const SUBMISSIONS_KEY = "chinese-food-submissions";
const MESSAGES_KEY = "chinese-food-community-messages";
const CURRENT_USER_KEY = "chinese-food-current-user";

// ========== 用户管理 ==========
export function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(phone: string): StoredUser | undefined {
  return loadUsers().find((u) => u.phone === phone);
}

export function registerUser(phone: string, password: string): { success: boolean; error?: string } {
  const users = loadUsers();
  if (users.find((u) => u.phone === phone)) {
    return { success: false, error: "该手机号已注册" };
  }
  users.push({ phone, password, createdAt: new Date().toISOString().split("T")[0] });
  saveUsers(users);
  return { success: true };
}

export function verifyLogin(phone: string, password: string): { success: boolean; error?: string } {
  const user = findUser(phone);
  if (!user) {
    return { success: false, error: "无该账号，请先注册" };
  }
  if (user.password !== password) {
    return { success: false, error: "密码错误" };
  }
  return { success: true };
}

// ========== 当前登录用户 ==========
export interface CurrentUserInfo {
  phone: string;
}

export function saveCurrentUser(info: CurrentUserInfo) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(info));
}

export function loadCurrentUser(): CurrentUserInfo | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ========== Submission 管理 ==========
export function loadSubmissionsData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSubmissionsData<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ========== Admin 凭证 ==========
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "abc123",
};
