import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Input from '$lib/components/ui/input/input.svelte';

// ---------------------------------------------------------------------------
// Smoke tests: Input component (shadcn-svelte)
// Protects against: breaking changes in $bindable(), $props() destructuring,
// and conditional rendering for file vs text inputs.
// ---------------------------------------------------------------------------

describe('Input — smoke / regression', () => {
	it('renders a text input by default', () => {
		render(Input, { props: { placeholder: 'type here' } });
		const input = screen.getByPlaceholderText('type here');
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe('INPUT');
	});

	it('has data-slot="input"', () => {
		render(Input, { props: { placeholder: 'test' } });
		const input = screen.getByPlaceholderText('test');
		expect(input).toHaveAttribute('data-slot', 'input');
	});

	it('renders a file input when type="file"', () => {
		const { container } = render(Input, { props: { type: 'file' } });
		const input = container.querySelector('input[type="file"]');
		expect(input).toBeTruthy();
		expect(input).toHaveAttribute('data-slot', 'input');
	});

	it('applies custom className', () => {
		render(Input, { props: { class: 'my-custom-class', placeholder: 'cls' } });
		const input = screen.getByPlaceholderText('cls');
		expect(input.className).toContain('my-custom-class');
	});
});
