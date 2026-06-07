import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { initDB } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 创建测试用 Express 应用
function createTestApp() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: "*" } });
  const db = initDB();

  app.use(express.json({ limit: "50mb" }));

  // 用户认证 API
  app.post("/api/register", (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) return res.status(400).json({ error: "手机号和密码不能为空" });
      if (!/^\d{11}$/.test(phone)) return res.status(400).json({ error: "手机号必须为11位数字" });
      if (db.prepare("SELECT id FROM users WHERE phone = ?").get(phone))
        return res.status(400).json({ error: "该手机号已注册" });
      const createdAt = new Date().toISOString().split("T")[0];
      db.prepare("INSERT INTO users (phone, password, username, createdAt) VALUES (?, ?, ?, ?)")
        .run(phone, password, `用户${phone.slice(-4)}`, createdAt);
      res.json({ success: true, phone });
    } catch (err) { res.status(500).json({ error: "注册失败" }); }
  });

  app.post("/api/login", (req, res) => {
    try {
      const { phone, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
      if (!user) return res.status(400).json({ error: "无该账号，请先注册" });
      if (user.password !== password) return res.status(400).json({ error: "密码错误" });
      res.json({ success: true, phone: user.phone, username: user.username });
    } catch (err) { res.status(500).json({ error: "登录失败" }); }
  });

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "abc123") res.json({ success: true });
    else res.status(401).json({ error: "账号或密码错误" });
  });

  // 用户资料 API
  app.get("/api/profile/:phone", (req, res) => {
    try {
      const user = db.prepare("SELECT phone, username, region, signature, avatar FROM users WHERE phone = ?").get(req.params.phone);
      if (!user) return res.status(404).json({ error: "用户不存在" });
      res.json(user);
    } catch (err) { res.status(500).json({ error: "获取资料失败" }); }
  });

  app.put("/api/profile/:phone", (req, res) => {
    try {
      const { username, region, signature, avatar } = req.body;
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
    } catch (err) { res.status(500).json({ error: "更新资料失败" }); }
  });

  // 搜索用户
  app.get("/api/users/search", (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);
      const users = db.prepare(
        "SELECT phone, username, region, signature, avatar FROM users WHERE phone LIKE ? OR username LIKE ? LIMIT 20"
      ).all(`%${q}%`, `%${q}%`);
      res.json(users);
    } catch (err) { res.status(500).json({ error: "搜索失败" }); }
  });

  // 好友 API
  app.get("/api/friends/:phone", (req, res) => {
    try {
      const { phone } = req.params;
      const sent = db.prepare(`
        SELECT f.id as relationId, f.userId as initiatorId, f.friendId as targetId, f.status, f.createdAt, u.phone as friendPhone, u.username, u.region, u.signature, u.avatar
        FROM friends f JOIN users u ON f.friendId = u.phone
        WHERE f.userId = ?
      `).all(phone);
      const received = db.prepare(`
        SELECT f.id as relationId, f.userId as initiatorId, f.friendId as targetId, f.status, f.createdAt, u.phone as friendPhone, u.username, u.region, u.signature, u.avatar
        FROM friends f JOIN users u ON f.userId = u.phone
        WHERE f.friendId = ?
      `).all(phone);
      const all = [...sent, ...received];
      const map = new Map();
      all.forEach((f) => {
        const friendIdentity = f.friendPhone;
        const key = friendIdentity < phone ? `${friendIdentity}-${phone}` : `${phone}-${friendIdentity}`;
        if (!map.has(key) || f.status === "accepted") map.set(key, f);
      });
      res.json(Array.from(map.values()));
    } catch (err) { res.status(500).json({ error: "获取好友列表失败" }); }
  });

  app.post("/api/friends/request", (req, res) => {
    try {
      const { userId, friendId } = req.body;
      if (userId === friendId) return res.status(400).json({ error: "不能添加自己为好友" });
      const existing = db.prepare("SELECT * FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)").get(userId, friendId, friendId, userId);
      if (existing) return res.status(400).json({ error: "已存在好友关系" });
      const createdAt = new Date().toISOString();
      db.prepare("INSERT INTO friends (userId, friendId, status, createdAt) VALUES (?, ?, 'pending', ?)").run(userId, friendId, createdAt);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "发送请求失败" }); }
  });

  app.put("/api/friends/handle", (req, res) => {
    try {
      const { userId, friendId, action } = req.body;
      if (action === "accept") {
        db.prepare("UPDATE friends SET status = 'accepted' WHERE userId = ? AND friendId = ?").run(friendId, userId);
        const existing = db.prepare("SELECT * FROM friends WHERE userId = ? AND friendId = ?").get(userId, friendId);
        if (!existing) {
          db.prepare("INSERT INTO friends (userId, friendId, status, createdAt) VALUES (?, ?, 'accepted', ?)").run(userId, friendId, new Date().toISOString());
        }
      } else if (action === "reject") {
        db.prepare("DELETE FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)").run(friendId, userId, userId, friendId);
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "处理请求失败" }); }
  });

  // 作品 API
  app.get("/api/submissions", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM submissions ORDER BY createdAt DESC").all();
      const parsed = rows.map((r) => ({
        ...r, images: JSON.parse(r.images || "[]"), videos: JSON.parse(r.videos || "[]"),
        tags: JSON.parse(r.tags || "[]"), comments: JSON.parse(r.comments || "[]"), likes: r.likes || 0,
      }));
      res.json(parsed);
    } catch (err) { res.status(500).json({ error: "获取作品失败" }); }
  });

  app.post("/api/submissions", (req, res) => {
    try {
      const { author, title, description, region, tags, userId, isAnonymous, isUserCreated } = req.body;
      const id = `sub-${Date.now()}`;
      const createdAt = new Date().toISOString().split("T")[0];
      db.prepare(`INSERT INTO submissions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        id, author || "匿名厨友", title, description, "[]", "[]",
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
      db.prepare("DELETE FROM submissions WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "删除失败" }); }
  });

  return { app, server, db };
}

describe("Backend API Tests", () => {
  let app;
  let server;
  let db;

  beforeAll(() => {
    const testSetup = createTestApp();
    app = testSetup.app;
    server = testSetup.server;
    db = testSetup.db;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // 清理测试数据
    db.prepare("DELETE FROM users").run();
    db.prepare("DELETE FROM friends").run();
    db.prepare("DELETE FROM submissions").run();
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.phone).toBe("13800138000");
    });

    it("should reject registration with invalid phone", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({ phone: "123", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("手机号必须为11位数字");
    });

    it("should reject duplicate registration", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password456" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("该手机号已注册");
    });

    it("should login with correct credentials", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app)
        .post("/api/login")
        .send({ phone: "13800138000", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.phone).toBe("13800138000");
    });

    it("should reject login with wrong password", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app)
        .post("/api/login")
        .send({ phone: "13800138000", password: "wrongpassword" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("密码错误");
    });

    it("should reject login for non-existent user", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({ phone: "13800138000", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("无该账号，请先注册");
    });

    it("should login as admin with correct credentials", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ username: "admin", password: "abc123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject admin login with wrong credentials", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ username: "admin", password: "wrongpass" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("账号或密码错误");
    });
  });

  describe("User Profile", () => {
    it("should get user profile", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app).get("/api/profile/13800138000");

      expect(res.status).toBe(200);
      expect(res.body.phone).toBe("13800138000");
      expect(res.body.username).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app).get("/api/profile/99999999999");
      expect(res.status).toBe(404);
    });

    it("should update user profile", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app)
        .put("/api/profile/13800138000")
        .send({ username: "新用户名", region: "四川", signature: "爱吃辣" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const profileRes = await request(app).get("/api/profile/13800138000");
      expect(profileRes.body.username).toBe("新用户名");
      expect(profileRes.body.region).toBe("四川");
      expect(profileRes.body.signature).toBe("爱吃辣");
    });

    it("should reject duplicate username", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });
      await request(app)
        .post("/api/register")
        .send({ phone: "13900139000", password: "password123" });

      await request(app)
        .put("/api/profile/13800138000")
        .send({ username: "唯一用户名" });

      const res = await request(app)
        .put("/api/profile/13900139000")
        .send({ username: "唯一用户名" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("该用户名已被使用");
    });
  });

  describe("Friend System", () => {
    it("should send friend request", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });
      await request(app)
        .post("/api/register")
        .send({ phone: "13900139000", password: "password123" });

      const res = await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13900139000" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject self-friend request", async () => {
      const res = await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13800138000" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("不能添加自己为好友");
    });

    it("should reject duplicate friend request", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });
      await request(app)
        .post("/api/register")
        .send({ phone: "13900139000", password: "password123" });

      await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13900139000" });

      const res = await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13900139000" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("已存在好友关系");
    });

    it("should accept friend request", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });
      await request(app)
        .post("/api/register")
        .send({ phone: "13900139000", password: "password123" });

      await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13900139000" });

      const res = await request(app)
        .put("/api/friends/handle")
        .send({ userId: "13900139000", friendId: "13800138000", action: "accept" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const friendsRes = await request(app).get("/api/friends/13800138000");
      const acceptedFriends = friendsRes.body.filter((f) => f.status === "accepted");
      expect(acceptedFriends.length).toBeGreaterThan(0);
    });

    it("should reject friend request", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });
      await request(app)
        .post("/api/register")
        .send({ phone: "13900139000", password: "password123" });

      await request(app)
        .post("/api/friends/request")
        .send({ userId: "13800138000", friendId: "13900139000" });

      const res = await request(app)
        .put("/api/friends/handle")
        .send({ userId: "13900139000", friendId: "13800138000", action: "reject" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const friendsRes = await request(app).get("/api/friends/13800138000");
      expect(friendsRes.body.length).toBe(0);
    });
  });

  describe("Submissions", () => {
    it("should create a submission", async () => {
      const res = await request(app)
        .post("/api/submissions")
        .send({
          author: "测试用户",
          title: "测试作品",
          description: "这是一个测试作品",
          region: "四川",
          tags: "川菜,辣",
          userId: "13800138000",
          isAnonymous: "false",
          isUserCreated: "true",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.id).toBeDefined();
    });

    it("should list submissions", async () => {
      await request(app)
        .post("/api/submissions")
        .send({
          author: "测试用户",
          title: "测试作品",
          description: "描述",
          region: "四川",
          userId: "13800138000",
        });

      const res = await request(app).get("/api/submissions");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should update submission status", async () => {
      const createRes = await request(app)
        .post("/api/submissions")
        .send({
          author: "测试用户",
          title: "测试作品",
          description: "描述",
          region: "四川",
        });

      const id = createRes.body.id;

      const res = await request(app)
        .put(`/api/submissions/${id}`)
        .send({ status: "approved" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should delete submission", async () => {
      const createRes = await request(app)
        .post("/api/submissions")
        .send({
          author: "测试用户",
          title: "测试作品",
          description: "描述",
          region: "四川",
        });

      const id = createRes.body.id;

      const res = await request(app).delete(`/api/submissions/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("User Search", () => {
    it("should search users by phone", async () => {
      await request(app)
        .post("/api/register")
        .send({ phone: "13800138000", password: "password123" });

      const res = await request(app).get("/api/users/search?q=13800");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return empty array for empty query", async () => {
      const res = await request(app).get("/api/users/search");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
