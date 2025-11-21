#!/bin/bash

# AutoCommit SDK - 临时执行脚本
# 用法：curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/run-once.sh | bash

set -e

TEMP_DIR="/tmp/auto-commit-$$"
REPO_URL="https://github.com/ticoAg/auto-commit"

echo "🚀 正在临时运行 AutoCommit SDK"
echo "   无需安装，仅在临时目录执行"
echo ""

# Check prerequisites
if ! command -v node >/dev/null 2>&1; then
    echo "❌ 需要 Node.js，请先安装：https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ 需要 Node.js 22+，当前版本 $(node -v)"
    exit 1
fi

if ! command -v git >/dev/null 2>&1; then
    echo "❌ 需要 Git，请先安装"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "❌ 请在 Git 仓库内运行本脚本"
    exit 1
fi

# Check for Claude Code SDK
if ! command -v claude >/dev/null 2>&1; then
    echo "⚠️  未检测到 Claude Code SDK，正在临时安装..."
    npm install -g @anthropic-ai/claude-code
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📥 正在下载 AutoCommit SDK..."

# Download and extract
git clone --depth 1 "$REPO_URL" . 2>/dev/null || {
    curl -sL "$REPO_URL/archive/main.tar.gz" | tar xz --strip-components=1
}

# Install dependencies
echo "📦 正在安装依赖..."
npm install --silent

# Check Claude CLI authentication
if ! claude -p "test" >/dev/null 2>&1; then
    echo "⚠️  Claude CLI 未认证"
    echo "   请执行：claude login"
    echo "   （需要 Claude Pro/Max 订阅）"
    echo ""
    exit 1
fi

# Parse command line arguments and pass them through
echo "🤖 正在执行 auto-commit..."
node src/auto-commit.js "$@"

# Cleanup
echo ""
echo "🧹 正在清理临时文件..."
cd /
rm -rf "$TEMP_DIR"

echo "✅ 完成！临时执行已结束。"
