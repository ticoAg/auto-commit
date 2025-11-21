# Architecture (SDK Version)

> Updated: 2025-11-03 · Applies to v0.1.x (Node.js 22+ / Claude Code SDK)

This document explains how `auto-commit` works at a high level. The Chinese documentation is primary; this English version is a concise mirror.

## Goals
- Seamlessly integrate AI-generated commit messages into daily Git workflows.
- Prefer synchronous, deterministic execution with clear observability.
- Keep the core small; extend via config and templates.

## Key Pieces
- Entry: `bin/auto-commit` → `src/auto-commit.js` (`main()`)
- Class: `ClaudeAutoCommit`
- Subsystems:
- Config loader (YAML only, 5‑min cache)
  - Git change collector (parallel commands, cached results, truncation)
  - Prompt builder (language/format/emoji/type aware)
  - Generation via Claude Code SDK (30s timeout, up to 3 retries, backoff)
  - Commit & optional push (dry-run, save/use templates)
  - Verbose structured logs with `trace_id`

## Flow
1. Bootstrap: load config, verify Git repo, resolve `claude` binary, create `trace_id`.
2. Collect changes: run `status/branch/diff` in parallel; add `--stat` summaries; truncate long payloads.
3. Build prompt: switch by `language`, `conventionalCommit`, `useEmoji`, `commitType`.
4. Generate: call SDK, parse `result` first then `assistant`; handle timeout + backoff.
5. Commit/push: auto stage; support dry-run/template; optionally push current branch.
6. Observe: print structured metrics when `--verbose`.

## Differences from legacy CLI
- SDK-only implementation; no auto-update.
- Better reliability and logs (timeouts, retries, `trace_id`).
