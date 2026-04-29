import Dexie, { type EntityTable } from 'dexie';

export interface MatchEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  notes?: string;
  reminders: number[]; // Array of minutes before the event
  isSynced: boolean;
  externalId?: string;
}

export interface PersonalEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  notes?: string;
  reminders: number[];
}

export interface Contact {
  id: string;
  name: string;
  type: 'sport' | 'personal';
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Arena {
  id: string;
  name: string;
  address: string;
  contacts: string;
}

export interface SyncConfig {
  id: string;
  lastSyncTime: Date;
  calendarUrl?: string; // used if we support external sync
}

const db = new Dexie('AgendaPartiteDB') as Dexie & {
  matches: EntityTable<MatchEvent, 'id'>;
  personalEvents: EntityTable<PersonalEvent, 'id'>;
  contacts: EntityTable<Contact, 'id'>;
  arenas: EntityTable<Arena, 'id'>;
  syncInfo: EntityTable<SyncConfig, 'id'>;
};

db.version(3).stores({
  matches: 'id, date, location, isSynced',
  personalEvents: 'id, date',
  contacts: 'id, type, name',
  arenas: 'id, name',
  syncInfo: 'id'
});

db.version(2).stores({
  matches: 'id, date, location, isSynced',
  personalEvents: 'id, date',
  contacts: 'id, type, name',
  syncInfo: 'id'
});

db.version(1).stores({
  matches: 'id, date, location, isSynced',
  syncInfo: 'id'
});

export { db };
