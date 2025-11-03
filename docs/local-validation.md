# 本地开发自验指南（方案 2：手动克隆 + 软链）

> 适用场景：不使用 `scripts/install.sh`，希望直接基于本仓库代码进行全量功能验证，并在本机以全局命令 `claude-auto-commit` 使用。

## 前置条件

- Node.js 22+（`node -v`）
- 已登录 Claude Code（仅当需要在线生成提交信息）：`claude login`
- 任意可写目录，具备创建符号链接权限（全局软链需要 `sudo`）

## 安装（方案 2：手动克隆 + 软链，不用安装脚本）

1. 克隆并安装依赖

```bash
# 克隆本仓库
git clone https://github.com/ticoAg/claude-auto-commit.git
cd claude-auto-commit

# 仅生产依赖（包含 Claude Code SDK 与 YAML 解析）
npm i --production
```

2. 建立命令软链（两种方式任选其一）

```bash
# 方式 A：用户级（推荐，免 sudo）
mkdir -p ~/.local/bin
ln -sf "$(pwd)/bin/claude-auto-commit" ~/.local/bin/claude-auto-commit
# 确保 PATH 包含 ~/.local/bin（未包含则加到 shell 配置）

# 方式 B：系统级（需要 sudo）
sudo ln -sf "$(pwd)/bin/claude-auto-commit" /usr/local/bin/claude-auto-commit
```

3. 验证

```bash
which claude-auto-commit
claude-auto-commit --help  # 应看到“YAML 优先 / JSON 兼容（deprecated）”提示
```

## 配置（YAML 优先）

```yaml
# ~/.claude-auto-commit/config.yml
language: zh # en/ja/zh
useEmoji: true # 是否使用表情
conventionalCommit: false # 是否使用 Conventional Commits 格式
verbose: true # 是否详细输出
```

- 若同时存在 `config.yml` 与 `config.json`，工具将优先使用 YAML，并忽略 JSON；当读取 JSON 时会打印一次迁移提示。

## 本地 Git 沙箱（可选，用于安全自验推送）

创建一个本地裸仓库作为“假远端”，避免访问 GitHub：

```bash
mkdir -p /tmp/remote.git && git init --bare /tmp/remote.git
mkdir -p /tmp/work && cd /tmp/work

git init
git remote add origin /tmp/remote.git
printf "hello\n" > README.txt
git add . && git commit -m "init"
git branch -M main && git push -u origin main
```

## 功能自验用例

1. 基本生成（Dry‑run，不提交）

```bash
cd /tmp/work
printf "// change 1\n" >> app.js
claude-auto-commit --dry-run -v
# 期望：显示从 ~/.claude-auto-commit/config.yml 读取配置；打印生成的提交信息但不创建 commit
```

2. 模板流（可完全离线绕过 SDK 调用）

```bash
mkdir -p ~/.claude-auto-commit/templates
printf "chore: 本地模板提交流程验证\n" > ~/.claude-auto-commit/templates/local-test.txt
claude-auto-commit --list-templates  # 应包含 local-test

printf "// change 2\n" >> app.js
claude-auto-commit --template local-test  # 创建提交

# 推送到本地假远端（不访问 GitHub）
claude-auto-commit --template local-test --push

git --git-dir=/tmp/remote.git log --oneline  # 应看到最新提交
```

3. 保存模板（Dry‑run 下生效）

```bash
printf "// change 3\n" >> app.js
claude-auto-commit --dry-run --save-template today
# 期望：不提交；~/.claude-auto-commit/templates/today.txt 被创建
claude-auto-commit --template today  # 可用该模板进行真实提交
```

4. 边界验证

- 工作区干净：`claude-auto-commit -v` → “未检测到变更，工作区干净。”
- 选项解析：`claude-auto-commit -l ja -e -c -t feat --dry-run -v` 正常运行

### 指定全局 `claude` 路径（可选）

若系统存在多个 `claude`，你可以在本地配置中显式指定要使用的路径：

```yaml
# ~/.claude-auto-commit/config.yml
claudePath: /opt/homebrew/bin/claude
appendSignature: true  # 提交消息末尾追加 “自动生成 by claude-auto-commit”
```

在 `--verbose` 模式下，工具会打印所使用的 `claude` 路径与来源（config/which），便于确认是否命中你的登录实例。

## 卸载/还原

- 删除软链：

```bash
rm -f ~/.local/bin/claude-auto-commit  # 用户级
# 或
sudo rm -f /usr/local/bin/claude-auto-commit  # 系统级
```

- 清理沙箱（如创建过）：`rm -rf /tmp/work /tmp/remote.git`

## 常见问题

- 未登录 Claude 或离线？使用“模板流”即可全链路验证（自动暂存 → 提交 → 推送）。
- 未看到命令？确认 PATH 包含 `~/.local/bin` 或 `/usr/local/bin`，并重新打开终端。
- YAML 与 JSON 同时存在？日志会提示“优先使用 YAML”；如需测试 JSON 路径，临时改名 `config.yml` 后再运行。

---

_文档适用于 SDK 版；旧 CLI 版本已弃用。_
