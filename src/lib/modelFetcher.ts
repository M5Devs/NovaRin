import type { ModelOption, ProviderType } from '../types';

const CACHE_KEY = 'novarin_cached_models_v1';

export async function fetchModelsForProvider(
  provider: ProviderType,
  apiKey: string,
  baseUrl?: string
): Promise<ModelOption[]> {
  if (!apiKey && provider !== 'custom') return [];

  try {
    let fetchedModels: ModelOption[] = [];

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          fetchedModels = data.data.map((m: any) => ({
            id: m.id,
            name: m.id,
            provider: 'groq' as ProviderType,
            description: `Groq LPU Model (${m.owned_by || 'Groq'})`
          }));
        }
      }
    } else if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          fetchedModels = data.models.map((m: any) => {
            const cleanId = m.name.replace(/^models\//, '');
            return {
              id: cleanId,
              name: m.displayName || cleanId,
              provider: 'google' as ProviderType,
              description: m.description ? m.description.slice(0, 60) + '...' : 'Google AI Studio Multimodal Model'
            };
          });
        }
      }
    } else if (provider === 'openai') {
      const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, '')}/models` : 'https://api.openai.com/v1/models';
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          fetchedModels = data.data.slice(0, 30).map((m: any) => ({
            id: m.id,
            name: m.id,
            provider: 'openai' as ProviderType,
            description: 'OpenAI API Model'
          }));
        }
      }
    }

    if (fetchedModels.length > 0) {
      cacheModels(fetchedModels);
    }
    return fetchedModels;
  } catch (err) {
    console.error(`Failed to fetch models for ${provider}:`, err);
    return [];
  }
}

export function cacheModels(models: ModelOption[]): void {
  try {
    const existing = loadCachedModels();
    const map = new Map<string, ModelOption>();
    existing.forEach(m => map.set(m.id, m));
    models.forEach(m => map.set(m.id, m));
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.values())));
  } catch (err) {
    console.error('Failed to cache models:', err);
  }
}

export function loadCachedModels(): ModelOption[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load cached models:', err);
    return [];
  }
}
