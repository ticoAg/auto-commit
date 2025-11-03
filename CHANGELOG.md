# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 变更

## [0.1.6] - 2025-11-03

### 新增

- 🧩 CLI 入口“干净方案”：核心脚本 `src/claude-auto-commit.js` 导出 `main()`，由 `bin/claude-auto-commit` 直接调用，避免依赖“是否直接执行”的判断，解决全局命令静默无输出问题。
- 📡 任务日志增强：`--verbose` 模式下实时输出 Claude Code 的流式消息（system/assistant/result 关键信息，带截断防刷屏），便于定位如登录/API Key 等问题。
- 🔎 启动预检：仅检测是否能通过 `claude` 命令启动（`claude --version`），不再检查其他安装来源；若不可用，输出中文指引。
- ⚙️ 配置扩展：支持在 `~/.claude-auto-commit/config.yml` 指定 `claudePath`，用于强制绑定到你已登录的 `claude` 可执行路径（优先于 PATH 探测）。
- 🖊️ 提交信息标识：默认在提交信息末尾追加一行 `自动生成 by claude-auto-commit`；可通过配置项 `appendSignature: false` 关闭。

### 修复

- 🛠️ 修复 `claude-auto-commit --dry-run -v` 在部分环境下无日志的问题（bin 入口改为调用导出的 `main()`）。

### 兼容性

- ⬅️ 保留直接执行 `node src/claude-auto-commit.js` 的兼容逻辑，仍可用于本地调试。

- 📚 文档对齐为 SDK 版：移除旧 CLI 选项与说明，统一为 SDK 可用参数集（en/ja/zh 同步）。
- 🧰 配置改为 YAML 优先：新增 `~/.claude-auto-commit/config.yml` 示例；仍兼容 `config.json`（显示迁移提示）。
- 🛠️ 安装脚本更新：`install.sh` 默认生成 YAML 配置；若检测到 JSON，打印迁移提示且保留原文件。
- 💬 CLI/帮助文案更新：`bin/claude-auto-commit` 与 `--help` 输出增加“YAML 优先 / JSON 兼容（deprecated）”说明。
- 🧪 内部提示：在读取 JSON 配置时输出一次性中文警告，并记录配置来源（verbose 时显示）。
- 🗂️ 新增文档：`docs/zh-CN/local-validation.md` 提供“方案 2：手动克隆 + 软链”的本地开发自验流程（含本地裸仓库推送验证）。

### 文档与清理

- 🗃️ 文档结构：新增语言目录 `docs/zh-CN` 与 `docs/en-US`（中文为主，英文精简版）。
- 📚 新文档：`docs/zh-CN/实现原理.md`、`docs/en-US/architecture.md`；复制对齐 `reference.md`、`local-validation.md`、`FEATURES.md`、`FAQ.md` 到对应语言目录。
- 🔗 README 语言入口更新为 `zh-CN` / `en-US`；本地自验链接指向中文路径。
- 🧹 清理：删除废弃 `src/claude-auto-commit.sh` 与顶层 `CLAUDE.md`（内容已迁移至文档）。

### 兼容性变更

- ⛔ 配置不再支持 JSON：移除 `~/.claude-auto-commit/config.json` 兼容读取，仅保留 `config.yml`（YAML）。如仍在使用 JSON，请将其内容迁移为 YAML 并保存为 `~/.claude-auto-commit/config.yml`。

## [0.1.5] - 2025-11-03

### 新增

- ✅ 支持 `-l zh` 参数生成中文提交信息，帮助文本与配置示例同步更新为三语说明。

### 修复

- 🛠️ 仓库无改动时输出中文提示，`--verbose` 模式新增携带 `trace_id` 的结构化日志，避免静默退出。

### 变更

- 🔄 统一 CLI 版本号展示为 v0.1.5，确保 bin 与核心脚本信息一致。
- 📦 安装方案调整：默认推荐使用本仓库脚本（install.sh / run-once.sh）进行安装与临时执行，保留 NPX/NPM 作为备用方式。
- 📚 文档优化：
  - 重排 README 及多语言文档的安装顺序（优先本仓库脚本）。
  - 移除 NPM 徽章，避免误导优先安装渠道。
  - 新增 README “上游仓库（Upstream）” 说明，保留并致谢原始仓库 0xkaz/claude-auto-commit。
- 🧭 元数据对齐：同步 package.json 的 repository/bugs/homepage 指向本仓库。

## [0.1.0] - 2025-06-14

### 🎉 Major Version Update: CLI to SDK Migration

This release marks a significant architectural shift from Claude CLI dependency to Claude Code SDK integration, providing improved performance, reliability, and extensibility.

### Added

- ✨ Full Claude Code SDK integration (replaces CLI dependency)
- 📝 Enhanced template support for saving and reusing commit messages
- ⚙️ Configuration file support (~/.claude-auto-commit/config.json)
- 🔄 Retry mechanism with exponential backoff
- 🚀 Auto-push functionality
- 📊 Verbose logging and performance metrics
- 🌐 Enhanced multi-language support (English and Japanese)
- 😊 Emoji support in commit messages
- 📋 Conventional Commits format support
- 🔧 One-liner installer and runner scripts
- ⚡ Performance optimizations (parallel processing, caching)
- 🛡️ Enhanced error handling and resilience
- 📦 NPM package support for global installation

### Changed

- **BREAKING**: Migrated from Claude CLI to Claude Code SDK
- **BREAKING**: Node.js 22.0.0+ now required (upgraded from 16.0.0+)
- **BREAKING**: Main script changed from `.sh` to `.js` (src/claude-auto-commit.js)
- **BREAKING**: Installation method updated for SDK dependencies
- Improved structured codebase with object-oriented design
- Enhanced documentation and usage examples
- Updated installation process for SDK dependencies

### Technical Details

- Dependencies: @anthropic-ai/claude-code ^1.0.22
- Runtime: Node.js 22.0.0+ with ES modules support
- Architecture: Full JavaScript/TypeScript implementation
- Performance: Parallel git command execution, intelligent caching
- NPM: Available as both global CLI and local package

### Migration from v0.0.5

All core features from the CLI-based v0.0.5 are maintained with significant improvements:

- Backward compatible command-line interface
- Enhanced reliability and error handling
- Better performance and user experience
- Extended functionality with templates and configuration

### Installation Options

```bash
# Method 1: One-liner installation (recommended)
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/install.sh | bash

# Method 2: NPM global installation
npm install -g claude-auto-commit

# Method 3: One-time execution (no installation)
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/run-once.sh | bash
```

### Usage Examples

```bash
# Basic usage
claude-auto-commit

# Japanese with emojis and conventional commits
claude-auto-commit -l ja -e -c

# Use specific commit type and auto-push
claude-auto-commit -t feat --push

# Dry run with template saving
claude-auto-commit --dry-run --save-template my-template

# Use saved template
claude-auto-commit --template my-template
```

### Configuration

Create `~/.claude-auto-commit/config.json`:

```json
{
    "language": "ja",
    "useEmoji": true,
    "conventionalCommit": true,
    "verbose": false
}
```

### Requirements

- Node.js 22.0.0 or later
- Claude Code SDK (automatically installed)
- Git repository
- ANTHROPIC_API_KEY environment variable

## [0.0.5] - 2024-06-13

### Added

- **Template System** for saving and reusing commit message patterns
    - `--save-template <name> "<template>"` to save a template
    - `--template <name>` or `-T <name>` to use a saved template
    - `--list-templates` to show all saved templates
    - `--delete-template <name>` to remove a template
- **Smart placeholders** in templates using `{variable}` syntax
    - Prompts for values when using templates with placeholders
    - Supports multiple placeholders in a single template
    - Example: `🔥 HOTFIX: {description} - fixes {issue}`
- Templates stored in `~/.claude-auto-commit/templates/`

## [0.0.4] - 2024-06-13

### Added

- `--smart-group` flag to analyze and group related files for logical commits
    - Detects frontend, backend, tests, docs, config, and style files
    - Shows file categories and statistics
    - Supports verbose mode for detailed file listings
- `--analyze-history` command to learn from commit history
    - Analyzes emoji usage patterns
    - Calculates average commit message length
    - Detects common commit prefixes
    - Identifies language preferences
    - Saves results to `~/.claude-auto-commit/commit-style.yml`
- `--style learned` option to apply learned commit patterns
    - Uses analyzed emoji usage percentage
    - Targets learned average message length
    - Automatically enables emoji if usage > 50%

### Fixed

- macOS compatibility for grep commands (removed -P flag)
- Bash 3.x compatibility (removed associative arrays)

## [0.0.3] - 2024-06-13

### Added

- `--dry-run` flag for generating commit messages without committing
- `--summary` flag for displaying detailed change statistics
    - File-by-file statistics
    - Lines added/deleted count
    - File type breakdown

### Changed

- **BREAKING**: Changed default interface language from Japanese to English
- All system messages, prompts, and outputs now default to English
- Help text and usage information displayed in English
- Error messages and status updates in English
- Comments in source code translated to English
- Improved change summary display with emoji indicators

### Fixed

- Consistent language experience for international users
- Better compatibility with global development teams

## [0.0.2] - 2024-06-13

### Added

- Push confirmation prompt before pushing to remote repository
- `-y` / `--yes` flag to skip push confirmation
- CHANGELOG.md file

### Changed

- Default behavior now asks for confirmation before pushing
- Updated documentation to reflect new push confirmation feature

### Security

- Prevents accidental pushes to remote repository

## [0.0.1] - 2024-06-13

### Added

- Initial release
- AI-powered commit message generation using Claude CLI
- Multi-language support (English, Japanese, Chinese)
- Auto-update functionality
- Conventional Commits support
- Configurable options through CLI flags and config file
- One-line installation script
- Comprehensive documentation

[0.0.2]: https://github.com/0xkaz/claude-auto-commit/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/0xkaz/claude-auto-commit/releases/tag/v0.0.1
