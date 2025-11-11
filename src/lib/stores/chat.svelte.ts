import type { Chat, Message, ModelType } from '$lib/types';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

// ============================================================================
// Global Chat State with Svelte 5 Runes
// ============================================================================

class ChatState {
	chats = $state<Chat[]>([]);
	activeChat = $state<Chat | null>(null);
	contextEnabled = $state<boolean>(true);
	selectedModel = $state<ModelType>('qwen2.5-coder:7b');
	ollamaConnected = $state<boolean>(false);
	isGenerating = $state<boolean>(false);
	statusMessage = $state<string>('');

	// Current streaming message
	private streamingMessage = $state<Message | null>(null);

	// Event listeners
	private unlisteners: UnlistenFn[] = [];

	constructor() {
		// Load chats from localStorage on initialization
		this.loadFromStorage();

		// Setup streaming event listeners
		this.setupEventListeners();

		// Check Ollama status
		this.checkOllamaStatus();
	}

	// ========================================================================
	// Chat Management
	// ========================================================================

	createNewChat(title: string = 'New Chat'): Chat {
		const newChat: Chat = {
			id: crypto.randomUUID(),
			title,
			messages: [],
			timestamp: Date.now()
		};

		this.chats = [...this.chats, newChat];
		this.activeChat = newChat;
		this.saveToStorage();

		return newChat;
	}

	deleteChat(chatId: string): void {
		this.chats = this.chats.filter((c) => c.id !== chatId);

		if (this.activeChat?.id === chatId) {
			this.activeChat = this.chats[0] || null;
		}

		this.saveToStorage();
	}

	renameChat(chatId: string, newTitle: string): void {
		this.chats = this.chats.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c));

		if (this.activeChat?.id === chatId) {
			this.activeChat = { ...this.activeChat, title: newTitle };
		}

		this.saveToStorage();
	}

	selectChat(chatId: string): void {
		const chat = this.chats.find((c) => c.id === chatId);
		if (chat) {
			this.activeChat = chat;
		}
	}

	// ========================================================================
	// Message Management
	// ========================================================================

	addMessage(role: 'user' | 'assistant', content: string): Message {
		if (!this.activeChat) {
			this.createNewChat();
		}

		const message: Message = {
			id: crypto.randomUUID(),
			role,
			content,
			timestamp: Date.now(),
			isStreaming: role === 'assistant'
		};

		this.activeChat!.messages = [...this.activeChat!.messages, message];

		// Update the chat in the chats array
		this.chats = this.chats.map((c) =>
			c.id === this.activeChat!.id ? { ...this.activeChat! } : c
		);

		// Auto-generate title from first user message
		if (this.activeChat!.messages.length === 1 && role === 'user') {
			const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
			this.renameChat(this.activeChat!.id, title);
		}

		this.saveToStorage();

		return message;
	}

	getContextMessages(): Message[] {
		if (!this.contextEnabled || !this.activeChat) {
			return [];
		}

		// Return last 5 messages (or fewer if not available)
		const messages = this.activeChat.messages;
		return messages.slice(Math.max(0, messages.length - 5));
	}

	// ========================================================================
	// Streaming & Generation
	// ========================================================================

	async sendMessage(prompt: string): Promise<void> {
		if (!prompt.trim() || this.isGenerating) {
			return;
		}

		this.isGenerating = true;
		this.statusMessage = 'Generating response...';

		try {
			// Add user message
			this.addMessage('user', prompt);

			// Create placeholder for assistant message
			this.streamingMessage = this.addMessage('assistant', '');

			// Get context messages
			const context = this.getContextMessages()
				.filter((m) => m.id !== this.streamingMessage!.id)
				.map((m) => ({
					role: m.role,
					content: m.content
				}));

			// Invoke streaming command
			await invoke('generate_code_stream', {
				prompt,
				model: this.selectedModel,
				context: context.length > 0 ? context : null
			});
		} catch (error) {
			this.statusMessage = `Error: ${error}`;
			this.isGenerating = false;

			// Remove the streaming message if it failed
			if (this.streamingMessage && this.activeChat) {
				this.activeChat.messages = this.activeChat.messages.filter(
					(m) => m.id !== this.streamingMessage!.id
				);
				this.saveToStorage();
			}
		}
	}

	private setupEventListeners(): void {
		// Listen for streaming chunks
		listen<string>('gen_chunk', (event) => {
			if (this.streamingMessage && this.activeChat) {
				this.streamingMessage.content += event.payload;

				// Update the message in the active chat
				this.activeChat.messages = this.activeChat.messages.map((m) =>
					m.id === this.streamingMessage!.id ? { ...this.streamingMessage! } : m
				);

				// Update in chats array
				this.chats = this.chats.map((c) =>
					c.id === this.activeChat!.id ? { ...this.activeChat! } : c
				);
			}
		}).then((unlisten) => this.unlisteners.push(unlisten));

		// Listen for completion
		listen('gen_done', () => {
			if (this.streamingMessage) {
				this.streamingMessage.isStreaming = false;
				this.streamingMessage = null;
			}

			this.isGenerating = false;
			this.statusMessage = 'Response complete';
			this.saveToStorage();

			// Clear status after 2 seconds
			setTimeout(() => {
				this.statusMessage = '';
			}, 2000);
		}).then((unlisten) => this.unlisteners.push(unlisten));

		// Listen for errors
		listen<string>('gen_error', (event) => {
			this.statusMessage = `Error: ${event.payload}`;
			this.isGenerating = false;

			if (this.streamingMessage && this.activeChat) {
				this.activeChat.messages = this.activeChat.messages.filter(
					(m) => m.id !== this.streamingMessage!.id
				);
				this.streamingMessage = null;
				this.saveToStorage();
			}
		}).then((unlisten) => this.unlisteners.push(unlisten));
	}

	// ========================================================================
	// Ollama Status
	// ========================================================================

	async checkOllamaStatus(): Promise<void> {
		try {
			const connected = await invoke<boolean>('check_ollama');
			this.ollamaConnected = connected;
			this.statusMessage = connected ? 'Connected to Ollama' : 'Ollama not available';

			setTimeout(() => {
				if (this.statusMessage.includes('Ollama')) {
					this.statusMessage = '';
				}
			}, 3000);
		} catch (error) {
			this.ollamaConnected = false;
			this.statusMessage = 'Failed to check Ollama status';
		}
	}

	// ========================================================================
	// Persistence
	// ========================================================================

	private saveToStorage(): void {
		try {
			localStorage.setItem('codehelper_chats', JSON.stringify(this.chats));
			localStorage.setItem('codehelper_settings', JSON.stringify({
				selectedModel: this.selectedModel,
				contextEnabled: this.contextEnabled
			}));
		} catch (error) {
			console.error('Failed to save to storage:', error);
		}
	}

	private loadFromStorage(): void {
		try {
			const chatsData = localStorage.getItem('codehelper_chats');
			if (chatsData) {
				this.chats = JSON.parse(chatsData);
				this.activeChat = this.chats[0] || null;
			}

			const settingsData = localStorage.getItem('codehelper_settings');
			if (settingsData) {
				const settings = JSON.parse(settingsData);
				this.selectedModel = settings.selectedModel || 'qwen2.5-coder:7b';
				this.contextEnabled = settings.contextEnabled ?? true;
			}
		} catch (error) {
			console.error('Failed to load from storage:', error);
		}
	}

	// ========================================================================
	// Cleanup
	// ========================================================================

	destroy(): void {
		this.unlisteners.forEach((unlisten) => unlisten());
		this.unlisteners = [];
	}
}

// Export singleton instance
export const chatState = new ChatState();
