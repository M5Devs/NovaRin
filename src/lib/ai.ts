import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { Settings } from '../types';
import { DEFAULT_MODELS } from './storage';

export function getLanguageModel(settings: Settings, modelOverride?: string): { model: LanguageModel; modelId: string } {
  const modelId = modelOverride || settings.selectedModel || 'gpt-4o-mini';
  const matchedPreset = DEFAULT_MODELS.find(m => m.id === modelId);

  // Determine provider: explicitly 'google' if gemini model prefix/preset, otherwise openai/custom
  const isGoogle = matchedPreset?.provider === 'google' || modelId.startsWith('gemini');

  if (isGoogle) {
    if (!settings.googleApiKey) {
      throw new Error('Google Gemini API Key is missing. Please set it in Settings.');
    }
    const google = createGoogleGenerativeAI({
      apiKey: settings.googleApiKey,
    });
    return {
      model: google(modelId),
      modelId
    };
  } else {
    // OpenAI or Custom OpenAI-compatible provider (Groq, OpenRouter, Ollama)
    if (!settings.openaiApiKey && !settings.openaiBaseUrl) {
      throw new Error('OpenAI / Custom API Key or Base URL is missing. Please set it in Settings.');
    }

    const openai = createOpenAI({
      apiKey: settings.openaiApiKey || 'lm-studio', // Fallback key for local endpoints like Ollama/LM Studio
      baseURL: settings.openaiBaseUrl ? settings.openaiBaseUrl.trim() : undefined,
    });

    return {
      model: openai(modelId),
      modelId
    };
  }
}
