import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketService } from '../services/ticketService';
import { Company, isSupabaseConfigured } from '../lib/supabase';
import { LocalCustomerService } from '../services/localCustomerService';
import { ExtendedCompany } from '../types/customer';

interface CustomerSearchProps {
  onSelectCompany: (company: Company | ExtendedCompany) => void;
  onAutoFill?: (data: any) => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ onSelectCompany, onAutoFill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<(Company | ExtendedCompany)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        
        let results: (Company | ExtendedCompany)[] = [];
        
        // Try Supabase first if configured
        if (isSupabaseConfigured()) {
          results = await TicketService.searchCompanies(searchTerm);
        }
        
        // If no results from Supabase or not configured, use local data
        if (results.length === 0) {
          results = await LocalCustomerService.searchLocalCompanies(searchTerm);
        }
        
        setCompanies(results);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setCompanies([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelectCompany = async (company: Company | ExtendedCompany) => {
    onSelectCompany(company);
    setSearchTerm(company.name);
    setShowResults(false);
    
    // Auto-fill data if callback provided
    if (onAutoFill) {
      const autoFillData = await LocalCustomerService.getAutoFillData(company.name);
      if (autoFillData) {
        onAutoFill(autoFillData);
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for customer..."
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResults && companies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {companies.map((company) => (
              <motion.button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              >
                <div className="text-white font-medium">{company.name}</div>
                {(company.edi_id || ('webTPID' in company && company.webTPID)) && (
                  <div className="text-zinc-400 text-sm">
                    ID: {company.edi_id || ('webTPID' in company ? company.webTPID : '')}
                  </div>
                )}
                {'contactName' in company && company.contactName && (
                  <div className="text-zinc-400 text-sm">Contact: {company.contactName}</div>
                )}
                <div className="text-zinc-500 text-xs mt-1">
                  {company.contact_email || ('email' in company && typeof company.email === 'string' ? company.email : '')}
                </div>
                {'status' in company && company.status && (
                  <div className="text-zinc-500 text-xs">
                    Status: {company.status}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && companies.length === 0 && !isSearching && searchTerm.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-md p-4"
        >
          <p className="text-zinc-400 text-sm">No customers found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerSearch;