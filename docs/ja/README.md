# AutoCommit

<div align="center">

![AutoCommit Hero](../images/hero-banner.png)

🤖 Claude Code + Codex の二重エンジンによる AI Git コミット生成ツール（SDK 版のみ）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/releases)
[![GitHub stars](https://img.shields.io/github/stars/ticoAg/auto-commit.svg)](https://github.com/ticoAg/auto-commit/stargazers)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-blue.svg)](https://github.com/ticoAg/auto-commit)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org)
[![Claude Code SDK](https://img.shields.io/badge/Powered%20by-Claude%20Code%20SDK-orange.svg)](https://docs.anthropic.com/en/docs/claude-code)

</div>

言語: [English](../en-US/README.md) | [中文](../zh-CN/README.md)

AutoCommit は Git の変更内容を解析し、**Claude Code SDK** または **OpenAI Codex** のいずれかを用いて高品質でコンテキストに沿ったコミットメッセージを生成します。

> AutoCommit（旧称 Claude Auto-Commit）はデフォルトコマンドを `auto-commit` に変更しました。`claude-auto-commit` は後方互換用のエイリアスとして引き続き利用できます。

## 🚀 クイックスタート

### インストール

```bash
# 方法1（推奨）
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/install.sh | bash

# 方法2: その場実行（インストール不要）
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/run-once.sh | bash

# 方法3: NPX
npx @ticoag/auto-commit

# 方法4: NPM グローバル
npm install -g @ticoag/auto-commit
```

### 基本的な使い方

```bash
auto-commit                    # 生成してコミット
auto-commit -l ja -e -c        # 日本語 + 絵文字 + Conventional
auto-commit -t feat --push     # コミットタイプ指定 + 自動 push（現在ブランチ）
auto-commit --dry-run -v       # 事前確認 + 詳細出力
auto-commit --dry-run --save-template hotfix
auto-commit --template hotfix
```

### Provider（Claude / Codex）

| Provider | 説明 | 認証 |
| --- | --- | --- |
| `claude`（既定） | ローカルの `claude` CLI（Claude Code SDK）を再利用 | `claude login` または設定で `claudePath` を指定 |
| `codex` | `@openai/codex-sdk` を使用 | `CODEX_API_KEY`（または `codex login`）を設定 |

```bash
auto-commit --provider codex
auto-commit --provider codex --codex-model o4-mini

# ~/.auto-commit/config.yml
provider: codex
codexModel: o4-mini
```

### 必要要件

- Git リポジトリ
- Node.js 22+
- Provider に応じた認証:
  - `claude`: `claude login`
  - `codex`: `CODEX_API_KEY` または `codex login`

## ✨ 機能（SDK）

- Claude Code SDK または Codex による AI 生成
- 対応言語: 英語 / 日本語 / 中国語（en/ja/zh）
- Conventional Commits（任意）
- テンプレートとローカル設定
- 日常開発向けの軽量・高速な体験

## ⚙️ 設定（YAML 推奨）

`~/.auto-commit/config.yml` を作成または編集（YAML のみ対応）：

```yaml
# AutoCommit 設定（YAML）
# JSON はサポートしません。
language: ja               # en/ja/zh
useEmoji: false            # 絵文字を使用するか
conventionalCommit: false  # Conventional Commits 形式を使用するか
verbose: false             # 詳細出力
provider: claude           # claude / codex
codexModel: o4-mini        # Codex のモデル（任意）
# codexPath: /custom/codex # Codex CLI を固定したい場合
```

補足:
- YAML のみ。実行時のコマンドライン引数は設定値を上書きします。
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
| `--provider <claude|codex>` | Provider を切り替え | `claude` |
| `--codex` / `--claude` | Provider 切替のショートカット | - |
| `--codex-model <name>` | Codex モデルを指定 | SDK 既定 |
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
