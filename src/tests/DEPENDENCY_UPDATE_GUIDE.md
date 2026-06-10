# Dependency Update Guide

A practical, opinionated runbook for safely updating dependencies in this Tauri 2 + Svelte 5 + shadcn-svelte template.

---

## Philosophy

The test harness in this repository exists specifically to answer one question after every dependency change: **"did anything break?"**

The fastest workflow is not to update packages one-by-one from the start. That is tedious and often unnecessary — most semver-compatible updates work fine together. The smart approach is:

1. **Try everything at once.** If it passes, you're done.
2. **If it breaks, bisect.** Discard the batch, go incremental.

This is the same principle behind `git bisect`: start broad, narrow down only when needed.

---

## Strategy: Optimistic Batch, Pessimistic Fallback

```
┌─────────────────────────────────────────────────────────┐
│  Phase 1: Optimistic Batch Update                       │
│  Update ALL dependencies at once on an isolated branch  │
│  Run full test suite                                    │
│                                                         │
│  ✅ All green? → Commit, PR, merge. Done.               │
│  ❌ Something broke? → Discard branch, go to Phase 2    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Incremental Bisection                         │
│  Fresh branch from main                                 │
│  Update dependencies one-by-one (or in logical groups)  │
│  Run test suite after each update                       │
│  Identify which package introduced the breakage         │
│                                                         │
│  Pin the problematic package and document why            │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Optimistic Batch Update

### Step 1: Create an isolated branch

```bash
git checkout main
git pull origin main
git checkout -b chore/update-deps-$(date +%Y-%m-%d)
```

### Step 2: Update everything

**Frontend (npm):**

```bash
# Update all packages to their latest versions allowed by package.json ranges
npm update

# If you want to jump to latest majors (breaking changes possible):
npx npm-check-updates -u
npm install
```

**Backend (Rust):**

```bash
# Update lockfile to latest compatible versions
cargo update --manifest-path src-tauri/Cargo.toml

# For major version bumps, manually edit Cargo.toml version strings,
# then run:
cargo build --manifest-path src-tauri/Cargo.toml
```

### Step 3: Run the full validation pipeline

```bash
npm run test
```

This single command runs, in order:

1. `svelte-check` + `tsc` (type checking)
2. `prettier --check` + `eslint` (formatting & linting)
3. `vitest run` (92 frontend tests)
4. `cargo test` (9 Rust tests)

### Step 4: Evaluate

**✅ All green?** Commit and open a PR:

```bash
git add .
git commit -m "chore: update all dependencies $(date +%Y-%m-%d)"
git push origin HEAD
```

The GitHub Actions CI pipeline will run the same checks on a clean Ubuntu environment. If CI passes, merge with confidence.

**❌ Something broke?** Discard this branch entirely:

```bash
git checkout main
git branch -D chore/update-deps-$(date +%Y-%m-%d)
```

Proceed to Phase 2.

---

## Phase 2: Incremental Bisection

Only reach for this when Phase 1 fails. The goal is to isolate which specific package update caused the failure.

### Step 1: Fresh branch

```bash
git checkout main
git checkout -b chore/update-deps-incremental-$(date +%Y-%m-%d)
```

### Step 2: Group dependencies logically

Don't update one package at a time blindly. Group them by ecosystem:

| Group              | Packages                                                                                    | Risk Level                                                      |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Svelte core**    | `svelte`, `@sveltejs/vite-plugin-svelte`, `svelte-check`                                    | 🔴 High — Svelte major releases change the compiler and runtime |
| **Vite toolchain** | `vite`, `@tailwindcss/vite`                                                                 | 🟡 Medium — Vite majors can change plugin APIs                  |
| **UI components**  | `@lucide/svelte`, `tailwind-variants`, shadcn components                                    | 🟡 Medium — Icon renames, variant API changes                   |
| **Tailwind CSS**   | `tailwindcss`, `tailwind-merge`, `tw-animate-css`                                           | 🟡 Medium — v4 had major breaking changes                       |
| **TypeScript**     | `typescript`, `@tsconfig/svelte`                                                            | 🟡 Medium — Strict mode changes, new errors                     |
| **Linting**        | `eslint`, `eslint-config-prettier`, `eslint-plugin-svelte`, `prettier`, `prettier-plugin-*` | 🟢 Low — Usually safe, may flag new lint rules                  |
| **Testing**        | `vitest`, `@testing-library/svelte`, `@testing-library/jest-dom`, `jsdom`                   | 🟢 Low — Rarely break, but API changes happen                   |
| **Tauri**          | `tauri` (Rust), `@tauri-apps/api`, `@tauri-apps/cli`, `tauri-plugin-log`                    | 🔴 High — Tauri major versions change IPC and plugin APIs       |
| **Rust utilities** | `serde`, `serde_json`, `thiserror`, `log`, `tempfile`                                       | 🟢 Low — Mature, stable APIs                                    |

### Step 3: Update one group at a time

For each group:

```bash
# Example: updating the Svelte core group
npm install --save-dev svelte@latest @sveltejs/vite-plugin-svelte@latest svelte-check@latest

# Run tests
npm run test

# If green, commit this group
git add .
git commit -m "chore(deps): update svelte core to latest"

# If red, identify which package in the group caused the issue:
# revert and try each package individually
git checkout -- package.json package-lock.json
npm install
```

### Step 4: Handle breakages

When you find the problematic package:

1. **Check the changelog/migration guide** of that package for breaking changes.
2. **Adapt your code** if the fix is straightforward.
3. **Pin the version** in `package.json` if you need to defer the migration:
   ```json
   "svelte": "5.53.11"  // Pinned: v5.54 breaks X — see issue #123
   ```
4. **Open an issue** or leave a `TODO` comment so the pin doesn't become permanent.

### Step 5: Final validation and PR

Once all groups are updated (or pinned with documented reasons):

```bash
npm run test
git push origin HEAD
```

Open a PR. CI will validate on a clean machine.

---

## Rust-Specific Notes

### Updating Cargo dependencies

For semver-compatible updates (patch and minor):

```bash
cargo update --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

For major version bumps, edit `src-tauri/Cargo.toml` manually:

```toml
[dependencies]
tauri = { version = "3.0.0", features = [] }  # Example major bump
```

Then rebuild and test:

```bash
cargo build --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

### Checking for outdated Rust dependencies

```bash
# Install the tool (one-time)
cargo install cargo-outdated

# List outdated crates
cargo outdated --manifest-path src-tauri/Cargo.toml

# Preview safe lockfile updates without applying
cargo update --manifest-path src-tauri/Cargo.toml --dry-run
```

---

## Why This Approach Works

**Optimistic-first is not reckless.** It is the pragmatically productive approach because:

- **Most updates are safe.** Semver exists for a reason. The vast majority of minor/patch updates across all your dependencies will not break anything. Updating them one-by-one wastes time.
- **The test harness is your safety net.** 101 validations across 3 boundaries catch regressions in seconds. If the batch passes, you have empirical evidence that everything is compatible.
- **Bisection is only for failures.** You only pay the cost of incremental work when there's an actual problem to diagnose. This is O(1) in the common case, O(n) only in the worst case.
- **Git makes rollback free.** A discarded branch costs nothing. You lose zero work from your main branch.

**One-by-one-first is wasteful** because:

- You run the test suite N times even when 0 packages have issues.
- You create N commits for what is logically a single maintenance task.
- It creates a false sense of thoroughness — you still can't catch interaction effects between packages updated in separate commits.

---

## Scheduling Recommendations

| Cadence                           | What to update                              | Approach                                                                   |
| --------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| **Weekly**                        | `npm update` + `cargo update` (semver-safe) | Phase 1 only — should always pass                                          |
| **Monthly**                       | `npx npm-check-updates -u` (all latest)     | Phase 1, fallback to Phase 2                                               |
| **On Tauri/Svelte major release** | Major version bump of core framework        | Phase 2 directly — expect breaking changes, read the migration guide first |

---

## Quick Reference

```bash
# ── Diagnose ──
npm outdated                                                    # Frontend
cargo outdated --manifest-path src-tauri/Cargo.toml             # Rust

# ── Update (optimistic) ──
npx npm-check-updates -u && npm install                         # Frontend (all latest)
cargo update --manifest-path src-tauri/Cargo.toml               # Rust (semver-safe)

# ── Validate ──
npm run test                                                    # Full pipeline

# ── Individual checks (for debugging) ──
npm run test:check                                              # Types + lint
npm run test:unit                                               # Vitest (92 tests)
npm run test:rust                                               # Cargo test (9 tests)
npm run test:watch                                              # Vitest in watch mode
```
