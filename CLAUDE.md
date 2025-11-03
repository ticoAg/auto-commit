# Claude Auto-Commit Project

## 🎯 Overview
An AI-powered Git commit message generator built on the Claude Code SDK.

## 📋 Current Status
- ✅ v0.1.0 SDK-based release completed
- ✅ Full migration from Claude CLI to Claude Code SDK
- ✅ Major performance improvements (parallelism and caching)
- ✅ New features added (templates, config file, one-liner execution)
- ✅ Enhanced error handling
- ✅ NPM package support
- ✅ Multi-language support (English and Japanese)
- ✅ GitHub repository: https://github.com/ticoAg/claude-auto-commit

## 🚀 Next TODOs

### v0.1.0 Completed
- ✅ SDK migration finalized
- ✅ Performance optimization
- ✅ New features shipped (templates, config, one-liner)
- ✅ NPM packaging supported

### Upcoming Versions
- [ ] v0.1.1: NPM publishing and package optimization
- [ ] v0.2.0: VS Code extension
- [ ] v0.3.0: GitHub Actions integration
- [ ] v1.0.0: Plugin system and enterprise features

### Technical Improvements
- [ ] Full TypeScript support
- [ ] Expanded test suite
- [ ] Stronger CI/CD pipeline
- [ ] Automated documentation generation

## 📁 Project Structure
```
claude-auto-commit/
├── src/
│   ├── claude-auto-commit.js    # 🆕 Main SDK-based script
│   └── claude-auto-commit.sh    # ⚠️  Legacy CLI script (deprecated, for migration period only)
├── bin/
│   └── claude-auto-commit       # Executable (JS version)
├── scripts/
│   ├── install.sh              # One-liner installer
│   └── run-once.sh             # One-time execution script
├── docs/                       # Multi-language documentation
├── package.json                # NPM package settings
└── CHANGELOG.md                # Version history
```

## 💡 Technical Specs
- Runtime: Node.js 22.0.0+, ES Modules
- SDK: @anthropic-ai/claude-code ^1.0.22
- Config file: `~/.claude-auto-commit/config.json`
- Templates: `~/.claude-auto-commit/templates/`
- Performance: Parallel processing and intelligent caching

## 🔄 Installation Methods
1. One-liner (recommended): Script-based automatic setup
2. NPM Global: `npm install -g claude-auto-commit`
3. One-time execution: No installation, run once only

## 🚨 CLI Deprecation Schedule

### v0.1.0 (current): Dual support with deprecation warning
- ✅ `src/claude-auto-commit.js`: Primary (SDK-based)
- ⚠️ `src/claude-auto-commit.sh`: Legacy (CLI) with startup warning
- 🎯 Goal: Gradual migration for existing users
- 📢 Warning covers: performance gap, new features, migration steps, planned removal date

### v0.2.0 (planned): Remove legacy CLI
- ❌ Remove `src/claude-auto-commit.sh`
- 📋 Provide a full migration guide
- 🎯 Goal: Reduce technical debt and maintenance cost

## 📅 Release History
- June 14, 2025: v0.1.0 SDK-based release
- June 13, 2025: v0.0.5 CLI version (final)
