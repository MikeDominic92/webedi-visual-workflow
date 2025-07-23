import { supabase, isSupabaseConfigured, Ticket, Company, TradingPartner, CustomerProfile } from '../lib/supabase';
import { ParsedTicket, VisualWorkflow } from '../types';

export class TicketService {
  // Save a new ticket to the database
  static async saveTicket(
    parsedTicket: ParsedTicket, 
    workflow: VisualWorkflow
  ): Promise<Ticket | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping ticket save');
      return null;
    }

    try {
      // First, find or create the company
      const companyId = await this.findOrCreateCompany(parsedTicket);
      
      // Find or create trading partner
      const tradingPartnerId = await this.findOrCreateTradingPartner(parsedTicket);

      // Create the ticket
      const ticketData = {
        ticket_number: parsedTicket.id,
        company_id: companyId,
        trading_partner_id: tradingPartnerId,
        document_type: parsedTicket.documentType,
        supplier: parsedTicket.supplier,
        buyer: parsedTicket.buyer,
        error_type: parsedTicket.errorType,
        error_code: parsedTicket.errorCode,
        affected_pos: parsedTicket.affectedPOs,
        action: parsedTicket.action,
        workflow_data: workflow,
        raw_text: parsedTicket.rawText,
        status: 'open',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase!
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) {
        console.error('Error saving ticket:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveTicket:', error);
      return null;
    }
  }

  // Find or create a company based on the parsed ticket
  private static async findOrCreateCompany(parsedTicket: ParsedTicket): Promise<string | null> {
    if (!supabase) return null;

    // Determine which field contains the customer name
    const customerName = parsedTicket.buyer || parsedTicket.supplier;
    if (!customerName) return null;

    try {
      // First, try to find existing company
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', customerName)
        .single();

      if (existingCompany) {
        return existingCompany.id;
      }

      // Create new company
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert([{
          name: customerName,
          company_type: 'customer',
          edi_id: parsedTicket.webediId
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating company:', error);
        return null;
      }

      return newCompany?.id || null;
    } catch (error) {
      console.error('Error in findOrCreateCompany:', error);
      return null;
    }
  }

  // Find or create a trading partner
  private static async findOrCreateTradingPartner(parsedTicket: ParsedTicket): Promise<string | null> {
    if (!supabase || !parsedTicket.tradingPartner) return null;

    try {
      // First, try to find existing trading partner
      const { data: existingPartner } = await supabase
        .from('trading_partners')
        .select('id')
        .eq('name', parsedTicket.tradingPartner)
        .single();

      if (existingPartner) {
        return existingPartner.id;
      }

      // Create new trading partner
      const { data: newPartner, error } = await supabase
        .from('trading_partners')
        .insert([{
          name: parsedTicket.tradingPartner,
          integration_type: parsedTicket.integationType
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating trading partner:', error);
        return null;
      }

      return newPartner?.id || null;
    } catch (error) {
      console.error('Error in findOrCreateTradingPartner:', error);
      return null;
    }
  }

  // Get customer profile with ticket history
  static async getCustomerProfile(companyId: string): Promise<CustomerProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase!
        .from('customer_profiles')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Error fetching customer profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerProfile:', error);
      return null;
    }
  }

  // Get tickets for a specific company
  static async getCompanyTickets(companyId: string): Promise<Ticket[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase!
        .from('tickets')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company tickets:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompanyTickets:', error);
      return [];
    }
  }

  // Search companies by name
  static async searchCompanies(searchTerm: string): Promise<Company[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase!
        .from('companies')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Error searching companies:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchCompanies:', error);
      return [];
    }
  }

  // Update ticket status
  static async updateTicketStatus(
    ticketId: string, 
    status: 'open' | 'resolved' | 'pending',
    resolution?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updateData.resolution = resolution;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase!
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTicketStatus:', error);
      return false;
    }
  }

  // Get recent tickets
  static async getRecentTickets(limit: number = 10): Promise<Ticket[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase!
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent tickets:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentTickets:', error);
      return [];
    }
  }
}