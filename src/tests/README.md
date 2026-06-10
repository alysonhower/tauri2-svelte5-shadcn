# Test Suite

Automated regression and smoke tests for the `tauri2-svelte5-shadcn` template.

## Purpose

This test harness serves two complementary goals:

1. **Dependency shield** — Detect breakages when updating Svelte, Tailwind, Lucide, TypeScript, Tauri, or any other dependency. Run `npm run test` after any update and get an immediate pass/fail verdict.

2. **Development safety net** — Provide working examples of how to test every layer of a Tauri + Svelte 5 application. When you build on top of this template, these tests serve as living documentation for patterns you should replicate for your own code.

---

## Quick Start

```bash
# Run everything (types + lint + frontend + rust)
npm run test

# Frontend only (92 tests, ~5s)
npm run test:unit

# Rust only (9 tests)
npm run test:rust

# Watch mode during development
npm run test:watch
```

---

## Architecture

```
src/tests/
├── setup.ts                              # Global test setup (Tauri IPC mock, jest-dom matchers)
├── integration/
│   └── hello-world.test.ts               # Full component integration (UI + state + IPC)
└── unit/
    ├── runes/
    │   ├── global-state.test.ts           # Svelte 5 $state/$derived + IPC contract
    │   └── prevent-default.test.ts        # Event helper utility
    ├── ui/
    │   ├── button.test.ts                 # shadcn Button (variants, sizes, accessibility)
    │   ├── card.test.ts                   # shadcn Card family (7 sub-components + barrel exports)
    │   ├── input.test.ts                  # shadcn Input (modes, data-slot, class merging)
    │   └── lucide-icons.test.ts           # Icon availability smoke tests
    └── utils.test.ts                      # cn() utility + TypeScript type contract

src-tauri/src/commands/
├── default.rs                            # Rust unit tests for read/write commands (6 tests)
└── errors.rs                             # Rust unit tests for error serialization (3 tests)
```

---

## What the Tests Cover

### Boundary 1: Frontend UI & Reactivity (92 tests)

| Area                         | What's tested                                                                 | Why it matters when developing                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **shadcn-svelte components** | Rendering, props, `data-slot` attributes, variant/size matrix, barrel exports | When you add or customize shadcn components, follow the same pattern: render the component, assert `data-slot`, verify that all exports are present in `index.ts`. |
| **Svelte 5 Runes**           | `$state` reactivity, `$derived` computations, class-based state management    | When you create new reactive state classes using Runes, write tests that verify initial values, setter behavior, derived computations, and reset logic.            |
| **IPC contract**             | `invoke()` call signatures, argument shapes, file path constants              | When you add new Tauri commands, write tests that assert the exact `invoke('command_name', { ...args })` signature. This catches frontend/backend argument drift.  |
| **Lucide icons**             | Individual icon module resolution, default export shape                       | When you use new icons, add a smoke test for each one. Tests use individual imports (`@lucide/svelte/icons/name`) — never the barrel.                              |
| **Utilities**                | `cn()` class merging with Tailwind conflict resolution, type exports          | When you add utility functions to `$lib/utils.ts`, add corresponding tests.                                                                                        |

### Boundary 2: Rust Backend (9 tests)

| Area                    | What's tested                                                            | Why it matters when developing                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tauri commands**      | Input/output correctness, edge cases (empty, unicode), error propagation | When you add new `#[tauri::command]` functions, write `#[cfg(test)]` tests next to them. Use the `tempfile` crate for any filesystem operations.        |
| **Error serialization** | JSON shape (`{name, message}`), variant mapping, field count             | When you add new error variants to the `Error` enum, add tests that verify the serialized JSON shape matches what the frontend TypeScript types expect. |

### Boundary 3: Integration (8 tests)

| Area                      | What's tested                                                   | Why it matters when developing                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component composition** | Full component mount with shadcn + Runes + IPC working together | When you build new pages/features, write an integration test that renders the top-level component and asserts that key UI elements exist and IPC calls fire correctly. |

---

## Extending Tests for Your Application

This template gives you a tested starting point. As you build your application, you need to grow the test suite alongside your code. Here's what to do for each type of change:

### Adding a New shadcn Component

```typescript
// src/tests/unit/ui/my-component.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MyComponent from '$lib/components/ui/my-component/my-component.svelte';
import * as Exports from '$lib/components/ui/my-component/index';

describe('MyComponent — smoke / regression', () => {
	it('renders with correct data-slot', () => {
		const { container } = render(MyComponent);
		expect(container.querySelector('[data-slot="my-component"]')).toBeTruthy();
	});

	// Test all barrel exports
	it('exports MyComponent from index', () => {
		expect(Exports.MyComponent).toBeDefined();
	});
});
```

### Adding a New Tauri Command

**Rust side** — add `#[cfg(test)]` tests in the same file:

```rust
#[tauri::command]
pub fn my_command(input: String) -> Result<String, Error> {
    // ...
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn my_command_returns_expected_output() {
        let result = my_command("test".to_string()).unwrap();
        assert_eq!(result, "expected");
    }

    #[test]
    fn my_command_handles_error_case() {
        let result = my_command("".to_string());
        assert!(result.is_err());
    }
}
```

**Frontend side** — test the IPC contract:

```typescript
// src/tests/unit/runes/my-feature.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mockInvoke } from '../../setup';

describe('MyFeature — IPC contract', () => {
	beforeEach(() => {
		mockInvoke.mockReset();
		mockInvoke.mockResolvedValue('');
	});

	it('calls invoke with correct command and args', async () => {
		mockInvoke.mockResolvedValueOnce('result');
		// ... call your function that uses invoke()
		expect(mockInvoke).toHaveBeenCalledWith('my_command', { input: 'test' });
	});
});
```

### Adding New Reactive State (Svelte 5 Runes)

Follow the pattern in `global-state.test.ts`:

```typescript
// Test initial values
const state = new MyState();
expect(state.value).toBe(defaultValue);

// Test setters
state.value = 'new';
expect(state.value).toBe('new');

// Test derived values
expect(state.computedProp).toBe(expectedDerived);

// Test reset
state.reset();
expect(state.value).toBe(defaultValue);
```

### Adding New Lucide Icons

Add a smoke test for each new icon you use in your app:

```typescript
it('exports MyIcon', async () => {
	const mod = await import('@lucide/svelte/icons/my-icon');
	expect(mod.default).toBeDefined();
});
```

> **Important:** Always use individual icon imports, not the barrel `@lucide/svelte`. The barrel export resolves ~1500 modules and causes test timeouts.

### Adding a New Page or Feature Component

Create an integration test:

```typescript
// src/tests/integration/my-feature.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { mockInvoke } from '../setup';
import MyFeature from '$lib/components/MyFeature.svelte';

describe('MyFeature — integration', () => {
	beforeEach(() => {
		mockInvoke.mockReset();
		mockInvoke.mockResolvedValue('');
	});

	it('renders without crashing', () => {
		const { container } = render(MyFeature);
		expect(container).toBeTruthy();
	});

	it('displays expected UI elements', () => {
		render(MyFeature);
		expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
	});
});
```

---

## Test Infrastructure Details

### Global Setup (`setup.ts`)

The setup file does two things:

1. **Registers jest-dom matchers** — Adds `.toBeInTheDocument()`, `.toHaveAttribute()`, etc.
2. **Mocks `@tauri-apps/api/core`** — Provides a controllable `invoke` stub. Every test can import `mockInvoke` to configure per-command responses:

```typescript
import { mockInvoke } from '../setup';

beforeEach(() => {
	mockInvoke.mockReset();
	mockInvoke.mockResolvedValue(''); // default: return empty string
});

it('handles specific response', async () => {
	mockInvoke.mockResolvedValueOnce('custom-response');
	// ... your test
});
```

### Vite Config (`vite.config.ts`)

Key test-related settings:

- **`resolve.conditions: ['browser']`** — Forces Svelte's client-side exports in JSDOM (avoids `lifecycle_function_unavailable` errors).
- **`svelteTesting()` plugin** — Correct Svelte 5 component transformation for tests.
- **`testTimeout: 30000`** — Generous timeout for Lucide icon resolution on slower machines.

### Rust Tests

Rust tests live alongside the source code using `#[cfg(test)]` modules. They use the `tempfile` crate for filesystem isolation — each test gets a unique temporary file that is cleaned up automatically.

---

## Related Docs

- [WALKTHROUGH.md](./WALKTHROUGH.md) — Detailed record of what was implemented, files created/modified, and technical decisions.
- [DEPENDENCY_UPDATE_GUIDE.md](./DEPENDENCY_UPDATE_GUIDE.md) — Step-by-step guide for safely updating dependencies.
