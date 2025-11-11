<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus, MessageSquare, Trash2 } from 'lucide-svelte';

	function handleNewChat() {
		chatState.createNewChat();
	}

	function handleSelectChat(chatId: string) {
		chatState.selectChat(chatId);
	}

	function handleDeleteChat(event: Event, chatId: string) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this chat?')) {
			chatState.deleteChat(chatId);
		}
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;

		return date.toLocaleDateString();
	}
</script>

<aside class="flex h-full w-64 flex-col border-r border-border bg-background">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-border p-4">
		<h2 class="text-lg font-semibold">Chats</h2>
		<Button size="icon" variant="ghost" onclick={handleNewChat}>
			<Plus class="h-5 w-5" />
		</Button>
	</div>

	<!-- Chat List -->
	<div class="flex-1 overflow-y-auto p-2">
		{#if chatState.chats.length === 0}
			<div class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
				<MessageSquare class="mb-2 h-12 w-12 opacity-50" />
				<p class="text-sm">No chats yet</p>
				<p class="mt-1 text-xs">Click + to start</p>
			</div>
		{:else}
			<div class="space-y-1">
				{#each chatState.chats as chat (chat.id)}
					<button
						class="group relative w-full rounded-lg p-3 text-left transition-colors hover:bg-accent
							{chatState.activeChat?.id === chat.id ? 'bg-accent' : ''}"
						onclick={() => handleSelectChat(chat.id)}
					>
						<div class="flex items-start justify-between">
							<div class="flex-1 overflow-hidden pr-2">
								<h3 class="truncate text-sm font-medium">{chat.title}</h3>
								<p class="mt-1 text-xs text-muted-foreground">
									{chat.messages.length} messages • {formatDate(chat.timestamp)}
								</p>
							</div>
							<Button
								size="icon"
								variant="ghost"
								class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
								onclick={(e) => handleDeleteChat(e, chat.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Context Toggle -->
	<div class="border-t border-border p-4">
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				bind:checked={chatState.contextEnabled}
				class="h-4 w-4 rounded border-gray-300"
			/>
			<span class="text-sm">Remember conversation</span>
		</label>
	</div>
</aside>
