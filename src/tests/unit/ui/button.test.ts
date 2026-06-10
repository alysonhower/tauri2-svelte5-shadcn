import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';

// ---------------------------------------------------------------------------
// Smoke tests: Button component (shadcn-svelte)
// Protects against: shadcn-svelte major updates, tailwind-variants API changes,
// Svelte 5 $props()/$bindable() breaking changes.
// ---------------------------------------------------------------------------

describe('Button — smoke / regression', () => {
	it('renders as a <button> by default', () => {
		render(Button, { props: { children: undefined } });
		const btn = screen.getByRole('button');
		expect(btn).toBeInTheDocument();
		expect(btn.tagName).toBe('BUTTON');
	});

	it('renders as an <a> when href is provided', () => {
		render(Button, { props: { href: 'https://example.com', children: undefined } });
		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', 'https://example.com');
	});

	it('applies disabled correctly on anchor variant', () => {
		render(Button, { props: { href: 'https://example.com', disabled: true, children: undefined } });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('aria-disabled', 'true');
		expect(link).not.toHaveAttribute('href');
	});

	it('has data-slot="button"', () => {
		render(Button, { props: { children: undefined } });
		const btn = screen.getByRole('button');
		expect(btn).toHaveAttribute('data-slot', 'button');
	});

	describe('buttonVariants — all variant/size combos compile', () => {
		const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
		const sizes = ['default', 'sm', 'lg', 'icon'] as const;

		for (const variant of variants) {
			for (const size of sizes) {
				it(`variant="${variant}" size="${size}"`, () => {
					const cls = buttonVariants({ variant, size });
					expect(typeof cls).toBe('string');
					expect(cls.length).toBeGreaterThan(0);
				});
			}
		}
	});
});
