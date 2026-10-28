import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Sparkles, Zap, Brain } from 'lucide-react';
import { DEFAULT_MODELS } from '../lib/storage';

interface ModelSelectorPopoverProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const ModelSelectorPopover: React.FC<ModelSelectorPopoverProps> = ({
  selectedModel,
  onSelectModel,
  onOpenSettings,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModelObj = DEFAULT_MODELS.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    provider: selectedModel.includes('gemini') ? 'google' : 'openai',
    description: 'Custom model ID'
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'google':
        return { label: 'Gemini', icon: Sparkles, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 'custom':
        return { label: 'Groq / Custom', icon: Zap, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      case 'openai':
      default:
        return { label: 'OpenAI', icon: Brain, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };
    }
  };

  const activeBadge = getProviderBadge(currentModelObj.provider);
  const ProviderIcon = activeBadge.icon;

  const googleModels = DEFAULT_MODELS.filter(m => m.provider === 'google');
  const openaiModels = DEFAULT_MODELS.filter(m => m.provider === 'openai');
  const customModels = DEFAULT_MODELS.filter(m => m.provider === 'custom');

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 border border-zinc-800/80 hover:border-zinc-700/80 text-xs font-medium backdrop-blur-md transition-all duration-200 shadow-sm"
      >
        <ProviderIcon className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-mono text-zinc-200 max-w-[150px] truncate">{currentModelObj.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl z-50 p-2 text-xs divide-y divide-zinc-800/60 animate-in fade-in zoom-in-95 duration-150">
          {/* OpenAI Section */}
          <div className="py-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Brain className="w-3 h-3 text-cyan-400" /> OpenAI Models
            </div>
            {openaiModels.map(m => {
              const isSelected = m.id === selectedModel;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                    isSelected ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs">{m.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{m.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Google Gemini Section */}
          <div className="py-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> Google AI Studio
            </div>
            {googleModels.map(m => {
              const isSelected = m.id === selectedModel;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                    isSelected ? 'bg-amber-500/10 text-amber-400 font-medium' : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs">{m.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{m.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Groq / Custom Section */}
          <div className="py-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400" /> Groq & Custom Endpoints
            </div>
            {customModels.map(m => {
              const isSelected = m.id === selectedModel;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                    isSelected ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs">{m.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{m.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {onOpenSettings && (
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-center px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 text-[11px] font-medium transition"
              >
                + Configure API Keys & Custom Models
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
