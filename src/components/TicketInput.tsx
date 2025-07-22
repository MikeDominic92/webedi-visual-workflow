// src/components/TicketInput.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../store/workflowStore';

const sampleTickets = {
  invoice: `Ticket Title: 5064 Zero Egg Count - Outbound 810 Invoices rejected by Chewy.com (Duplicate Invoice Number)
IMMEDIATE ACTIONS:
COMM -> Email Tim Davis (tdavis@zeroeggcount.com), CC Marta Brito (mbrito@chewy.com).
COMM -> State the exact rejection reason provided by Chewy: "This invoice number already exists. You must provide a unique invoice number. (AP-810776)".
COMM -> List the affected PO Numbers: RS41745897, RS41732724, RS41732712.
COMM -> Instruct the customer to log into WebEDI, find the original invoices, and resubmit them with a new, unique invoice number (e.g., add "-1" to the end of the original number).
VALIDATE FIX:
P4.0 -> Transactions -> Confirm a new 810 has been successfully sent by the user for the affected POs.
The transaction is no longer on a subsequent rejection report from Chewy.`,

  purchase: `3892 Acme Corp - 850 Purchase Order rejected by Target Corporation
Error: Item not found in catalog (ERR-CAT-404)
ISSUE DETAILS:
- Affected PO Numbers: TG87654321, TG87654322
- Invalid SKUs: ACM-12345, ACM-12346
- Order Date: 2024-01-20
RESOLUTION STEPS:
1. Contact buyer@target.com to verify correct item codes
2. Check if items have been discontinued or replaced
3. Update catalog with new SKU mappings
4. Resubmit order with corrected item codes`,

  shipment: `7235 Global Shipping Inc - 856 ASN Rejected by Amazon (Invalid Tracking)
Rejection Reason: Carrier code 'GLSP' not recognized in system
Error Code: (AMZ-856-001)
Affected PO Numbers: AZ99887766, AZ99887767, AZ99887768
CARRIER DETAILS:
- Tracking Numbers: GLSP1234567890, GLSP1234567891
- Expected Format: Standard carrier codes only (UPS, FEDEX, USPS)
ACTION REQUIRED:
Map GLSP carrier code to approved carrier in system or use standard carrier for shipment.`
};

const TicketInput: React.FC = () => {
  const [ticketText, setTicketText] = useState('');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        EDI Ticket Analyzer
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="ticket" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your EDI ticket below:
          </label>
          <textarea
            id="ticket"
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Example: 810 Invoice rejected by Walmart - duplicate invoice number..."
            disabled={isProcessing}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!ticketText.trim() || isProcessing}
            className={`
              flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
              ${ticketText.trim() && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Try a sample ticket:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSampleTicket('invoice')}
            className="px-3 py-1 text-sm bg-edi-error text-white rounded-full hover:opacity-90 transition-opacity"
          >
            810 Invoice Error
          </button>
          <button
            onClick={() => loadSampleTicket('purchase')}
            className="px-3 py-1 text-sm bg-edi-processing text-white rounded-full hover:opacity-90 transition-opacity"
          >
            850 PO Error
          </button>
          <button
            onClick={() => loadSampleTicket('shipment')}
            className="px-3 py-1 text-sm bg-edi-complete text-white rounded-full hover:opacity-90 transition-opacity"
          >
            856 ASN Error
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Supported Document Types:
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
          <div>• 810 - Invoice</div>
          <div>• 850 - Purchase Order</div>
          <div>• 856 - Ship Notice/ASN</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketInput;