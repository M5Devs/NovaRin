import type { Settings, ModelOption } from '../types';

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Google Gemini 2.0 Flash',
    provider: 'google',
    description: 'Next-gen high speed multimodal model'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'google',
    description: 'Complex reasoning and multimodal tasks'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Groq Llama 3.3 70B',
    provider: 'groq',
    description: 'Ultra-fast inference on Groq LPU system'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Groq Mixtral 8x7B',
    provider: 'groq',
    description: 'High performance open mixture of experts'
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    description: 'Flagship high-intelligence model'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    description: 'Fast, lightweight and cost-effective model'
  }
];

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: '',
  openaiBaseUrl: '',
  googleApiKey: '',
  groqApiKey: '',
  enableLocal: false,
  localEndpoint: 'http://localhost:11434/v1',
  selectedModel: 'gpt-4o-mini',
  systemPrompt: 'You are NovaRin, a helpful, precise, and concise AI assistant.',
  temperature: 0.7,
  activePluginIds: ['word-counter']
};

const SETTINGS_KEY = 'novarin_settings_v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed
    };
  } catch (err) {
    console.error('Failed to load settings from LocalStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to LocalStorage:', err);
  }
}
