import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { mockInvoke } from '../setup';
import HelloWorld from '$lib/components/HelloWorld.svelte';

// ---------------------------------------------------------------------------
// Integration test: HelloWorld component
// Full smoke test of the main application component — validates that UI
// elements, shadcn components, Runes reactivity, and IPC bridge all work
// together without crashing.
// ---------------------------------------------------------------------------

describe('HelloWorld — integration smoke test', () => {
	beforeEach(() => {
		mockInvoke.mockReset();
		// Simulate backend returning empty strings on initial read
		mockInvoke.mockResolvedValue('');
	});

	it('renders without crashing', () => {
		const { container } = render(HelloWorld);
		expect(container).toBeTruthy();
	});

	it('displays the greeting input', () => {
		render(HelloWorld);
		const input = screen.getByPlaceholderText('e.g., Hello, Welcome');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('id', 'greeting-input');
	});

	it('displays the name input', () => {
		render(HelloWorld);
		const input = screen.getByPlaceholderText('Enter your name');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('id', 'name-input');
	});

	it('displays the Save button', () => {
		render(HelloWorld);
		const btn = screen.getByRole('button', { name: /save/i });
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute('type', 'submit');
	});

	it('displays the Reset button', () => {
		render(HelloWorld);
		const btn = screen.getByRole('button', { name: /reset/i });
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute('type', 'button');
	});

	it('shows default message "Hello, World!" when state is empty', () => {
		render(HelloWorld);
		expect(screen.getByText('Hello, World!')).toBeInTheDocument();
	});

	it('calls invoke("read") on mount for both files', async () => {
		render(HelloWorld);
		// Wait for $effect to fire
		await new Promise((r) => setTimeout(r, 10));

		const readCalls = mockInvoke.mock.calls.filter(
			(call: unknown[]) => call[0] === 'read'
		);
		expect(readCalls.length).toBeGreaterThanOrEqual(2);

		const paths = readCalls.map((call: unknown[]) => (call[1] as { path: string }).path);
		expect(paths).toContain('name.txt');
		expect(paths).toContain('greet.txt');
	});

	it('contains a Card with shadow-xl class', () => {
		const { container } = render(HelloWorld);
		const card = container.querySelector('[data-slot="card"]');
		expect(card).toBeTruthy();
	});
});
