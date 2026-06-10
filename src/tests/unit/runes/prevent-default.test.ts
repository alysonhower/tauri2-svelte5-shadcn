import { describe, it, expect, vi } from 'vitest';
import { preventDefault } from '$lib/commands.svelte';

// ---------------------------------------------------------------------------
// Tests: preventDefault helper
// Protects against: runtime API changes in Svelte event handling
// ---------------------------------------------------------------------------

describe('preventDefault — helper', () => {
	it('calls e.preventDefault() before invoking the wrapped function', () => {
		const innerFn = vi.fn();
		const wrapped = preventDefault(innerFn);

		const fakeEvent = {
			preventDefault: vi.fn()
		} as unknown as Event;

		wrapped(fakeEvent);

		expect(fakeEvent.preventDefault).toHaveBeenCalledOnce();
		expect(innerFn).toHaveBeenCalledOnce();
		expect(innerFn).toHaveBeenCalledWith(fakeEvent);
	});

	it('calls preventDefault before the inner function', () => {
		const callOrder: string[] = [];
		const innerFn = vi.fn(() => callOrder.push('inner'));
		const wrapped = preventDefault(innerFn);

		const fakeEvent = {
			preventDefault: vi.fn(() => callOrder.push('prevent'))
		} as unknown as Event;

		wrapped(fakeEvent);

		expect(callOrder).toEqual(['prevent', 'inner']);
	});
});
