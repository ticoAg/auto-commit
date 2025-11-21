# 文档变更记录（docs）

- 2025-11-03 · v0.1.0-docs
  - 新增：`docs/zh-CN/实现原理.md`（SDK 实现原理，中文主文档）
  - 新增：`docs/en-US/architecture.md`（英文精简版）
  - 目录：新增语言目录 `zh-CN` 与 `en-US`；暂时保留旧 `zh`/`en` 文件以兼容链接
  - 复制：将 `docs/reference.md` → `docs/zh-CN/reference.md`，`docs/local-validation.md` → `docs/zh-CN/local-validation.md`
  - 复制：将 `docs/FEATURES.md`、`docs/FAQ.md` → `docs/en-US/FEATURES.md`、`docs/en-US/FAQ.md`
  - 语言入口：新增 `docs/zh-CN/README.md`（基于根 README 调整相对路径）


## 0.5.0（2025-11-21）

- 变更：默认配置调整为 Codex / GPT-5.1 / 中文 / Emoji。
- 移除：日语语言支持与相关代码。
- 移除：`claude-auto-commit` 兼容性别名。

## 0.2.0（2025-11-04）

- 新增：结构化提示词（主题行 + 要点）
- 改进：verbose 分段日志（含 trace_id）
- 改进：提交信息以等号分隔块高亮显示，去除外层引号
- 兼容性：无破坏性改动

## 0.2.1（2025-11-04）

- 新增：结构化提示词（主题行 + 要点）
- 改进：verbose 分段日志（含 trace_id）
- 改进：提交信息以等号分隔块高亮显示，去除外层引号
- 兼容性：无破坏性改动

## 0.3.0（2025-11-20）

- 更名：全站文档由 *Claude Auto-Commit* 调整为 *AutoCommit*，命令/截图与链接同步更新。
- provider：`zh-CN` / `en-US` / `ja` README 增加 Codex/Provider 说明、配置示例与命令选项。
- 安装：所有脚本/指南中的 `npx`、`npm install` 命令改为 `@ticoag/auto-commit`，curl 链接指向新仓库。
- Release：更新 `docs/publish` 模板与公告模版（announcement-template），对外文案改为 AutoCommit。

## 0.4.0（2025-11-21）

- 新增：Codex 通道（@openai/codex-sdk），可在 CLI 中切换 provider
- 新增：项目品牌更名为 AutoCommit，默认命令改为 `auto-commit`
- 优化：配置与模板目录切换至 ~/.auto-commit，仍兼容旧路径
- 文档：README 与多语言指南同步更新，包含新的安装与发布说明
- 兼容性：保留 `claude-auto-commit` 命令的向后兼容别名
