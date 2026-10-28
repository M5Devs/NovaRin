export type ProviderType = 'openai' | 'google' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

export interface Settings {
  openaiApiKey: string;
  openaiBaseUrl: string; // Enables OpenRouter, Groq, Ollama, LM Studio, etc.
  googleApiKey: string;
  selectedModel: string;
  systemPrompt: string;
  activePluginIds: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}
