import type { ProviderType } from '../types';

export function detectProviderFromKey(key: string): ProviderType {
  const trimmed = key.trim();
  if (trimmed.startsWith('gsk_')) {
    return 'groq';
  }
  if (trimmed.startsWith('AIzaSy')) {
    return 'google';
  }
  if (trimmed.startsWith('sk-or-')) {
    return 'openai'; // OpenRouter uses OpenAI compatible protocol
  }
  if (trimmed.startsWith('sk-')) {
    return 'openai';
  }
  return 'openai';
}
