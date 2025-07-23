import { useState, useEffect } from 'react';
import { LocalCustomerService } from '../services/localCustomerService';
import { CustomerData } from '../data/customerData';

export function useCustomerData(companyNameOrId?: string) {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function fetchCustomerData() {
      if (!companyNameOrId) {
        setCustomerData(null);
        return;
      }
      
      setLoading(true);
      try {
        const autoFillData = await LocalCustomerService.getAutoFillData(companyNameOrId);
        if (autoFillData) {
          // Get the full customer data
          const company = await LocalCustomerService.getCompanyByName(companyNameOrId, true);
          if (company && 'status' in company) {
            setCustomerData({
              webTPID: company.webTPID || company.id,
              companyName: company.name,
              contactName: company.contactName || '',
              email: company.contact_email || '',
              phone: company.contact_phone || '',
              status: company.status || 'Active',
              signupDate: company.signupDate || company.created_at,
              contactDate: company.contactDate || company.updated_at
            });
          }
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomerData();
  }, [companyNameOrId]);
  
  return { customerData, loading };
}