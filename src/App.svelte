<script lang="ts">
	import { onMount } from 'svelte';
	import { chatState } from '$lib/stores/chat.svelte';
	import ChatList from '$lib/components/chat/ChatList.svelte';
	import MessageList from '$lib/components/chat/MessageList.svelte';
	import MessageInput from '$lib/components/chat/MessageInput.svelte';
	import ModelSelector from '$lib/components/chat/ModelSelector.svelte';
	import StatusIndicator from '$lib/components/chat/StatusIndicator.svelte';

	onMount(() => {
		// Initialize with a default chat if none exist
		if (chatState.chats.length === 0) {
			chatState.createNewChat('Welcome Chat');
		}

		// Cleanup on unmount
		return () => {
			chatState.destroy();
		};
	});
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-border bg-background px-6 py-4">
		<div>
			<h1 class="text-2xl font-bold">SmolPC Code Helper</h1>
			<p class="text-sm text-muted-foreground">AI-powered coding assistant for students</p>
		</div>
		<div class="flex items-center gap-4">
			<div class="w-64">
				<ModelSelector />
			</div>
			<StatusIndicator />
		</div>
	</header>

	<!-- Main Content -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar -->
		<ChatList />

		<!-- Chat Area -->
		<main class="flex flex-1 flex-col overflow-hidden">
			<MessageList />
			<MessageInput />
		</main>
	</div>
</div>
