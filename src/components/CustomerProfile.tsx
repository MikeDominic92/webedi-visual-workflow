import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TicketService } from '../services/ticketService';
import { Company, Ticket, CustomerProfile as CustomerProfileData } from '../lib/supabase';
import { format } from 'date-fns';

interface CustomerProfileProps {
  company: Company;
  onClose: () => void;
  onLoadTicket?: (ticket: Ticket) => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ company, onClose, onLoadTicket }) => {
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      const [profileData, ticketsData] = await Promise.all([
        TicketService.getCustomerProfile(company.id),
        TicketService.getCompanyTickets(company.id)
      ]);
      setProfile(profileData);
      setTickets(ticketsData);
      setLoading(false);
    };

    loadProfileData();
  }, [company.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400';
      case 'open': return 'text-amber-400';
      case 'pending': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-lg border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">{company.name}</h2>
              {company.edi_id && (
                <p className="text-zinc-400 mt-1">EDI ID: {company.edi_id}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="mt-4">
              <div className="animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
          ) : profile && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Total Tickets</p>
                <p className="text-2xl font-bold text-white">{profile.total_tickets}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{profile.resolved_tickets}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Open</p>
                <p className="text-2xl font-bold text-amber-400">{profile.open_tickets}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Avg Resolution</p>
                <p className="text-2xl font-bold text-white">
                  {profile.avg_resolution_time ? `${Math.round(profile.avg_resolution_time)}m` : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Ticket History</h3>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-zinc-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => onLoadTicket?.(ticket)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getDocumentTypeColor(ticket.document_type)}`}>
                          {ticket.document_type}
                        </span>
                        <span className={`font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white mt-2">{ticket.error_type}</p>
                      {ticket.affected_pos.length > 0 && (
                        <p className="text-zinc-400 text-sm mt-1">
                          POs: {ticket.affected_pos.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-sm">
                        {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {format(new Date(ticket.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  {ticket.resolution && (
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                      <p className="text-zinc-400 text-sm">Resolution: {ticket.resolution}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-8">No tickets found for this customer</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomerProfile;