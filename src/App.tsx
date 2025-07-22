// src/App.tsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TicketInput from './components/TicketInput';
import SubwayMapVisualizer from './components/SubwayMapVisualizer';
import { useWorkflow, useParsedTicket } from './store/workflowStore';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WebEDI Visual Workflow
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Transform EDI tickets into intuitive subway map visualizations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TicketInput />
            
            <AnimatePresence>
              {ticket && (
                <div className="mt-6">
                  <TicketDetails />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {workflow ? (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-lg shadow-lg p-6 h-[600px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Workflow Visualization
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Confidence: {Math.round(workflow.metadata.confidence * 100)}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${workflow.metadata.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[calc(100%-3rem)]">
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
                  className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-300"
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
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No Workflow Generated
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Paste an EDI ticket to visualize its workflow
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="mt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Phase 1 MVP • React Flow + TypeScript • Subway Map Visualization
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;