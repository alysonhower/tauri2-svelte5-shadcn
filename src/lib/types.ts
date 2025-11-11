// ============================================================================
// Core Types for CodeHelper
// ============================================================================

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	isStreaming?: boolean;
}

export interface Chat {
	id: string;
	title: string;
	messages: Message[];
	timestamp: number;
}

export type ModelType = 'qwen2.5-coder:7b' | 'deepseek-coder:6.7b';

export interface AppSettings {
	selectedModel: ModelType;
	contextEnabled: boolean;
	ollamaConnected: boolean;
}
