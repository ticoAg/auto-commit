# AutoCommit 参考手册 (v0.1.5)

> 更新记录：2025-11-03 · v0.1.5 · 新增中文提交信息支持与无变更提示优化

AutoCommit 基于 Claude Code SDK，提供面向中文团队的自动化提交助手。本手册覆盖命令使用、参数说明与配置要点。

## 快速开始

```bash
# 基本执行（需已处于 Git 仓库）
auto-commit

# 首次安装（NPM 全局）
npm install -g @ticoag/auto-commit
auto-commit

# 一次性执行脚本
curl -fsSL https://raw.githubusercontent.com/ticoAg/auto-commit/main/scripts/run-once.sh | bash
```

## 常用命令示例

```bash
# 中文提交信息 + 表情 + Conventional Commits
auto-commit -l zh -e -c

# 指定提交类型并自动推送
auto-commit -t feat --push

# 仅预览提交信息
auto-commit --dry-run

# 查看详细分析与耗时
auto-commit --verbose

# 使用或保存模板
auto-commit --template hotfix
auto-commit --dry-run --save-template hotfix
```

## 参数列表

| 参数                     | 短命令 | 说明                                   | 默认值   |
| ------------------------ | ------ | -------------------------------------- | -------- |
| `--language <lang>`      | `-l`   | 提交语言（`en`/`ja`/`zh`）             | `en`     |
| `--emoji`                | `-e`   | 在提交信息中加入表情                   | `false`  |
| `--conventional`         | `-c`   | 启用 Conventional Commits 规范         | `false`  |
| `--type <type>`          | `-t`   | 指定提交类型（如 feat、fix 等）        | 自动推断 |
| `--dry-run`              | `-d`   | 仅生成提交信息，不真正提交             | `false`  |
| `--verbose`              | `-v`   | 输出调试信息与性能统计                 | `false`  |
| `--push`                 | `-p`   | 提交后自动推送当前分支                 | `false`  |
| `--template <name>`      |        | 使用已保存模板                         | 无       |
| `--save-template <name>` |        | 将生成结果保存为模板（需 `--dry-run`） | 无       |
| `--list-templates`       |        | 列出已保存模板                         | -        |
| `--help`                 | `-h`   | 显示帮助信息（中英双语，中文优先）     | -        |
| `--version`              |        | 显示版本信息                           | -        |

## 主要能力

- 🧠 基于 Claude Code SDK 生成提交信息，支持中英日语输出。
- ⚡ 并行执行 Git 命令并缓存结果，加速分析。
- 🔄 最多 3 次重试，失败时指数退避，默认超时 30 秒。
- 📦 自动暂存改动，支持 Conventional Commits、表情与模板。
- 🔍 `--verbose` 模式提供结构化日志（含 `trace_id`）与性能耗时。

## 配置文件

- 存放路径：`~/.auto-commit/config.yml`（仅 YAML）
- 模板目录：`~/.auto-commit/templates/`
- 示例配置（中文团队推荐）：

```json
{
    "language": "zh",
    "useEmoji": true,
    "conventionalCommit": true,
    "verbose": false
}
```

## 使用提示

- **网络要求**：生成提交信息需配置 `ANTHROPIC_API_KEY` 并具备外网访问。
- **无改动提示**：若仓库干净，将输出“未检测到变更”并在 `--verbose` 模式下打印结构化日志。
- **模板策略**：推荐在 `--dry-run` 下验证模板效果，再正式提交。
- **故障排查**：若生成阶段失败，命令会附带 `trace_id`，便于在日志中聚合排查。
