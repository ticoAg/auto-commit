# Claude Auto-Commit

<div align="center">

![Claude Auto-Commit Hero](../images/hero-banner.png)

🤖 AI-powered Git commit message generator using Claude Code SDK (SDK version only)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/ticoAg/claude-auto-commit.svg)](https://github.com/ticoAg/claude-auto-commit/releases)
[![GitHub stars](https://img.shields.io/github/stars/ticoAg/claude-auto-commit.svg)](https://github.com/ticoAg/claude-auto-commit/stargazers)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue.svg)](https://github.com/ticoAg/claude-auto-commit)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org)
[![Claude Code SDK](https://img.shields.io/badge/Powered%20by-Claude%20Code%20SDK-orange.svg)](https://docs.anthropic.com/en/docs/claude-code)

</div>

Language: [日本語](../ja/README.md) | [中文](../../README.md)

Claude Auto-Commit integrates AI-powered commit message generation into your Git workflow. It analyzes your changes and produces high-quality, contextual messages using Claude Code SDK.

## 🚀 Quick Start

### Installation

```bash
# Method 1 (recommended)
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/install.sh | bash

# Method 2: One-time run (no installation)
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/run-once.sh | bash

# Method 3: NPX
npx claude-auto-commit

# Method 4: NPM global
npm install -g claude-auto-commit
```

### Basic Usage

```bash
claude-auto-commit                    # Generate and commit
claude-auto-commit -l ja -e -c        # Japanese + emoji + conventional
claude-auto-commit -t feat --push     # Commit type + auto push (current branch)
claude-auto-commit --dry-run -v       # Preview with verbose output
claude-auto-commit --dry-run --save-template hotfix
claude-auto-commit --template hotfix
```

### Requirements

- Git repository
- Node.js 22+
- Claude Code tool authenticated via `claude login` (SDK uses this authentication; CLI is not invoked at runtime)

## ✨ Features (SDK)

- AI-powered via Claude Code SDK
- Languages: English / Japanese / Chinese (en/ja/zh)
- Conventional Commits support (optional)
- Templates and local configuration
- Fast and lightweight, optimized for daily workflows

## ⚙️ Configuration (YAML preferred)

Create or edit `~/.claude-auto-commit/config.yml` (YAML is preferred; JSON is still compatible):

```yaml
# Claude Auto Commit config (YAML)
# If both config.yml and config.json exist, YAML takes precedence.
language: en               # en/ja/zh
useEmoji: false            # whether to use emojis
conventionalCommit: false  # use Conventional Commits format
verbose: false             # verbose output
```

Notes:
- YAML is recommended. JSON is still supported for backward compatibility and will trigger a migration hint.
- Command-line flags override config values at runtime.

## 📖 CLI Options (SDK)

| Option | Description | Default |
|------|------|--------|
| `-l, --language <lang>` | Language (en/ja/zh) | `en` |
| `-e, --emoji` | Use emojis | `false` |
| `-c, --conventional` | Use Conventional Commits format | `false` |
| `-t, --type <type>` | Commit type (feat/fix/docs/style/refactor/test/chore) | empty (auto) |
| `-d, --dry-run` | Generate only, do not commit | `false` |
| `-v, --verbose` | Verbose output | `false` |
| `-p, --push` | Push after commit (current branch) | `false` |
| `--template <name>` | Use a saved template | - |
| `--save-template <name>` | Save template (dry-run only) | - |
| `--list-templates` | List available templates | - |
| `--version` | Show version | - |
| `-h, --help` | Show help | - |

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## 📄 License

MIT License. See [LICENSE](../../LICENSE).

## 🙏 Acknowledgments

- Claude Code SDK by [Anthropic](https://anthropic.com)
- [Conventional Commits](https://conventionalcommits.org)
- Open source community

---

Made with ❤️ for the developer community

[Report Issues](https://github.com/ticoAg/claude-auto-commit/issues) · [Request Features](https://github.com/ticoAg/claude-auto-commit/issues/new?template=feature_request.md)

