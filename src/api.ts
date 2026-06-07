import type { Submission } from "./types/submission";

const API_BASE = ""; // 使用相对路径，通过 Vite proxy 转发到 localhost:3001

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ========== 作品管理 ==========
export async function loadSubmissions(): Promise<Submission[]> {
  try {
    return await fetchJson(`${API_BASE}/api/submissions`);
  } catch { return []; }
}

export async function createSubmission(formData: FormData): Promise<{ success: boolean; id?: string }> {
  try {
    const data = await fetchJson(`${API_BASE}/api/submissions`, {
      method: "POST",
      body: formData,
    });
    return { success: true, id: data.id };
  } catch (e: any) {
    console.error("createSubmission error:", e);
    return { success: false };
  }
}

export async function updateSubmissionStatus(id: string, status: string): Promise<{ success: boolean }> {
  try {
    await fetchJson(`${API_BASE}/api/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteSubmission(id: string): Promise<{ success: boolean }> {
  try {
    await fetchJson(`${API_BASE}/api/submissions/${id}`, { method: "DELETE" });
    return { success: true };
  } catch { return { success: false }; }
}

// ========== 用户认证 ==========
export async function apiRegister(phone: string, password: string) {
  try {
    const data = await fetchJson(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    return { success: true, phone: data.phone };
  } catch (e: any) {
    return { success: false, error: e.message || "注册失败" };
  }
}

export async function apiLogin(phone: string, password: string) {
  try {
    const data = await fetchJson(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    return { success: true, phone: data.phone, username: data.username };
  } catch (e: any) {
    return { success: false, error: e.message || "登录失败" };
  }
}

// ========== 用户资料 ==========
export async function getProfile(phone: string) {
  try {
    return await fetchJson(`${API_BASE}/api/profile/${phone}`);
  } catch { return null; }
}

export async function updateProfile(phone: string, data: { username?: string; region?: string; signature?: string; avatar?: string }) {
  try {
    await fetchJson(`${API_BASE}/api/profile/${phone}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch { return { success: false }; }
}

export async function uploadAvatar(phone: string, file: File): Promise<{ success: boolean; avatar?: string }> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const data = await fetchJson(`${API_BASE}/api/profile/${phone}/avatar`, {
      method: "POST",
      body: formData,
    });
    return { success: true, avatar: data.avatar };
  } catch { return { success: false }; }
}

export async function searchUsers(q: string) {
  try {
    return await fetchJson(`${API_BASE}/api/users/search?q=${encodeURIComponent(q)}`);
  } catch { return []; }
}

// ========== 好友 ==========
export async function getFriends(phone: string) {
  try {
    return await fetchJson(`${API_BASE}/api/friends/${phone}`);
  } catch { return []; }
}

export async function sendFriendRequest(userId: string, friendId: string) {
  try {
    await fetchJson(`${API_BASE}/api/friends/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, friendId }),
    });
    return { success: true };
  } catch { return { success: false }; }
}

export async function handleFriendRequest(userId: string, friendId: string, action: "accept" | "reject") {
  try {
    await fetchJson(`${API_BASE}/api/friends/handle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, friendId, action }),
    });
    return { success: true };
  } catch { return { success: false }; }
}

// ========== 私聊消息 ==========
export async function getMessages(userId: string, otherId: string) {
  try {
    return await fetchJson(`${API_BASE}/api/messages/${userId}/${otherId}`);
  } catch { return []; }
}

// ========== 好友删除 ==========
export async function unfriend(userId: string, friendId: string) {
  try {
    await fetchJson(`${API_BASE}/api/friends/${userId}/${friendId}`, { method: "DELETE" });
    return { success: true };
  } catch { return { success: false }; }
}

// ========== 群聊 ==========
export async function createGroup(name: string, creatorId: string, members: string[]) {
  try {
    const data = await fetchJson(`${API_BASE}/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, creatorId, members }),
    });
    return { success: true, groupId: data.groupId };
  } catch { return { success: false }; }
}

export async function getGroups(phone: string) {
  try {
    return await fetchJson(`${API_BASE}/api/groups/${phone}`);
  } catch { return []; }
}

export async function getGroupMembers(groupId: number) {
  try {
    return await fetchJson(`${API_BASE}/api/groups/${groupId}/members`);
  } catch { return []; }
}

export async function getGroupMessages(groupId: number) {
  try {
    return await fetchJson(`${API_BASE}/api/groups/${groupId}/messages`);
  } catch { return []; }
}

export async function kickGroupMember(groupId: number, phone: string, operatorId: string) {
  try {
    await fetchJson(
      `${API_BASE}/api/groups/${groupId}/members/${phone}?operatorId=${encodeURIComponent(operatorId)}`,
      { method: "DELETE" }
    );
    return { success: true };
  } catch { return { success: false }; }
}

export async function dissolveGroup(groupId: number, operatorId: string) {
  try {
    await fetchJson(
      `${API_BASE}/api/groups/${groupId}?operatorId=${encodeURIComponent(operatorId)}`,
      { method: "DELETE" }
    );
    return { success: true };
  } catch { return { success: false }; }
}
