#!/bin/bash
# ============================
# 老吃家美食网站 - 一键部署脚本
# 用法: ./scripts/deploy.sh
# ============================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🍜 老吃家美食网站 - Docker 部署"
echo "================================"

# 1. 检查 Docker 环境
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    exit 1
fi

# 2. 加载环境变量（如果存在）
if [ -f ".env" ]; then
    echo "📋 加载环境变量..."
    set -a
    source .env
    set +a
fi

# 3. 创建必要目录
echo "📁 创建数据目录..."
mkdir -p data uploads backups

# 4. 备份现有数据（如果数据库存在）
if [ -f "data/data.db" ]; then
    echo "💾 备份现有数据..."
    bash "$SCRIPT_DIR/backup.sh"
fi

# 5. 构建并启动服务
echo "🐳 构建并启动容器..."
if docker compose version &> /dev/null; then
    docker compose down
    docker compose up --build -d
else
    docker-compose down
    docker-compose up --build -d
fi

# 6. 等待服务就绪
echo "⏳ 等待服务就绪..."
sleep 5

MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost/api/submissions > /dev/null 2>&1; then
        echo "✅ 服务已就绪！"
        break
    fi
    RETRY=$((RETRY + 1))
    echo "  等待中... ($RETRY/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "⚠️  服务启动超时，请检查日志:"
    if docker compose version &> /dev/null; then
        docker compose logs --tail=50 app
    else
        docker-compose logs --tail=50 app
    fi
    exit 1
fi

# 7. 清理旧镜像
echo "🧹 清理未使用的镜像..."
docker image prune -f > /dev/null 2>&1 || true

# 8. 显示状态
echo ""
echo "================================"
echo "🎉 部署完成！"
echo "================================"
echo ""
echo "🌐 访问地址:"
echo "   - HTTP:  http://localhost"
echo "   - API:   http://localhost/api"
echo ""
echo "📊 容器状态:"
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi
echo ""
echo "📜 常用命令:"
echo "   查看日志: docker compose logs -f app"
echo "   停止服务: docker compose down"
echo "   备份数据: ./scripts/backup.sh"
echo ""
