import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecentTickets, useWorkflowStore } from '../store/workflowStore';
import { Ticket } from '../lib/supabase';
import { format } from 'date-fns';

interface RecentTicketsProps {
  onLoadTicket?: (ticketText: string) => void;
}

const RecentTickets: React.FC<RecentTicketsProps> = ({ onLoadTicket }) => {
  const recentTickets = useRecentTickets();
  const loadRecentTickets = useWorkflowStore(state => state.loadRecentTickets);

  useEffect(() => {
    loadRecentTickets();
  }, []);

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

  const handleLoadTicket = (ticket: Ticket) => {
    if (onLoadTicket && ticket.raw_text) {
      onLoadTicket(ticket.raw_text);
    }
  };

  if (recentTickets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mt-4"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Tickets</h3>
      
      <div className="space-y-2">
        {recentTickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            className="bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors cursor-pointer"
            whileHover={{ scale: 1.01 }}
            onClick={() => handleLoadTicket(ticket)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full text-white ${getDocumentTypeColor(ticket.document_type)}`}>
                  {ticket.document_type}
                </span>
                <span className="text-white text-sm">{ticket.buyer || ticket.supplier}</span>
              </div>
              <span className="text-zinc-400 text-xs">
                {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1 truncate">{ticket.error_type}</p>
          </motion.div>
        ))}
      </div>
      
      <p className="text-zinc-500 text-xs mt-3 text-center">
        Click a ticket to load it
      </p>
    </motion.div>
  );
};

export default RecentTickets;