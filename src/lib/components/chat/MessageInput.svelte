<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Send, Loader2 } from 'lucide-svelte';

	let inputValue = $state('');
	let textarea: HTMLTextAreaElement;

	async function handleSend() {
		const message = inputValue.trim();
		if (!message || chatState.isGenerating) return;

		inputValue = '';

		// Reset textarea height
		if (textarea) {
			textarea.style.height = 'auto';
		}

		await chatState.sendMessage(message);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function handleInput() {
		// Auto-resize textarea
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
		}
	}
</script>

<div class="border-t border-border bg-background p-4">
	<div class="flex gap-2">
		<div class="relative flex-1">
			<textarea
				bind:this={textarea}
				bind:value={inputValue}
				onkeydown={handleKeydown}
				oninput={handleInput}
				placeholder={chatState.isGenerating
					? 'Generating response...'
					: 'Ask me anything about coding...'}
				disabled={chatState.isGenerating}
				class="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
				rows="1"
				style="max-height: 200px;"
			></textarea>
		</div>
		<Button
			onclick={handleSend}
			disabled={!inputValue.trim() || chatState.isGenerating}
			size="icon"
			class="h-[50px] w-[50px] shrink-0"
		>
			{#if chatState.isGenerating}
				<Loader2 class="h-5 w-5 animate-spin" />
			{:else}
				<Send class="h-5 w-5" />
			{/if}
		</Button>
	</div>

	{#if chatState.statusMessage}
		<div class="mt-2 text-xs text-muted-foreground">
			{chatState.statusMessage}
		</div>
	{/if}
</div>
