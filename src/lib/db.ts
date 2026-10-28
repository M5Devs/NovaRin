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
