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
      if (!overrideContent) {
        setInput('');
      }

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

  // Regenerate Response: Delete last assistant response (and optionally last user message or resend)
  const regenerateResponse = useCallback(async () => {
    if (!activeSessionId || isLoading || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant') {
      await db.messages.delete(lastMsg.id);
    }

    // Now re-trigger AI stream with history up to last user message
    setError(null);
    setIsLoading(true);
    setStreamingContent('');

    const history = await db.messages.where('chatId').equals(activeSessionId).sortBy('createdAt');
    if (history.length === 0) {
      setIsLoading(false);
      return;
    }

    const coreMessages = history.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));

    if (settings.systemPrompt) {
      coreMessages.unshift({
        role: 'system',
        content: settings.systemPrompt
      });
    }

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

      if (fullText) {
        const assistantMsgId = `msg_${Date.now()}_assistant`;
        await db.messages.add({
          id: assistantMsgId,
          chatId: activeSessionId,
          role: 'assistant',
          content: fullText,
          createdAt: Date.now(),
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error during regenerate:', err);
        setError(err.message || 'An error occurred while regenerating response.');
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [activeSessionId, isLoading, messages, settings]);

  // Edit prompt and resend
  const editUserMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!activeSessionId || isLoading) return;

      // Find the index of the message to edit
      const targetIndex = messages.findIndex(m => m.id === messageId);
      if (targetIndex === -1) return;

      // Delete the message and all subsequent messages in Dexie
      const msgsToDelete = messages.slice(targetIndex);
      for (const msg of msgsToDelete) {
        await db.messages.delete(msg.id);
      }

      // Send the edited content as new user message
      await sendMessage(newContent);
    },
    [activeSessionId, isLoading, messages, sendMessage]
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
    regenerateResponse,
    editUserMessage,
  };
}
