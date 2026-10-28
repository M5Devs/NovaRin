import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Zap
} from 'lucide-react';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 justify-between transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition"
          >
            <PanelLeftOpen className="w-5 h-5 text-cyan-400" />
          </button>

          <button
            onClick={onNewChat}
            title="New Chat"
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            <Zap className="w-4 h-4 text-slate-950 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 tracking-wide text-sm flex items-center gap-1.5">
              NovaRin
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                BYOK
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">v1.0.0 • Local Client</p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Action */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/15"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat Sessions History */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Conversations ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-600">
            No saved chats yet.
          </div>
        ) : (
          sessions.map(s => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                  isActive
                    ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 transition"
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <div className="pt-2 flex items-center justify-between px-2 text-[10px] text-slate-600">
          <span>Local Dexie Storage</span>
          <span className="flex items-center gap-1">
            AGPLv3
          </span>
        </div>
      </div>
    </div>
  );
};
