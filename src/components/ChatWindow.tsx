import React, { useRef, useEffect, useMemo } from 'react';
import { Key, AlertCircle, Zap, Code, Brain, FileText, PenTool, Sparkles } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { InputArea } from './InputArea';
import { ModelSelectorPopover } from './ModelSelectorPopover';
import type { ChatSession, Settings, ChatMessage } from '../types';
import { useNovaChat } from '../hooks/useNovaChat';

interface ChatWindowProps {
  session: ChatSession | null;
  settings: Settings;
  onOpenSettings: () => void;
  onSelectModel: (modelId: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Code,
    title: 'Fast Code Review',
    description: 'Analyze code for bugs, performance bottlenecks, and best practices.',
    prompt: 'Please review the following code snippet for potential bugs, security issues, and performance optimizations:\n\n```ts\n\n```',
    color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-400/60',
  },
  {
    icon: Brain,
    title: 'Brainstorm Architecture',
    description: 'Design scalable system architectures and database schemas.',
    prompt: 'Help me design a high-level system architecture for ',
    color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30 hover:border-purple-400/60',
  },
  {
    icon: FileText,
    title: 'Summarize Document',
    description: 'Extract key takeaways, action items, and structured insights.',
    prompt: 'Summarize the core insights, key takeaways, and action items from the following text:\n\n',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-400/60',
  },
  {
    icon: PenTool,
    title: 'Creative Writing',
    description: 'Draft technical articles, documentation, or creative stories.',
    prompt: 'Write a compelling and concise overview explaining ',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30 hover:border-amber-400/60',
  },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  settings,
  onOpenSettings,
  onSelectModel,
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
    regenerateResponse,
    editUserMessage,
  } = useNovaChat(session?.id || null, settings);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const hasApiKeyConfigured = Boolean(
    settings.openaiApiKey || settings.googleApiKey || settings.openaiBaseUrl
  );

  const handleCardClick = (promptText: string) => {
    setInput(promptText);
  };

  const streamingMessage = useMemo<ChatMessage | null>(() => {
    if (!streamingContent || !session) return null;
    return {
      id: 'streaming_active',
      chatId: session.id,
      role: 'assistant',
      content: streamingContent,
      createdAt: Date.now(),
    };
  }, [streamingContent, session?.id]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-400">
        <Zap className="w-12 h-12 text-zinc-700 mb-3" />
        <h2 className="text-lg font-semibold text-zinc-200">No active conversation</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Select a chat session from the sidebar or click "New Chat" to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3 truncate pr-4">
          <h2 className="font-semibold text-zinc-200 text-sm truncate max-w-md">
            {session.title || 'New Conversation'}
          </h2>
          <ModelSelectorPopover
            selectedModel={settings.selectedModel}
            onSelectModel={onSelectModel}
            onOpenSettings={onOpenSettings}
          />
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
        {/* Hero Welcome Screen when empty */}
        {messages.length === 0 && !streamingContent && (
          <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-8 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Glowing Logo Icon */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-40 blur-xl group-hover:opacity-60 transition duration-500 animate-pulse-glow" />
              <div className="relative w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 shadow-2xl">
                <Zap className="w-10 h-10 fill-current animate-float text-cyan-400" />
              </div>
            </div>

            {/* Welcome Greeting & Active Model Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Model: <strong className="text-zinc-200">{settings.selectedModel}</strong></span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
                Where intelligence meets privacy.
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                NovaRin is your lightweight, client-side BYOK AI workspace. Select a prompt starter below or type your question.
              </p>
            </div>

            {/* Setup Warning Banner if keys missing */}
            {!hasApiKeyConfigured && (
              <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-left text-xs space-y-2.5 shadow-xl">
                <div className="font-semibold text-amber-400 flex items-center gap-2">
                  <Key className="w-4 h-4" /> Setup Required
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  To start chatting, enter your OpenAI API key, Google Gemini key, or set a Custom Base URL for Groq/Ollama in Settings.
                </p>
                <button
                  onClick={onOpenSettings}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 font-bold rounded-xl text-center transition shadow-lg shadow-cyan-500/20"
                >
                  Configure API Keys Now
                </button>
              </div>
            )}

            {/* 2x2 Quick Prompt Starters Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {QUICK_PROMPTS.map((starter, idx) => {
                const IconComponent = starter.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCardClick(starter.prompt)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${starter.color} border bg-zinc-900/60 hover:bg-zinc-800/80 transition-all duration-200 text-left group flex flex-col justify-between space-y-3 cursor-pointer shadow-md hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition">
                        Click to load →
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-zinc-100">
                        {starter.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {starter.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Saved Chat Messages */}
        {messages.map((m: ChatMessage) => (
          <MessageItem
            key={m.id}
            message={m}
            onRegenerate={regenerateResponse}
            onEdit={editUserMessage}
          />
        ))}

        {/* Live Streaming Message Bubble */}
        {streamingMessage && (
          <MessageItem
            message={streamingMessage}
            isStreaming={true}
          />
        )}

        {/* Error Notification */}
        {error && (
          <div className="max-w-3xl mx-auto my-4 px-4 py-3 rounded-2xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Modern Input Area */}
      <InputArea
        input={input}
        setInput={setInput}
        onSubmit={() => sendMessage()}
        isLoading={isLoading}
        onStop={stop}
        selectedModel={settings.selectedModel}
        onSelectModel={onSelectModel}
        onOpenSettings={onOpenSettings}
        systemPrompt={settings.systemPrompt}
      />
    </div>
  );
};
