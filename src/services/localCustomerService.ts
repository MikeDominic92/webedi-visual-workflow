// Local customer service that works with the embedded customer database
import { customerDatabase, searchCompanies, getCompanyById, getCompanyByName, getCompanyByFuzzyName } from '../data/customerData';
import { ExtendedCompany, customerDataToCompany, createAutoFillData, CustomerAutoFillData } from '../types/customer';
import { ParsedTicket } from '../types';

export class LocalCustomerService {
  /**
   * Search for companies in the local database
   */
  static async searchLocalCompanies(searchTerm: string): Promise<ExtendedCompany[]> {
    const results = searchCompanies(searchTerm);
    return results.map(customerDataToCompany);
  }

  /**
   * Get company by WebTPID
   */
  static async getCompanyById(webTPID: string): Promise<ExtendedCompany | null> {
    const customer = getCompanyById(webTPID);
    return customer ? customerDataToCompany(customer) : null;
  }

  /**
   * Get company by name (exact or fuzzy match)
   */
  static async getCompanyByName(companyName: string, fuzzy: boolean = true): Promise<ExtendedCompany | null> {
    const customer = fuzzy ? getCompanyByFuzzyName(companyName) : getCompanyByName(companyName);
    return customer ? customerDataToCompany(customer) : null;
  }

  /**
   * Get auto-fill data for a company
   */
  static async getAutoFillData(companyNameOrId: string): Promise<CustomerAutoFillData | null> {
    // Try to find by ID first
    let customer = getCompanyById(companyNameOrId);
    
    // If not found, try by name
    if (!customer) {
      customer = getCompanyByFuzzyName(companyNameOrId);
    }
    
    return customer ? createAutoFillData(customer) : null;
  }

  /**
   * Enhance parsed ticket with customer data
   */
  static async enhanceTicketWithCustomerData(ticket: ParsedTicket): Promise<ParsedTicket> {
    // Try to find customer by company name or ID
    let customerData = null;
    
    if (ticket.companyId) {
      customerData = await this.getAutoFillData(ticket.companyId);
    } else if (ticket.companyName) {
      customerData = await this.getAutoFillData(ticket.companyName);
    } else if (ticket.buyer) {
      customerData = await this.getAutoFillData(ticket.buyer);
    } else if (ticket.supplier) {
      customerData = await this.getAutoFillData(ticket.supplier);
    }
    
    if (customerData) {
      // Enhance ticket with customer data
      return {
        ...ticket,
        companyName: ticket.companyName || customerData.companyName,
        companyId: ticket.companyId || customerData.companyId,
        customerName: ticket.customerName || customerData.customerName,
        email: ticket.email || customerData.email,
        phoneNumber: ticket.phoneNumber || customerData.phoneNumber,
        callerOnRecord: ticket.callerOnRecord || customerData.callerOnRecord,
        personOnPhone: ticket.personOnPhone || customerData.personOnPhone
      };
    }
    
    return ticket;
  }

  /**
   * Get all companies (for dropdown or full list display)
   */
  static async getAllCompanies(): Promise<ExtendedCompany[]> {
    return customerDatabase.map(customerDataToCompany);
  }

  /**
   * Check if a company exists in the local database
   */
  static async companyExists(companyNameOrId: string): Promise<boolean> {
    const byId = getCompanyById(companyNameOrId);
    const byName = getCompanyByFuzzyName(companyNameOrId);
    return !!(byId || byName);
  }

  /**
   * Get suggested companies based on partial input
   */
  static async getSuggestions(partialInput: string, limit: number = 10): Promise<ExtendedCompany[]> {
    if (!partialInput || partialInput.length < 2) {
      return [];
    }
    
    const results = searchCompanies(partialInput);
    return results.slice(0, limit).map(customerDataToCompany);
  }
}