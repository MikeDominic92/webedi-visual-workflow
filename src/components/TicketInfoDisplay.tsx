import React from 'react';
import { motion } from 'framer-motion';
import { ParsedTicket } from '../types';

interface TicketInfoDisplayProps {
  ticket: ParsedTicket;
}

interface InfoBoxProps {
  label: string;
  value: string | string[] | undefined;
  icon?: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ label, value, icon, className = '' }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-stealth-800/50 backdrop-blur-sm border border-stealth-600/50 rounded-lg p-4 hover:bg-stealth-800/70 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 bg-stealth-700/50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stealth-200 uppercase tracking-wider mb-1">{label}</p>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2">
              {value.map((item, index) => (
                <span key={index} className="px-2 py-1 bg-stealth-700/50 rounded text-sm text-white">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white font-medium break-words">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TicketInfoDisplay: React.FC<TicketInfoDisplayProps> = ({ ticket }) => {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case '810': return 'text-doc-810';
      case '850': return 'text-doc-850';
      case '856': return 'text-doc-856';
      default: return 'text-white';
    }
  };

  const getErrorTypeColor = (type: string) => {
    if (type.toLowerCase().includes('error')) return 'text-status-error';
    if (type.toLowerCase().includes('warning')) return 'text-status-warning';
    return 'text-status-info';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stealth-800/50 backdrop-blur-sm border border-stealth-600/50 rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {ticket.ticketTitle || `${ticket.companyId || ''} ${ticket.companyName || ''} - ${ticket.errorType}`}
        </h2>
        <p className="text-stealth-200">
          {ticket.issueDescription}
        </p>
      </motion.div>

      {/* Customer Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoBox
            label="Customer Name"
            value={ticket.customerName}
            icon={
              <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <InfoBox
            label="Company Name"
            value={ticket.companyName}
            icon={
              <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <InfoBox
            label="Company ID"
            value={ticket.companyId}
            icon={
              <svg className="w-4 h-4 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
          />
          <InfoBox
            label="Phone Number"
            value={ticket.phoneNumber}
            icon={
              <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
          <InfoBox
            label="Email"
            value={ticket.email}
            icon={
              <svg className="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Trading Partner & Document Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Document & Trading Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoBox
            label="Trading Partner"
            value={ticket.tradingPartner}
            icon={
              <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <InfoBox
            label="Document Type"
            value={ticket.documentType}
            className={getDocumentTypeColor(ticket.documentType)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <InfoBox
            label="Integration Type"
            value={ticket.integationType}
            icon={
              <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <InfoBox
            label="Supplier"
            value={ticket.supplier}
            icon={
              <svg className="w-4 h-4 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          <InfoBox
            label="Buyer"
            value={ticket.buyer}
            icon={
              <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Error & Issue Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error & Issue Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBox
            label="Error Type"
            value={ticket.errorType}
            className={getErrorTypeColor(ticket.errorType)}
            icon={
              <svg className="w-4 h-4 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <InfoBox
            label="Error Code"
            value={ticket.errorCode}
            icon={
              <svg className="w-4 h-4 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
          />
          <InfoBox
            label="Priority"
            value={ticket.priority}
            icon={
              <svg className="w-4 h-4 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <InfoBox
            label="Action Required"
            value={ticket.action}
            icon={
              <svg className="w-4 h-4 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Message IDs & Affected POs Section */}
      {(ticket.messageIds?.length > 0 || ticket.affectedPOs?.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Reference Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticket.messageIds?.length > 0 && (
              <InfoBox
                label="Message IDs / Control Numbers"
                value={ticket.messageIds}
                icon={
                  <svg className="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                }
              />
            )}
            {ticket.affectedPOs?.length > 0 && (
              <InfoBox
                label="Affected PO Numbers"
                value={ticket.affectedPOs}
                icon={
                  <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-stealth-200"
      >
        <p>Ticket processed at {new Date(ticket.timestamp).toLocaleString()}</p>
      </motion.div>
    </div>
  );
};

export default TicketInfoDisplay;