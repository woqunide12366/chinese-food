import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { initDB } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3001;

// 数据库
const db = initDB();

// 密码哈希（与前端历史版本兼容）
function hashPassword(pwd) {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(16);
}

// 中间件
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 上传目录（支持环境变量，方便容器部署时挂载 Volume）
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ========== Socket.IO 实时聊天 ==========
io.on("connection", (socket) => {
  socket.on("join", (phone) => { if (phone) { socket.join(phone); } });
  socket.on("joinGroup", (groupId) => { socket.join(`group-${groupId}`); });

  // 私聊消息
  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, content } = data;
    const createdAt = new Date().toISOString();
    const result = db.prepare("INSERT INTO messages (senderId, receiverId, content, createdAt) VALUES (?, ?, ?, ?)").run(senderId, receiverId, content, createdAt);
    const msg = { id: result.lastInsertRowid, senderId, receiverId, content, createdAt, isRead: 0 };
    io.to(receiverId).emit("newMessage", msg);
    io.to(senderId).emit("newMessage", msg);
  });

  // 好友请求通知
  socket.on("friendRequestSent", (data) => {
    io.to(data.receiverId).emit("friendRequestReceived", data);
  });

  // 群聊消息
  socket.on("sendGroupMessage", (data) => {
    const { groupId, senderId, content } = data;
    const createdAt = new Date().toISOString();
    const result = db.prepare("INSERT INTO group_messages (groupId, senderId, content, createdAt) VALUES (?, ?, ?, ?)").run(groupId, senderId, content, createdAt);
    const msg = { id: result.lastInsertRowid, groupId, senderId, content, createdAt };
    io.to(`group-${groupId}`).emit("newGroupMessage", msg);
  });

  socket.on("disconnect", () => {});
});

// ========== 用户资料 API ==========

// 获取用户资料
app.get("/api/profile/:phone", (req, res) => {
  try {
    const user = db.prepare("SELECT phone, username, region, signature, avatar FROM users WHERE phone = ?").get(req.params.phone);
    if (!user) return res.status(404).json({ error: "用户不存在" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "获取资料失败" });
  }
});

// 更新用户资料（含用户名唯一性校验）
app.put("/api/profile/:phone", (req, res) => {
  try {
    const { username, region, signature, avatar } = req.body;
    // 检查用户名唯一性
    if (username && username.trim()) {
      const existing = db.prepare("SELECT phone FROM users WHERE username = ? AND phone != ?").get(username.trim(), req.params.phone);
      if (existing) return res.status(400).json({ error: "该用户名已被使用" });
    }
    const fields = [];
    const values = [];
    if (username !== undefined) { fields.push("username = ?"); values.push(username || ""); }
    if (region !== undefined) { fields.push("region = ?"); values.push(region || ""); }
    if (signature !== undefined) { fields.push("signature = ?"); values.push(signature || ""); }
    if (avatar !== undefined) { fields.push("avatar = ?"); values.push(avatar || ""); }
    if (fields.length > 0) {
      db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE phone = ?`).run(...values, req.params.phone);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "更新资料失败" });
  }
});

// 上传头像
app.post("/api/profile/:phone/avatar", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "未上传文件" });
    const avatarUrl = `/uploads/${req.file.filename}`;
    db.prepare("UPDATE users SET avatar = ? WHERE phone = ?").run(avatarUrl, req.params.phone);
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "上传头像失败" });
  }
});

// 搜索用户（加好友用）
app.get("/api/users/search", (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = db.prepare(
      "SELECT phone, username, region, signature, avatar FROM users WHERE phone LIKE ? OR username LIKE ? LIMIT 20"
    ).all(`%${q}%`, `%${q}%`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "搜索失败" });
  }
});

// ========== 好友 API ==========

// 获取好友列表
app.get("/api/friends/:phone", (req, res) => {
  try {
    const { phone } = req.params;
    // 我发起的
    const sent = db.prepare(`
      SELECT f.id as relationId, f.userId as initiatorId, f.friendId as targetId, f.status, f.createdAt, u.phone as friendPhone, u.username, u.region, u.signature, u.avatar
      FROM friends f JOIN users u ON f.friendId = u.phone
      WHERE f.userId = ?
    `).all(phone);
    // 收到的
    const received = db.prepare(`
      SELECT f.id as relationId, f.userId as initiatorId, f.friendId as targetId, f.status, f.createdAt, u.phone as friendPhone, u.username, u.region, u.signature, u.avatar
      FROM friends f JOIN users u ON f.userId = u.phone
      WHERE f.friendId = ?
    `).all(phone);
    // 合并去重
    const all = [...sent, ...received];
    const map = new Map();
    all.forEach((f) => {
      const friendIdentity = f.friendPhone;
      const key = friendIdentity < phone ? `${friendIdentity}-${phone}` : `${phone}-${friendIdentity}`;
      if (!map.has(key) || f.status === "accepted") map.set(key, f);
    });
    res.json(Array.from(map.values()));
  } catch (err) {
    res.status(500).json({ error: "获取好友列表失败" });
  }
});

// 发送好友请求
app.post("/api/friends/request", (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (userId === friendId) return res.status(400).json({ error: "不能添加自己为好友" });
    const existing = db.prepare("SELECT * FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)").get(userId, friendId, friendId, userId);
    if (existing) return res.status(400).json({ error: "已存在好友关系" });
    const createdAt = new Date().toISOString();
    db.prepare("INSERT INTO friends (userId, friendId, status, createdAt) VALUES (?, ?, 'pending', ?)").run(userId, friendId, createdAt);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "发送请求失败" });
  }
});

// 处理好友请求
app.put("/api/friends/handle", (req, res) => {
  try {
    const { userId, friendId, action } = req.body;
    if (action === "accept") {
      db.prepare("UPDATE friends SET status = 'accepted' WHERE userId = ? AND friendId = ?").run(friendId, userId);
      // 创建双向关系
      const existing = db.prepare("SELECT * FROM friends WHERE userId = ? AND friendId = ?").get(userId, friendId);
      if (!existing) {
        db.prepare("INSERT INTO friends (userId, friendId, status, createdAt) VALUES (?, ?, 'accepted', ?)").run(userId, friendId, new Date().toISOString());
      }
    } else if (action === "reject") {
      db.prepare("DELETE FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)").run(friendId, userId, userId, friendId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "处理请求失败" });
  }
});

// 删除好友
app.delete("/api/friends/:userId/:friendId", (req, res) => {
  try {
    db.prepare("DELETE FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)")
      .run(req.params.userId, req.params.friendId, req.params.friendId, req.params.userId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "删除好友失败" }); }
});

// ========== 聊天消息 API ==========

// 获取与某人的聊天记录
app.get("/api/messages/:userId/:otherId", (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = db.prepare(
      "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY createdAt ASC"
    ).all(userId, otherId, otherId, userId);
    // 标记为已读
    db.prepare("UPDATE messages SET isRead = 1 WHERE senderId = ? AND receiverId = ?").run(otherId, userId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "获取消息失败" });
  }
});

// ========== 群聊 API ==========

// 创建群聊（至少需要有创建者+1个好友）
app.post("/api/groups", (req, res) => {
  try {
    const { name, creatorId, members } = req.body;
    if (!name || !creatorId) return res.status(400).json({ error: "群名称和创建者不能为空" });
    if (!members || !Array.isArray(members) || members.length < 1) return res.status(400).json({ error: "至少需要邀请1位好友" });
    const createdAt = new Date().toISOString();
    const result = db.prepare("INSERT INTO groups (name, creatorId, createdAt) VALUES (?, ?, ?)").run(name, creatorId, createdAt);
    const groupId = result.lastInsertRowid;
    db.prepare("INSERT INTO group_members (groupId, phone, role, joinedAt) VALUES (?, ?, 'owner', ?)").run(groupId, creatorId, createdAt);
    const stmt = db.prepare("INSERT OR IGNORE INTO group_members (groupId, phone, role, joinedAt) VALUES (?, ?, 'member', ?)");
    members.forEach((m) => stmt.run(groupId, m, createdAt));
    res.json({ success: true, groupId });
  } catch (err) { res.status(500).json({ error: "创建群聊失败" }); }
});

// 踢出群成员（仅群主）
app.delete("/api/groups/:groupId/members/:phone", (req, res) => {
  try {
    const { groupId, phone } = req.params;
    const { operatorId } = req.query;
    const group = db.prepare("SELECT creatorId FROM groups WHERE id = ?").get(groupId);
    if (!group) return res.status(404).json({ error: "群聊不存在" });
    if (group.creatorId !== operatorId) return res.status(403).json({ error: "仅群主可操作" });
    db.prepare("DELETE FROM group_members WHERE groupId = ? AND phone = ?").run(groupId, phone);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "踢人失败" }); }
});

// 解散群聊（仅群主）
app.delete("/api/groups/:groupId", (req, res) => {
  try {
    const { groupId } = req.params;
    const { operatorId } = req.query;
    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(groupId);
    if (!group) return res.status(404).json({ error: "群聊不存在" });
    if (group.creatorId !== operatorId) return res.status(403).json({ error: "仅群主可操作" });
    db.prepare("DELETE FROM group_messages WHERE groupId = ?").run(groupId);
    db.prepare("DELETE FROM group_members WHERE groupId = ?").run(groupId);
    db.prepare("DELETE FROM groups WHERE id = ?").run(groupId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "解散失败" }); }
});

// 获取用户的群列表
app.get("/api/groups/:phone", (req, res) => {
  try {
    const groups = db.prepare(`
      SELECT g.id, g.name, g.creatorId, g.createdAt,
        (SELECT COUNT(*) FROM group_members WHERE groupId = g.id) as memberCount
      FROM groups g JOIN group_members gm ON g.id = gm.groupId
      WHERE gm.phone = ? ORDER BY g.createdAt DESC
    `).all(req.params.phone);
    res.json(groups);
  } catch (err) { res.status(500).json({ error: "获取群列表失败" }); }
});

// 获取群成员
app.get("/api/groups/:groupId/members", (req, res) => {
  try {
    const members = db.prepare(`
      SELECT gm.phone, gm.role, u.username, u.region, u.signature, u.avatar
      FROM group_members gm JOIN users u ON gm.phone = u.phone
      WHERE gm.groupId = ?
    `).all(req.params.groupId);
    res.json(members);
  } catch (err) { res.status(500).json({ error: "获取群成员失败" }); }
});

// 获取群消息
app.get("/api/groups/:groupId/messages", (req, res) => {
  try {
    const messages = db.prepare("SELECT * FROM group_messages WHERE groupId = ? ORDER BY createdAt ASC").all(req.params.groupId);
    res.json(messages);
  } catch (err) { res.status(500).json({ error: "获取群消息失败" }); }
});

// ========== 作品 API（原有）=========
app.get("/api/submissions", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM submissions ORDER BY createdAt DESC").all();
    const parsed = rows.map((r) => ({
      ...r, images: JSON.parse(r.images || "[]"), videos: JSON.parse(r.videos || "[]"),
      tags: JSON.parse(r.tags || "[]"), comments: JSON.parse(r.comments || "[]"), likes: r.likes || 0,
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "获取作品失败" });
  }
});

app.post("/api/submissions", upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), (req, res) => {
  try {
    const { author, title, description, region, tags, userId, isAnonymous, isUserCreated } = req.body;
    const imageUrls = (req.files?.images || []).map((f) => `/uploads/${f.filename}`);
    const videoUrls = (req.files?.videos || []).map((f) => `/uploads/${f.filename}`);
    const id = `sub-${Date.now()}`;
    const createdAt = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO submissions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, author || "匿名厨友", title, description, JSON.stringify(imageUrls), JSON.stringify(videoUrls),
      JSON.stringify(tags ? tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : []),
      region || "其他", 0, "[]", createdAt, isUserCreated === "true" ? 1 : 0, isAnonymous === "true" ? 1 : 0, "pending", userId || null
    );
    res.json({ success: true, id });
  } catch (err) { res.status(500).json({ error: "创建作品失败" }); }
});

app.put("/api/submissions/:id", (req, res) => {
  try {
    const { status } = req.body;
    if (status && ["pending", "approved", "rejected"].includes(status))
      db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "更新失败" }); }
});

app.delete("/api/submissions/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT images, videos FROM submissions WHERE id = ?").get(req.params.id);
    if (row) {
      [...JSON.parse(row.images || "[]"), ...JSON.parse(row.videos || "[]")].forEach((p) => {
        const fp = path.join(uploadsDir, path.basename(p));
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
    }
    db.prepare("DELETE FROM submissions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "删除失败" }); }
});

// ========== 用户认证 API（原有，注册时设置默认用户名）=========
app.post("/api/register", (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: "手机号和密码不能为空" });
    if (!/^\d{11}$/.test(phone)) return res.status(400).json({ error: "手机号必须为11位数字" });
    if (db.prepare("SELECT id FROM users WHERE phone = ?").get(phone))
      return res.status(400).json({ error: "该手机号已注册" });
    const createdAt = new Date().toISOString().split("T")[0];
    db.prepare("INSERT INTO users (phone, password, username, createdAt) VALUES (?, ?, ?, ?)")
      .run(phone, hashPassword(password), `用户${phone.slice(-4)}`, createdAt);
    res.json({ success: true, phone });
  } catch (err) { res.status(500).json({ error: "注册失败" }); }
});

app.post("/api/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (!user) return res.status(400).json({ error: "无该账号，请先注册" });
    // 兼容旧明文密码和新哈希密码
    const valid = user.password === hashPassword(password) || user.password === password;
    if (!valid) return res.status(400).json({ error: "密码错误" });
    res.json({ success: true, phone: user.phone, username: user.username });
  } catch (err) { res.status(500).json({ error: "登录失败" }); }
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "abc123") res.json({ success: true });
  else res.status(401).json({ error: "账号或密码错误" });
});

// ========== 生产环境：托管前端静态文件 ==========
const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/socket.io/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log("📦 生产模式: 前端静态文件已挂载");
} else {
  console.log("🔧 开发模式: 使用 Vite 代理前端");
}

// 启动
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🍜 服务已启动: http://localhost:${PORT}`);
});
