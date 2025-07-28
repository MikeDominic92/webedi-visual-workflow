// src/components/TicketInput.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../store/workflowStore';
import CustomerSearch from './CustomerSearch';
import { Company } from '../lib/supabase';
import { ExtendedCompany } from '../types/customer';
import { CustomerAutoFillData } from '../types/customer';

const sampleTickets = {
  invoice: `Ticket Title: 5064 - Zero Egg Count - 810 Invoices rejected by Chewy.com (Duplicate Invoice Number)
Customer name: Tim Davis (caller on record) / Tim Davis (person on the phone)
Company name: Zero Egg Count
Company ID number: 5064
Phone number: N/A
Email: tdavis@zeroeggcount.com
Trading Partner: Chewy.com
Document Types: 810
Error/Issue: Invoices rejected with error "This invoice number already exists. You must provide a unique invoice number. (AP-810776)". Customer needs to log into WebEDI, find the original invoices, and resubmit them with a new, unique invoice number (e.g., add "-1" to the end of the original number).
Message IDs/Control Numbers: AP-810776
Integration Type: WebEDI
Affected PO Numbers: RS41745897, RS41732724, RS41732712`,

  purchase: `Ticket Title: 3892 - Acme Corp - 850 Purchase Order rejected by Target Corporation
Customer name: John Smith (caller on record) / Sarah Johnson (person on the phone)
Company name: Acme Corp
Company ID number: 3892
Phone number: (555) 123-4567
Email: orders@acmecorp.com
Trading Partner: Target Corporation
Document Types: 850
Error/Issue: Purchase orders rejected with error "Item not found in catalog (ERR-CAT-404)". Invalid SKUs ACM-12345 and ACM-12346 are not recognized in Target's system. Need to verify correct item codes with buyer@target.com and check if items have been discontinued or replaced.
Message IDs/Control Numbers: ERR-CAT-404
Integration Type: AS2
Affected PO Numbers: TG87654321, TG87654322`,

  shipment: `Ticket Title: 4952 - Magnolia Brush - SFTP Process Leaving Original Files
Customer name: Tanna Meals (caller on record) / Greta (person on the phone)
Company name: Magnolia Brush
Company ID number: 4952
Phone number: N/A
Email: tanna@magnoliabrush.com
Trading Partner: All
Document Types: All inbound orders (e.g., 850) and outbound (e.g., 810 invoices)
Error/Issue: Since yesterday (July 17), their ERP (Global Shop) is processing inbound orders but leaving the original "unbuilt" file in the SFTP directory, leading to duplicate files. It is also happening for outbound documents. This indicates their internal script is failing to perform the cleanup step after processing.
Message IDs/Control Numbers: N/A
Integration Type: SFTP with Global Shop ERP`
};

const TicketInput: React.FC = () => {
  const [ticketText, setTicketText] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | ExtendedCompany | null>(null);
  const { parseTicket, isProcessing, error, clearWorkflow } = useWorkflowStore();

  const handleSubmit = () => {
    if (ticketText.trim()) {
      parseTicket(ticketText);
    }
  };

  const loadSampleTicket = (type: keyof typeof sampleTickets) => {
    setTicketText(sampleTickets[type]);
    clearWorkflow();
  };

  const handleAutoFill = (data: CustomerAutoFillData) => {
    // Parse existing ticket text or create new template
    const lines = ticketText.split('\n');
    const updatedLines: string[] = [];
    
    // Track which fields have been updated
    let companyNameUpdated = false;
    let companyIdUpdated = false;
    let customerNameUpdated = false;
    let emailUpdated = false;
    let phoneUpdated = false;
    
    // Update existing fields or add new ones
    lines.forEach(line => {
      if (line.toLowerCase().includes('company name:') && !companyNameUpdated) {
        updatedLines.push(`Company name: ${data.companyName}`);
        companyNameUpdated = true;
      } else if (line.toLowerCase().includes('company id') && !companyIdUpdated) {
        updatedLines.push(`Company ID number: ${data.companyId}`);
        companyIdUpdated = true;
      } else if (line.toLowerCase().includes('customer name:') && !customerNameUpdated) {
        updatedLines.push(`Customer name: ${data.customerName} (caller on record) / ${data.personOnPhone || data.customerName} (person on the phone)`);
        customerNameUpdated = true;
      } else if (line.toLowerCase().includes('email:') && !emailUpdated) {
        updatedLines.push(`Email: ${data.email}`);
        emailUpdated = true;
      } else if (line.toLowerCase().includes('phone') && !phoneUpdated) {
        updatedLines.push(`Phone number: ${data.phoneNumber}`);
        phoneUpdated = true;
      } else {
        updatedLines.push(line);
      }
    });
    
    // Add missing fields at the beginning if not found
    const fieldsToAdd: string[] = [];
    if (!customerNameUpdated) {
      fieldsToAdd.push(`Customer name: ${data.customerName} (caller on record) / ${data.personOnPhone || data.customerName} (person on the phone)`);
    }
    if (!companyNameUpdated) {
      fieldsToAdd.push(`Company name: ${data.companyName}`);
    }
    if (!companyIdUpdated) {
      fieldsToAdd.push(`Company ID number: ${data.companyId}`);
    }
    if (!phoneUpdated) {
      fieldsToAdd.push(`Phone number: ${data.phoneNumber}`);
    }
    if (!emailUpdated) {
      fieldsToAdd.push(`Email: ${data.email}`);
    }
    
    // Combine fields
    const finalText = fieldsToAdd.length > 0 
      ? fieldsToAdd.join('\n') + (updatedLines.length > 0 ? '\n' + updatedLines.join('\n') : '')
      : updatedLines.join('\n');
    
    setTicketText(finalText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stealth-card glass-effect p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-4 neon-text">
        EDI Ticket Analyzer
      </h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            className="text-sm text-stealth-200 hover:text-white transition-colors mb-2"
          >
            {showCustomerSearch ? '− Hide' : '+ Search'} Customer Database
          </button>
          
          {showCustomerSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <CustomerSearch
                onSelectCompany={(company) => {
                  setSelectedCompany(company);
                  setShowCustomerSearch(false);
                }}
                onAutoFill={handleAutoFill}
              />
              {selectedCompany && (
                <div className="mt-2 p-2 bg-stealth-800 rounded text-sm text-stealth-100">
                  Selected: {selectedCompany.name}
                </div>
              )}
            </motion.div>
          )}
        </div>
        <div>
          <label htmlFor="ticket" className="block text-sm font-medium text-stealth-100 mb-2">
            Paste your EDI ticket below:
          </label>
          <textarea
            id="ticket"
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            className="stealth-input h-40 resize-none"
            placeholder="Example: 810 Invoice rejected by Walmart - duplicate invoice number..."
            disabled={isProcessing}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/20 border border-red-500/50 text-status-error px-4 py-3 rounded-md backdrop-blur-sm"
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!ticketText.trim() || isProcessing}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
              ${ticketText.trim() && !isProcessing
                ? 'stealth-button-primary'
                : 'bg-stealth-700 text-stealth-400 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Workflow'
            )}
          </button>
          
          <button
            onClick={clearWorkflow}
            className="stealth-button border border-stealth-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-stealth-700">
        <p className="text-sm text-stealth-200 mb-3">Try a sample ticket:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSampleTicket('invoice')}
            className="px-3 py-1 text-sm bg-doc-810 text-white rounded-full hover:bg-doc-810/80 transition-colors-shadow"
          >
            810 Invoice Error
          </button>
          <button
            onClick={() => loadSampleTicket('purchase')}
            className="px-3 py-1 text-sm bg-doc-850 text-white rounded-full hover:bg-doc-850/80 transition-colors-shadow"
          >
            850 PO Error
          </button>
          <button
            onClick={() => loadSampleTicket('shipment')}
            className="px-3 py-1 text-sm bg-doc-856 text-white rounded-full hover:bg-doc-856/80 transition-colors-shadow"
          >
            856 ASN Error
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-stealth-800/50 rounded-lg border border-stealth-600 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-stealth-100 mb-2">
          Supported Document Types:
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-stealth-200">
          <div>• 810 - Invoice</div>
          <div>• 850 - Purchase Order</div>
          <div>• 856 - Ship Notice/ASN</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketInput;