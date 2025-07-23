// src/App.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputTabs from './components/InputTabs';
import SubwayMapVisualizer from './components/SubwayMapVisualizer';
import ExportMenu from './components/ExportMenu';
import ErrorPatternLibrary from './components/ErrorPatternLibrary';
import TicketInfoHeader from './components/TicketInfoHeader';
import CustomerSearch from './components/CustomerSearch';
import CustomerProfile from './components/CustomerProfile';
import RecentTickets from './components/RecentTickets';
import CustomerInfoBadge from './components/CustomerInfoBadge';
import { useWorkflow, useParsedTicket, useWorkflowError, useWorkflowStore } from './store/workflowStore';
import { Company, Ticket } from './lib/supabase';
import { isSupabaseConfigured } from './lib/supabase';
import AIStatusIndicator from './components/AIStatusIndicator';
import { LocalCustomerService } from './services/localCustomerService';
import { useCustomerData } from './hooks/useCustomerData';

const TicketDetails: React.FC = () => {
  const ticket = useParsedTicket();
  
  if (!ticket) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ticket Analysis
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Document Type:</span>
          <span className="font-medium">{ticket.documentType}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Supplier:</span>
          <span className="font-medium">{ticket.supplier}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Buyer:</span>
          <span className="font-medium">{ticket.buyer}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Error Type:</span>
          <span className="font-medium text-red-600">{ticket.errorType}</span>
        </div>
        
        {ticket.errorCode && (
          <div className="flex justify-between">
            <span className="text-gray-600">Error Code:</span>
            <span className="font-medium">{ticket.errorCode}</span>
          </div>
        )}
        
        {ticket.affectedPOs.length > 0 && (
          <div>
            <span className="text-gray-600">Affected POs:</span>
            <div className="mt-1">
              {ticket.affectedPOs.map((po, index) => (
                <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mt-1">
                  {po}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function App() {
  const workflow = useWorkflow();
  const ticket = useParsedTicket();
  const error = useWorkflowError();
  const workflowRef = useRef<HTMLDivElement>(null);
  const [showErrorLibrary, setShowErrorLibrary] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const { parseTicket } = useWorkflowStore();
  
  // Get customer data for the current ticket
  const { customerData } = useCustomerData(ticket?.companyName || ticket?.companyId);

  useEffect(() => {
    if (workflow) {
      console.log('Workflow Generated:', {
        documentType: workflow.metadata.documentType,
        confidence: workflow.metadata.confidence,
        nodeCount: workflow.nodes.length,
        generationTime: workflow.metadata.generatedAt
      });
    }
  }, [workflow]);

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                WebEDI Visual Workflow
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Transform EDI tickets into intuitive subway map visualizations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isSupabaseConfigured() && (
                <div className="w-64">
                  <CustomerSearch onSelectCompany={(company) => {
                    setSelectedCompany(company);
                    setShowCustomerProfile(true);
                  }} />
                </div>
              )}
              <button
                onClick={() => setShowErrorLibrary(!showErrorLibrary)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  showErrorLibrary 
                    ? 'bg-white text-black' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Error Library</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Info Header - Always visible when ticket exists */}
        <AnimatePresence>
          {ticket && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TicketInfoHeader ticket={ticket} />
              
              {/* Customer Info Badge - Show if customer data is available */}
              {(ticket.companyId || ticket.companyName) && (
                <div className="mt-4">
                  <CustomerInfoBadge
                    companyName={ticket.companyName}
                    companyId={ticket.companyId}
                    customerName={ticket.customerName || ticket.callerOnRecord}
                    email={ticket.email}
                    phone={ticket.phoneNumber}
                    status={customerData?.status}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1">
            <InputTabs />
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 bg-red-900/20 border border-red-900/50 rounded-lg p-4"
                >
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-400">Error Processing File</h3>
                      <p className="text-sm text-red-300 mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {isSupabaseConfigured() && (
              <RecentTickets onLoadTicket={(ticketText) => parseTicket(ticketText)} />
            )}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {workflow ? (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 h-[700px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      Workflow Process Flow
                    </h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-zinc-400">
                          Confidence: {Math.round(workflow.metadata.confidence * 100)}%
                        </span>
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${workflow.metadata.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                      <ExportMenu targetRef={workflowRef} />
                    </div>
                  </div>
                  
                  <div ref={workflowRef} className="h-[calc(100%-3rem)]">
                    <SubwayMapVisualizer
                      nodes={workflow.nodes}
                      edges={workflow.edges}
                      onNodeClick={(node) => {
                        console.log('Node clicked:', node);
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 h-[700px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 18l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m0 18V2"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-white">
                      No Workflow Generated
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Paste an EDI ticket or upload a file to visualize its workflow
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Error Pattern Library Modal */}
      <AnimatePresence>
        {showErrorLibrary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowErrorLibrary(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 bottom-20 max-w-4xl mx-auto z-50"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setShowErrorLibrary(false)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <ErrorPatternLibrary 
                  currentErrorType={ticket?.errorType}
                  onSelectError={(pattern) => {
                    console.log('Selected pattern:', pattern);
                    setShowErrorLibrary(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {showCustomerProfile && selectedCompany && (
          <CustomerProfile
            company={selectedCompany}
            onClose={() => {
              setShowCustomerProfile(false);
              setSelectedCompany(null);
            }}
            onLoadTicket={(ticket) => {
              if (ticket.raw_text) {
                parseTicket(ticket.raw_text);
                setShowCustomerProfile(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      <footer className="mt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-600">
            Phase 1 MVP • React Flow + TypeScript • Subway Map Visualization
          </p>
        </div>
      </footer>
      
      <AIStatusIndicator />
    </div>
  );
}

export default App;