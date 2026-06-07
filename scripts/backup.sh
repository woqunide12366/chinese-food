#!/bin/bash
# ============================
# 老吃家美食网站 - 数据备份脚本
# 用法: ./scripts/backup.sh
# ============================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"
KEEP_DAYS=7

echo "🍜 开始备份数据..."

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 创建临时备份文件夹
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# 复制数据库
cp "$PROJECT_DIR/data/data.db" "$TMP_DIR/data.db" 2>/dev/null || echo "⚠️ 数据库文件不存在，跳过"

# 复制上传文件
cp -r "$PROJECT_DIR/uploads" "$TMP_DIR/uploads" 2>/dev/null || echo "⚠️ 上传目录不存在，跳过"

# 打包压缩
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$TMP_DIR" .
echo "✅ 备份完成: backups/${BACKUP_NAME}.tar.gz"

# 清理过期备份（保留最近 N 天）
DELETED=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "🗑️  已清理 $DELETED 个过期备份（${KEEP_DAYS}天前）"
fi

echo "📦 当前备份列表:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  (无)"
