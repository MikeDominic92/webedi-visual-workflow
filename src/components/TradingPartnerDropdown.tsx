import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Common trading partners
const TRADING_PARTNERS = [
  'Walmart',
  'Target',
  'Amazon',
  'Costco',
  'Kroger',
  'Home Depot',
  'Lowes',
  'CVS',
  'Walgreens',
  'Best Buy',
  'Chewy.com',
  'PetSmart',
  'Petco',
  'Macys',
  'Nordstrom',
  'Kohls',
  'Albertsons',
  'Safeway',
  'Publix',
  'HEB',
  'Whole Foods',
  'Trader Joes',
  'BJs Wholesale',
  '7-Eleven',
  'Dollar General',
  'Family Dollar',
  'Rite Aid',
  'Office Depot',
  'Staples',
  'Michaels',
  'Hobby Lobby',
  'IKEA',
  'Wayfair',
  'Williams-Sonoma',
  'Crate & Barrel',
  'Pottery Barn',
  'GameStop',
  'Barnes & Noble',
  'Dicks Sporting Goods',
  'Academy Sports',
  'Bass Pro Shops',
  'Cabelas',
  'REI',
  'Patagonia',
  'Nike',
  'Adidas',
  'Under Armour'
].sort();

interface TradingPartnerDropdownProps {
  value?: string;
  onSelect: (partner: string) => void;
  placeholder?: string;
  className?: string;
}

const TradingPartnerDropdown: React.FC<TradingPartnerDropdownProps> = ({
  value = '',
  onSelect,
  placeholder = 'Select trading partner...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [customPartner, setCustomPartner] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
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

  // Filter partners based on search term
  const filteredPartners = TRADING_PARTNERS.filter(partner => 
    partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Include custom partner option if search term doesn't match existing partners
  const showCustomOption = searchTerm && 
    !TRADING_PARTNERS.some(p => p.toLowerCase() === searchTerm.toLowerCase()) &&
    filteredPartners.length === 0;

  const handleSelect = (partner: string) => {
    setSearchTerm(partner);
    setIsOpen(false);
    onSelect(partner);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleCustomPartner = () => {
    handleSelect(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    onSelect('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <input
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
        {isOpen && (filteredPartners.length > 0 || showCustomOption) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {showCustomOption && (
              <motion.button
                onClick={handleCustomPartner}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800"
                whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-white">Add "{searchTerm}" as custom partner</span>
                </div>
              </motion.button>
            )}
            
            {filteredPartners.map((partner) => (
              <motion.button
                key={partner}
                onClick={() => handleSelect(partner)}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              >
                <div className="text-white">{partner}</div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && searchTerm && filteredPartners.length === 0 && !showCustomOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md p-4"
        >
          <p className="text-zinc-400 text-sm">No trading partners found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  );
};

export default TradingPartnerDropdown;