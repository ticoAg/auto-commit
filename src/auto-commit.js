#!/usr/bin/env node
/**
 * Module Description:
 *  - This file is the main entry point for the SDK version, providing the complete flow for AI commit message generation.
 *  - Designed to follow "Sync First, Minimal Side Effects", balancing performance with parallel Git commands and result caching.
 *  - Key nodes output optional structured logs (--verbose), including trace_id for issue tracking.
 *  - Only enhances comments and documentation, maintaining external behavior and CLI parameter compatibility without changing core logic.
 */
import { query } from "@anthropic-ai/claude-code";
import { Codex } from "@openai/codex-sdk";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import YAML from "yaml"; // 读取 YAML 配置
// 统一版本来源：从 package.json 读取版本号，避免手工同步
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// 通过 require 读取 JSON，兼容各 Node 版本的 ESM 行为
const pkg = require("../package.json");
const CLI_VERSION = `v${pkg.version}`;

const execAsync = promisify(exec);

/**
 * AutoCommit
 *
 * Class Description: Encapsulates the main flow of "Config Read -> Change Detection -> Prompt Construction -> Text Generation -> Commit/Push".
 * - Default behavior can be overridden via constructor arguments or configuration file;
 * - Maintains lightweight runtime caches (_gitCache/_configCache) to reduce repeated IO;
 * - Throws exceptions with Chinese semantic information on error, facilitating end-user understanding.
 */
class AutoCommit {
	constructor(options = {}) {
		this._cliOptions = { ...options };
		// Default to Chinese + Emoji
		this.language = options.language || "zh";
		this.useEmoji = options.useEmoji ?? true;
		this.conventionalCommit = options.conventionalCommit || false;
		this.commitType = options.commitType || "";
		this.dryRun = options.dryRun || false;
		this.verbose = options.verbose || false;
		this.push = options.push || false;
		this.templateName = options.templateName || "";
		this.maxRetries = options.maxRetries || 3;
		this.timeout = options.timeout || 30000;
		this.traceId = options.traceId || randomUUID();
		// Default to Codex provider
		const provider = (options.provider || "codex").toString().toLowerCase();
		this.provider = provider === "claude" ? "claude" : "codex";
		// Default to gpt-5.1 model (can be overridden via CLI/config)
		this.codexModel = options.codexModel || "gpt-5.1";
		this.codexExecutablePath = options.codexPath || null;
		this._codexClient = null;
		// 缓存：Git 命令结果，避免在单次运行内重复执行
		this._gitCache = {};
		// 缓存：配置文件内容，减少频繁文件读取
		this._configCache = null;
		this._configCacheTime = 0;
		this.CONFIG_CACHE_TTL = 5 * 60 * 1000; // 配置缓存 5 分钟
		// 记录系统上已安装的 `claude` 可执行入口路径（在预检或配置读取时赋值）
		this.claudeExecutablePath = null;
		// 是否在提交信息末尾附加来源标识，默认开启
		this.appendSignature = true;
		// 配置目录（仅使用 AutoCommit 新路径）
		this.primaryConfigDir = path.join(os.homedir(), ".auto-commit");
		this.activeConfigDir = this.primaryConfigDir;
		}

		// 轻量打印工具：分段标题（仅 verbose 下生效）
		logSection(title) {
			if (!this.verbose) return;
			const line = "=".repeat(64);
			console.log(`\n${line}\n${title}\n${line}`);
		}

		// 将提交信息以清晰的分隔块打印（所有模式下都生效）
		printCommitBlock(message) {
			console.log("生成的提交信息");
			const line = "=".repeat(64);
			console.log(`\n${line}`);
			console.log("");
			console.log(message);
			console.log(line);
		}

	// 性能测量工具：用于 --verbose 模式输出阶段耗时（毫秒）
	async measure(name, fn) {
		if (!this.verbose) {
			return await fn();
		}

		const start = process.hrtime.bigint();
		const result = await fn();
		const end = process.hrtime.bigint();
		const duration = Number(end - start) / 1e6; // 毫秒

		console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
		return result;
	}

	async loadConfig() {
		try {
			const now = Date.now();
			if (
				this._configCache &&
				now - this._configCacheTime < this.CONFIG_CACHE_TTL
			) {
				if (this.verbose) {
					console.log("📄 Configuration loaded from cache");
				}
				return this._configCache;
			}

			let config = null;
			let source = "default";

			const yamlPath = path.join(this.primaryConfigDir, "config.yml");
			try {
				const exists = await fs
					.access(yamlPath)
					.then(() => true)
					.catch(() => false);
				if (!exists) {
					this.activeConfigDir = this.primaryConfigDir;
				} else {
					const content = await fs.readFile(yamlPath, "utf8");
					config = YAML.parse(content) || {};
					source = yamlPath;
					this.activeConfigDir = this.primaryConfigDir;
				}
			} catch (e) {
				console.log(
					`⚠️  无法解析 YAML 配置（${yamlPath}）：${e.message}，将使用内置默认值。`
				);
			}

			if (!config) {
				this.activeConfigDir = this.primaryConfigDir;
			}

			if (config) {
				this._configCache = config;
				this._configCacheTime = now;

				const cli = this._cliOptions || {};

				if (cli.language === undefined && config.language) {
					this.language = config.language;
				}
				if (cli.useEmoji === undefined && typeof config.useEmoji === "boolean") {
					this.useEmoji = config.useEmoji;
				}
				if (
					cli.conventionalCommit === undefined &&
					typeof config.conventionalCommit === "boolean"
				) {
					this.conventionalCommit = config.conventionalCommit;
				}
				if (cli.commitType === undefined && typeof config.commitType === "string") {
					this.commitType = config.commitType;
					if (config.commitType) {
						this.conventionalCommit = true;
					}
				}
				if (cli.verbose === undefined && typeof config.verbose === "boolean") {
					this.verbose = config.verbose;
				}
				if (cli.push === undefined && typeof config.push === "boolean") {
					this.push = config.push;
				}
				if (cli.templateName === undefined && typeof config.templateName === "string") {
					this.templateName = config.templateName;
				}
				if (cli.provider === undefined && typeof config.provider === "string") {
					const normalized = config.provider.toLowerCase();
					this.provider = normalized === "codex" ? "codex" : "claude";
				}
				if (typeof config.claudePath === "string" && config.claudePath.trim()) {
					this.claudeExecutablePath = config.claudePath.trim();
				}
				if (typeof config.codexPath === "string" && config.codexPath.trim()) {
					this.codexExecutablePath = config.codexPath.trim();
				}
				if (typeof config.codexModel === "string" && config.codexModel.trim()) {
					this.codexModel = config.codexModel.trim();
				}
				if (typeof config.appendSignature === "boolean") {
					this.appendSignature = config.appendSignature;
				}

				// Fallback: Default to Chinese
				this.language = this.language || "zh";
				this.useEmoji = Boolean(this.useEmoji);
				this.conventionalCommit = Boolean(this.conventionalCommit);

				if (this.verbose) {
					console.log("📄 Configuration loaded from:", source);
				}
				return config;
			}
		} catch (error) {
			if (this.verbose) {
				console.log("⚠️  No configuration file found, using defaults");
			}
		}
		return null;
	}

	getCodexClient() {
		if (!this._codexClient) {
			const options = {};
			if (this.codexExecutablePath) {
				options.codexPathOverride = this.codexExecutablePath;
			}
			if (process.env.CODEX_BASE_URL) {
				options.baseUrl = process.env.CODEX_BASE_URL;
			}
			if (process.env.CODEX_API_KEY) {
				options.apiKey = process.env.CODEX_API_KEY;
			}
			this._codexClient = new Codex(options);
		}
		return this._codexClient;
	}

	async saveTemplate(name, message) {
		try {
			const templatesDir = path.join(
				this.primaryConfigDir,
				"templates"
			);
			await fs.mkdir(templatesDir, { recursive: true });

			const templatePath = path.join(templatesDir, `${name}.txt`);
			await fs.writeFile(templatePath, message, "utf8");

			console.log(`💾 Template saved: ${name}`);
		} catch (error) {
			console.error(`❌ Failed to save template: ${error.message}`);
		}
	}

	async loadTemplate(name) {
		try {
			const templatePath = path.join(
				this.primaryConfigDir,
				"templates",
				`${name}.txt`
			);
			const template = await fs.readFile(templatePath, "utf8");
			return template.trim();
		} catch (error) {
			throw new Error(`Template "${name}" not found`);
		}
	}

	async listTemplates() {
		try {
			const templatesDir = path.join(this.primaryConfigDir, "templates");
			const files = await fs.readdir(templatesDir);
			return files
				.filter((f) => f.endsWith(".txt"))
				.map((f) => f.replace(".txt", ""));
		} catch (error) {
			return [];
		}
	}

	async checkGitRepository() {
		/**
		 * Description: Verify if the current working directory is inside a Git repository.
		 * - Success: returns true;
		 * - Failure: throws an exception with Chinese prompt;
		 * - Design: does not rely on git worktree status, only checks if .git directory exists.
		 */
		try {
			await execAsync("git rev-parse --git-dir");
			return true;
		} catch (error) {
			throw new Error(
				"Not a git repository. Please run this command in a git repository."
			);
		}
	}

	async checkForChanges() {
		try {
			const { stdout: status } = await execAsync("git status --porcelain", {
				maxBuffer: 1024 * 1024,
			});
			// 缓存：status 结果，供 getGitChanges() 复用，避免重复执行
			this._gitCache.status = status;
			return status.trim().length > 0;
		} catch (error) {
			throw new Error(`Failed to check git status: ${error.message}`);
		}
	}

	async getGitChanges() {
		/**
		 * Description: Collect Git change information in parallel and assemble it into text fragments for prompt use.
		 * - Parallel: status/branch/diff (staged/unstaged), optionally appending --stat summary;
		 * - Cache: Reuse query results from previous stages (e.g., branch/status) as much as possible;
		 * - Truncation: Control return text size to avoid prompt being too long causing generation timeout or failure.
		 */
		try {
			// 若有缓存则直接使用；否则并行执行相关命令以提升性能
			let statusPromise;
			if (this._gitCache.status !== undefined) {
				statusPromise = Promise.resolve({
					stdout: this._gitCache.status,
				});
			} else {
				statusPromise = execAsync("git status --porcelain", {
					maxBuffer: 1024 * 1024,
				});
			}

			// 并行执行 Git 命令以提升整体性能
			const [statusResult, branchResult, diffResult, diffUnstagedResult] =
				await Promise.all([
					statusPromise,
					execAsync("git branch --show-current", {
						maxBuffer: 1024 * 1024,
					}),
					execAsync("git diff --cached --name-only", {
						maxBuffer: 1024 * 1024,
					}),
					execAsync("git diff --name-only", {
						maxBuffer: 1024 * 1024,
					}),
				]);

			const status = statusResult.stdout;
			const branch = branchResult.stdout;
			const diff = diffResult.stdout;
			const diffUnstaged = diffUnstagedResult.stdout;

			// 缓存：当前分支名，供 pushChanges() 复用
			this._gitCache.branch = branch;

			if (!status.trim()) {
				throw new Error("No changes detected");
			}

			let changes = `Branch: ${branch.trim()}\n\nStatus:\n${status}\n\n`;

			// 预构建 --stat 的 Promise（仅在需要时）
			const statsPromises = [];
			const statsTypes = [];

			if (diff.trim()) {
				changes += `Staged files:\n${diff}\n`;
				statsPromises.push(
					execAsync("git diff --cached --stat", {
						maxBuffer: 1024 * 1024,
					})
				);
				statsTypes.push("staged");
			}

			if (diffUnstaged.trim()) {
				changes += `Unstaged files:\n${diffUnstaged}\n`;
				statsPromises.push(
					execAsync("git diff --stat", { maxBuffer: 1024 * 1024 })
				);
				statsTypes.push("unstaged");
			}

			// 并行执行统计命令（如有）
			if (statsPromises.length > 0) {
				const statsResults = await Promise.allSettled(statsPromises);

				statsResults.forEach((result, index) => {
					const type = statsTypes[index];
					if (result.status === "fulfilled") {
						if (type === "staged") {
							changes += `\nStaged changes summary:\n${result.value.stdout}\n\n`;
						} else {
							changes += `\nUnstaged changes summary:\n${result.value.stdout}\n`;
						}
					} else {
						if (type === "staged") {
							changes += `\nStaged changes: (too large to display)\n\n`;
						} else {
							changes += `\nUnstaged changes: (too large to display)\n`;
						}
					}
				});
			}

			// 过长时进行截断，避免提示词爆炸
			if (changes.length > 4000) {
				changes = changes.substring(0, 4000) + "\n... (truncated for brevity)";
			}

			return changes;
		} catch (error) {
			throw new Error(`Failed to get git changes: ${error.message}`);
		}
	}

	async generateCommitMessage(changes) {
		if (this.provider === "codex") {
			return await this.generateCommitMessageWithCodex(changes);
		}
		return await this.generateCommitMessageWithClaude(changes);
	}

	async generateCommitMessageWithClaude(changes) {
		/**
		 * Description: Call Claude Code SDK to generate commit message.
		 * - Input: Change text fragment (produced by getGitChanges());
		 * - Timeout & Retry: Single 30s timeout, max 3 attempts (exponential backoff);
		 * - Return: Plain text commit message;
		 * - Exception: Throws error after reaching max retries.
		 */
		const prompt = this.buildPrompt(changes);

		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				if (this.verbose) {
					console.log(
						`🤖 Generating commit message (attempt ${attempt}/${this.maxRetries})...`
					);
				}

				const messages = [];
				const abortController = new AbortController();
				const timeoutId = setTimeout(
					() => abortController.abort(),
					this.timeout
				);

				for await (const message of query({
					prompt: prompt,
					abortController,
					options: {
						maxTurns: 1,
						// 指定使用用户 shell 中的 `claude` 可执行文件，复用其登录状态
						pathToClaudeCodeExecutable: this.claudeExecutablePath || undefined,
					},
				})) {
					messages.push(message);
						// 在 verbose 模式下输出 Claude Code 的关键过程日志，便于排障
						// 注意：日志内容做适度截断避免刷屏
					if (this.verbose) {
						try {
							const m = message;
							if (m.type === "system") {
								const mode = m.permissionMode || "default";
								const model = m.model || "unknown";
								console.log(
									`🧩 Claude Code 初始化: model=${model}, permissionMode=${mode}`
								);
							} else if (m.type === "assistant") {
								const content = m.message?.content;
								let text = "";
								if (Array.isArray(content)) {
									text = content
										.map((p) => (p && typeof p.text === "string" ? p.text : ""))
										.join("")
										.trim();
								} else if (typeof content === "string") {
									text = content;
								}
								if (text) {
									const preview =
										text.length > 200 ? text.slice(0, 200) + "..." : text;
									console.log(`🤖 Assistant: ${preview}`);
								}
							} else if (m.type === "result") {
								const turns = m.num_turns ?? "?";
								const time = m.duration_ms ?? 0;
								const cost = m.total_cost_usd ?? 0;
								console.log(
									`✅ Claude Code 完成: turns=${turns}, time=${time}ms, cost=$${cost}`
								);
							}
						} catch (_) {
							// 兜底：日志解析失败时忽略，不影响主流程
						}
					}
				}

				clearTimeout(timeoutId);

				// 结果解析优先取 result
				const resultMessage = messages.find((msg) => msg.type === "result");
				if (resultMessage && resultMessage.result) {
					return resultMessage.result.trim();
				}

				// 回退：尝试从 assistant 消息提取文本
				const assistantMessage = messages.find(
					(msg) => msg.type === "assistant"
				);
				if (
					assistantMessage &&
					assistantMessage.message &&
					assistantMessage.message.content
				) {
					const content = assistantMessage.message.content;
					if (Array.isArray(content) && content[0] && content[0].text) {
						return content[0].text.trim();
					}
				}

				throw new Error("No valid response received from Claude");
			} catch (error) {
				if (error.name === "AbortError") {
					console.log(`⏱️  Attempt ${attempt} timed out`);
				} else {
					console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
				}

				if (attempt === this.maxRetries) {
					throw new Error(
						`Failed to generate commit message after ${this.maxRetries} attempts: ${error.message}`
					);
				}

				// Exponential backoff wait
				const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
				console.log(`⏳ Retrying in ${delay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	async generateCommitMessageWithCodex(changes) {
		const prompt = this.buildPrompt(changes);
		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				if (this.verbose) {
					console.log(
						`🤖 Codex generating commit message (attempt ${attempt}/${this.maxRetries})...`
					);
				}

				const codex = this.getCodexClient();
				const thread = codex.startThread({
					workingDirectory: process.cwd(),
					skipGitRepoCheck: true,
					model: this.codexModel || undefined,
				});
				const abortController = new AbortController();
				const timeoutId = setTimeout(() => abortController.abort(), this.timeout);
				const turn = await thread.run(prompt, { signal: abortController.signal });
				clearTimeout(timeoutId);

				if (this.verbose && turn.usage) {
					console.log(
						`✅ Codex 完成: tokens_in=${turn.usage?.input_tokens ?? 0}, tokens_out=${
							turn.usage?.output_tokens ?? 0
						}`
					);
				}

				const message = this.extractMessageFromCodexTurn(turn);
				if (message) {
					return message;
				}

				throw new Error("No valid response received from Codex");
			} catch (error) {
				if (error.name === "AbortError") {
					console.log(`⏱️  Codex attempt ${attempt} timed out`);
				} else {
					console.log(`❌ Codex attempt ${attempt} failed: ${error.message}`);
				}

				if (attempt === this.maxRetries) {
					throw new Error(
						`Failed to generate commit message via Codex after ${this.maxRetries} attempts: ${error.message}`
					);
				}

				const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
				console.log(`⏳ Codex retrying in ${delay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	extractMessageFromCodexTurn(turn) {
		if (!turn) return "";
		if (typeof turn.finalResponse === "string" && turn.finalResponse.trim()) {
			return turn.finalResponse.trim();
		}
		if (Array.isArray(turn.items)) {
			for (const item of turn.items) {
				if (item && typeof item.text === "string" && item.text.trim()) {
					return item.text.trim();
				}
				if (
					item &&
					item.type === "agent_message" &&
					typeof item.content === "string" &&
					item.content.trim()
				) {
					return item.content.trim();
				}
			}
		}
		return "";
	}

	buildPrompt(changes) {
		/**
		 * Description: Optimized prompt construction
		 * - Unified constraints: Output only "commit message itself", no code blocks/quotes/explanatory text;
		 * - Structure: First line is short subject (<= 72 chars); empty line; optional 1~3 bullet points (each starts with "- ");
		 * - Conventional Commits: If enabled, subject starts with `<type>(optional scope): `; if commitType is specified, use it fixedly;
		 * - Emoji: If enabled, can be added to subject or bullet points (max 2), otherwise do not add;
		 */
		let base = "";
		const cc = this.conventionalCommit;
		const ctype = this.commitType;
		const emojiHintZh = this.useEmoji
			? "如适合，可在主题或要点中加入不超过2个表情符号；"
			: "不要加入任何表情符号；";

		if (this.language === "zh") {
			base =
				"请基于下面的 Git 变更生成中文提交信息：\n" +
				`- 仅输出提交信息本身，不要解释/引号/Markdown 代码块；\n` +
				`- 第一行是简短主题（动词开头，<=72 字符）；空一行；随后 1~3 行要点（每行以 \"- \" 开头，可省略）；\n` +
				(cc ? `- 使用 Conventional Commits 格式；${ctype ? ` 主题类型固定为 \"${ctype}\"；` : ""}\n` : "") +
				emojiHintZh +
				"- 不要包含引用他人的说明、模型自我描述或无关文本。";
		} else {
			const emojiHintEn = this.useEmoji ? "- If appropriate, include up to 2 emojis.\n" : "- Do not include emojis.\n";
			base =
				"Generate an English commit message from the following Git changes.\n" +
				"- Output only the commit message: no quotes, no explanations, no Markdown code fences;\n" +
				"- Structure: one short subject line (imperative, <=72 chars), then a blank line, then 1-3 bullet points (each starts with \"- \"; optional);\n" +
				(cc ? `- Use Conventional Commits;${ctype ? ` enforce type \"${ctype}\";` : ""}\n` : "") +
				emojiHintEn +
				"- Do not include model meta-commentary or unrelated text.";
		}

		let prompt = base;
		prompt += `\n\nChanges:\n${changes}`;
		return prompt;
	}

    /**
     * Check if `claude` command is executable
     * Only checks executability, not installation source or detailed config.
     */
    async checkClaudeCommand() {
        /**
         * Description: Parse and verify `claude` executable path.
         * - Priority: Use config item `claudePath`; otherwise parse via PATH;
         * - Success: Record path and return true; Failure: Throw exception with Chinese prompt;
         */
        try {
            // 若已通过配置指定了 claudePath，则优先使用并校验
            if (this.claudeExecutablePath) {
                await execAsync(`"${this.claudeExecutablePath}" --version`, { timeout: 5000 });
                if (this.verbose) {
                    console.log(
                        `🧪 检查: \`claude\` 命令可用，路径: ${this.claudeExecutablePath}（来源: config）`
                    );
                }
                return true;
            }

            // 否则定位 `claude` 的实际可执行路径（PATH 优先）
            const whichCmd = process.platform === "darwin" ? "which claude" : "command -v claude";
            const { stdout: whichOut } = await execAsync(whichCmd, { timeout: 5000 });
            const resolvedPath = (whichOut || "").toString().trim();
            if (!resolvedPath) {
                throw new Error("未能解析到 `claude` 可执行路径");
            }
            this.claudeExecutablePath = resolvedPath;
            await execAsync(`"${this.claudeExecutablePath}" --version`, { timeout: 5000 });
            if (this.verbose) {
                console.log(
                    `🧪 检查: \`claude\` 命令可用，路径: ${this.claudeExecutablePath}（来源: which）`
                );
            }
            return true;
        } catch (error) {
            throw new Error(
                "未检测到可用的 `claude` 命令。请确保已正确安装并在 PATH 中可用（例如能在终端执行 `claude --version`）。"
            );
        }
    }

	async checkCodexEnvironment() {
		try {
			this.getCodexClient();
			if (this.verbose) {
				const source = this.codexExecutablePath
					? this.codexExecutablePath
					: "bundled";
				console.log(`🧪 检查: Codex CLI 可用，来源: ${source}`);
			}
			return true;
		} catch (error) {
			throw new Error(
				`未检测到可用的 Codex CLI。请确保已安装依赖并通过 codex login 完成鉴权：${error.message}`
			);
		}
	}

	async stageAllChanges() {
		try {
			await execAsync("git add .");
			if (this.verbose) {
				console.log("📁 All changes staged");
			}
		} catch (error) {
			throw new Error(`Failed to stage changes: ${error.message}`);
		}
	}

	async createCommit(message) {
		try {
			// Escape message
			const escapedMessage = message.replace(/"/g, '\\"').replace(/\$/g, "\\$");
			await execAsync(`git commit -m "${escapedMessage}"`);
			return true;
		} catch (error) {
			throw new Error(`Failed to create commit: ${error.message}`);
		}
	}

	async pushChanges() {
		try {
			// Use cached branch if available, otherwise get it
			let currentBranch;
			if (this._gitCache.branch !== undefined) {
				currentBranch = this._gitCache.branch.trim();
			} else {
				const { stdout: branch } = await execAsync("git branch --show-current");
				currentBranch = branch.trim();
			}

			console.log(`🚀 Pushing to ${currentBranch}...`);
			await execAsync(`git push origin ${currentBranch}`);
			console.log("✅ Changes pushed successfully!");
		} catch (error) {
			console.error(`❌ Failed to push changes: ${error.message}`);
			console.log("💡 You may need to push manually: git push");
		}
	}

	async showStatistics() {
		try {
			const { stdout: logOutput } = await execAsync("git log --oneline -10");
			console.log("\n📊 Recent commits:");
			console.log(logOutput);
		} catch (error) {
			if (this.verbose) {
				console.log("⚠️  Could not retrieve commit history");
			}
		}
	}

    async run() {
		/**
		 * Description: CLI Main Execution Flow.
		 * 1) Pre-check (Config/Git/claude) 2) Change detection & collection 3) Template or SDK generation
		 * 4) Commit/Push based on mode 5) Optional statistics 6) Structured log wrap-up
		 */
		const totalStart = this.verbose ? process.hrtime.bigint() : null;

		// 在 verbose 模式下先输出一段可视分隔，包含 trace_id
		this.logSection(`启动 | trace_id=${this.traceId}`);

		try {
			console.log(
				`🚀 AutoCommit（SDK 版本 ${CLI_VERSION}，trace_id=${this.traceId})`
			);

			// 并行执行：配置读取 + Git 仓库检测 + `claude` 命令可用性校验
			await this.measure(
				"Config, Git & provider check",
				async () => {
					const tasks = [this.loadConfig(), this.checkGitRepository()];
					if (this.provider === "claude") {
						tasks.push(this.checkClaudeCommand());
					} else {
						tasks.push(this.checkCodexEnvironment());
					}
					const [cfg] = await Promise.all(tasks);
					return cfg;
				}
			);

			const detectionMetrics = await this.measure(
				"Change detection",
				async () => {
					const start = process.hrtime.bigint();
					const hasChanges = await this.checkForChanges();
					const end = process.hrtime.bigint();
					const durationMs = Number(end - start) / 1e6;
					return { hasChanges, durationMs };
				}
			);

			const { hasChanges, durationMs } = detectionMetrics;

			if (!hasChanges) {
				console.log("✨ 未检测到变更，工作区干净。");
				if (this.verbose) {
					// 输出结构化日志，便于携带 trace_id 进行问题追踪
					const structuredLog = {
						trace_id: this.traceId,
						phase: "change_detection",
						changed_files: 0,
						duration_ms: Number(durationMs.toFixed(2)),
					};
					console.log(JSON.stringify(structuredLog));
				}
				return;
			}

			await this.measure("Staging changes", () => this.stageAllChanges());

			const changes = await this.measure("Git changes analysis", () =>
				this.getGitChanges()
			);

			if (this.verbose) {
				const engine =
					this.provider === "codex" ? "Codex CLI" : "Claude Code SDK";
				console.log(`🔍 Analyzing changes with ${engine}...`);
			}

			// If using template
			let commitMessage;
			if (this.templateName) {
				try {
					commitMessage = await this.loadTemplate(this.templateName);
					console.log(`📋 Using template: ${this.templateName}`);
				} catch (error) {
					console.log(`⚠️  ${error.message}, generating new message...`);
					commitMessage = await this.measure("Commit message generation", () =>
						this.generateCommitMessage(changes)
					);
				}
			} else {
				commitMessage = await this.measure("Commit message generation", () =>
					this.generateCommitMessage(changes)
				);
			}


				// 根据配置在消息末尾增加来源标识（避免重复追加）
				if (this.appendSignature) {
					const signature = "auto generated by @ticoag/auto-commit";
					const trimmed = commitMessage.trimEnd();
					if (!trimmed.endsWith(signature)) {
						commitMessage = `${trimmed}\n\n${signature}`;
					}
				}

				// 以分隔块突出显示生成的提交信息（无外层引号）
				this.printCommitBlock(commitMessage);

			if (this.dryRun) {
				console.log("\n🔍 Dry run mode - commit not created");

				// Template save option
				if (process.argv.includes("--save-template")) {
					const templateName =
						process.argv[process.argv.indexOf("--save-template") + 1];
					if (templateName) {
						await this.saveTemplate(templateName, commitMessage);
					}
				}
				return;
			}

			await this.createCommit(commitMessage);
			console.log("\n✅ Commit created successfully!");

			if (this.push) {
				await this.pushChanges();
			}

			if (this.verbose) {
				await this.showStatistics();

				// Display total execution time
				if (totalStart) {
					const totalEnd = process.hrtime.bigint();
					const totalDuration = Number(totalEnd - totalStart) / 1e6; // 毫秒
					console.log(
						`\n⏱️  Total execution time: ${totalDuration.toFixed(2)}ms`
					);
				}
			}
		} catch (error) {
			console.error(`❌ 错误（trace_id=${this.traceId}）: ${error.message}`);

			if (this.verbose) {
				console.error("堆栈信息:", error.stack);
			}

			process.exit(1);
		}
	}
}

function parseArgs() {
	const args = process.argv.slice(2);
	const options = {};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "-l":
			case "--language":
				options.language = args[++i];
				break;
			case "-e":
			case "--emoji":
				options.useEmoji = true;
				break;
			case "-c":
			case "--conventional":
				options.conventionalCommit = true;
				break;
			case "-t":
			case "--type":
				options.commitType = args[++i];
				options.conventionalCommit = true; // 自动启用 Conventional 提交格式
				break;
			case "-d":
			case "--dry-run":
				options.dryRun = true;
				break;
			case "-v":
			case "--verbose":
				options.verbose = true;
				break;
			case "-p":
			case "--push":
				options.push = true;
				break;
			case "--template":
				options.templateName = args[++i];
				break;
			case "--provider":
				options.provider = args[++i];
				break;
			case "--codex":
				options.provider = "codex";
				break;
			case "--claude":
				options.provider = "claude";
				break;
			case "--codex-model":
				options.codexModel = args[++i];
				break;
			case "--save-template":
				// 不在此处消费参数（在 run() 中处理）
				break;
			case "--list-templates":
				(async () => {
					const autoCommit = new AutoCommit();
					const templates = await autoCommit.listTemplates();
					console.log("📋 Available templates:");
					if (templates.length === 0) {
						console.log("  No templates found");
					} else {
						templates.forEach((template) => console.log(`  - ${template}`));
					}
					process.exit(0);
				})();
				return;
			case "--version":
				console.log(`AutoCommit ${CLI_VERSION}`);
				process.exit(0);
			case "-h":
			case "--help":
				// 中文优先的双语帮助文本；与 bin 脚本保持一致，便于直接用 node 运行
				console.log(`
AutoCommit (SDK 版本 ${CLI_VERSION}) / AutoCommit (SDK Version ${CLI_VERSION})

用法 / Usage:
  auto-commit [options]

选项 / Options:
  -l, --language <lang>       提交信息语言（zh, en） / Language for commit message (zh, en)
  -e, --emoji                 在提交信息中包含表情 / Include emojis in commit message
  -c, --conventional          使用 Conventional Commits 规范 / Use Conventional Commits format
  -t, --type <type>           指定提交类型（feat, fix, docs 等）/ Specify commit type (feat, fix, docs, etc.)
  -d, --dry-run               仅预览提交信息，不创建提交 / Preview commit message without creating commit
  -v, --verbose               输出详细日志 / Verbose output
  -p, --push                  提交后自动推送 / Push changes after commit
  --template <name>           使用已保存模板 / Use saved template
  --save-template <name>      将生成的信息保存为模板（仅 dry-run）/ Save generated message as template (dry-run only)
  --list-templates            列出可用模板 / List available templates
  --provider <claude|codex>   选择 AI 引擎（默认 codex）/ Select AI provider (default: codex)
  --codex                     快捷方式，等同于 --provider codex / Shortcut for --provider codex
  --claude                    快捷方式，等同于 --provider claude / Shortcut for --provider claude
  --codex-model <name>        指定 Codex 模型（可选） / Optional Codex model name
  --version                   显示版本信息 / Show version information
  -h, --help                  显示帮助信息 / Show this help message

示例 / Examples:
  auto-commit
  auto-commit -l zh -e -c
  auto-commit -l en -e -c
  auto-commit -t feat --push
  auto-commit --provider codex --push
  auto-commit --dry-run --save-template my-template

配置 / Configuration:
  路径 / Path: ~/.auto-commit/config.yml (YAML only)
  YAML 示例 / Example:
  language: zh
  useEmoji: true
  conventionalCommit: false
  provider: codex
  verbose: true
        `);
				process.exit(0);
				break;
		}
	}

	return options;
}

/**
 * 导出的 CLI 入口函数（干净方案）
 * - 解析参数并执行主流程
 */
export async function main() {
	const options = parseArgs();
	const autoCommit = new AutoCommit(options);
	try {
		// 中文注释：统一入口，仅调度主流程；异常在此层集中处理
		await autoCommit.run();
	} catch (error) {
		// 中文注释：统一的致命错误兜底
		console.error("Fatal error:", error);
		process.exit(1);
	}
}

export default AutoCommit;
