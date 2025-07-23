import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { customerDatabase, CustomerData } from '../data/customerData';

interface CompanyDropdownProps {
  value?: string;
  onSelect: (company: CustomerData) => void;
  placeholder?: string;
  className?: string;
}

const CompanyDropdown: React.FC<CompanyDropdownProps> = ({
  value = '',
  onSelect,
  placeholder = 'Select a company...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CustomerData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize selected company based on value prop
  useEffect(() => {
    if (value) {
      const company = customerDatabase.find(c => c.companyName === value || c.webTPID === value);
      if (company) {
        setSelectedCompany(company);
        setSearchTerm(company.companyName);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter companies based on search term
  const filteredCompanies = customerDatabase.filter(company => 
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.webTPID.includes(searchTerm) ||
    company.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (company: CustomerData) => {
    setSelectedCompany(company);
    setSearchTerm(company.companyName);
    setIsOpen(false);
    onSelect(company);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setSelectedCompany(null);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCompany(null);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        />
        
        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Dropdown arrow */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && filteredCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredCompanies.map((company) => (
              <motion.button
                key={company.webTPID}
                onClick={() => handleSelect(company)}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-medium">{company.companyName}</div>
                    <div className="text-zinc-400 text-sm">ID: {company.webTPID}</div>
                    <div className="text-zinc-500 text-xs">{company.contactName}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    company.status === 'Active' ? 'bg-green-900 text-green-300' : 
                    company.status === 'Inactive' ? 'bg-red-900 text-red-300' : 
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {company.status}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && searchTerm && filteredCompanies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md p-4"
        >
          <p className="text-zinc-400 text-sm">No companies found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  );
};

export default CompanyDropdown;