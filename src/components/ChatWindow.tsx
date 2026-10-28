import React, { useRef, useEffect } from 'react';
import { Bot, Key, AlertCircle } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { InputArea } from './InputArea';
import type { ChatSession, Settings, ChatMessage } from '../types';
import { useNovaChat } from '../hooks/useNovaChat';

interface ChatWindowProps {
  session: ChatSession | null;
  settings: Settings;
  onOpenSettings: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  settings,
  onOpenSettings,
}) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    streamingContent,
    error,
    sendMessage,
    stop,
  } = useNovaChat(session?.id || null, settings);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const hasApiKeyConfigured = Boolean(
    settings.openaiApiKey || settings.googleApiKey || settings.openaiBaseUrl
  );

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-400">
        <Bot className="w-12 h-12 text-slate-700 mb-3" />
        <h2 className="text-lg font-semibold text-slate-200">No active conversation</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a chat session from the sidebar or click "New Chat" to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Session Bar */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-200 text-sm truncate max-w-md">
            {session.title || 'New Chat Session'}
          </h2>
          <p className="text-[11px] text-slate-500 font-mono">
            Model: {settings.selectedModel}
          </p>
        </div>

        {!hasApiKeyConfigured && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure API Keys</span>
          </button>
        )}
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingContent && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-200">
                Welcome to NovaRin
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A lightweight, modular, privacy-first BYOK AI client. All your messages and API keys stay local in your browser.
              </p>
            </div>

            {!hasApiKeyConfigured && (
              <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
                <div className="font-medium text-amber-400 flex items-center gap-2">
                  <Key className="w-4 h-4" /> Setup Required
                </div>
                <p className="text-slate-400">
                  Please open Settings to enter your OpenAI or Google Gemini API key (or set a Custom Base URL for Groq/Ollama/OpenRouter).
                </p>
                <button
                  onClick={onOpenSettings}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-center transition"
                >
                  Open Settings Modal
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((m: ChatMessage) => (
          <MessageItem key={m.id} message={m} />
        ))}

        {/* Live Streaming Message Bubble */}
        {streamingContent && (
          <MessageItem
            message={{
              id: 'streaming_active',
              chatId: session.id,
              role: 'assistant',
              content: streamingContent,
              createdAt: Date.now(),
            }}
          />
        )}

        {/* Error notification */}
        {error && (
          <div className="max-w-3xl mx-auto my-4 px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <InputArea
        input={input}
        setInput={setInput}
        onSubmit={() => sendMessage()}
        isLoading={isLoading}
        onStop={stop}
        selectedModel={settings.selectedModel}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};
