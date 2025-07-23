// src/components/TicketInfoHeader.tsx

import React from 'react';
import { ParsedTicket } from '../types';

interface TicketInfoHeaderProps {
  ticket: ParsedTicket | null;
}

const TicketInfoHeader: React.FC<TicketInfoHeaderProps> = ({ ticket }) => {
  if (!ticket) return null;

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-6">
      {/* Primary Information Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Company Information */}
        <div className="bg-black rounded-lg p-4 border border-zinc-700">
          <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            Customer Information
          </h3>
          <div className="space-y-1">
            <p className="text-lg font-bold text-white">
              {ticket.supplier || 'Unknown Company'}
            </p>
            {ticket.webediId && (
              <p className="text-sm text-zinc-400">
                Company ID: <span className="font-mono font-semibold text-white">{ticket.webediId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Trading Partner */}
        <div className="bg-black rounded-lg p-4 border border-zinc-700">
          <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            Trading Partner
          </h3>
          <p className="text-lg font-bold text-white">
            {ticket.tradingPartner || ticket.buyer || 'Unknown Partner'}
          </p>
          {ticket.integationType && (
            <p className="text-sm text-zinc-400">
              Integration: <span className="font-semibold text-white">{ticket.integationType}</span>
            </p>
          )}
        </div>

        {/* Document Information */}
        <div className="bg-black rounded-lg p-4 border border-zinc-700">
          <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            Document Details
          </h3>
          <div className="space-y-1">
            <p className="text-lg font-bold text-white">
              {getDocumentTypeName(ticket.documentType)}
            </p>
            {ticket.affectedPOs && ticket.affectedPOs.length > 0 && (
              <p className="text-sm text-zinc-400">
                Documents: <span className="font-semibold text-white">{ticket.affectedPOs.join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-black rounded-lg p-4 border border-red-900/50">
        <h3 className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">
          Issue Description
        </h3>
        <div className="space-y-2">
          <p className="text-base font-semibold text-white">
            {getErrorDescription(ticket.errorType)}
          </p>
          {ticket.errorCode && (
            <p className="text-sm text-zinc-400">
              Error Code: <span className="font-mono bg-red-900/30 text-red-400 px-2 py-1 rounded">{ticket.errorCode}</span>
            </p>
          )}
          {ticket.controlNumber && (
            <p className="text-sm text-zinc-400">
              Control Number: <span className="font-mono text-white">{ticket.controlNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* Additional Metadata */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
          Ticket ID: {ticket.id}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
          Action: {ticket.action}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
          {new Date(ticket.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// Helper functions
function getDocumentTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    '810': '810 Invoice',
    '850': '850 Purchase Order',
    '856': '856 Advance Ship Notice',
    '855': '855 PO Acknowledgment',
    '997': '997 Functional Acknowledgment'
  };
  return typeNames[type] || type;
}

function getErrorDescription(errorType: string): string {
  const descriptions: Record<string, string> = {
    'DUPLICATE_INVOICE': 'Duplicate Invoice Detected',
    'PRICE_MISMATCH': 'Price Mismatch Error',
    'INVALID_PO': 'Invalid Purchase Order',
    'INVALID_ITEM': 'Invalid Item Code',
    'QUANTITY_EXCEEDED': 'Quantity Limit Exceeded',
    'INVALID_TRACKING': 'Invalid Tracking Information',
    'SHIPMENT_MISMATCH': 'Shipment Does Not Match PO',
    'VIDEO_ANALYSIS': 'Manual Review Required - Video Analysis',
    'UNKNOWN_ERROR': 'Unknown Error Type'
  };
  return descriptions[errorType] || errorType;
}

export default TicketInfoHeader;