# Changelog

## 2.1.1 (2026-07-28)

- Use Tailwind CSS 4 canonical utility forms to eliminate editor diagnostics.
- Keep intentional Svelte `$inspect` instrumentation with a line-scoped ESLint suppression.
- Ignore Rust build output and generated Tauri schemas in the development watcher to prevent unnecessary recursive rebuilds.

## 2.1.0 (2026-07-28)

- Add comprehensive frontend regression tests with Vitest and Testing Library.
- Add Rust unit tests for Tauri file commands and serialized errors.
- Add testing, walkthrough, and dependency-maintenance documentation.
- Run type checks, linting, frontend tests, and Rust tests in CI.
- Upgrade Svelte, Vite, ESLint, Tauri, Tailwind CSS, and related dependencies.
- Upgrade CI/CD to Node.js 24 and current GitHub Actions.
- Fix the shadcn-svelte schema and registry configuration.
- Stabilize the HelloWorld integration test.
- Standardize package management on npm and remove the stale pnpm lockfile.
- Publish GitHub releases automatically after all platform artifacts succeed.

## 2.0.0 (2025-05-20)

- Replace SvelteKit with Svelte for a leaner frontend architecture.
- Enable runes mode by default.
- Upgrade to Tailwind CSS 4.0 and remove legacy Tailwind configuration files.
- Modularize Tauri commands and enhance error handling mechanisms.
- Refactor "HelloWorld" example into a separate component, including new functionalities.
- Implemente new Prettier and ESLint configurations.
- Update project dependencies to their latest versions.
- Ensure `package-lock.json` is now tracked by version control.
- Switch Node.js version management from Bun to NVM.
- Update CI/CD workflows and Renovate bot configuration.

## 1.0.0 (2024-11-16)

- Implement basic ci/cd config
- Add MIT license
- Update package metadata and descriptions
