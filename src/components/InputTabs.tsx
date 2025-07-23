import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TicketInput from './TicketInput';
import FileUploadInput from './FileUploadInput';

type TabType = 'text' | 'file';

const InputTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('text');

  const tabs = [
    { id: 'text' as TabType, label: 'Text Input', icon: '📝' },
    { id: 'file' as TabType, label: 'File Upload', icon: '📁' }
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-1 flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md
              font-medium transition-all duration-200 relative
              ${activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-zinc-800 rounded-md -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'text' ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <TicketInput />
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <FileUploadInput />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-400">
        <p className="font-medium mb-1 text-zinc-300">💡 Pro Tip:</p>
        <p>
          {activeTab === 'text' 
            ? 'Paste EDI ticket text directly or use sample tickets to see how the workflow visualization works.'
            : 'Upload PDFs, images (screenshots), CSV files, or even videos. We\'ll extract the text automatically using OCR technology.'
          }
        </p>
      </div>
    </div>
  );
};

export default InputTabs;