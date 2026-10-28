import React, { useState } from 'react';
import {
  X,
  Key,
  Cpu,
  Sparkles,
  Check,
  Plug,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Brain,
  Sliders,
  Database,
  Trash2,
  Download,
  Shield,
  Layers,
  Server,
  RefreshCw
} from 'lucide-react';
import type { Settings } from '../types';
import { DEFAULT_MODELS } from '../lib/storage';
import { pluginManager } from '../plugins/manager';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { detectProviderFromKey } from '../lib/providerSniffer';
import { fetchModelsForProvider } from '../lib/modelFetcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (newSettings: Settings) => void;
}

type TabType = 'providers' | 'models' | 'persona' | 'plugins' | 'storage';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [customModelInput, setCustomModelInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Show/Hide password states for keys
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  // Stats for Storage Tab
  const sessionsCount = useLiveQuery(() => db.sessions.count()) ?? 0;
  const messagesCount = useLiveQuery(() => db.messages.count()) ?? 0;

  if (!isOpen) return null;

  const handleKeyChange = async (field: keyof Settings, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto provider sniffer
      if (value.trim()) {
        const detected = detectProviderFromKey(value);
        if (field === 'groqApiKey' || (field === 'openaiApiKey' && detected === 'groq')) {
          updated.groqApiKey = value;
        } else if (field === 'googleApiKey' || detected === 'google') {
          updated.googleApiKey = value;
        }
      }
      return updated;
    });

    // Dynamically fetch models when key is pasted
    if (value.trim().length > 10) {
      setIsFetchingModels(true);
      const detected = detectProviderFromKey(value);
      await fetchModelsForProvider(detected, value, formData.openaiBaseUrl);
      setIsFetchingModels(false);
    }
  };

  const handleChange = (field: keyof Settings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTogglePlugin = (pluginId: string) => {
    setFormData(prev => {
      const active = prev.activePluginIds.includes(pluginId)
        ? prev.activePluginIds.filter(id => id !== pluginId)
        : [...prev.activePluginIds, pluginId];
      return { ...prev, activePluginIds: active };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFetchingModels(true);

    // Fetch models on save for available keys
    if (formData.groqApiKey) await fetchModelsForProvider('groq', formData.groqApiKey);
    if (formData.googleApiKey) await fetchModelsForProvider('google', formData.googleApiKey);
    if (formData.openaiApiKey) await fetchModelsForProvider('openai', formData.openaiApiKey, formData.openaiBaseUrl);

    setIsFetchingModels(false);
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 500);
  };

  const handleExportData = async () => {
    const sessions = await db.sessions.toArray();
    const messages = await db.messages.toArray();
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions,
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novarin_chat_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to delete all conversations and messages? This action cannot be undone.')) {
      await db.messages.clear();
      await db.sessions.clear();
      alert('All conversation data cleared.');
    }
  };

  const allPlugins = pluginManager.getAllPlugins();

  const presets = [
    {
      label: '💻 Senior Coder',
      prompt: 'You are an elite Senior Software Engineer. Provide concise, clean, highly optimized code with production-grade best practices and brief explanations.',
    },
    {
      label: '🎯 Concise Assistant',
      prompt: 'You are NovaRin, a direct, concise AI assistant. Answer directly without fluff, pleasantries, or boilerplate intro/outro phrases.',
    },
    {
      label: '🧠 Architecture Consultant',
      prompt: 'You are a Principal Systems Architect. Help design scalable, reliable, and decoupled system architectures, database schemas, and microservice topologies.',
    },
    {
      label: '⚡ Deep Thinker',
      prompt: 'You are a thorough analytical thinker. Break down problems step-by-step, evaluate edge cases, and reason critically before concluding.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-zinc-950 font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">NovaRin Settings</h2>
              <p className="text-[11px] text-zinc-500">Client-Side Bring Your Own Key (BYOK) Workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabbed Layout Grid Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-56 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-zinc-800/80 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto flex-shrink-0 select-none">
            <button
              onClick={() => setActiveTab('providers')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === 'providers'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Providers & Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === 'models'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Model & Generation</span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === 'persona'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Persona & System Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab('plugins')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === 'plugins'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Plug className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Plugins & Extensions</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === 'storage'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Database className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Data & Privacy</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-900/60">
            {/* TAB 1: PROVIDERS & KEYS */}
            {activeTab === 'providers' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" /> AI Providers Configuration
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pasting an API key auto-detects the provider and dynamically fetches available models.
                  </p>
                </div>

                {/* Groq Cloud Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400 fill-current" />
                      <h4 className="text-sm font-bold text-zinc-200">Groq Cloud (Fast Inference)</h4>
                      {formData.groqApiKey ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Groq Key Configured" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500/50" title="Groq Key Missing" />
                      )}
                    </div>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                    >
                      Groq Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      placeholder="gsk_..."
                      value={formData.groqApiKey}
                      onChange={e => handleKeyChange('groqApiKey', e.target.value)}
                      className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500/60 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Google Gemini Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-zinc-200">Google Gemini</h4>
                      {formData.googleApiKey ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Gemini Key Configured" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500/50" title="Gemini Key Missing" />
                      )}
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                    >
                      Get free key from Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={formData.googleApiKey}
                      onChange={e => handleKeyChange('googleApiKey', e.target.value)}
                      className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI & Custom Endpoints Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-zinc-200">OpenAI & Custom Endpoints</h4>
                      {formData.openaiApiKey || formData.openaiBaseUrl ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="OpenAI / BaseURL Configured" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500/50" title="OpenAI Unconfigured" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">OpenAI API Key</label>
                    <div className="relative">
                      <input
                        type={showOpenAIKey ? 'text' : 'password'}
                        placeholder="sk-..."
                        value={formData.openaiApiKey}
                        onChange={e => handleKeyChange('openaiApiKey', e.target.value)}
                        className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500/60 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                      >
                        {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-zinc-500" /> Custom Base URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://openrouter.ai/api/v1 or https://api.deepseek.com/v1"
                      value={formData.openaiBaseUrl}
                      onChange={e => handleChange('openaiBaseUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500/60 transition"
                    />
                  </div>
                </div>

                {/* Local LLMs (Ollama / LM Studio) Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-zinc-200">Enable Local Inference (Ollama / LM Studio)</h4>
                      {formData.enableLocal && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" title="Local Inference Active" />
                      )}
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableLocal}
                        onChange={e => handleChange('enableLocal', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {formData.enableLocal && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                      <label className="text-[11px] font-medium text-zinc-400">Endpoint URL (no API key required)</label>
                      <input
                        type="text"
                        placeholder="http://localhost:11434/v1"
                        value={formData.localEndpoint}
                        onChange={e => handleChange('localEndpoint', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500/60 transition font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MODEL & GENERATION */}
            {activeTab === 'models' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" /> Model & Generation Parameters
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Select your default model and adjust model creativity settings.
                  </p>
                </div>

                {/* Model Selector Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4 shadow-md">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Active Default Model</label>
                    <select
                      value={formData.selectedModel}
                      onChange={e => handleChange('selectedModel', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60 transition"
                    >
                      {DEFAULT_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))}
                      {!DEFAULT_MODELS.some(m => m.id === formData.selectedModel) && (
                        <option value={formData.selectedModel}>
                          Custom: {formData.selectedModel}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Custom Model String */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <label className="text-[11px] font-medium text-zinc-400">Or enter custom Model ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. deepseek-r1, qwen2.5-72b-instruct"
                        value={customModelInput}
                        onChange={e => setCustomModelInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customModelInput.trim()) {
                            handleChange('selectedModel', customModelInput.trim());
                            setCustomModelInput('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                      >
                        Set Model
                      </button>
                    </div>
                  </div>
                </div>

                {/* Temperature Slider Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-semibold text-zinc-200">Creativity / Temperature</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800">
                      {formData.temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={e => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>0.2 = Precise / Coding</span>
                    <span>0.7 = Balanced</span>
                    <span>1.0 = Creative</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERSONA & SYSTEM PROMPT */}
            {activeTab === 'persona' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" /> Persona & System Instructions
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Set a global default system prompt or persona that guides model responses across all chats.
                  </p>
                </div>

                {/* Quick Presets Row */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Quick Persona Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChange('systemPrompt', preset.prompt)}
                        className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-left transition text-xs font-medium text-zinc-300 hover:text-cyan-400 flex items-center justify-between"
                      >
                        <span>{preset.label}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Apply</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Prompt Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Global System Prompt Text</label>
                  <textarea
                    rows={6}
                    value={formData.systemPrompt}
                    onChange={e => handleChange('systemPrompt', e.target.value)}
                    placeholder="Enter custom instructions..."
                    className="w-full p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500/60 leading-relaxed resize-none font-sans"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: PLUGINS & EXTENSIONS */}
            {activeTab === 'plugins' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Plug className="w-4 h-4 text-emerald-400" /> Installed Plugins
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enable or disable modular extension hooks without altering core application code.
                  </p>
                </div>

                <div className="space-y-3">
                  {allPlugins.map(plugin => {
                    const isChecked = formData.activePluginIds.includes(plugin.id);
                    return (
                      <div
                        key={plugin.id}
                        className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between shadow-md"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                            <span>{plugin.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                              v{plugin.version}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{plugin.description}</p>
                        </div>

                        {/* iOS-style toggle switch */}
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlugin(plugin.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: DATA & STORAGE */}
            {activeTab === 'storage' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-rose-400" /> Data Management & Privacy
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage local Dexie IndexedDB storage, backup your conversation history, or perform data cleanup.
                  </p>
                </div>

                {/* Storage Metrics Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                    <Shield className="w-4 h-4 text-emerald-400" /> Local Storage Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-lg font-bold text-cyan-400 font-mono">{sessionsCount}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Conversations</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-lg font-bold text-purple-400 font-mono">{messagesCount}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Messages</div>
                    </div>
                  </div>
                </div>

                {/* Export Data Button */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between shadow-md">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Export Conversation Backup</h4>
                    <p className="text-[11px] text-zinc-400">Download all your chat sessions and messages as a JSON backup.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-cyan-400" /> Export JSON
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Clear all conversation history from browser IndexedDB. API keys will remain saved in LocalStorage.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Conversations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            {isFetchingModels ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Fetching dynamic models from provider...</span>
              </>
            ) : (
              <span>Settings auto-persist in LocalStorage.</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/20"
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
