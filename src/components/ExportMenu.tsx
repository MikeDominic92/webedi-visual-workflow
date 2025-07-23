import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportWorkflow, ExportFormat, generateWorkflowReport } from '../utils/exportUtils';
import { useWorkflow, useParsedTicket } from '../store/workflowStore';
import toast from 'react-hot-toast';

interface ExportMenuProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ targetRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const workflow = useWorkflow();
  const ticket = useParsedTicket();

  const handleExport = async (format: ExportFormat) => {
    if (!targetRef.current || !workflow) {
      toast.error('No workflow to export');
      return;
    }

    setIsExporting(true);
    
    try {
      await exportWorkflow(targetRef.current, format, {
        fileName: `webedi-workflow-${ticket?.documentType || 'unknown'}-${Date.now()}`,
        backgroundColor: '#f9fafb',
      });
      
      toast.success(`Workflow exported as ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = () => {
    const report = generateWorkflowReport(ticket, workflow);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (!workflow) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        disabled={isExporting}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {isExporting ? 'Exporting...' : 'Export'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-700 px-3 py-2">
                  Export Options
                </h3>
                
                <button
                  onClick={() => handleExport('png')}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Export as PNG</span>
                </button>
                
                <button
                  onClick={() => handleExport('svg')}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Export as SVG</span>
                </button>
                
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Export as PDF</span>
                </button>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <button
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Report (TXT)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;