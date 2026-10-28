import Dexie, { type Table } from 'dexie';
import type { ChatSession, ChatMessage } from '../types';

export class NovaRinDatabase extends Dexie {
  sessions!: Table<ChatSession, string>;
  messages!: Table<ChatMessage, string>;

  constructor() {
    super('NovaRinDB');

    // Schema definitions
    this.version(1).stores({
      sessions: 'id, createdAt, updatedAt',
      messages: 'id, chatId, createdAt'
    });
  }
}

export const db = new NovaRinDatabase();

export async function createChat(title: string = 'New Conversation'): Promise<string> {
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();
  await db.sessions.add({
    id: chatId,
    title,
    createdAt: now,
    updatedAt: now,
    model: 'gpt-4o-mini',
  });
  return chatId;
}

export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  await db.sessions.update(chatId, {
    title: newTitle,
    updatedAt: Date.now(),
  });
}

export async function deleteChat(chatId: string): Promise<void> {
  await db.messages.where('chatId').equals(chatId).delete();
  await db.sessions.delete(chatId);
}

export async function clearAllChats(): Promise<void> {
  await db.messages.clear();
  await db.sessions.clear();
}
