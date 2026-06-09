import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Card from '$lib/components/ui/card/card.svelte';
import Content from '$lib/components/ui/card/card-content.svelte';
import Header from '$lib/components/ui/card/card-header.svelte';
import Title from '$lib/components/ui/card/card-title.svelte';
import Footer from '$lib/components/ui/card/card-footer.svelte';
import Description from '$lib/components/ui/card/card-description.svelte';
import Action from '$lib/components/ui/card/card-action.svelte';

// Also test barrel exports
import * as CardExports from '$lib/components/ui/card/index';

// ---------------------------------------------------------------------------
// Smoke tests: Card family (shadcn-svelte)
// Protects against: shadcn-svelte major updates breaking sub-component APIs
// ---------------------------------------------------------------------------

describe('Card — smoke / regression', () => {
	it('Card renders with data-slot="card"', () => {
		const { container } = render(Card);
		const el = container.querySelector('[data-slot="card"]');
		expect(el).toBeTruthy();
	});

	it('CardContent renders with data-slot="card-content"', () => {
		const { container } = render(Content);
		const el = container.querySelector('[data-slot="card-content"]');
		expect(el).toBeTruthy();
	});

	it('CardHeader renders with data-slot="card-header"', () => {
		const { container } = render(Header);
		const el = container.querySelector('[data-slot="card-header"]');
		expect(el).toBeTruthy();
	});

	it('CardTitle renders with data-slot="card-title"', () => {
		const { container } = render(Title);
		const el = container.querySelector('[data-slot="card-title"]');
		expect(el).toBeTruthy();
	});

	it('CardFooter renders with data-slot="card-footer"', () => {
		const { container } = render(Footer);
		const el = container.querySelector('[data-slot="card-footer"]');
		expect(el).toBeTruthy();
	});

	it('CardDescription renders with data-slot="card-description"', () => {
		const { container } = render(Description);
		const el = container.querySelector('[data-slot="card-description"]');
		expect(el).toBeTruthy();
	});

	it('CardAction renders with data-slot="card-action"', () => {
		const { container } = render(Action);
		const el = container.querySelector('[data-slot="card-action"]');
		expect(el).toBeTruthy();
	});

	describe('barrel exports — index.ts re-exports all sub-components', () => {
		const expected = [
			'Root', 'Content', 'Description', 'Footer',
			'Header', 'Title', 'Action',
			'Card', 'CardContent', 'CardDescription',
			'CardFooter', 'CardHeader', 'CardTitle', 'CardAction'
		];

		for (const name of expected) {
			it(`exports "${name}"`, () => {
				expect((CardExports as Record<string, unknown>)[name]).toBeDefined();
			});
		}
	});
});
