<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import type { ModelType } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown } from 'lucide-svelte';

	let isOpen = $state(false);

	const models: { value: ModelType; label: string; description: string }[] = [
		{
			value: 'qwen2.5-coder:7b',
			label: 'Qwen 2.5 Coder',
			description: 'Detailed explanations (7B)'
		},
		{
			value: 'deepseek-coder:6.7b',
			label: 'DeepSeek Coder',
			description: 'Faster responses (6.7B)'
		}
	];

	function handleSelect(model: ModelType) {
		chatState.selectedModel = model;
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	const selectedModelInfo = $derived(
		models.find((m) => m.value === chatState.selectedModel) || models[0]
	);
</script>

<div class="relative">
	<Button variant="outline" onclick={toggleDropdown} class="w-full justify-between">
		<div class="flex flex-col items-start text-left">
			<span class="text-sm font-medium">{selectedModelInfo.label}</span>
			<span class="text-xs text-muted-foreground">{selectedModelInfo.description}</span>
		</div>
		<ChevronDown class="ml-2 h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}" />
	</Button>

	{#if isOpen}
		<div
			class="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-background shadow-lg"
		>
			{#each models as model}
				<button
					class="flex w-full flex-col items-start p-3 text-left transition-colors hover:bg-accent
						{chatState.selectedModel === model.value ? 'bg-accent' : ''}"
					onclick={() => handleSelect(model.value)}
				>
					<span class="text-sm font-medium">{model.label}</span>
					<span class="text-xs text-muted-foreground">{model.description}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
