import { createClient } from '@supabase/supabase-js';
import type { BusinessReport } from './openai';
import { leadsDB } from '../services/LeadsDB';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Agency {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Lead {
  id: string;
  email: string;
  business_name: string;
  business_category: string;
  business_address: string;
  business_rating: number;
  business_reviews_count?: number;
  business_claimed?: boolean;
  business_photos?: string[];
  business_website?: string;
  business_phone?: string;
  business_hours?: Record<string, string>;
  report_data: BusinessReport;
  agency_id: string;
  created_at: string;
  email_sent?: boolean;
  source: 'embed' | 'app';
  place_id?: string;
}

// Custom event for lead storage
const LEAD_STORED_EVENT = 'gbp_optimizer_lead_stored';

// Lead Management
export async function storeLead(data: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
  try {
    const lead = await leadsDB.addLead(data);
    
    // Dispatch custom event for cross-tab communication
    const event = new CustomEvent(LEAD_STORED_EVENT, { detail: lead });
    window.dispatchEvent(event);
    
    return lead;
  } catch (error) {
    console.error('Failed to store lead:', error);
    throw new Error('Failed to store lead data');
  }
}

export async function getAgencyLeads(agencyId: string): Promise<Lead[]> {
  try {
    return await leadsDB.getLeadsByAgency(agencyId);
  } catch (error) {
    console.error('Failed to get leads:', error);
    return [];
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  try {
    return await leadsDB.getAllLeads();
  } catch (error) {
    console.error('Failed to get all leads:', error);
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    return await leadsDB.getLead(id);
  } catch (error) {
    console.error('Failed to get lead:', error);
    return null;
  }
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    await leadsDB.deleteLead(id);
    return true;
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return false;
  }
}