import React, { useRef, useEffect } from 'react';
import { Send, Square, Cpu, Settings as SettingsIcon } from 'lucide-react';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
  selectedModel: string;
  onOpenSettings: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  selectedModel,
  onOpenSettings,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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
    <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Input Card Container */}
        <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl focus-within:border-cyan-500/50 transition">
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
            className="w-full px-4 pt-3.5 pb-2 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-[200px] leading-relaxed"
          />

          {/* Bottom Bar inside Input Card */}
          <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-800/40">
            {/* Active Model Badge */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition text-xs font-mono"
              title="Click to change model in Settings"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[180px]">{selectedModel}</span>
              <SettingsIcon className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSubmit()}
                  disabled={!input.trim()}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 rounded-xl transition shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-[11px] text-center text-slate-600">
          NovaRin runs directly in your browser with Local IndexedDB storage & direct provider endpoints.
        </div>
      </div>
    </div>
  );
};
