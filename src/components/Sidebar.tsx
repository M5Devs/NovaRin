import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Search,
  MoreVertical,
  Edit2,
  Check,
  X,
  Database,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import type { ChatSession } from '../types';
import { db } from '../lib/db';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
    setOpenMenuId(null);
  };

  const handleSaveRename = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleInput.trim()) {
      await db.sessions.update(id, { title: editTitleInput.trim(), updatedAt: Date.now() });
    }
    setEditingSessionId(null);
  };

  // Grouping logic for sessions
  const filteredSessions = sessions.filter(s =>
    (s.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const todaySessions: ChatSession[] = [];
  const yesterdaySessions: ChatSession[] = [];
  const last7DaysSessions: ChatSession[] = [];
  const olderSessions: ChatSession[] = [];

  filteredSessions.forEach(session => {
    const diff = now - session.updatedAt;
    if (diff < ONE_DAY) {
      todaySessions.push(session);
    } else if (diff < 2 * ONE_DAY) {
      yesterdaySessions.push(session);
    } else if (diff < 7 * ONE_DAY) {
      last7DaysSessions.push(session);
    } else {
      olderSessions.push(session);
    }
  });

  const renderSessionGroup = (title: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;
    return (
      <div className="space-y-0.5 mb-3">
        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-zinc-600" />
          <span>{title}</span>
        </div>
        {groupSessions.map(session => {
          const isActive = session.id === activeSessionId;
          const isEditing = session.id === editingSessionId;
          const isMenuOpen = session.id === openMenuId;

          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-800/90 text-cyan-400 font-medium shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-1">
                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                {isEditing ? (
                  <form
                    onSubmit={e => handleSaveRename(session.id, e)}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 flex-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitleInput}
                      onChange={e => setEditTitleInput(e.target.value)}
                      className="w-full px-1.5 py-0.5 bg-zinc-950 border border-cyan-500/50 rounded text-xs text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-400 hover:bg-zinc-800 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSessionId(null)}
                      className="p-1 text-zinc-400 hover:bg-zinc-800 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <span className="truncate">{session.title || 'New Conversation'}</span>
                )}
              </div>

              {!isEditing && (
                <div className="relative flex items-center">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : session.id);
                    }}
                    className={`p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 transition ${
                      isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-6 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 p-1 text-xs space-y-0.5 animate-in fade-in duration-100"
                    >
                      <button
                        onClick={e => handleStartRename(session, e)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-400" /> Rename
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          onDeleteSession(session.id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-zinc-950/90 border-r border-zinc-800/80 flex flex-col items-center py-4 justify-between backdrop-blur-md transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 rounded-xl transition"
          >
            <PanelLeftOpen className="w-5 h-5 text-cyan-400" />
          </button>

          <button
            onClick={onNewChat}
            title="New Chat"
            className="p-2.5 bg-gradient-to-tr from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col h-full select-none transition-all duration-300 backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-cyan-500/20">
            <Zap className="w-4 h-4 text-zinc-950 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-100 tracking-wide text-sm flex items-center gap-1.5">
              NovaRin
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 font-mono">
                BYOK
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">Cyber-Minimalist Client</p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Action */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/15"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Chat</span>
        </button>

        {/* Real-time Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
          />
        </div>
      </div>

      {/* Grouped Chat Sessions History */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-600">
            {searchQuery ? 'No matching chats found.' : 'No saved conversations.'}
          </div>
        ) : (
          <>
            {renderSessionGroup('Today', todaySessions)}
            {renderSessionGroup('Yesterday', yesterdaySessions)}
            {renderSessionGroup('Previous 7 Days', last7DaysSessions)}
            {renderSessionGroup('Older', olderSessions)}
          </>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
            Config
          </span>
        </button>

        <div className="pt-2 flex items-center justify-between px-2 text-[10px] text-zinc-500 border-t border-zinc-900/80">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-400" /> Local Offline
          </span>
          <span className="flex items-center gap-1 text-zinc-600 font-mono">
            <ShieldCheck className="w-3 h-3 text-zinc-500" /> AGPLv3
          </span>
        </div>
      </div>
    </div>
  );
};
