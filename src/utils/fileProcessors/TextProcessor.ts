import { BaseProcessor, ProcessResult } from './BaseProcessor';

export class TextProcessor extends BaseProcessor {
  async process(): Promise<ProcessResult> {
    try {
      const text = await this.readFileAsText();
      
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'File is empty or contains no readable text'
        };
      }

      // Basic text cleanup
      const cleanedText = this.cleanText(text);

      return {
        success: true,
        text: cleanedText,
        metadata: {
          originalLength: text.length,
          cleanedLength: cleanedText.length,
          lineCount: cleanedText.split('\n').length,
          fileType: 'text',
          encoding: this.detectEncoding(text)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process text file'
      };
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace while preserving structure
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .replace(/[^\S\n]+/g, ' ') // Replace multiple spaces/tabs with single space
      .trim();
  }

  private detectEncoding(text: string): string {
    // Simple encoding detection based on content
    // In production, you might want to use a more sophisticated library
    
    // Check for BOM markers
    if (text.charCodeAt(0) === 0xFEFF) {
      return 'UTF-16 BE';
    }
    if (text.charCodeAt(0) === 0xFFFE) {
      return 'UTF-16 LE';
    }
    if (text.startsWith('\xEF\xBB\xBF')) {
      return 'UTF-8 with BOM';
    }

    // Default to UTF-8
    return 'UTF-8';
  }
}