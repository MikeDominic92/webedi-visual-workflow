import { BaseProcessor, ProcessResult } from './BaseProcessor';
import { TextProcessor } from './TextProcessor';
import { PDFProcessor } from './PDFProcessor';
import { ImageProcessor } from './ImageProcessor';
import { CSVProcessor } from './CSVProcessor';
import { VideoProcessor } from './VideoProcessor';
import { detectFileType, SupportedFileType } from '../fileTypeDetector';

export type { ProcessResult } from './BaseProcessor';

export class FileProcessorFactory {
  static async createProcessor(file: File): Promise<BaseProcessor | null> {
    const fileTypeInfo = await detectFileType(file);
    
    if (!fileTypeInfo.canProcess) {
      return null;
    }

    switch (fileTypeInfo.type) {
      case 'text':
      case 'edi':
        return new TextProcessor(file);
      
      case 'pdf':
        return new PDFProcessor(file);
      
      case 'image':
        return new ImageProcessor(file);
      
      case 'csv':
        return new CSVProcessor(file);
      
      case 'xml':
        // TODO: Implement XML processor
        return new TextProcessor(file); // Fallback to text for now
      
      case 'json':
        // TODO: Implement JSON processor
        return new TextProcessor(file); // Fallback to text for now
      
      case 'video':
        return new VideoProcessor(file);
      
      default:
        return null;
    }
  }

  static async processFile(file: File): Promise<ProcessResult> {
    try {
      const processor = await this.createProcessor(file);
      
      if (!processor) {
        return {
          success: false,
          error: `File type not supported: ${file.type || 'unknown'}`
        };
      }

      return await processor.process();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process file'
      };
    }
  }
}