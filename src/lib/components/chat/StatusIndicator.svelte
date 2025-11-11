<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from 'lucide-svelte';

	function handleRefresh() {
		chatState.checkOllamaStatus();
	}
</script>

<div class="flex items-center gap-2">
	<div class="flex items-center gap-2">
		<div
			class="h-2 w-2 rounded-full {chatState.ollamaConnected
				? 'bg-green-500'
				: 'bg-red-500'}"
		></div>
		<span class="text-sm text-muted-foreground">
			{chatState.ollamaConnected ? 'Connected' : 'Disconnected'}
		</span>
	</div>
	<Button size="icon" variant="ghost" onclick={handleRefresh} class="h-6 w-6">
		<RefreshCw class="h-3 w-3" />
	</Button>
</div>
