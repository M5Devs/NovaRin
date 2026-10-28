import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createChat, deleteChat } from './lib/db';
import { loadSettings, saveSettings } from './lib/storage';
import { pluginManager } from './plugins/manager';
import { wordCounterPlugin } from './plugins/wordCounter';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import type { Settings } from './types';

// Register plugins
pluginManager.register(wordCounterPlugin);

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Live query for sessions sorted by updatedAt descending
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
      createChat('New Conversation').then(id => setActiveSessionId(id));
    }
  }, [sessions]);

  const handleNewChat = async () => {
    // Check if there is already an empty session (0 messages)
    for (const session of sessions) {
      const count = await db.messages.where('chatId').equals(session.id).count();
      if (count === 0) {
        setActiveSessionId(session.id);
        return;
      }
    }

    const newSessionId = await createChat('New Conversation');
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = async (id: string) => {
    const remaining = sessions.filter(s => s.id !== id);
    await deleteChat(id);

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        const newSessionId = await createChat('New Conversation');
        setActiveSessionId(newSessionId);
      }
    }
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectModel = (modelId: string) => {
    const updated = { ...settings, selectedModel: modelId };
    setSettings(updated);
    saveSettings(updated);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased font-sans">
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
        onSelectModel={handleSelectModel}
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
