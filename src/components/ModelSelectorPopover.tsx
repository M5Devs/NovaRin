import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Sparkles, Zap, Brain, Search, RefreshCw } from 'lucide-react';
import { DEFAULT_MODELS } from '../lib/storage';
import { loadCachedModels } from '../lib/modelFetcher';
import { getModelMetadata } from '../lib/modelCatalog';
import type { ModelOption } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
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

  const cachedModels = loadCachedModels();

  const allModels = useMemo(() => {
    const map = new Map<string, ModelOption>();
    DEFAULT_MODELS.forEach(m => map.set(m.id, m));
    cachedModels.forEach(m => map.set(m.id, m));
    return Array.from(map.values());
  }, [cachedModels]);

  const currentModelObj = allModels.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    provider: selectedModel.includes('gemini') ? 'google' : selectedModel.includes('llama') ? 'groq' : 'openai',
    description: 'Custom model ID'
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'google':
        return { label: 'Gemini ♊', icon: Sparkles, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 'groq':
        return { label: 'Groq ⚡', icon: Zap, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      case 'openai':
      default:
        return { label: 'OpenAI 🧠', icon: Brain, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };
    }
  };

  const activeBadge = getProviderBadge(currentModelObj.provider);
  const ProviderIcon = activeBadge.icon;

  const handleSyncModels = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const filteredModels = allModels.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const googleModels = filteredModels.filter(m => m.provider === 'google');
  const groqModels = filteredModels.filter(m => m.provider === 'groq');
  const openaiModels = filteredModels.filter(m => m.provider === 'openai' || m.provider === 'custom');

  const renderModelRow = (m: ModelOption) => {
    const isSelected = m.id === selectedModel;
    const meta = getModelMetadata(m.id);

    return (
      <button
        key={m.id}
        onClick={() => {
          onSelectModel(m.id);
          setIsOpen(false);
        }}
        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all duration-150 ${
          isSelected ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'hover:bg-zinc-800/80 text-zinc-300'
        }`}
      >
        <div className="truncate pr-2 space-y-0.5">
          <div className="text-xs font-semibold flex items-center gap-1.5 truncate">
            <span>{m.name}</span>
            {meta.contextLength && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                {meta.contextLength}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {meta.tags.map((tag, idx) => (
              <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-950 text-cyan-400/90 border border-zinc-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-200 border border-zinc-800/90 hover:border-zinc-700/80 text-xs font-medium backdrop-blur-md transition-all duration-200 shadow-sm"
      >
        <ProviderIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="font-mono text-zinc-200 max-w-[160px] truncate">{currentModelObj.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl z-50 p-2 text-xs divide-y divide-zinc-800/60 animate-in fade-in zoom-in-95 duration-150 max-h-[420px] flex flex-col">
          {/* Search Header Input with Sync Refresh button */}
          <div className="p-1 pb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500/60 transition"
              />
            </div>
            <button
              onClick={handleSyncModels}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-400 transition"
              title="Sync / Refresh cached models"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 py-1">
            {/* Groq Section */}
            {groqModels.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400 fill-current" /> Groq Cloud ⚡
                </div>
                {groqModels.map(renderModelRow)}
              </div>
            )}

            {/* Google Gemini Section */}
            {googleModels.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Google AI Studio ♊
                </div>
                {googleModels.map(renderModelRow)}
              </div>
            )}

            {/* OpenAI Section */}
            {openaiModels.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-cyan-400" /> OpenAI & Custom 🧠
                </div>
                {openaiModels.map(renderModelRow)}
              </div>
            )}
          </div>

          {onOpenSettings && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-center px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 text-[11px] font-medium transition"
              >
                + Configure API Keys & Custom Endpoints
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
