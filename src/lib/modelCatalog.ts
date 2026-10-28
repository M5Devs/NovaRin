export interface ModelMetadata {
  contextLength?: string;
  tags: string[];
}

export function getModelMetadata(modelId: string): ModelMetadata {
  const id = modelId.toLowerCase();

  if (id.includes('qwen')) {
    return {
      contextLength: '32k',
      tags: ['💻 Top Coder', '⚡ Fast']
    };
  }

  if (id.includes('gemini')) {
    const is2m = id.includes('1.5') || id.includes('2.0');
    return {
      contextLength: is2m ? '2M' : '1M',
      tags: ['👁️ Vision', '📚 Multimodal']
    };
  }

  if (id.includes('llama-3.3-70b') || id.includes('llama-3-70b')) {
    return {
      contextLength: '128k',
      tags: ['🧠 High Reasoning', '⚡ LPU Fast']
    };
  }

  if (id.includes('deepseek-r1') || id.includes('deepseek')) {
    return {
      contextLength: '64k',
      tags: ['🤔 Deep Thinker', '📐 Math & Logic']
    };
  }

  if (id.includes('mixtral')) {
    return {
      contextLength: '32k',
      tags: ['⚡ MoE Fast', '🧩 Open MoE']
    };
  }

  if (id.includes('gpt-4o')) {
    return {
      contextLength: '128k',
      tags: ['👁️ Vision', '🧠 Reasoning']
    };
  }

  if (id.includes('gpt-4')) {
    return {
      contextLength: '128k',
      tags: ['🧠 High Intelligence']
    };
  }

  return {
    contextLength: '128k',
    tags: ['⚡ Fast Inference']
  };
}
