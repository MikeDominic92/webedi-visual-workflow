import { createClient } from '@supabase/supabase-js';
import { config } from '../config/environment';

// Database types
export interface Company {
  id: string;
  name: string;
  company_type: 'customer' | 'trading_partner' | 'both';
  edi_id?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TradingPartner {
  id: string;
  name: string;
  edi_id?: string;
  integration_type?: string;
  contact_info?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_number?: string;
  company_id?: string;
  trading_partner_id?: string;
  document_type: string;
  supplier: string;
  buyer: string;
  error_type: string;
  error_code?: string;
  affected_pos: string[];
  action: string;
  workflow_data?: any;
  raw_text: string;
  status: 'open' | 'resolved' | 'pending';
  resolution?: string;
  resolved_at?: string;
  resolution_time_minutes?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  company_type: string;
  edi_id?: string;
  contact_email?: string;
  contact_phone?: string;
  total_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  document_types_used: string[];
  common_errors: string[];
  last_ticket_date?: string;
  avg_resolution_time?: number;
}

// Initialize Supabase client
const supabaseUrl = config.SUPABASE_URL;
const supabaseAnonKey = config.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Database features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};