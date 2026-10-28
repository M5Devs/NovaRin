export type ProviderType = 'openai' | 'google' | 'groq' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

export interface Settings {
  openaiApiKey: string;
  openaiBaseUrl: string; // Enables OpenRouter, DeepSeek, etc.
  googleApiKey: string;
  groqApiKey: string;
  enableLocal: boolean;
  localEndpoint: string;
  selectedModel: string;
  systemPrompt: string;
  temperature: number;
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
