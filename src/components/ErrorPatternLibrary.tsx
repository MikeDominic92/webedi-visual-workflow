import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { errorPatterns, ErrorPattern } from '../data/errorPatterns';

interface ErrorPatternLibraryProps {
  onSelectError?: (pattern: ErrorPattern) => void;
  currentErrorType?: string;
}

const ErrorPatternLibrary: React.FC<ErrorPatternLibraryProps> = ({ 
  onSelectError,
  currentErrorType 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  const filteredPatterns = useMemo(() => {
    return errorPatterns.filter(pattern => {
      const matchesSearch = searchTerm === '' || 
        pattern.errorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pattern.errorCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pattern.commonCauses.some(cause => cause.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSeverity = selectedSeverity === 'all' || pattern.severity === selectedSeverity;
      const matchesDocType = selectedDocType === 'all' || pattern.documentTypes.includes(selectedDocType);
      
      return matchesSearch && matchesSeverity && matchesDocType;
    });
  }, [searchTerm, selectedSeverity, selectedDocType]);

  const uniqueDocTypes = useMemo(() => {
    const types = new Set<string>();
    errorPatterns.forEach(pattern => {
      pattern.documentTypes.forEach(type => types.add(type));
    });
    return Array.from(types).sort();
  }, []);

  const getSeverityColor = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityIcon = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Pattern Library</h2>
        <p className="text-gray-600">
          Browse common EDI errors and their resolution steps
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search errors, codes, or causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Documents</option>
            {uniqueDocTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {currentErrorType && (
            <button
              onClick={() => setSearchTerm(currentErrorType)}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              Show Current Error
            </button>
          )}
        </div>
      </div>

      {/* Error Patterns List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {filteredPatterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                expandedPattern === pattern.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              } ${currentErrorType && pattern.errorType.toLowerCase().includes(currentErrorType.toLowerCase()) 
                ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {pattern.errorType}
                    </h3>
                    {pattern.errorCode && (
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                        {pattern.errorCode}
                      </code>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(pattern.severity)}`}>
                      <span className="mr-1">{getSeverityIcon(pattern.severity)}</span>
                      {pattern.severity}
                    </span>
                    <span className="text-gray-600">
                      Frequency: {pattern.frequency}%
                    </span>
                    <span className="text-gray-600">
                      Est. Time: {pattern.estimatedTime}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {pattern.documentTypes.map(docType => (
                      <span
                        key={docType}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {docType}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: expandedPattern === pattern.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedPattern === pattern.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Common Causes</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {pattern.commonCauses.map((cause, index) => (
                            <li key={index}>{cause}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Resolution Steps</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                          {pattern.resolutionSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Prevention Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {pattern.preventionTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {onSelectError && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectError(pattern);
                          }}
                          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Apply This Solution
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPatterns.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gray-600">No error patterns found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPatternLibrary;