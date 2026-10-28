import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles, Trash2, SlidersHorizontal } from 'lucide-react';
import { ModelSelectorPopover } from './ModelSelectorPopover';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenSettings: () => void;
  systemPrompt?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  selectedModel,
  onSelectModel,
  onOpenSettings,
  systemPrompt,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent backdrop-blur-sm pointer-events-none">
      <div className="max-w-3xl mx-auto space-y-2 pointer-events-auto">
        {/* Floating Capsule Input Card */}
        <div className="relative flex flex-col bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-200">

          {/* Top Control Bar inside Input Card */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1 border-b border-zinc-800/40">
            <div className="flex items-center gap-2">
              {/* Quick Model Selector Popover */}
              <ModelSelectorPopover
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                onOpenSettings={onOpenSettings}
              />

              {/* Active System Persona Pill */}
              {systemPrompt && (
                <button
                  onClick={onOpenSettings}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-800 transition truncate max-w-[200px]"
                  title={`Active Persona: ${systemPrompt}`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{systemPrompt}</span>
                </button>
              )}
            </div>

            {/* Clear Input Button */}
            {input.length > 0 && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Text Area Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NovaRin anything... (Shift+Enter for new line)"
            rows={1}
            className="w-full px-4 pt-3 pb-3 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none resize-none max-h-[220px] leading-relaxed font-sans"
          />

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Direct Streaming
              </span>
            </div>

            {/* Circular Dynamic Send / Stop Button */}
            <div>
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center justify-center transition shadow-md shadow-rose-500/10 animate-pulse"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSubmit()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-30 disabled:hover:from-cyan-500 disabled:hover:to-cyan-400 text-zinc-950 flex items-center justify-center transition-all duration-200 shadow-md shadow-cyan-500/20 cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-4 h-4 stroke-[2.5] translate-x-[0.5px]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-[10px] text-center text-zinc-600 font-sans">
          NovaRin runs client-side with Local IndexedDB storage.
        </div>
      </div>
    </div>
  );
};
