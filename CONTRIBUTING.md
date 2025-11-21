# Contributing to AutoCommit

Thank you for your interest in contributing to AutoCommit! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Issues
1. Check existing [issues](https://github.com/ticoAg/auto-commit/issues) first
2. Use the appropriate issue template
3. Provide detailed information including:
   - Version number
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior

### Suggesting Features
1. Check if the feature has already been requested
2. Use the feature request template
3. Explain the use case and benefit
4. Be open to discussion and feedback

### Submitting Code Changes

#### Prerequisites
- Git repository with some commit history for testing
- Claude subscription (Pro, Max, or Team)
- Claude CLI installed and configured
- Bash shell (macOS, Linux, or WSL)

#### Development Setup
```bash
# Clone the repository
git clone https://github.com/ticoAg/auto-commit.git
cd auto-commit

# Install dependencies (production is enough for CLI usage)
npm install --production

# Verify the CLI
node src/auto-commit.js --help
```

#### Testing Your Changes
Before submitting a pull request, please test your changes:

```bash
# Test basic functionality (dry-run)
node src/auto-commit.js --dry-run

# Test with options
node src/auto-commit.js -l zh -e -c -t feat --dry-run

# Template system
node src/auto-commit.js --dry-run --save-template test
node src/auto-commit.js --template test
```

#### Pull Request Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly on your system
5. Update documentation if needed
6. Commit with descriptive messages
7. Push to your fork
8. Create a pull request using the template

## 📝 Code Style Guidelines

### JavaScript/Node Guidelines
- Use ES Modules and absolute imports when possible
- Add concise comments for non-trivial logic
- Keep CLI output user-oriented; log internals under `--verbose`
- Prefer synchronous design unless a clear bottleneck exists

### Commit Message Format
We use conventional commits for consistency:
```
type(scope): description

feat: add template system
fix: resolve macOS compatibility issue
docs: update installation instructions
```

### Documentation
- Update README.md for new features
- Update help text in the script
- Add examples for new functionality
- Update CHANGELOG.md

## 🧪 Testing

### Manual Testing Checklist
- [ ] Basic commit message generation
- [ ] Dry run mode
- [ ] Different language options
- [ ] Template system
- [ ] History analysis
- [ ] Provider switching（claude/codex）
- [ ] Error handling

### Platform Testing
- [ ] macOS (Bash 3.x and 5.x)
- [ ] Linux (various distributions)
- [ ] Windows WSL

## 📋 Release Process

1. Update version in `package.json` (if applicable)
2. Update CHANGELOG.md
3. Run `node scripts/release.mjs` 并完成交互流程（生成 changelog / docs/publish）
4. Tag version: `git tag v0.x.y`
5. Push tag: `git push origin v0.x.y`
6. GitHub Actions will create the release

## 🤔 Questions?

- Check the [README](./README.md) first
- Search [existing issues](https://github.com/ticoAg/auto-commit/issues)

## Upstream / 原始仓库

本项目是从上游仓库 fork 并持续维护的版本：

- 0xkaz/claude-auto-commit（上游）：https://github.com/0xkaz/claude-auto-commit

贡献者如需在上游同步相关议题或提交 PR，欢迎参考上游仓库的贡献流程；本仓库会定期跟进上游更新。
- Create a new issue with the "question" template
- Join discussions in the repository

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make AutoCommit better! 🚀
