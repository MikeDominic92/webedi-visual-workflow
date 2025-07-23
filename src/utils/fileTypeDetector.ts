import { fileTypeFromBuffer } from 'file-type';
import { filetypeinfo } from 'magic-bytes.js';

export type SupportedFileType = 
  | 'pdf'
  | 'image'
  | 'text'
  | 'csv'
  | 'xml'
  | 'json'
  | 'video'
  | 'edi'
  | 'unknown';

export interface FileTypeInfo {
  type: SupportedFileType;
  mimeType: string;
  extension: string;
  canProcess: boolean;
  processor?: string;
}

// Map MIME types to our supported file types
const MIME_TYPE_MAP: Record<string, SupportedFileType> = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/bmp': 'image',
  'text/plain': 'text',
  'text/csv': 'csv',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/json': 'json',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
};

// EDI file patterns
const EDI_PATTERNS = [
  /^ISA\*/,  // X12 EDI
  /^UNB\+/,  // EDIFACT
  /^ST\*/,   // X12 Transaction Set
  /^BGN\*/,  // Beginning segment
];

export async function detectFileType(file: File): Promise<FileTypeInfo> {
  try {
    // First, try to detect by file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Check for EDI extensions
    if (['edi', 'x12', '850', '810', '856'].includes(extension)) {
      return {
        type: 'edi',
        mimeType: 'text/plain',
        extension,
        canProcess: true,
        processor: 'TextProcessor'
      };
    }

    // Try to detect by MIME type
    if (file.type && MIME_TYPE_MAP[file.type]) {
      return {
        type: MIME_TYPE_MAP[file.type],
        mimeType: file.type,
        extension,
        canProcess: true,
        processor: getProcessorForType(MIME_TYPE_MAP[file.type])
      };
    }

    // Read file buffer for magic bytes detection
    const buffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(buffer);
    
    // Use file-type library for detection
    const detectedType = await fileTypeFromBuffer(uint8Array);
    
    if (detectedType && MIME_TYPE_MAP[detectedType.mime]) {
      return {
        type: MIME_TYPE_MAP[detectedType.mime],
        mimeType: detectedType.mime,
        extension: detectedType.ext,
        canProcess: true,
        processor: getProcessorForType(MIME_TYPE_MAP[detectedType.mime])
      };
    }

    // Check for EDI patterns in text files
    if (await isEDIFile(file)) {
      return {
        type: 'edi',
        mimeType: 'text/plain',
        extension: extension || 'edi',
        canProcess: true,
        processor: 'TextProcessor'
      };
    }

    // Fallback to extension-based detection
    const typeByExtension = getTypeByExtension(extension);
    if (typeByExtension) {
      return typeByExtension;
    }

    // Unknown file type
    return {
      type: 'unknown',
      mimeType: file.type || 'application/octet-stream',
      extension,
      canProcess: false
    };

  } catch (error) {
    console.error('Error detecting file type:', error);
    return {
      type: 'unknown',
      mimeType: file.type || 'application/octet-stream',
      extension: '',
      canProcess: false
    };
  }
}

function getProcessorForType(type: SupportedFileType): string {
  switch (type) {
    case 'pdf':
      return 'PDFProcessor';
    case 'image':
      return 'ImageProcessor';
    case 'text':
    case 'edi':
      return 'TextProcessor';
    case 'csv':
      return 'CSVProcessor';
    case 'xml':
      return 'XMLProcessor';
    case 'json':
      return 'JSONProcessor';
    case 'video':
      return 'VideoProcessor';
    default:
      return 'UnknownProcessor';
  }
}

function getTypeByExtension(extension: string): FileTypeInfo | null {
  const extensionMap: Record<string, FileTypeInfo> = {
    'txt': { type: 'text', mimeType: 'text/plain', extension, canProcess: true, processor: 'TextProcessor' },
    'log': { type: 'text', mimeType: 'text/plain', extension, canProcess: true, processor: 'TextProcessor' },
    'csv': { type: 'csv', mimeType: 'text/csv', extension, canProcess: true, processor: 'CSVProcessor' },
    'xml': { type: 'xml', mimeType: 'application/xml', extension, canProcess: true, processor: 'XMLProcessor' },
    'json': { type: 'json', mimeType: 'application/json', extension, canProcess: true, processor: 'JSONProcessor' },
    'pdf': { type: 'pdf', mimeType: 'application/pdf', extension, canProcess: true, processor: 'PDFProcessor' },
    'png': { type: 'image', mimeType: 'image/png', extension, canProcess: true, processor: 'ImageProcessor' },
    'jpg': { type: 'image', mimeType: 'image/jpeg', extension, canProcess: true, processor: 'ImageProcessor' },
    'jpeg': { type: 'image', mimeType: 'image/jpeg', extension, canProcess: true, processor: 'ImageProcessor' },
    'gif': { type: 'image', mimeType: 'image/gif', extension, canProcess: true, processor: 'ImageProcessor' },
    'mp4': { type: 'video', mimeType: 'video/mp4', extension, canProcess: true, processor: 'VideoProcessor' },
    'mov': { type: 'video', mimeType: 'video/quicktime', extension, canProcess: true, processor: 'VideoProcessor' },
    'avi': { type: 'video', mimeType: 'video/x-msvideo', extension, canProcess: true, processor: 'VideoProcessor' },
    'webm': { type: 'video', mimeType: 'video/webm', extension, canProcess: true, processor: 'VideoProcessor' },
    'mkv': { type: 'video', mimeType: 'video/x-matroska', extension, canProcess: true, processor: 'VideoProcessor' },
  };

  return extensionMap[extension] || null;
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, 4100)); // Read first 4KB for type detection
  });
}

async function isEDIFile(file: File): Promise<boolean> {
  try {
    // Read first 1KB of file as text
    const text = await readFileAsText(file.slice(0, 1024));
    
    // Check for EDI patterns
    return EDI_PATTERNS.some(pattern => pattern.test(text));
  } catch {
    return false;
  }
}

async function readFileAsText(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function validateFile(file: File, maxSize: number = 50 * 1024 * 1024): { 
  valid: boolean; 
  error?: string;
} {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
    };
  }

  // Check if file has content
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }

  return { valid: true };
}