import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '../store/workflowStore';
import { FileProcessorFactory } from '../utils/fileProcessors';
import { validateFile } from '../utils/fileTypeDetector';

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  extractedText?: string;
  error?: string;
}

const ACCEPTED_FILE_TYPES = {
  'text/plain': ['.txt', '.log', '.edi'],
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
  'text/csv': ['.csv'],
  'application/xml': ['.xml'],
  'application/json': ['.json'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileUploadInput: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { isProcessing, parseTicket } = useWorkflowStore();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}`,
      status: 'pending' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      const { file, errors } = rejection;
      const errorMessages = errors.map((e: any) => e.message).join(', ');
      console.error(`File ${file.name} rejected: ${errorMessages}`);
    });

    // Start processing files
    newFiles.forEach(uploadedFile => {
      processFile(uploadedFile);
    });
  }, []);

  const processFile = async (uploadedFile: UploadedFile) => {
    // Update status to processing
    updateFileStatus(uploadedFile.id, 'processing', 10);

    try {
      // Validate file
      const validation = validateFile(uploadedFile.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update progress
      updateFileStatus(uploadedFile.id, 'processing', 30);
      
      // Process file using appropriate processor
      const result = await FileProcessorFactory.processFile(uploadedFile.file);
      
      // Update progress
      updateFileStatus(uploadedFile.id, 'processing', 80);
      
      if (result.success && result.text) {
        // Update to success
        updateFileStatus(uploadedFile.id, 'success', 100, result.text);
      } else {
        throw new Error(result.error || 'Failed to extract text from file');
      }
    } catch (error) {
      updateFileStatus(uploadedFile.id, 'error', 0, undefined, error instanceof Error ? error.message : 'Processing failed');
    }
  };

  const updateFileStatus = (
    fileId: string, 
    status: UploadedFile['status'], 
    progress: number,
    extractedText?: string,
    error?: string
  ) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status, progress, extractedText, error }
        : f
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: isProcessing,
    multiple: true
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📄';
    } else if (file.type.startsWith('video/')) {
      return '🎬';
    } else if (file.type === 'text/csv') {
      return '📊';
    } else if (file.type === 'application/xml') {
      return '📋';
    } else {
      return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Upload EDI Files
      </h2>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-gray-700 font-medium">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here, or click to select'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports: PDF, Images (PNG, JPG), Text files, CSV, XML, Videos (MP4)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-700">Uploaded Files</h3>
            
            {uploadedFiles.map(uploadedFile => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getFileIcon(uploadedFile.file)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {uploadedFile.status === 'processing' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-blue-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadedFile.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Processing...</p>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {uploadedFile.status === 'success' && uploadedFile.extractedText && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Text extracted successfully
                          </p>
                          <button
                            onClick={() => {
                              if (uploadedFile.extractedText) {
                                console.log('Use This Text clicked');
                                console.log('Extracted text preview:', uploadedFile.extractedText.substring(0, 500));
                                console.log('Full text length:', uploadedFile.extractedText.length);
                                parseTicket(uploadedFile.extractedText);
                              }
                            }}
                            disabled={isProcessing}
                            className={`mt-2 text-xs px-3 py-1 rounded transition-colors ${
                              isProcessing 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isProcessing ? 'Processing...' : 'Use This Text'}
                          </button>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {uploadedFile.status === 'error' && uploadedFile.error && (
                        <p className="text-xs text-red-600 mt-2">
                          Error: {uploadedFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported Formats Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Supported File Formats:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>• PDF Documents</div>
          <div>• Images (PNG, JPG, etc.)</div>
          <div>• Text Files (.txt, .edi)</div>
          <div>• CSV Files</div>
          <div>• XML Documents</div>
          <div>• Videos (MP4, MOV)</div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploadInput;