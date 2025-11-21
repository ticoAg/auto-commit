# AutoCommit

<div align="center">

![AutoCommit Hero](../images/hero-banner.png)

🤖 Dual-engine (Claude Code + Codex) Git commit message generator (SDK only)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/releases)
[![GitHub stars](https://img.shields.io/github/stars/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/stargazers)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue.svg)](https://github.com/ticoAg/auto-commit)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org)
[![Claude Code SDK](https://img.shields.io/badge/Powered%20by-Claude%20Code%20SDK-orange.svg)](https://docs.anthropic.com/en/docs/claude-code)

</div>

Language: [日本語](../ja/README.md) | [中文](../zh-CN/README.md)

AutoCommit integrates AI-powered commit message generation into your Git workflow. It analyzes your changes and produces high-quality, contextual messages using either Claude Code SDK or OpenAI Codex.

> AutoCommit was formerly known as **Claude Auto-Commit**. Use the `auto-commit` command going forward; `claude-auto-commit` stays available as a legacy alias.

## 🚀 Quick Start

### Installation

```bash
# Method 1 (recommended)
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/install.sh | bash

# Method 2: One-time run (no installation)
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/run-once.sh | bash

# Method 3: NPX
npx @ticoag/auto-commit

# Method 4: NPM global
npm install -g @ticoag/auto-commit
```

### Basic Usage

```bash
auto-commit                    # Generate and commit
auto-commit -l ja -e -c        # Japanese + emoji + conventional
auto-commit -t feat --push     # Commit type + auto push (current branch)
auto-commit --dry-run -v       # Preview with verbose output
auto-commit --dry-run --save-template hotfix
auto-commit --template hotfix
```

### Provider Modes (Claude + Codex)

| Provider | Description | Authentication |
| --- | --- | --- |
| `claude` (default) | Reuses your local `claude` CLI and Claude Code SDK | Run `claude login` or set `claudePath` |
| `codex` | Uses `@openai/codex-sdk` for commit drafting | Provide `CODEX_API_KEY`/`OPENAI_API_KEY` or run `codex login` |

Switch providers via CLI or config:

```bash
auto-commit --provider codex
auto-commit --provider codex --codex-model o4-mini

# ~/.auto-commit/config.yml
provider: codex
codexModel: o4-mini
```

### Requirements

- Git repository
- Node.js 22+
- For `claude`: `claude login` (CLI only used for auth)
- For `codex`: Codex CLI bundled via SDK plus valid API key/login

## ✨ Features (SDK)

- Dual-engine AI via Claude Code SDK or Codex
- Languages: English / Japanese / Chinese (en/ja/zh)
- Conventional Commits support (optional)
- Templates and local configuration
- Fast and lightweight, optimized for daily workflows

## ⚙️ Configuration (YAML preferred)

Create or edit `~/.auto-commit/config.yml` (YAML only):

```yaml
# AutoCommit config (YAML)
# YAML only; no JSON fallback.
language: en               # en/ja/zh
useEmoji: false            # whether to use emojis
conventionalCommit: false  # use Conventional Commits format
verbose: false             # verbose output
provider: claude           # claude | codex
codexModel: gpt-5.1        # optional, overrides Codex model
# codexPath: /custom/path  # optional, override Codex binary path
```

Notes:
- YAML only. Command-line flags override config values at runtime.
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
| `-h, --help` | Show help (bilingual, Chinese-first) | - |

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

[Report Issues](https://github.com/ticoAg/auto-commit/issues) · [Request Features](https://github.com/ticoAg/auto-commit/issues/new?template=feature_request.md)
