const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const serverless = require("serverless-http");

let app = null;
const cloudbaseModule = require("@cloudbase/node-sdk");
const cloudbase = cloudbaseModule.default || cloudbaseModule;

// 集合名称列表
const COLLECTIONS = ["users", "submissions", "friends", "messages", "groups", "group_members", "group_messages"];

async function ensureCollections(db) {
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name);
    } catch (e) {
      // 集合已存在则忽略
    }
  }
}

async function initApp() {
  const appEnv = cloudbase.init({
    env: "chinesefood-d2gylcicj48fe6762",
  });
  const db = appEnv.database();

  // 确保所有集合已创建
  await ensureCollections(db);

  app = express();
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // 请求日志中间件
  app.use((req, res, next) => {
    log(req.method, req.path, JSON.stringify(req.body).slice(0, 300));
    next();
  });

  const uploadsDir = path.join("/tmp", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir));
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname)}`),
  });
  const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

  function log(...args) {
    console.log("[chinese-food]", ...args);
  }

  // ===== 辅助函数 =====
  async function queryAll(collection, filter = {}) {
    log("queryAll", collection, JSON.stringify(filter));
    const res = await db.collection(collection).where(filter).orderBy("createdAt", "desc").get();
    log("queryAll result", res.data?.length || 0);
    return res.data || [];
  }
  async function queryOne(collection, filter = {}) {
    log("queryOne", collection, JSON.stringify(filter));
    const res = await db.collection(collection).where(filter).limit(1).get();
    log("queryOne result", res.data?.length || 0);
    return res.data && res.data.length > 0 ? res.data[0] : null;
  }
  async function addDoc(collection, data) {
    log("addDoc", collection, JSON.stringify(data).slice(0, 200));
    const result = await db.collection(collection).add({ data });
    log("addDoc result", JSON.stringify(result));
    return result;
  }
  async function updateDoc(collection, filter, data) {
    return db.collection(collection).where(filter).update(data);
  }
  async function deleteDocs(collection, filter) {
    return db.collection(collection).where(filter).remove();
  }
  const now = () => new Date().toISOString();

  // ===== API Routes =====
  app.get("/api/submissions", async (req, res) => {
    try {
      const rows = await queryAll("submissions");
      res.json(rows.map((r) => ({ ...r, images: typeof r.images === "string" ? JSON.parse(r.images || "[]") : r.images || [], videos: typeof r.videos === "string" ? JSON.parse(r.videos || "[]") : r.videos || [], tags: typeof r.tags === "string" ? JSON.parse(r.tags || "[]") : r.tags || [], comments: typeof r.comments === "string" ? JSON.parse(r.comments || "[]") : r.comments || [], likes: r.likes || 0 })));
    } catch (err) { res.status(500).json({ error: "获取作品失败" }); }
  });

  app.post("/api/submissions", upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), async (req, res) => {
    try {
      const { author, title, description, region, tags, userId, isAnonymous, isUserCreated } = req.body;
      const imageUrls = (req.files?.images || []).map((f) => `/uploads/${f.filename}`);
      const videoUrls = (req.files?.videos || []).map((f) => `/uploads/${f.filename}`);
      const id = `sub-${Date.now()}`;
      const createdAt = now().split("T")[0];
      await addDoc("submissions", {
        _id: id, id,
        author: author || "匿名厨友", title, description,
        images: JSON.stringify(imageUrls), videos: JSON.stringify(videoUrls),
        tags: JSON.stringify(tags ? tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : []),
        region: region || "其他", likes: 0, comments: "[]",
        createdAt,
        isUserCreated: isUserCreated === "true" ? 1 : 0,
        isAnonymous: isAnonymous === "true" ? 1 : 0,
        status: "pending",
        userId: userId || null,
      });
      res.json({ success: true, id });
    } catch (err) { res.status(500).json({ error: "创建作品失败" }); }
  });

  app.put("/api/submissions/:id", async (req, res) => {
    try {
      if (["pending", "approved", "rejected"].includes(req.body.status)) {
        await updateDoc("submissions", { id: req.params.id }, { status: req.body.status });
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "更新失败" }); }
  });

  app.delete("/api/submissions/:id", async (req, res) => {
    try {
      const row = await queryOne("submissions", { id: req.params.id });
      if (row) {
        const imgs = typeof row.images === "string" ? JSON.parse(row.images || "[]") : row.images || [];
        const vids = typeof row.videos === "string" ? JSON.parse(row.videos || "[]") : row.videos || [];
        [...imgs, ...vids].forEach((p) => { const fp = path.join(uploadsDir, path.basename(p)); if (fs.existsSync(fp)) fs.unlinkSync(fp); });
      }
      await deleteDocs("submissions", { id: req.params.id });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "删除失败" }); }
  });

  // ===== 用户认证 =====
  app.post("/api/register", async (req, res) => {
    try {
      const { phone, password } = req.body;
      log("register attempt", phone);
      if (!phone || !password) return res.status(400).json({ error: "手机号和密码不能为空" });
      if (!/^\d{11}$/.test(phone)) return res.status(400).json({ error: "手机号必须为11位数字" });
      const existing = await queryOne("users", { phone });
      if (existing) return res.status(400).json({ error: "该手机号已注册" });
      await addDoc("users", { phone, password, username: `用户${phone.slice(-4)}`, region: "", signature: "", createdAt: now().split("T")[0] });
      log("register success", phone);
      res.json({ success: true, phone });
    } catch (err) { log("register error", err.message, err.stack); res.status(500).json({ error: "注册失败: " + err.message }); }
  });

  app.post("/api/login", async (req, res) => {
    try {
      log("login attempt", req.body.phone);
      const user = await queryOne("users", { phone: req.body.phone });
      if (!user) return res.status(400).json({ error: "无该账号，请先注册" });
      if (user.password !== req.body.password) return res.status(400).json({ error: "密码错误" });
      log("login success", user.phone);
      res.json({ success: true, phone: user.phone, username: user.username });
    } catch (err) { log("login error", err.message, err.stack); res.status(500).json({ error: "登录失败: " + err.message }); }
  });

  app.get("/api/profile/:phone", async (req, res) => {
    try {
      const user = await queryOne("users", { phone: req.params.phone });
      if (!user) return res.status(404).json({ error: "用户不存在" });
      res.json({ phone: user.phone, username: user.username, region: user.region, signature: user.signature });
    } catch (err) { res.status(500).json({ error: "获取资料失败" }); }
  });

  app.put("/api/profile/:phone", async (req, res) => {
    try {
      const { username, region, signature } = req.body;
      if (username && username.trim()) {
        const existing = await queryOne("users", { username: username.trim() });
        if (existing && existing.phone !== req.params.phone) return res.status(400).json({ error: "该用户名已被使用" });
      }
      await updateDoc("users", { phone: req.params.phone }, { username: username || "", region: region || "", signature: signature || "" });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "更新资料失败" }); }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);
      const result = await db.collection("users").where(db.command.or([{ phone: db.command.regex(`.*${q}.*`) }, { username: db.command.regex(`.*${q}.*`) }])).limit(20).get();
      res.json((result.data || []).map((u) => ({ phone: u.phone, username: u.username, region: u.region, signature: u.signature })));
    } catch (err) { res.status(500).json({ error: "搜索失败" }); }
  });

  // ===== 好友 =====
  app.get("/api/friends/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const sent = await db.collection("friends").where({ userId: phone }).get();
      const received = await db.collection("friends").where({ friendId: phone }).get();
      const allData = [...(sent.data || []), ...(received.data || [])];
      const map = new Map();
      for (const f of allData) {
        const friendPhone = f.userId === phone ? f.friendId : f.userId;
        const key = friendPhone < phone ? `${friendPhone}-${phone}` : `${phone}-${friendPhone}`;
        if (!map.has(key) || f.status === "accepted") {
          const userDoc = await queryOne("users", { phone: friendPhone });
          map.set(key, {
            relationId: f._id, initiatorId: f.userId, targetId: f.friendId, status: f.status, createdAt: f.createdAt,
            friendPhone, username: userDoc?.username || "", region: userDoc?.region || "", signature: userDoc?.signature || "",
          });
        }
      }
      res.json(Array.from(map.values()));
    } catch (err) { res.status(500).json({ error: "获取好友列表失败" }); }
  });

  app.post("/api/friends/request", async (req, res) => {
    try {
      const { userId, friendId } = req.body;
      if (userId === friendId) return res.status(400).json({ error: "不能添加自己为好友" });
      const existing = await queryOne("friends", { userId, friendId });
      const existingReverse = await queryOne("friends", { userId: friendId, friendId: userId });
      if (existing || existingReverse) return res.status(400).json({ error: "已存在好友关系" });
      await addDoc("friends", { userId, friendId, status: "pending", createdAt: now() });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "发送请求失败" }); }
  });

  app.put("/api/friends/handle", async (req, res) => {
    try {
      const { userId, friendId, action } = req.body;
      if (action === "accept") {
        await updateDoc("friends", { userId: friendId, friendId: userId }, { status: "accepted" });
        const reverse = await queryOne("friends", { userId, friendId });
        if (!reverse) await addDoc("friends", { userId, friendId, status: "accepted", createdAt: now() });
      } else if (action === "reject") {
        await deleteDocs("friends", { userId: friendId, friendId: userId });
        await deleteDocs("friends", { userId, friendId });
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "处理请求失败" }); }
  });

  app.delete("/api/friends/:userId/:friendId", async (req, res) => {
    try {
      await deleteDocs("friends", { userId: req.params.userId, friendId: req.params.friendId });
      await deleteDocs("friends", { userId: req.params.friendId, friendId: req.params.userId });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "删除好友失败" }); }
  });

  // ===== 私聊消息 =====
  app.get("/api/messages/:userId/:otherId", async (req, res) => {
    try {
      const { userId, otherId } = req.params;
      const msgs = await db.collection("messages")
        .where(db.command.or([{ senderId: userId, receiverId: otherId }, { senderId: otherId, receiverId: userId }]))
        .orderBy("createdAt", "asc").get();
      await updateDoc("messages", { senderId: otherId, receiverId: userId }, { isRead: 1 });
      res.json(msgs.data || []);
    } catch (err) { res.status(500).json({ error: "获取消息失败" }); }
  });

  // ===== 群聊 =====
  app.post("/api/groups", async (req, res) => {
    try {
      const { name, creatorId, members } = req.body;
      if (!name || !creatorId) return res.status(400).json({ error: "群名称和创建者不能为空" });
      if (!members || members.length < 1) return res.status(400).json({ error: "至少需要邀请1位好友" });
      const createdAt = now();
      const gRes = await addDoc("groups", { name, creatorId, createdAt });
      const gid = gRes.id;
      await addDoc("group_members", { groupId: gid, phone: creatorId, role: "owner", joinedAt: createdAt });
      for (const m of members) {
        try { await addDoc("group_members", { groupId: gid, phone: m, role: "member", joinedAt: createdAt }); } catch {}
      }
      res.json({ success: true, groupId: gid });
    } catch (err) { res.status(500).json({ error: "创建群聊失败" }); }
  });

  app.get("/api/groups/:phone", async (req, res) => {
    try {
      const memberships = await db.collection("group_members").where({ phone: req.params.phone }).get();
      const groupIds = (memberships.data || []).map((m) => m.groupId);
      if (groupIds.length === 0) return res.json([]);
      const groups = await db.collection("groups").where(db.command.in("_id", groupIds)).get();
      const result = [];
      for (const g of groups.data || []) {
        const countRes = await db.collection("group_members").where({ groupId: g._id }).count();
        result.push({ id: g._id, name: g.name, creatorId: g.creatorId, createdAt: g.createdAt, memberCount: countRes.total || 0 });
      }
      res.json(result);
    } catch (err) { res.status(500).json({ error: "获取群列表失败" }); }
  });

  app.get("/api/groups/:groupId/messages", async (req, res) => {
    try {
      const msgs = await db.collection("group_messages").where({ groupId: req.params.groupId }).orderBy("createdAt", "asc").get();
      res.json(msgs.data || []);
    } catch (err) { res.status(500).json({ error: "获取群消息失败" }); }
  });

  app.get("/api/groups/:groupId/members", async (req, res) => {
    try {
      const members = await db.collection("group_members").where({ groupId: req.params.groupId }).get();
      res.json(members.data || []);
    } catch (err) { res.status(500).json({ error: "获取群成员失败" }); }
  });

  app.delete("/api/groups/:groupId", async (req, res) => {
    try {
      await deleteDocs("group_messages", { groupId: req.params.groupId });
      await deleteDocs("group_members", { groupId: req.params.groupId });
      await deleteDocs("groups", { _id: req.params.groupId });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "解散失败" }); }
  });
}

// 云函数入口 - 同时支持 HTTP 触发和 callFunction 调用
let handler = null;

exports.main = async (event, context) => {
  if (!app) {
    await initApp();
    handler = serverless(app);
  }

  // 判断是否是 callFunction 调用（event 中有 path 字段）
  if (event.path && event.path.startsWith("/api")) {
    const method = event.method || "POST";
    const path = event.path;
    const bodyData = { ...event };
    delete bodyData.path;
    delete bodyData.method;

    // 构造模拟 HTTP 请求
    const mockEvent = {
      httpMethod: method,
      path: path,
      queryString: event.query || {},
      headers: { "content-type": "application/json" },
      body: JSON.stringify(bodyData),
      requestContext: { sourceIp: context.source_ip || "127.0.0.1" },
    };

    const result = await handler(mockEvent, context);
    // 解析 serverless-http 返回的结果
    let responseBody = result.body;
    try { responseBody = JSON.parse(result.body); } catch {}
    return responseBody;
  }

  // HTTP 触发（正常 serverless-http 处理）
  return await handler(event, context);
};
