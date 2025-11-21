#!/bin/bash

# AutoCommit SDK v0.3.0 - 一键安装脚本
# 用法：curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Installation directories
INSTALL_DIR="$HOME/.auto-commit"
BIN_DIR="$HOME/.local/bin"
CONFIG_DIR="$HOME/.auto-commit"

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to remove old CLI version
remove_old_version() {
    local old_locations=(
        "/usr/local/bin/claude-auto-commit"
        "/opt/homebrew/bin/claude-auto-commit"
        "$HOME/bin/claude-auto-commit"
    )

    for location in "${old_locations[@]}"; do
        if [[ -f "$location" ]]; then
            # Check if it's the old CLI version
            if grep -q "Version: 0.0.5\|VERSION=\"0.0.5\"" "$location" 2>/dev/null; then
                print_message "$YELLOW" "🗑️  Removing old CLI version from $location..."
                rm -f "$location" 2>/dev/null || sudo rm -f "$location" 2>/dev/null || {
                    print_message "$RED" "⚠️  Could not remove $location. Please remove manually:"
                    print_message "$RED" "   sudo rm $location"
                }
            fi
        fi
    done
}

# Function to detect shell and update profile
update_shell_profile() {
    local shell_profile=""

    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_profile="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        if [[ -f "$HOME/.bash_profile" ]]; then
            shell_profile="$HOME/.bash_profile"
        else
            shell_profile="$HOME/.bashrc"
        fi
    elif [[ "$SHELL" == *"fish"* ]]; then
        shell_profile="$HOME/.config/fish/config.fish"
    fi

    if [[ -n "$shell_profile" ]] && [[ -f "$shell_profile" ]]; then
        # Check if PATH already contains the bin directory
        if ! grep -q "$BIN_DIR" "$shell_profile"; then
            echo "" >> "$shell_profile"
            echo "# AutoCommit SDK 安装路径" >> "$shell_profile"
            if [[ "$SHELL" == *"fish"* ]]; then
                echo "set -gx PATH $BIN_DIR \$PATH" >> "$shell_profile"
            else
                echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$shell_profile"
            fi
            print_message "$GREEN" "✅ 已在 $shell_profile 中追加 PATH 配置"
        fi
    fi
}

# Banner
echo ""
print_message "$BLUE" "🚀 AutoCommit SDK v0.3.0 安装程序"
print_message "$BLUE" "================================"
echo ""

# Check prerequisites
print_message "$YELLOW" "📋 正在检查依赖..."

# Check Node.js
if ! command_exists node; then
    print_message "$RED" "❌ 未检测到 Node.js，请先安装 22.0.0 及以上版本。"
    echo "   访问：https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
    print_message "$RED" "❌ 需要 Node.js 22.0.0 及以上版本，当前版本为：$NODE_VERSION"
    exit 1
fi
print_message "$GREEN" "✅ 已检测到 Node.js $(node -v)"

# Check npm
if ! command_exists npm; then
    print_message "$RED" "❌ 未检测到 npm，请先安装 npm。"
    exit 1
fi
print_message "$GREEN" "✅ 已检测到 npm $(npm -v)"

# Check git
if ! command_exists git; then
    print_message "$RED" "❌ 未检测到 Git，请先安装 Git。"
    exit 1
fi
print_message "$GREEN" "✅ Git $(git --version | cut -d' ' -f3) found"

# Check Claude Code SDK
if ! command_exists claude; then
    print_message "$YELLOW" "⚠️  Claude Code SDK not found. Installing..."
    npm install -g @anthropic-ai/claude-code
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✅ Claude Code SDK installed successfully"
    else
        print_message "$RED" "❌ Failed to install Claude Code SDK"
        exit 1
    fi
else
    print_message "$GREEN" "✅ Claude Code SDK found"
fi

# Check Claude CLI authentication
if ! command_exists claude; then
    print_message "$YELLOW" "⚠️  Claude CLI not found. Installing..."
    npm install -g @anthropic-ai/claude-code
else
    print_message "$GREEN" "✅ Claude CLI found"
fi

# Check if Claude is authenticated
if ! claude -p "test" >/dev/null 2>&1; then
    print_message "$YELLOW" "⚠️  Claude CLI not authenticated"
    echo "   Please run the following command after installation:"
    echo "   claude login"
    echo "   (Requires Claude Pro/Max subscription)"
    echo ""
fi

# Remove old CLI versions
print_message "$YELLOW" "🧹 正在检查旧版 CLI..."
remove_old_version

# Create necessary directories
print_message "$YELLOW" "📁 正在创建安装目录..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$CONFIG_DIR/templates"

# Clone or download the repository
print_message "$YELLOW" "📥 正在下载 AutoCommit SDK..."

# Remove old installation if exists
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi

# Clone the repository
git clone https://github.com/ticoAg/auto-commit.git "$INSTALL_DIR" 2>/dev/null || {
    # If git clone fails, try downloading as archive
    print_message "$YELLOW" "📦 Git 克隆失败，改为下载压缩包..."
    curl -fsSL https://github.com/ticoAg/auto-commit/archive/main.tar.gz | tar -xz -C "$HOME/.tmp"
    mv "$HOME/.tmp/auto-commit-main" "$INSTALL_DIR"
}

# Install dependencies
print_message "$YELLOW" "📦 正在安装依赖..."
cd "$INSTALL_DIR"
npm install --production

# Create symbolic link
print_message "$YELLOW" "🔗 正在创建命令链接..."
ln -sf "$INSTALL_DIR/bin/auto-commit" "$BIN_DIR/auto-commit"
chmod +x "$BIN_DIR/auto-commit"
ln -sf "$INSTALL_DIR/bin/claude-auto-commit" "$BIN_DIR/claude-auto-commit"
chmod +x "$BIN_DIR/claude-auto-commit"

# Create default config (YAML preferred); keep JSON for backward compatibility
if [ ! -f "$CONFIG_DIR/config.yml" ]; then
    print_message "$YELLOW" "⚙️ 正在生成 YAML 默认配置 (config.yml)..."
    cat > "$CONFIG_DIR/config.yml" << 'EOF'
# AutoCommit 配置（YAML）
# 说明：如同时存在 config.yml 与 config.json，将优先读取 YAML。
language: zh               # en/ja/zh
useEmoji: true            # 是否在提交消息中使用表情
conventionalCommit: false  # 是否使用 Conventional Commits 格式
provider: codex           # claude/codex
verbose: true             # 是否启用详细输出
EOF
    print_message "$GREEN" "✅ 已生成 ~/.auto-commit/config.yml"
fi

# If legacy JSON exists, keep it but show a migration hint
if [ -f "$CONFIG_DIR/config.json" ]; then
    print_message "$YELLOW" "ℹ️  检测到旧的 JSON 配置：$CONFIG_DIR/config.json"
    print_message "$YELLOW" "   已优先使用 YAML（config.yml）。建议将配置迁移到 YAML。"
fi

# Update shell profile
update_shell_profile

# Installation complete
echo ""
print_message "$GREEN" "🎉 安装完成！"
echo ""
print_message "$BLUE" "📖 快速上手："
echo "   1. 如果尚未完成 Claude 认证，请先执行："
echo "      claude login"
echo "      （选择选项 2：Claude app，需要 Pro/Max 订阅）"
echo ""
echo "   2. 在任意 Git 仓库中运行 auto-commit："
echo "      auto-commit"
echo "      auto-commit -l zh -e -c"
echo "      auto-commit --provider codex --push"
echo ""
echo "   3. 按需修改默认配置："
echo "      编辑 ~/.auto-commit/config.yml（推荐），或继续沿用 ~/.claude-auto-commit/config.yml（兼容）"
echo ""

# Check if bin directory is in PATH
if ! echo "$PATH" | grep -q "$BIN_DIR"; then
    print_message "$YELLOW" "⚠️ 请确保将 $BIN_DIR 加入 PATH："
    echo "   export PATH=\"$BIN_DIR:\$PATH\""
    echo "   或重启终端以生效"
fi

print_message "$BLUE" "🔗 文档与源码：https://github.com/ticoAg/auto-commit"
echo ""
