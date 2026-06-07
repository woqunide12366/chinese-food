# ========== 阶段1：构建前端 ==========
FROM node:20-slim AS builder
WORKDIR /app

# 使用国内 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ========== 阶段2：运行后端 ==========
FROM node:20-slim AS runner
WORKDIR /app

# 换 Debian 国内源 + 安装依赖
RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null || sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# 创建非 root 用户（安全最佳实践）
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --create-home nodejs

# 安装后端依赖
COPY server/package*.json ./server/
RUN npm config set registry https://registry.npmmirror.com && \
    cd server && npm ci --production

# 复制后端源码
COPY server/ ./server/

# 复制构建好的前端产物（server/index.js 通过 ../dist 引用）
COPY --from=builder /app/dist ./dist

# 创建数据目录并设置权限
RUN mkdir -p /app/server/uploads /data && \
    chown -R nodejs:nodejs /app /data

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/submissions', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/server
CMD ["node", "index.js"]
