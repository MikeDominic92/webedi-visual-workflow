import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParsedTicket } from '../types';
import { format } from 'date-fns';
import { useWorkflowStore } from '../store/workflowStore';
import CompanyDropdown from './CompanyDropdown';
import TradingPartnerDropdown from './TradingPartnerDropdown';
import { CustomerData } from '../data/customerData';

interface EditableTicketHeaderProps {
  ticket: ParsedTicket;
}

const EditableTicketHeader: React.FC<EditableTicketHeaderProps> = ({ ticket }) => {
  const { updateTicket, setEditMode } = useWorkflowStore();
  const [localTicket, setLocalTicket] = useState<ParsedTicket>(ticket);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(ticket.ticketTitle || '');

  useEffect(() => {
    setLocalTicket(ticket);
    setTempTitle(ticket.ticketTitle || '');
  }, [ticket]);

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

  const handleCompanySelect = (company: CustomerData) => {
    const updates = {
      companyName: company.companyName,
      companyId: company.webTPID,
      customerName: company.contactName,
      email: company.email,
      phoneNumber: company.phone
    };
    
    setLocalTicket({ ...localTicket, ...updates });
  };

  const handleTradingPartnerSelect = (partner: string) => {
    setLocalTicket({ ...localTicket, tradingPartner: partner });
  };

  const handleFieldChange = (field: keyof ParsedTicket, value: string) => {
    setLocalTicket({ ...localTicket, [field]: value });
  };

  const handleTitleSave = () => {
    setLocalTicket({ ...localTicket, ticketTitle: tempTitle });
    setEditingTitle(false);
  };

  const handleSave = () => {
    updateTicket(localTicket);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalTicket(ticket);
    setEditMode(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-lg border-2 border-blue-500 overflow-hidden"
    >
      {/* Edit Mode Banner */}
      <div className="bg-blue-600 px-4 py-2 text-white text-sm font-medium">
        Edit Mode - Make changes and click Save to apply
      </div>

      {/* Header with Ticket Title */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getDocumentTypeColor(localTicket.documentType)}`}>
              {localTicket.documentType}
            </span>
            
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="flex-1 px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempTitle(localTicket.ticketTitle || '');
                    setEditingTitle(false);
                  }}
                  className="px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 border-b border-dashed border-zinc-600"
              >
                {localTicket.ticketTitle || `Ticket #${localTicket.id}`}
              </h2>
            )}
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getActionColor(localTicket.action)}`}>
            {localTicket.action.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Customer Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Company</p>
              <CompanyDropdown
                value={localTicket.companyName}
                onSelect={handleCompanySelect}
                placeholder="Select company..."
              />
            </div>
            
            <div>
              <p className="text-xs text-zinc-500 mb-1">Company ID</p>
              <input
                type="text"
                value={localTicket.companyId || ''}
                onChange={(e) => handleFieldChange('companyId', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <p className="text-xs text-zinc-500 mb-1">Contact Name</p>
              <input
                type="text"
                value={localTicket.customerName || ''}
                onChange={(e) => handleFieldChange('customerName', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <p className="text-xs text-zinc-500 mb-1">Email</p>
              <input
                type="email"
                value={localTicket.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <p className="text-xs text-zinc-500 mb-1">Phone</p>
              <input
                type="text"
                value={localTicket.phoneNumber || ''}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Trading Partner & Integration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Trading Partner</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Partner</p>
              <TradingPartnerDropdown
                value={localTicket.tradingPartner || localTicket.buyer || ''}
                onSelect={handleTradingPartnerSelect}
                placeholder="Select trading partner..."
              />
            </div>
            
            <div>
              <p className="text-xs text-zinc-500 mb-1">Integration Type</p>
              <input
                type="text"
                value={localTicket.integationType || ''}
                onChange={(e) => handleFieldChange('integationType', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., WebEDI, AS2, SFTP"
              />
            </div>
            
            {localTicket.messageIds && localTicket.messageIds.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Message IDs</p>
                <div className="space-y-1 mt-1">
                  {localTicket.messageIds.map((id, index) => (
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
              <p className="text-red-400 font-medium">{localTicket.errorType}</p>
            </div>
            {localTicket.errorCode && (
              <div>
                <p className="text-xs text-zinc-500">Error Code</p>
                <p className="text-white font-mono">{localTicket.errorCode}</p>
              </div>
            )}
            {localTicket.affectedPOs && localTicket.affectedPOs.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Affected POs</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {localTicket.affectedPOs.map((po, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-red-900/20 text-red-400 rounded font-mono">
                      {po}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500">Created</p>
              <p className="text-white">{format(localTicket.timestamp, 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Description */}
      {localTicket.issueDescription && (
        <div className="px-6 pb-6">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Issue Description</h3>
            <textarea
              value={localTicket.issueDescription}
              onChange={(e) => handleFieldChange('issueDescription', e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex justify-end gap-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </motion.div>
  );
};

export default EditableTicketHeader;