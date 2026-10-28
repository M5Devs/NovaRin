import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db';
import { loadSettings, saveSettings } from './lib/storage';
import { pluginManager } from './plugins/manager';
import { wordCounterPlugin } from './plugins/wordCounter';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import type { ChatSession, Settings } from './types';

// Register plugins
pluginManager.register(wordCounterPlugin);

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Live query for sessions sorted by newest first
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('updatedAt').reverse().toArray(),
    []
  ) || [];

  // Auto-select or create first session if none exists
  useEffect(() => {
    if (sessions.length > 0) {
      if (!activeSessionId || !sessions.some(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions[0].id);
      }
    } else {
      handleNewChat();
    }
  }, [sessions.length]);

  const handleNewChat = async () => {
    const newSessionId = `chat_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.selectedModel,
    };

    await db.sessions.add(newSession);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = async (id: string) => {
    await db.messages.where('chatId').equals(id).delete();
    await db.sessions.delete(id);

    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Sidebar Component */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={id => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Chat Interface */}
      <ChatWindow
        session={activeSession}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}

export default App;
