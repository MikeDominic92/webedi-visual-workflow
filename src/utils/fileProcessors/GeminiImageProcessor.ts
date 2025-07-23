import { BaseProcessor, ProcessResult } from './BaseProcessor';
import { AITicketParser } from '../aiTicketParser';
import { GeminiService } from '../../services/geminiService';
import { config } from '../../config/environment';
import { createWorker, Worker } from 'tesseract.js';

export class GeminiImageProcessor extends BaseProcessor {
  private worker: Worker | null = null;

  async process(): Promise<ProcessResult> {
    try {
      // First, try to use Gemini's vision capabilities
      if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
        console.log('Using Gemini 2.5 Pro vision for direct image analysis...');
        
        // Convert file to data URL for Gemini
        const dataUrl = await this.readFileAsDataURL();
        
        // Try to parse as ticket using Gemini vision
        const parsedTicket = await AITicketParser.parseImage(dataUrl);
        
        if (parsedTicket) {
          console.log('Gemini vision analysis successful');
          return {
            success: true,
            text: parsedTicket.rawText || 'Image analyzed by Gemini AI',
            parsedTicket, // Include the parsed ticket data
            metadata: {
              fileType: 'image',
              imageType: this.file.type,
              aiProcessed: true,
              processor: 'Gemini 2.5 Pro Vision'
            }
          };
        }
      }
      
      // Fallback to OCR if Gemini is not available or fails
      console.log('Falling back to OCR processing...');
      
      // Initialize Tesseract worker
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Convert file to data URL for Tesseract
      const dataUrl = await this.readFileAsDataURL();

      // Perform OCR
      const { data: { text, confidence } } = await this.worker.recognize(dataUrl);

      // Terminate worker
      await this.worker.terminate();
      this.worker = null;

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'No text detected in the image'
        };
      }

      // Clean up OCR text
      const cleanedText = this.cleanOCRText(text);
      
      console.log('OCR processing completed:');
      console.log('- Confidence:', confidence);
      console.log('- Text preview:', cleanedText.substring(0, 200));

      return {
        success: true,
        text: cleanedText,
        metadata: {
          fileType: 'image',
          ocrConfidence: confidence,
          originalLength: text.length,
          cleanedLength: cleanedText.length,
          imageType: this.file.type,
          aiProcessed: false,
          processor: 'Tesseract OCR'
        }
      };
    } catch (error) {
      // Ensure worker is terminated on error
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }

      console.error('Image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image file'
      };
    }
  }

  private cleanOCRText(text: string): string {
    return text
      // Remove common OCR artifacts
      .replace(/[|\\]/g, '') // Remove vertical bars and backslashes that often appear as artifacts
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*\n/g, '$1\n') // Preserve sentence breaks
      .replace(/\n+/g, '\n') // Remove multiple line breaks
      // Fix common OCR mistakes
      .replace(/[0O]([A-Z])/g, 'O$1') // Zero confused with O before capital letters
      .replace(/[1Il]([a-z])/g, 'l$1') // 1 or I confused with l before lowercase
      .replace(/[5S]([0-9])/g, '5$1') // S confused with 5 before numbers
      // Remove isolated single characters (often noise)
      .replace(/\b[a-zA-Z]\b\s*/g, (match, offset, string) => {
        // Keep single characters that are likely valid (I, A, a)
        if (/[IAa]/.test(match.trim())) return match;
        // Keep if it's part of a larger pattern (e.g., bullet points)
        if (offset > 0 && string[offset - 1] === '\n') return match;
        return '';
      })
      .trim();
  }
}