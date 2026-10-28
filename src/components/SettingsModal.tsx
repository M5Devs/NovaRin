import React, { useState } from 'react';
import { X, Key, Server, Cpu, Sparkles, Check, Plug } from 'lucide-react';
import type { Settings } from '../types';
import { DEFAULT_MODELS } from '../lib/storage';
import { pluginManager } from '../plugins/manager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [customModelInput, setCustomModelInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const allPlugins = pluginManager.getAllPlugins();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-lg">
            <Key className="w-5 h-5 text-cyan-400" />
            <span>NovaRin Settings (BYOK)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* OpenAI Configuration */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Key className="w-4 h-4" /> OpenAI / OpenRouter / Groq / Ollama
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={formData.openaiApiKey}
                onChange={e => handleChange('openaiApiKey', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
              <p className="text-xs text-slate-500">Stored locally in browser. Leave empty if using local Ollama/LM Studio without auth.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> Custom Base URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://api.groq.com/openai/v1 or https://openrouter.ai/api/v1"
                value={formData.openaiBaseUrl}
                onChange={e => handleChange('openaiBaseUrl', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
              <p className="text-xs text-slate-500">Overrides standard OpenAI endpoint. Supports Groq, OpenRouter, Together AI, or local endpoints (e.g., http://localhost:11434/v1).</p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Google Gemini Configuration */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Google Gemini Provider
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={formData.googleApiKey}
                onChange={e => handleChange('googleApiKey', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Model Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Default Model Selection
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Active Model</label>
              <select
                value={formData.selectedModel}
                onChange={e => handleChange('selectedModel', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
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

            {/* Custom Model ID input */}
            <div className="flex gap-2 items-center pt-1">
              <input
                type="text"
                placeholder="Or enter custom model ID (e.g. deepseek-r1, llama-3.3-70b-versatile)"
                value={customModelInput}
                onChange={e => setCustomModelInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customModelInput.trim()) {
                    handleChange('selectedModel', customModelInput.trim());
                    setCustomModelInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Use Model
              </button>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Global System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Global System Prompt / Persona</label>
            <textarea
              rows={3}
              value={formData.systemPrompt}
              onChange={e => handleChange('systemPrompt', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition resize-none"
            />
          </div>

          {/* Plugin Manager */}
          {allPlugins.length > 0 && (
            <>
              <hr className="border-slate-800" />
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                  <Plug className="w-4 h-4" /> Installed Plugins
                </h3>
                <div className="space-y-2">
                  {allPlugins.map(plugin => {
                    const isChecked = formData.activePluginIds.includes(plugin.id);
                    return (
                      <div
                        key={plugin.id}
                        onClick={() => handleTogglePlugin(plugin.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'bg-cyan-950/20 border-cyan-500/40'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-200">{plugin.name} <span className="text-xs text-slate-500">v{plugin.version}</span></div>
                          <div className="text-xs text-slate-400">{plugin.description}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Save Action */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-500/20"
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
        </form>
      </div>
    </div>
  );
};
