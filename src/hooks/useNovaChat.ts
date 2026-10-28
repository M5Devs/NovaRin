import { useState, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { streamText } from 'ai';
import { db } from '../lib/db';
import { getLanguageModel } from '../lib/ai';
import { pluginManager } from '../plugins/manager';
import type { ChatMessage, Settings } from '../types';

export function useNovaChat(activeSessionId: string | null, settings: Settings) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Live query from Dexie for messages in active session
  const messages = useLiveQuery(
    () => (activeSessionId ? db.messages.where('chatId').equals(activeSessionId).sortBy('createdAt') : []),
    [activeSessionId]
  ) || [];

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (overrideContent?: string) => {
      const textToSend = overrideContent || input;
      if (!textToSend.trim() || !activeSessionId || isLoading) return;

      setError(null);
      setInput('');

      // Run plugin hooks
      const processedUserText = await pluginManager.processBeforeSend(
        textToSend,
        settings.activePluginIds || []
      );

      // Save user message to Dexie
      const userMessageId = `msg_${Date.now()}_user`;
      const userMsg: ChatMessage = {
        id: userMessageId,
        chatId: activeSessionId,
        role: 'user',
        content: processedUserText,
        createdAt: Date.now(),
      };
      await db.messages.add(userMsg);

      // Update session title if first message
      const existingMsgCount = await db.messages.where('chatId').equals(activeSessionId).count();
      if (existingMsgCount <= 1) {
        const titleSnippet = processedUserText.slice(0, 30) + (processedUserText.length > 30 ? '...' : '');
        await db.sessions.update(activeSessionId, { title: titleSnippet, updatedAt: Date.now() });
      } else {
        await db.sessions.update(activeSessionId, { updatedAt: Date.now() });
      }

      // Fetch history for AI prompt context
      const history = await db.messages.where('chatId').equals(activeSessionId).sortBy('createdAt');
      const coreMessages = history.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      // Prepend system prompt if present
      if (settings.systemPrompt) {
        coreMessages.unshift({
          role: 'system',
          content: settings.systemPrompt
        });
      }

      setIsLoading(true);
      setStreamingContent('');

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { model } = getLanguageModel(settings);

        const result = streamText({
          model,
          messages: coreMessages,
          abortSignal: controller.signal,
        });

        let fullText = '';
        for await (const chunk of result.textStream) {
          fullText += chunk;
          setStreamingContent(fullText);
        }

        // Stream completed successfully, store assistant message
        if (fullText) {
          const assistantMsgId = `msg_${Date.now()}_assistant`;
          const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            chatId: activeSessionId,
            role: 'assistant',
            content: fullText,
            createdAt: Date.now(),
          };
          await db.messages.add(assistantMsg);

          // Process plugin post-receive
          pluginManager.processMessageReceived(fullText, settings.activePluginIds || []);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User canceled stream - save whatever was accumulated so far
          if (streamingContent) {
            const assistantMsgId = `msg_${Date.now()}_assistant_stopped`;
            await db.messages.add({
              id: assistantMsgId,
              chatId: activeSessionId,
              role: 'assistant',
              content: streamingContent + ' [Stopped]',
              createdAt: Date.now(),
            });
          }
        } else {
          console.error('Error during AI stream:', err);
          setError(err.message || 'An error occurred while generating response.');
        }
      } finally {
        setIsLoading(false);
        setStreamingContent('');
        abortControllerRef.current = null;
      }
    },
    [input, activeSessionId, isLoading, settings, streamingContent]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    streamingContent,
    error,
    sendMessage,
    stop,
  };
}
