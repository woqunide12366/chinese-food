# 管理员登录信息

## 管理员账号
- **管理员账号**: `admin`
- **管理员密码**: `abc123`
- **登录地址**: `http://localhost:5173/admin-login`

## 用户登录测试账号（已注册）
- **手机号**: `13800138000`
- **密码**: `test123`

## 项目启动方式

### 方式一：开发模式（推荐）
1. 启动后端：`cd server && node index.js`（运行在端口 3001）
2. 启动前端：`npm run dev`（运行在端口 5173）
3. 访问 `http://localhost:5173`

### 方式二：生产模式
1. 构建前端：`npm run build`
2. 启动后端：`cd server && node index.js`
3. 访问 `http://localhost:3001`

## 项目运行状态（当前）
- ✅ 前端服务：http://localhost:5173
- ✅ 后端服务：http://localhost:3001
- ✅ 注册/登录 API：正常
- ✅ 管理员登录 API：正常
