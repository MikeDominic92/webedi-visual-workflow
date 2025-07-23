import { BaseProcessor, ProcessResult } from './BaseProcessor';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with correct CDN URL matching installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs';

export class PDFProcessor extends BaseProcessor {
  async process(): Promise<ProcessResult> {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pageTexts: string[] = [];
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        pageTexts.push(pageText);
        fullText += pageText + '\n\n';
      }

      // Clean up the extracted text
      fullText = this.cleanPDFText(fullText);
      
      console.log('PDF text extraction completed:');
      console.log('- Pages:', pdf.numPages);
      console.log('- Raw text length:', fullText.length);
      console.log('- Text preview:', fullText.substring(0, 200));

      if (!fullText.trim()) {
        return {
          success: false,
          error: 'No text content found in PDF. The PDF might contain only images.'
        };
      }

      return {
        success: true,
        text: fullText,
        metadata: {
          pageCount: pdf.numPages,
          fileType: 'pdf',
          hasText: true,
          pageTexts: pageTexts
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PDF file'
      };
    }
  }

  private cleanPDFText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Preserve paragraph breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Remove page numbers and headers/footers (common patterns)
      .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
      .replace(/^\d+$/gm, '')
      // Clean up common PDF artifacts
      .replace(/\u0000/g, '') // Null characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
      .trim();
  }
}