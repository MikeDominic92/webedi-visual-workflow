import React from 'react';
import { motion } from 'framer-motion';

interface CustomerInfoBadgeProps {
  companyName?: string;
  companyId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

const CustomerInfoBadge: React.FC<CustomerInfoBadgeProps> = ({
  companyName,
  companyId,
  customerName,
  email,
  phone,
  status
}) => {
  if (!companyName && !companyId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-300">Customer Information</h3>
        {status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'Active' ? 'bg-green-900 text-green-300' : 
            status === 'Inactive' ? 'bg-red-900 text-red-300' : 
            'bg-yellow-900 text-yellow-300'
          }`}>
            {status}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        {companyName && (
          <div>
            <span className="text-zinc-500">Company:</span>
            <span className="ml-2 text-zinc-300">{companyName}</span>
          </div>
        )}
        
        {companyId && (
          <div>
            <span className="text-zinc-500">ID:</span>
            <span className="ml-2 text-zinc-300">{companyId}</span>
          </div>
        )}
        
        {customerName && (
          <div>
            <span className="text-zinc-500">Contact:</span>
            <span className="ml-2 text-zinc-300">{customerName}</span>
          </div>
        )}
        
        {email && (
          <div>
            <span className="text-zinc-500">Email:</span>
            <span className="ml-2 text-zinc-300 text-xs">{email}</span>
          </div>
        )}
        
        {phone && (
          <div>
            <span className="text-zinc-500">Phone:</span>
            <span className="ml-2 text-zinc-300">{phone}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-zinc-500">
        <span className="inline-flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Data from local customer database
        </span>
      </div>
    </motion.div>
  );
};

export default CustomerInfoBadge;