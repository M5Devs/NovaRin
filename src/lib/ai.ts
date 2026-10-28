import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { Settings } from '../types';
import { DEFAULT_MODELS } from './storage';

export function getLanguageModel(settings: Settings, modelOverride?: string): { model: LanguageModel; modelId: string } {
  const modelId = modelOverride || settings.selectedModel || 'gpt-4o-mini';
  const matchedPreset = DEFAULT_MODELS.find(m => m.id === modelId);

  // Check provider type explicitly
  const isGoogle = matchedPreset?.provider === 'google' || modelId.startsWith('gemini');
  const isGroq = matchedPreset?.provider === 'groq' || modelId.includes('llama') || modelId.includes('mixtral') || modelId.includes('qwen') || modelId.includes('gemma');

  if (isGoogle) {
    if (!settings.googleApiKey) {
      throw new Error('Google Gemini API Key is missing. Please set it in Settings -> Providers.');
    }
    const google = createGoogleGenerativeAI({
      apiKey: settings.googleApiKey,
    });
    return {
      model: google(modelId),
      modelId
    };
  } else if (isGroq) {
    const groqKey = settings.groqApiKey || settings.openaiApiKey;
    if (!groqKey) {
      throw new Error('Groq API Key is missing. Please set it in Settings -> Providers -> Groq.');
    }
    const groqOpenAI = createOpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    return {
      model: groqOpenAI(modelId),
      modelId
    };
  } else if (settings.enableLocal && settings.localEndpoint) {
    const localOpenAI = createOpenAI({
      apiKey: 'local',
      baseURL: settings.localEndpoint.trim(),
    });
    return {
      model: localOpenAI(modelId),
      modelId
    };
  } else {
    // Standard OpenAI or Custom OpenAI-compatible provider
    if (!settings.openaiApiKey && !settings.openaiBaseUrl) {
      throw new Error('OpenAI API Key or Custom Base URL is missing. Please set it in Settings -> Providers.');
    }

    const openai = createOpenAI({
      apiKey: settings.openaiApiKey || 'lm-studio',
      baseURL: settings.openaiBaseUrl ? settings.openaiBaseUrl.trim() : undefined,
    });

    return {
      model: openai(modelId),
      modelId
    };
  }
}
