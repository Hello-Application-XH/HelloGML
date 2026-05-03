#!/bin/bash
set -e

echo "=== HelloGML 自动更新脚本 ==="

# 1. 备份本地 wrangler.toml 关键配置
echo "[1/5] 备份本地配置..."
SIGN_SECRET=$(grep 'SIGN_SECRET' wrangler.toml | head -1 | sed 's/.*= "\(.*\)"/\1/')
ADMIN_KEY=$(grep 'ADMIN_KEY' wrangler.toml | grep -v '^#' | head -1 | sed 's/.*= "\(.*\)"/\1/')
KV_ID=$(grep '^id = ' wrangler.toml | head -1 | sed 's/id = "\(.*\)".*/\1/')
echo "  SIGN_SECRET: ${SIGN_SECRET:0:8}..."
echo "  ADMIN_KEY: ${ADMIN_KEY:0:8}..."
echo "  KV_ID: $KV_ID"

# 2. 合并上游代码（保留本地提交，冲突时优先使用上游）
echo "[2/5] 合并最新代码..."
git fetch origin
git merge origin/main --no-edit -X theirs

# 3. 还原本地 wrangler.toml 配置（merge 可能覆盖）
echo "[3/5] 还原本地配置..."
sed -i "s|SIGN_SECRET = \".*\"|SIGN_SECRET = \"$SIGN_SECRET\"|" wrangler.toml
sed -i "/^ADMIN_KEY/s|= \".*\"|= \"$ADMIN_KEY\"|" wrangler.toml
sed -i "s|^id = \".*\"|id = \"$KV_ID\"|" wrangler.toml

# 4. 安装依赖
echo "[4/5] 安装依赖..."
npm install

# 5. 部署 Worker
echo "[5/5] 部署到 Cloudflare Workers..."
npm run deploy

# 6. 重启 feeder（playwright-feeder.js 有可能随版本更新）
sudo systemctl restart glm-feeder 2>/dev/null && echo "  feeder 已重启" || true

echo ""
echo "=== 更新完成 ==="
git log --oneline -3
