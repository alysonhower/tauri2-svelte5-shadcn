import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Smoke tests: Lucide Icons (@lucide/svelte)
// Protects against: package rename/restructure (lucide-svelte → @lucide/svelte),
// icon removal, or export format breaking changes.
//
// We import individual icons (not the barrel) to avoid the massive overhead
// of resolving all ~1500 icons in the test environment.
// Individual icon modules export the component as `default`.
// ---------------------------------------------------------------------------

describe('@lucide/svelte — smoke / regression', () => {
	it('exports Search icon', async () => {
		const mod = await import('@lucide/svelte/icons/search');
		expect(mod.default).toBeDefined();
		expect(typeof mod.default === 'function' || typeof mod.default === 'object').toBe(true);
	});

	it('exports Settings icon', async () => {
		const mod = await import('@lucide/svelte/icons/settings');
		expect(mod.default).toBeDefined();
	});

	it('exports ChevronDown icon', async () => {
		const mod = await import('@lucide/svelte/icons/chevron-down');
		expect(mod.default).toBeDefined();
	});

	it('exports X icon', async () => {
		const mod = await import('@lucide/svelte/icons/x');
		expect(mod.default).toBeDefined();
	});

	it('exports Menu icon', async () => {
		const mod = await import('@lucide/svelte/icons/menu');
		expect(mod.default).toBeDefined();
	});

	it('exports Sun icon', async () => {
		const mod = await import('@lucide/svelte/icons/sun');
		expect(mod.default).toBeDefined();
	});

	it('exports Moon icon', async () => {
		const mod = await import('@lucide/svelte/icons/moon');
		expect(mod.default).toBeDefined();
	});

	it('exports Check icon', async () => {
		const mod = await import('@lucide/svelte/icons/check');
		expect(mod.default).toBeDefined();
	});

	it('exports Plus icon', async () => {
		const mod = await import('@lucide/svelte/icons/plus');
		expect(mod.default).toBeDefined();
	});

	it('exports Trash2 icon', async () => {
		const mod = await import('@lucide/svelte/icons/trash-2');
		expect(mod.default).toBeDefined();
	});
});
