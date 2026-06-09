import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockInvoke } from '../../setup';
import { GlobalState, FILES } from '$lib/commands.svelte';

// ---------------------------------------------------------------------------
// Tests: GlobalState (Svelte 5 Runes + IPC bridge)
// Protects against: $state() runtime API changes, invoke() contract drift,
// argument mismatch between front and back.
// ---------------------------------------------------------------------------

describe('GlobalState — runes & IPC contract', () => {
	beforeEach(() => {
		mockInvoke.mockReset();
		mockInvoke.mockResolvedValue('');
	});

	it('initialises with empty name and greet', () => {
		const gs = new GlobalState();
		expect(gs.name).toBe('');
		expect(gs.greet).toBe('');
	});

	it('setters update the reactive state', () => {
		const gs = new GlobalState();
		gs.name = 'Alice';
		gs.greet = 'Howdy';
		expect(gs.name).toBe('Alice');
		expect(gs.greet).toBe('Howdy');
	});

	it('nlen and glen derive correctly from name/greet', () => {
		const gs = new GlobalState();
		gs.name = 'Bob';
		gs.greet = 'Hi';
		expect(gs.nlen).toBe(3);
		expect(gs.glen).toBe(2);
	});

	it('reset() clears both name and greet', () => {
		const gs = new GlobalState();
		gs.name = 'Alice';
		gs.greet = 'Hello';
		gs.reset();
		expect(gs.name).toBe('');
		expect(gs.greet).toBe('');
	});

	describe('read() — IPC contract', () => {
		it('calls invoke("read") with the correct path for NAME_FILE', async () => {
			mockInvoke.mockResolvedValueOnce('Alice');
			const gs = new GlobalState();
			await gs.read(FILES.NAME_FILE);
			expect(mockInvoke).toHaveBeenCalledWith('read', { path: 'name.txt' });
			expect(gs.name).toBe('Alice');
		});

		it('calls invoke("read") with the correct path for GREET_FILE', async () => {
			mockInvoke.mockResolvedValueOnce('Hello');
			const gs = new GlobalState();
			await gs.read(FILES.GREET_FILE);
			expect(mockInvoke).toHaveBeenCalledWith('read', { path: 'greet.txt' });
			expect(gs.greet).toBe('Hello');
		});
	});

	describe('write() — IPC contract', () => {
		it('calls invoke("write") with path and contents for NAME_FILE', async () => {
			mockInvoke.mockResolvedValueOnce(undefined);
			const gs = new GlobalState();
			await gs.write(FILES.NAME_FILE, 'Bob');
			expect(mockInvoke).toHaveBeenCalledWith('write', { path: 'name.txt', contents: 'Bob' });
			expect(gs.name).toBe('Bob');
		});

		it('calls invoke("write") with path and contents for GREET_FILE', async () => {
			mockInvoke.mockResolvedValueOnce(undefined);
			const gs = new GlobalState();
			await gs.write(FILES.GREET_FILE, 'Welcome');
			expect(mockInvoke).toHaveBeenCalledWith('write', { path: 'greet.txt', contents: 'Welcome' });
			expect(gs.greet).toBe('Welcome');
		});
	});

	describe('FILES enum — contract values', () => {
		it('GREET_FILE is "greet.txt"', () => {
			expect(FILES.GREET_FILE).toBe('greet.txt');
		});

		it('NAME_FILE is "name.txt"', () => {
			expect(FILES.NAME_FILE).toBe('name.txt');
		});
	});
});
