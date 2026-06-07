import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function initDB() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, "data.db");
  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  // 用户表
  db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE NOT NULL, password TEXT NOT NULL, username TEXT DEFAULT '', region TEXT DEFAULT '', signature TEXT DEFAULT '', createdAt TEXT NOT NULL)`);
  try { db.exec("ALTER TABLE users ADD COLUMN username TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN region TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN signature TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''"); } catch {}

  // 作品表
  db.exec(`CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, author TEXT NOT NULL DEFAULT '匿名厨友', title TEXT NOT NULL, description TEXT NOT NULL, images TEXT DEFAULT '[]', videos TEXT DEFAULT '[]', tags TEXT DEFAULT '[]', region TEXT DEFAULT '其他', likes INTEGER DEFAULT 0, comments TEXT DEFAULT '[]', createdAt TEXT NOT NULL, isUserCreated INTEGER DEFAULT 0, isAnonymous INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', userId TEXT)`);

  // 好友关系表
  db.exec(`CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, friendId TEXT NOT NULL, status TEXT DEFAULT 'pending', createdAt TEXT NOT NULL, UNIQUE(userId, friendId))`);

  // 私聊消息表
  db.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, senderId TEXT NOT NULL, receiverId TEXT NOT NULL, content TEXT NOT NULL, createdAt TEXT NOT NULL, isRead INTEGER DEFAULT 0)`);

  // 群聊表
  db.exec(`CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, creatorId TEXT NOT NULL, createdAt TEXT NOT NULL)`);

  // 群成员表
  db.exec(`CREATE TABLE IF NOT EXISTS group_members (id INTEGER PRIMARY KEY AUTOINCREMENT, groupId INTEGER NOT NULL, phone TEXT NOT NULL, role TEXT DEFAULT 'member', joinedAt TEXT NOT NULL, UNIQUE(groupId, phone))`);

  // 群消息表
  db.exec(`CREATE TABLE IF NOT EXISTS group_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, groupId INTEGER NOT NULL, senderId TEXT NOT NULL, content TEXT NOT NULL, createdAt TEXT NOT NULL)`);

  console.log("✅ 数据库初始化完成");
  return db;
}
