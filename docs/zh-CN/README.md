# AutoCommit

<div align="center">

![AutoCommit Hero](../images/hero-banner.png)

🤖 **Claude Code + Codex 双引擎的 AI Git 提交消息生成器**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/releases)
[![GitHub stars](https://img.shields.io/github/stars/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/stargazers)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue.svg)](https://github.com/ticoAg/auto-commit)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org)
[![Claude Code SDK](https://img.shields.io/badge/Powered%20by-Claude%20Code%20SDK-orange.svg)](https://docs.anthropic.com/en/docs/claude-code)

</div>

**语言**: [English](../en-US/README.md) | [日本語](../ja/README.md)

AutoCommit 是一个开源命令行工具，将 AI 驱动的提交消息生成集成到您的 Git 工作流程中。通过分析您的代码更改，可在 **Claude Code SDK** 与 **OpenAI Codex** 之间自由选择，生成高质量、可靠且具备上下文的提交消息。

> AutoCommit 原名「Claude Auto-Commit」。`auto-commit` 为新的默认命令，`claude-auto-commit` 仍作为兼容别名保留。

## 🌟 转变您的提交历史

<div align="center">

![Before and After Comparison](../images/demo-before-after-english.png)

*告别模糊的提交消息。让Claude AI编写有意义的提交，讲述您代码的故事。*

</div>

## 🚀 快速开始

### 安装选项（SDK 版）

> 本项目已完全切换至 SDK 版实现。旧的 Bash CLI 版本（src/auto-commit.sh）已弃用，不再在文档中提供或保证其行为。

**方法1：一键安装（推荐）**
```bash
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/install.sh | bash
```

**方法2：一次性执行（无需安装）**
```bash
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/run-once.sh | bash
```

**方法3：NPX（Node.js 用户）**
```bash
npx @ticoag/auto-commit
```

**方法4：NPM 全局安装**
```bash
npm install -g @ticoag/auto-commit
```

### 基本用法

```bash
# 分析更改并生成提交消息
auto-commit

# 中文界面 + 表情符号 + 约定式提交
auto-commit -l zh -e -c

# 指定提交类型并自动推送
auto-commit -t feat --push

# 使用模板/保存模板（干跑模式）
auto-commit --dry-run --save-template hotfix
auto-commit --template hotfix

# 详细输出
auto-commit -v
```

## 🤖 Provider 模式（Claude & Codex）

| Provider | 说明 | 鉴权方式 |
| --- | --- | --- |
| `claude`（默认） | 复用本地 `claude` CLI（Claude Code SDK） | 执行 `claude login` 或在配置中设置 `claudePath` |
| `codex` | 使用 `@openai/codex-sdk` 生成提交信息 | 提供 `CODEX_API_KEY`/`OPENAI_API_KEY` 或执行 `codex login` |

切换示例：

```bash
auto-commit --provider codex
auto-commit --provider codex --codex-model o4-mini

# ~/.auto-commit/config.yml
provider: codex
codexModel: o4-mini
```

### 本地开发自验（不使用安装脚本）
- 如需基于本仓库代码直接使用并验证（方案 2：手动克隆 + 软链），请参阅：`docs/zh-CN/local-validation.md`

## ✨ 功能特性（SDK 版）

- 🧠 **双引擎 AI**: 使用 Claude Code SDK 或 Codex 生成高质量提交消息
- 🌍 **多语言支持**: 英语、日语、中文（en/ja/zh）
- 📝 **约定式提交**: 可选 Conventional Commits 格式
- 📋 **模板与配置**: 支持保存/应用提交模板与本地配置
- 🎯 **变更分析**: 汇总当前分支、暂存/未暂存文件与更改统计
- ⚡ **快速轻量**: 面向日常开发的极速体验
- 🛠️ **可定制**: 通过命令行与配置文件进行自定义

## 📋 系统要求

- Git 仓库
- Node.js 22+（推荐使用 LTS 或最新稳定版）
- Provider 鉴权：
  - `claude`：安装并执行 `claude login`
  - `codex`：提供 `CODEX_API_KEY`（或 `codex login`），SDK 会自动调用随包附带的 Codex CLI

## 🎯 使用示例

### 基本用法（SDK 版）
```bash
# 使用自动生成消息的简单提交
auto-commit

# 中文 + 约定式提交 + 指定类型
auto-commit -l zh -c -t feat

# 生成后自动推送（当前分支）
auto-commit --push

# 干跑并保存为模板，然后按模板提交
auto-commit --dry-run --save-template hotfix
auto-commit --template hotfix
```

### 高级选项
```bash
# 干跑（仅生成不提交）
auto-commit --dry-run

# 保存/使用模板
auto-commit --dry-run --save-template release
auto-commit --template release

# 推送到远端（使用当前分支）
auto-commit --push

# 详细输出
auto-commit -v
```

## 🔗 使用全局 `claude`（复用你已登录的实例）

本工具启动时会将 Claude Code SDK 的可执行入口指向你系统上的 `claude` 命令，从而复用你在终端已登录/已配置的会话。

- 优先顺序：
  1) 读取配置文件中的 `claudePath`
  2) 若未配置，则使用 `which claude`（或 `command -v claude`）从 PATH 探测

在 `--verbose` 模式下会打印所使用的 `claude` 路径与来源（config/which）。

配置示例（YAML）：

```yaml
# ~/.auto-commit/config.yml
language: zh
conventionalCommit: true
verbose: true

# 显式绑定到特定的 claude 可执行文件（可选）
claudePath: /opt/homebrew/bin/claude

# 在提交信息末尾追加标识（默认 true）
appendSignature: true
```


## 🔧 安装方法

### 方法1: 一键安装（推荐）
```bash
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/install.sh | bash
```

### 方法2: 手动克隆
```bash
git clone https://github.com/ticoAg/auto-commit.git
cd auto-commit
npm install --production
# 将 bin/auto-commit 加入 PATH
# 方式 A（用户级，推荐）：
mkdir -p ~/.local/bin && ln -sf "$(pwd)/bin/auto-commit" ~/.local/bin/auto-commit
# 方式 B（系统级，需要 sudo）：
sudo ln -sf "$(pwd)/bin/auto-commit" /usr/local/bin/auto-commit
```

### 方法3: NPX（Node.js用户，备用）
```bash
npx @ticoag/auto-commit@latest
```

## 更新记录

- v0.3.0（2025-11-20）：项目更名为 AutoCommit，引入 Codex provider、`auto-commit` 命令与 `.auto-commit` 配置目录，文档/脚本已同步更新。
- v0.1.5（2025-11-03）：默认安装切换为本仓库脚本；移除 NPM 徽章；在主仓库 README 新增上游仓库说明；同步 package.json 元数据。

## ⚙️ 配置（仅 YAML）

配置文件路径为 `~/.auto-commit/config.yml`（仅 YAML）。运行时的命令行参数会覆盖配置文件中的同名字段。

完整示例（可直接复制到 `~/.auto-commit/config.yml`）：

```yaml
# AutoCommit 全量配置示例（YAML）
# 说明：仅展示当前版本实际生效的字段；未列出的字段即表示不被读取。

# 提交语言（支持：en/ja/zh）
language: zh

# 是否在提交信息中加入表情
useEmoji: true

# 是否使用 Conventional Commits 规范（如 feat:/fix:/docs: 等）
conventionalCommit: true

# 是否输出详细日志（包含分阶段耗时与结构化 trace 日志）
verbose: false

# （可选）显式指定全局 `claude` 可执行文件路径
# - 用于你的系统安装了多个 claude，或 PATH 无法正确解析时
# - 留空或删除该字段则自动从 PATH 解析（which/command -v）
claudePath: /opt/homebrew/bin/claude

# （可选）切换 provider / Codex 模型
provider: claude        # claude / codex
codexModel: o4-mini     # Codex 模型（留空则使用默认）
# codexPath: /custom/path/to/codex   # 如需绑定到自定义 Codex CLI

# （可选）是否在提交信息末尾追加来源标识
# - 默认 true，将追加一行 “自动生成 by auto-commit”
# - 设为 false 以关闭追加
appendSignature: true
```

字段说明（与代码保持一致）：
- `language`：字符串，`en/ja/zh` 三选一；默认 `en`。
- `useEmoji`：布尔，是否在提交信息中加入表情；默认 `false`。
- `conventionalCommit`：布尔，是否使用约定式提交前缀；默认 `false`。
- `verbose`：布尔，是否输出详细日志与结构化信息；默认 `false`。
- `claudePath`：字符串，可选；当存在多个 `claude` 时强制指定其路径。
- `provider`：字符串，可选；`claude` 或 `codex`。
- `codexModel`：字符串，可选；用于覆盖 Codex 默认模型。
- `codexPath`：字符串，可选；当需要使用自定义 Codex CLI 路径时设置。
- `appendSignature`：布尔，是否在提交末尾追加“来源标识”；默认 `true`。

提示：模板功能不需要在配置文件中设置目录，工具会自动使用 `~/.auto-commit/templates/`。

## 📖 所有选项（SDK 版）

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-l, --language <lang>` | 语言（en/ja/zh） | `en` |
| `-e, --emoji` | 使用表情符号 | `false` |
| `-c, --conventional` | 使用约定式提交格式 | `false` |
| `-t, --type <type>` | 指定提交类型（feat/fix/docs/style/refactor/test/chore） | 空（自动判断） |
| `-d, --dry-run` | 仅生成不提交 | `false` |
| `-v, --verbose` | 详细输出 | `false` |
| `-p, --push` | 提交后推送（当前分支） | `false` |
| `--template <name>` | 使用已保存模板 | - |
| `--save-template <name>` | 干跑模式下保存模板 | - |
| `--list-templates` | 列出可用模板 | - |
| `--provider <claude|codex>` | 切换生成 provider | `claude` |
| `--codex` / `--claude` | Provider 快捷切换 | - |
| `--codex-model <name>` | 指定 Codex 模型 | SDK 默认 |
| `--version` | 显示版本 | - |
| `-h, --help` | 显示帮助（中英双语，中文优先） | - |

## 🌟 特性详解

### 智能提交消息生成
Claude AI分析代码更改并考虑以下因素生成消息：
- 更改文件的类型
- 添加、修改、删除的行数
- 实际代码差异
- 项目上下文

### 多语言支持
为每种语言的编程社区文化生成适合的消息：
- **中文**: 技术性强，表达直接
- **英语**: 简洁标准的表达
- **日语**: 礼貌详细的说明

> 说明：SDK 版不再提供“自动更新”能力；如需获取最新版，请使用安装脚本或 `npx`。

## 🤝 贡献

欢迎贡献！请参阅[CONTRIBUTING.md](./CONTRIBUTING.md)了解详情。

## 📄 许可证

本项目使用MIT许可证 - 详见[LICENSE](./LICENSE)文件。

## 🙏 致谢

- [Anthropic](https://anthropic.com) 的 Claude Code SDK
- [约定式提交](https://conventionalcommits.org) 规范
- 开源社区的启发

---

**为开发者社区倾情打造 ❤️**

[报告问题](https://github.com/ticoAg/auto-commit/issues) | [功能请求](https://github.com/ticoAg/auto-commit/issues/new?template=feature_request.md)
