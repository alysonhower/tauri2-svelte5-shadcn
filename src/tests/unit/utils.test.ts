import { describe, it, expect } from 'vitest';
import { cn } from '$lib/utils';
import type {
	WithoutChild,
	WithoutChildren,
	WithoutChildrenOrChild,
	WithElementRef
} from '$lib/utils';

// ---------------------------------------------------------------------------
// Tests: Utility functions and types
// Protects against: clsx/tailwind-merge API changes, type export removals
// ---------------------------------------------------------------------------

describe('cn() — class name utility', () => {
	it('merges simple class names', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('handles conditional classes (falsy values)', () => {
		const isHidden = false;
		expect(cn('base', isHidden && 'hidden', undefined, null, 'active')).toBe('base active');
	});

	it('resolves Tailwind conflicts (last wins)', () => {
		const result = cn('px-4 py-2', 'px-8');
		expect(result).toContain('px-8');
		expect(result).not.toContain('px-4');
		expect(result).toContain('py-2');
	});

	it('returns empty string for no arguments', () => {
		expect(cn()).toBe('');
	});

	it('handles array inputs', () => {
		expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
	});
});

// Compile-time type checks — these just need to not produce TS errors
describe('Type exports — compile-time contract', () => {
	it('WithoutChild removes child prop', () => {
		type Input = { child: string; other: number };
		type Result = WithoutChild<Input>;
		// If this compiles, the type exists and works
		const _check: Result = { other: 42 };
		expect(_check.other).toBe(42);
	});

	it('WithoutChildren removes children prop', () => {
		type Input = { children: string; other: number };
		type Result = WithoutChildren<Input>;
		const _check: Result = { other: 42 };
		expect(_check.other).toBe(42);
	});

	it('WithoutChildrenOrChild removes both', () => {
		type Input = { child: string; children: string; other: number };
		type Result = WithoutChildrenOrChild<Input>;
		const _check: Result = { other: 42 };
		expect(_check.other).toBe(42);
	});

	it('WithElementRef adds ref prop', () => {
		type Input = { value: string };
		type Result = WithElementRef<Input, HTMLDivElement>;
		const _check: Result = { value: 'test', ref: null };
		expect(_check.ref).toBeNull();
	});
});
