# Claude Auto-Commit

<div align="center">

![Claude Auto-Commit Hero](../images/hero-banner.png)

🤖 Claude Code SDK を用いた AI 駆動の Git コミットメッセージ生成ツール（SDK 版のみ）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/ticoAg/claude-auto-commit.svg)](https://github.com/ticoAg/claude-auto-commit/releases)
[![GitHub stars](https://img.shields.io/github/stars/ticoAg/claude-auto-commit.svg)](https://github.com/ticoAg/claude-auto-commit/stargazers)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue.svg)](https://github.com/ticoAg/claude-auto-commit)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org)
[![Claude Code SDK](https://img.shields.io/badge/Powered%20by-Claude%20Code%20SDK-orange.svg)](https://docs.anthropic.com/en/docs/claude-code)

</div>

言語: [English](../en/README.md) | [中文](../../README.md)

Claude Auto-Commit は、Git の変更内容を解析し、Claude Code SDK を用いて高品質でコンテキストに即したコミットメッセージを生成します。

## 🚀 クイックスタート

### インストール

```bash
# 方法1（推奨）
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/install.sh | bash

# 方法2: その場実行（インストール不要）
curl -fsSL https://raw.githubusercontent.com/ticoAg/claude-auto-commit/main/scripts/run-once.sh | bash

# 方法3: NPX
npx claude-auto-commit

# 方法4: NPM グローバル
npm install -g claude-auto-commit
```

### 基本的な使い方

```bash
claude-auto-commit                    # 生成してコミット
claude-auto-commit -l ja -e -c        # 日本語 + 絵文字 + Conventional
claude-auto-commit -t feat --push     # コミットタイプ指定 + 自動 push（現在ブランチ）
claude-auto-commit --dry-run -v       # 事前確認 + 詳細出力
claude-auto-commit --dry-run --save-template hotfix
claude-auto-commit --template hotfix
```

### 必要要件

- Git リポジトリ
- Node.js 22+
- `claude login` による認証済みの Claude Code ツール（SDK はこの認証を利用。実行時に CLI コマンドは呼び出しません）

## ✨ 機能（SDK）

- Claude Code SDK による AI 生成
- 対応言語: 英語 / 日本語 / 中国語（en/ja/zh）
- Conventional Commits（任意）
- テンプレートとローカル設定
- 日常開発向けの軽量・高速な体験

## ⚙️ 設定（YAML 推奨）

`~/.claude-auto-commit/config.yml` を作成または編集（YAML を優先。JSON も互換対応）：

```yaml
# Claude Auto Commit 設定（YAML）
# config.yml と config.json が両方ある場合、YAML を優先します。
language: ja               # en/ja/zh
useEmoji: false            # 絵文字を使用するか
conventionalCommit: false  # Conventional Commits 形式を使用するか
verbose: false             # 詳細出力
```

補足:
- YAML を推奨。JSON も後方互換として対応（移行ヒントを表示）。
- 実行時のコマンドライン引数は設定値を上書きします。

## 📖 オプション（SDK）

| オプション | 説明 | 既定値 |
|------|------|--------|
| `-l, --language <lang>` | 言語（en/ja/zh） | `en` |
| `-e, --emoji` | 絵文字を使用 | `false` |
| `-c, --conventional` | Conventional Commits 形式 | `false` |
| `-t, --type <type>` | コミットタイプ（feat/fix/docs/style/refactor/test/chore） | 空（自動） |
| `-d, --dry-run` | 生成のみ（コミットしない） | `false` |
| `-v, --verbose` | 詳細出力 | `false` |
| `-p, --push` | コミット後に push（現在ブランチ） | `false` |
| `--template <name>` | 保存済みテンプレートを使用 | - |
| `--save-template <name>` | テンプレート保存（dry-run 時） | - |
| `--list-templates` | 利用可能なテンプレート一覧 | - |
| `--version` | バージョン表示 | - |
| `-h, --help` | ヘルプ表示 | - |

## 🤝 コントリビューション

歓迎します。詳細は [CONTRIBUTING.md](../../CONTRIBUTING.md) をご参照ください。

## 📄 ライセンス

MIT ライセンス。詳細は [LICENSE](../../LICENSE) をご参照ください。

## 🙏 謝辞

- [Anthropic](https://anthropic.com) の Claude Code SDK
- [Conventional Commits](https://conventionalcommits.org)
- OSS コミュニティ

---

開発者コミュニティへの感謝を込めて ❤️

