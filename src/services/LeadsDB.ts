import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Lead } from '../lib/supabase';

interface LeadsDBSchema extends DBSchema {
  leads: {
    key: string;
    value: Lead;
    indexes: {
      'by-agency': string;
      'by-date': string;
    };
  };
}

class LeadsDatabase {
  private dbName = 'gbp-optimizer-leads';
  private version = 1;
  private db: Promise<IDBPDatabase<LeadsDBSchema>>;

  constructor() {
    this.db = this.initDB();
  }

  private async initDB() {
    return openDB<LeadsDBSchema>(this.dbName, this.version, {
      upgrade(db) {
        const store = db.createObjectStore('leads', { keyPath: 'id' });
        store.createIndex('by-agency', 'agency_id');
        store.createIndex('by-date', 'created_at');
      },
    });
  }

  async addLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
    const db = await this.db;
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    await db.add('leads', newLead);
    return newLead;
  }

  async getLeadsByAgency(agencyId: string): Promise<Lead[]> {
    const db = await this.db;
    return db.getAllFromIndex('leads', 'by-agency', agencyId);
  }

  async getAllLeads(): Promise<Lead[]> {
    const db = await this.db;
    return db.getAll('leads');
  }

  async getLead(id: string): Promise<Lead | null> {
    const db = await this.db;
    return db.get('leads', id);
  }

  async deleteLead(id: string): Promise<void> {
    const db = await this.db;
    await db.delete('leads', id);
  }
}

export const leadsDB = new LeadsDatabase();