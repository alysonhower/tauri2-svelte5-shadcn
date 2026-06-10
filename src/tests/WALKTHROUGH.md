# Walkthrough — Regression Shield for the Template

## Summary

Implemented a complete test harness covering **3 system boundaries**, going from **zero tests** to **101 automated validations** (92 frontend + 9 Rust), all passing.

Branch: `test/smoke-regression-harness`

---

## Validation Results

| Tool                             | Status | Detail                              |
| -------------------------------- | ------ | ----------------------------------- |
| `npm run test:unit` (Vitest)     | ✅     | 92 tests, 8 suites — ~5s            |
| `npm run test:rust` (cargo test) | ✅     | 9 tests — 0.00s (excl. compilation) |
| `svelte-check`                   | ✅     | 0 errors, 0 warnings                |
| `tsc -p tsconfig.node.json`      | ✅     | Clean                               |
| `vite build`                     | ✅     | Production build OK                 |

---

## Files Created

### Test Configuration

| File       | Purpose                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| `setup.ts` | Global setup — `@tauri-apps/api/core` mock (`invoke`) + jest-dom matchers |

### Frontend Tests — Boundary 1 (UI & Runes)

| File                                 | Tests | What It Protects                                                                |
| ------------------------------------ | ----- | ------------------------------------------------------------------------------- |
| `unit/ui/button.test.ts`             | 28    | All 24 variant×size combinations + 4 rendering tests                            |
| `unit/ui/card.test.ts`               | 21    | 7 sub-component renders + 14 barrel exports                                     |
| `unit/ui/input.test.ts`              | 4     | text/file modes, data-slot, custom classes                                      |
| `unit/ui/lucide-icons.test.ts`       | 10    | 10 representative icons export valid components                                 |
| `unit/runes/global-state.test.ts`    | 10    | `$state` init/setters, `$derived` (nlen/glen), reset(), IPC read/write contract |
| `unit/runes/prevent-default.test.ts` | 2     | Event helper — call order                                                       |
| `unit/utils.test.ts`                 | 9     | `cn()` with Tailwind conflicts + 4 compile-time type checks                     |

### Integration Tests — Boundary 3 (IPC Bridge)

| File                              | Tests | What It Protects                                                                     |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------ |
| `integration/hello-world.test.ts` | 8     | Main component mounts, inputs/buttons exist, default message, invoke called on mount |

### Rust Tests — Boundary 2 (Core Backend)

| File                                | Tests | What It Protects                                                                                                       |
| ----------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| `src-tauri/src/commands/default.rs` | 6     | read/write roundtrip, overwrite, empty, unicode, IO error, UTF-8 error                                                 |
| `src-tauri/src/commands/errors.rs`  | 3     | JSON serialization IO → `{name:"io",message:...}`, UTF8 → `{name:"fromUtf8Error",message:...}`, exact shape (2 fields) |

---

## Modified Files

| File                               | Change                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                   | Added `test` block (Vitest), `svelteTesting()` plugin, `resolve.conditions: ['browser']`, `vitest/config` reference |
| `package.json`                     | 5 new scripts: `test`, `test:unit`, `test:watch`, `test:rust`, `test:check`                                         |
| `src-tauri/Cargo.toml`             | `[dev-dependencies] tempfile = "3"`                                                                                 |
| `.github/workflows/test-build.yml` | 4 new steps before build: type-check, lint, vitest, cargo test                                                      |

---

## Available Commands

```bash
# Full pipeline (static checks + frontend + rust)
npm run test

# Individual commands:
npm run test:unit      # Vitest — 92 tests, ~5s
npm run test:watch     # Vitest watch mode (dev)
npm run test:rust      # cargo test — 9 tests
npm run test:check     # svelte-check + tsc + prettier + eslint
```

---

## Technical Decisions

1. **`resolve.conditions: ['browser']`** at the root level of the Vite config — required because Svelte 5 exports `index-server.js` as default, and JSDOM needs the client variant for `mount()` to work.

2. **`svelteTesting()` plugin** — from `@testing-library/svelte/vite`, ensures correct `.svelte` transformations for tests.

3. **Lucide: individual imports** (`@lucide/svelte/icons/search`) instead of the barrel (`@lucide/svelte`) — the barrel exports ~1500 icons and causes timeouts in JSDOM. Individual import is instantaneous and is the recommended practice.

4. **`tempfile` crate** for Rust tests — isolates each test with temporary files that are automatically cleaned up, avoiding side-effects between tests.

5. **Global `invoke` mock in setup** — all frontend tests share the same resettable mock, allowing each test to configure specific backend responses without real dependency.

---

## What These Tests Do NOT Cover

To keep the suite fast (total execution under 8 seconds), the following scenarios are **explicitly out of scope**:

1. **Full End-to-End User Flows (E2E):** No multi-screen, long-running user journeys (e.g., complete navigation, database persistence, external API login flows). For this coverage, tools like Playwright or Cypress integrated with Tauri would be required.

2. **Visual Rendering Fidelity (Visual Snapshots / Pixel Regression):** We do not test the pixel renderer or whether an element shifted by 1px. Subtle CSS changes that alter layout without affecting logic will not fail the suite.

3. **Cross-Browser / Cross-WebView Compatibility:** Frontend tests run on JSDOM, a simulated browser environment in Node.js. This does not reproduce bugs specific to native renderers on each OS (e.g., WebKitGTK on Linux, WebKit on macOS, Webview2 on Windows).

4. **Real OS-Level Resource Integration (Hardware/OS):** All communication with Tauri's native API and real OS file systems is mocked or abstracted. The suite tests **code logic**, not the correct functioning of disk drivers or kernel APIs.

5. **Heavy Concurrency and IPC Stress Testing:** There are no concurrency validations or behavior tests under very high request frequency to the Tauri IPC bus.

6. **Tauri Plugin Integration:** Tests do not validate the behavior of Tauri plugins (e.g., `tauri-plugin-log`) in a real WebView context. Plugin APIs are trusted but not exercised.

7. **Build Artifact Integrity:** The suite does not validate the contents of production bundles (e.g., asset hashing, chunk splitting, bundle size budgets). It only verifies that `vite build` exits without errors.
