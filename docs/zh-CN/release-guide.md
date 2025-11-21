# 发布流程说明（完整）

> 版本：0.2.0 起适用（统一版本来源，新增发布脚本）
> 日期：2025-11-03

## 一、版本策略（SemVer）
- patch：修复缺陷且无 API/CLI 行为变化（例如 0.2.1）
- minor：新增向后兼容功能（例如 0.3.0）
- major：存在破坏性变更（例如 1.0.0）

本次为“新增/改进输出与日志”，建议使用 minor：0.2.0。

## 二、版本来源统一
- 代码中的版本号均从 `package.json` 读取：
  - `src/auto-commit.js` 通过 `import pkg from '../package.json' assert { type: 'json' }` 读取；
  - `bin/auto-commit` 同上。
- 这样每次仅需通过 `npm version` 修改 `package.json`，CLI 输出与帮助页会自动一致。

## 三、自动化发布脚本
- 命令：`npm run release`
- 脚本路径：`scripts/release.mjs`
- 功能：
  - 检查 Git 工作区干净；
  - 交互式选择版本类型（patch/minor/major/custom）；
  - 执行 `npm version`（自动创建提交与 tag）；
  - 生成/更新文档：
    - 追加 `CHANGELOG.md` 与 `docs/zh-CN/CHANGELOG.md`
    - 生成 `docs/publish/<version>-npm-publish.md`
  - 提交文档更新；
  - 可选：`git push`、`git push --tags`、`npm publish`。

## 四、手工发布（可替代脚本）
1. 确认环境
   - Node.js ≥ 22
   - 已登录 npm：`npm whoami`
   - 工作区干净：`git status --porcelain`
2. 升版本并打 tag（二选一）
   - 次版本：`npm version minor -m "chore(release): %s"`
   - 指定版本：`npm version 0.2.0 -m "chore(release): %s"`
3. 更新文档
   - 在 `CHANGELOG.md` 与 `docs/zh-CN/CHANGELOG.md` 添加条目（版本、日期、变更项）
   - 新建 `docs/publish/0.2.0-npm-publish.md` 写明主要内容、安装与注意事项
4. 推送与发布（可选）
   - `git push && git push --tags`
   - `npm publish`（已内置 `publishConfig.access: public`）

## 五、发布说明结构建议
- 标题：`<version> 发布到 npm（作用域包）`
- 元信息：`date`、`semver`
- 主要变更：Added / Changed / Fixed（中文叙述）
- 安装与升级：npx 与全局安装命令（指定版本号）
- 注意事项：Node 版本、npm 登录、2FA 等

## 六、回滚与修复
- 如需回滚：
  - 本地：`git tag -d vX.Y.Z && git reset --hard HEAD~1`
  - 远端：`git push origin :refs/tags/vX.Y.Z && git push --force`
- npm 撤回：不建议撤包；如确需，请发布更高版本修正。

## 七、常见问题
- `EEXIST`：全局 bin 冲突，需卸载旧包或移除旧软链后再安装。
- 2FA：`npm publish` 时输入一次性验证码即可。

---

如需 CI/CD 自动发布，可在后续为 GitHub Actions 提供 `NPM_TOKEN` 并在标签推送时触发工作流。当前项目以本地脚本发布为主。

