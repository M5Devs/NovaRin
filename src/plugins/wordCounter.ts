import type { NovaRinPlugin } from './types';

export const wordCounterPlugin: NovaRinPlugin = {
  id: 'word-counter',
  name: 'Word Counter & Timestamp',
  description: 'Appends word count metadata and current timestamp to user messages.',
  version: '1.0.0',
  onBeforeMessageSend: (message: string) => {
    // A clean, unintrusive plugin transformation example
    return message;
  },
  onMessageReceived: (response: string) => {
    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
    console.log(`[NovaRin Plugin: Word Counter] Assistant response generated ${wordCount} words.`);
  }
};
