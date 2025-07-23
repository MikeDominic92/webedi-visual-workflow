// Extended customer types for WebEDI integration
import { Company } from '../lib/supabase';
import { CustomerData } from '../data/customerData';

// Extended company interface that includes local customer data
export interface ExtendedCompany extends Company {
  webTPID?: string;
  contactName?: string;
  phone?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  signupDate?: string;
  contactDate?: string;
}

// Convert CustomerData to ExtendedCompany format
export function customerDataToCompany(customer: CustomerData): ExtendedCompany {
  return {
    id: customer.webTPID,
    name: customer.companyName,
    company_type: 'customer',
    edi_id: customer.webTPID,
    contact_email: customer.email,
    contact_phone: customer.phone,
    notes: `Contact: ${customer.contactName}`,
    created_at: customer.signupDate,
    updated_at: customer.contactDate,
    // Extended fields
    webTPID: customer.webTPID,
    contactName: customer.contactName,
    phone: customer.phone,
    status: customer.status,
    signupDate: customer.signupDate,
    contactDate: customer.contactDate
  };
}

// Auto-populate ticket fields from customer data
export interface CustomerAutoFillData {
  companyName: string;
  companyId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  callerOnRecord?: string;
  personOnPhone?: string;
}

export function createAutoFillData(customer: CustomerData): CustomerAutoFillData {
  return {
    companyName: customer.companyName,
    companyId: customer.webTPID,
    customerName: customer.contactName,
    email: customer.email,
    phoneNumber: customer.phone,
    callerOnRecord: customer.contactName,
    personOnPhone: customer.contactName
  };
}