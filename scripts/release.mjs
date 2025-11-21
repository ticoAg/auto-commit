#!/usr/bin/env node
/**
 * 发布流程自动化脚本（交互式）
 * 说明：
 *  - 统一中文输出与注释；
 *  - 尽量不引入外部依赖，仅使用 Node 内置模块；
 *  - 步骤：选择版本 → npm version → 生成/更新文档 → 可选 npm publish → 可选 git push --tags；
 *  - 注意：npm version 会创建一次提交与 tag；文档变更将作为后续单独提交。
 */
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const exec = promisify(_exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function sh(cmd, opts = {}) {
  output.write(`$ ${cmd}\n`);
  const { stdout, stderr } = await exec(cmd, { cwd: ROOT, ...opts });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  return { stdout, stderr };
}

async function getPkg() {
  const content = await fs.readFile(path.join(ROOT, 'package.json'), 'utf8');
  return JSON.parse(content);
}

async function ensureCleanGit() {
  const { stdout } = await sh('git status --porcelain');
  if (stdout.trim().length) {
    throw new Error('Git 工作区不干净，请先提交或暂存当前变更。');
  }
}

async function run() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('==== AutoCommit 发布向导 ====');
    await ensureCleanGit();

    const pkg = await getPkg();
    console.log(`当前版本：${pkg.version}`);

    const bump = (await rl.question('选择版本类型 (patch/minor/major/custom) [minor]: ')).trim() || 'minor';
    let target = '';
    if (bump === 'custom') {
      target = (await rl.question('输入目标版本 (例如 0.2.0)：')).trim();
      if (!/^\d+\.\d+\.\d+$/.test(target)) throw new Error('版本号格式不正确');
    }

    // 1) 升版本并打 tag（npm version 会提交一条记录并创建 tag）
    if (bump === 'custom') {
      await sh(`npm version ${target} -m "chore(release): %s"`);
    } else {
      await sh(`npm version ${bump} -m "chore(release): %s"`);
    }

    const updated = await getPkg();
    const ver = updated.version;
    const date = today();
    console.log(`版本已更新为：${ver}`);

    // 2) 生成/更新文档
    // 2.1 追加根 CHANGELOG.md 与 docs/zh-CN/CHANGELOG.md（若不存在则创建）
    const changelogEntry = `\n## ${ver}（${date}）\n\n- 新增：Codex 通道（@openai/codex-sdk），可在 CLI 中切换 provider\n- 新增：项目品牌更名为 AutoCommit，默认命令改为 \`auto-commit\`\n- 优化：配置与模板目录切换至 ~/.auto-commit，仍兼容旧路径\n- 文档：README 与多语言指南同步更新，包含新的安装与发布说明\n- 兼容性：保留 \`claude-auto-commit\` 命令的向后兼容别名\n`;
    const rootChangelog = path.join(ROOT, 'CHANGELOG.md');
    const zhChangelog = path.join(ROOT, 'docs', 'zh-CN', 'CHANGELOG.md');
    try { await fs.access(rootChangelog); } catch { await fs.writeFile(rootChangelog, '# 更新记录\n'); }
    try { await fs.access(zhChangelog); } catch { await fs.writeFile(zhChangelog, '# 更新记录（中文）\n'); }
    await fs.appendFile(rootChangelog, changelogEntry);
    await fs.appendFile(zhChangelog, changelogEntry);

    // 2.2 生成发布说明 docs/publish/<ver>-npm-publish.md
    const publishDir = path.join(ROOT, 'docs', 'publish');
    await fs.mkdir(publishDir, { recursive: true });
    const publishPath = path.join(publishDir, `${ver}-npm-publish.md`);
    const publishDoc = `---\ntitle: ${ver} 发布到 npm\ndate: ${date}\nsemver: ${ver}\n---\n\n# ${ver} 发布到 npm（作用域包）\n\n- 包名：@ticoag/auto-commit\n- Node.js：>= 22\n- 发布类型：${bump === 'custom' ? 'custom' : bump}\n\n## 主要变更\n- 新增：Codex provider（@openai/codex-sdk），支持 \`--provider codex\`\n- 更名：CLI 命令更新为 \`auto-commit\`，保留旧别名\n- 配置：默认目录迁移至 ~/.auto-commit，模板/配置共用\n- 文档：多语言 README、发布指南、安装脚本同步更新\n\n## 安装与升级\n\n一次性运行：\n\n\`\`\`bash\nnpx @ticoag/auto-commit@${ver} --help\n\`\`\`\n\n全局安装：\n\n\`\`\`bash\nnpm i -g @ticoag/auto-commit@${ver}\n\`\`\`\n\n## 发布命令（参考）\n\n已设置 publishConfig.access 为 public，可直接：\n\n\`\`\`bash\nnpm publish\n\`\`\`\n\n## 注意事项\n- 请确认已登录 npm：\n  - \`npm whoami\`\n- 若启用 2FA，按提示输入一次性验证码\n- 建议先用 \`npm pack --dry-run\` 预览打包内容\n`;
    await fs.writeFile(publishPath, publishDoc);

    // 3) 提交文档更新
    await sh('git add CHANGELOG.md docs/zh-CN/CHANGELOG.md docs/publish');
    await sh('git commit -m "docs: 更新发布说明与变更记录"');

    // 4) 可选 push & publish
    const doPush = ((await rl.question('是否推送到远端（包括 tags）? (y/N): ')).trim().toLowerCase() === 'y');
    if (doPush) {
      await sh('git push');
      await sh('git push --tags');
    }

    const doPub = ((await rl.question('是否发布到 npm? (y/N): ')).trim().toLowerCase() === 'y');
    if (doPub) {
      await sh('npm publish');
    }

    console.log('\n✅ 发布流程完成。');
    console.log(`- 版本：${ver}`);
    console.log(`- 发布说明：docs/publish/${ver}-npm-publish.md`);
    console.log('- 如未发布 npm 或未推送，可稍后再次运行本脚本。');

  } catch (e) {
    console.error('❌ 发布失败：', e.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

run();
