import React from 'react';
import { motion } from 'framer-motion';
import { ParsedTicket } from '../types';
import { format } from 'date-fns';

interface TicketInfoHeaderProps {
  ticket: ParsedTicket;
}

const TicketInfoHeader: React.FC<TicketInfoHeaderProps> = ({ ticket }) => {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case '810': return 'bg-red-600';
      case '850': return 'bg-amber-600';
      case '856': return 'bg-emerald-600';
      case '855': return 'bg-blue-600';
      case '997': return 'bg-purple-600';
      default: return 'bg-zinc-600';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'rejection': return 'text-red-400 bg-red-400/10';
      case 'acceptance': return 'text-green-400 bg-green-400/10';
      case 'modification': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
    >
      {/* Header with Ticket Title */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getDocumentTypeColor(ticket.documentType)}`}>
              {ticket.documentType}
            </span>
            <h2 className="text-xl font-bold text-white">
              {ticket.ticketTitle || `Ticket #${ticket.id}`}
            </h2>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getActionColor(ticket.action)}`}>
            {ticket.action.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Customer Information</h3>
          <div className="space-y-3">
            {ticket.companyName && (
              <div>
                <p className="text-xs text-zinc-500">Company</p>
                <p className="text-white font-medium">{ticket.companyName}</p>
              </div>
            )}
            {ticket.companyId && (
              <div>
                <p className="text-xs text-zinc-500">Company ID</p>
                <p className="text-white font-mono">{ticket.companyId}</p>
              </div>
            )}
            {ticket.customerName && (
              <div>
                <p className="text-xs text-zinc-500">Contact</p>
                <p className="text-white">
                  {ticket.personOnPhone && ticket.callerOnRecord ? (
                    <>
                      <span className="font-medium">{ticket.personOnPhone}</span>
                      <span className="text-zinc-400"> (on phone)</span>
                      <br />
                      <span className="text-sm text-zinc-400">Caller on record: {ticket.callerOnRecord}</span>
                    </>
                  ) : (
                    ticket.customerName
                  )}
                </p>
              </div>
            )}
            {ticket.email && (
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <a href={`mailto:${ticket.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                  {ticket.email}
                </a>
              </div>
            )}
            {ticket.phoneNumber && (
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-white">{ticket.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Trading Partner & Integration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Trading Partner</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Partner</p>
              <p className="text-white font-medium">{ticket.tradingPartner || ticket.buyer || 'N/A'}</p>
            </div>
            {ticket.integationType && (
              <div>
                <p className="text-xs text-zinc-500">Integration Type</p>
                <p className="text-white">{ticket.integationType}</p>
              </div>
            )}
            {ticket.documentTypes && ticket.documentTypes.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Document Types</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ticket.documentTypes.map((type, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ticket.messageIds && ticket.messageIds.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Message IDs</p>
                <div className="space-y-1 mt-1">
                  {ticket.messageIds.map((id, index) => (
                    <p key={index} className="text-sm text-white font-mono">{id}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Issue Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Error Type</p>
              <p className="text-red-400 font-medium">{ticket.errorType}</p>
            </div>
            {ticket.errorCode && (
              <div>
                <p className="text-xs text-zinc-500">Error Code</p>
                <p className="text-white font-mono">{ticket.errorCode}</p>
              </div>
            )}
            {ticket.errorDate && (
              <div>
                <p className="text-xs text-zinc-500">Error Since</p>
                <p className="text-white">{format(ticket.errorDate, 'MMM d, yyyy')}</p>
              </div>
            )}
            {ticket.affectedPOs && ticket.affectedPOs.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Affected POs</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ticket.affectedPOs.map((po, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-red-900/20 text-red-400 rounded font-mono">
                      {po}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500">Created</p>
              <p className="text-white">{format(ticket.timestamp, 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Description */}
      {ticket.issueDescription && (
        <div className="px-6 pb-6">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Issue Description</h3>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{ticket.issueDescription}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TicketInfoHeader;