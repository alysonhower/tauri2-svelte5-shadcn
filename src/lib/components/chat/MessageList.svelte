<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import type { Message } from '$lib/types';
	import { afterUpdate } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	let messagesContainer: HTMLDivElement;

	// Auto-scroll to bottom on new messages
	afterUpdate(() => {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Parse markdown-style code blocks for better display
	function parseContent(content: string): { type: 'text' | 'code'; content: string; language?: string }[] {
		const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
		const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
		let lastIndex = 0;
		let match;

		while ((match = codeBlockRegex.exec(content)) !== null) {
			// Add text before code block
			if (match.index > lastIndex) {
				const textContent = content.slice(lastIndex, match.index);
				if (textContent.trim()) {
					parts.push({ type: 'text', content: textContent });
				}
			}

			// Add code block
			parts.push({
				type: 'code',
				content: match[2].trim(),
				language: match[1] || 'plaintext'
			});

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < content.length) {
			const remaining = content.slice(lastIndex);
			if (remaining.trim()) {
				parts.push({ type: 'text', content: remaining });
			}
		}

		// If no code blocks found, return as text
		if (parts.length === 0 && content.trim()) {
			parts.push({ type: 'text', content });
		}

		return parts;
	}
</script>

<div class="flex h-full flex-col">
	<!-- Messages Container -->
	<div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-4">
		{#if !chatState.activeChat || chatState.activeChat.messages.length === 0}
			<div class="flex h-full items-center justify-center">
				<div class="text-center text-muted-foreground">
					<h3 class="text-lg font-medium">Start a conversation</h3>
					<p class="mt-2 text-sm">
						Ask me anything about coding! I'm here to help you learn.
					</p>
					<div class="mt-6 space-y-2">
						<button
							class="w-full rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
							onclick={() => chatState.sendMessage('How do I create a function in JavaScript?')}
						>
							How do I create a function in JavaScript?
						</button>
						<button
							class="w-full rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
							onclick={() => chatState.sendMessage('Explain what a loop is in programming')}
						>
							Explain what a loop is in programming
						</button>
						<button
							class="w-full rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
							onclick={() => chatState.sendMessage('Help me debug my Python code')}
						>
							Help me debug my Python code
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				{#each chatState.activeChat.messages as message (message.id)}
					<div
						class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
					>
						<div
							class="max-w-[80%] rounded-lg px-4 py-3 {message.role === 'user'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted'}"
						>
							{#if message.isStreaming}
								<div class="flex items-center gap-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									<span class="text-sm">Thinking...</span>
								</div>
							{/if}

							{#if message.content}
								{@const parts = parseContent(message.content)}
								{#each parts as part}
									{#if part.type === 'text'}
										<div class="whitespace-pre-wrap text-sm">
											{part.content}
										</div>
									{:else if part.type === 'code'}
										<div class="my-2">
											<div class="mb-1 flex items-center justify-between rounded-t-md bg-background px-3 py-1 text-xs text-muted-foreground">
												<span>{part.language}</span>
											</div>
											<pre class="overflow-x-auto rounded-b-md bg-background p-3 text-xs"><code>{part.content}</code></pre>
										</div>
									{/if}
								{/each}
							{/if}

							<div class="mt-2 text-xs opacity-70">
								{formatTime(message.timestamp)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
