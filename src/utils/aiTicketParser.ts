import { ParsedTicket } from '../types';
import { GeminiService } from '../services/geminiService';
import { TicketParser } from './ticketParser';
import { config } from '../config/environment';
import { LocalCustomerService } from '../services/localCustomerService';

export class AITicketParser {
  /**
   * Parse ticket using AI if available, fallback to regex parser
   */
  static async parse(rawText: string): Promise<ParsedTicket | null> {
    let parsedTicket: ParsedTicket | null = null;
    
    // Check if AI is enabled and available
    if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
      console.log('Using Gemini 2.5 Pro for ticket analysis...');
      
      try {
        const aiResult = await GeminiService.analyzeTicket(rawText);
        
        if (aiResult.success && aiResult.data) {
          console.log('AI analysis successful:', {
            confidence: aiResult.confidence,
            reasoning: aiResult.reasoning
          });
          parsedTicket = aiResult.data;
        } else {
          console.warn('AI analysis failed:', aiResult.error);
          console.log('Falling back to regex parser...');
        }
      } catch (error) {
        console.error('AI parsing error:', error);
        console.log('Falling back to regex parser...');
      }
    }
    
    // Fallback to traditional regex parser if AI didn't work
    if (!parsedTicket) {
      parsedTicket = TicketParser.parse(rawText);
    }
    
    // Enhance with customer data
    if (parsedTicket) {
      parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(parsedTicket);
    }
    
    return parsedTicket;
  }

  /**
   * Parse image-based ticket using AI vision capabilities
   */
  static async parseImage(imageData: string): Promise<ParsedTicket | null> {
    let parsedTicket: ParsedTicket | null = null;
    
    if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
      console.log('Using Gemini 2.5 Pro vision for image analysis...');
      
      try {
        const aiResult = await GeminiService.analyzeImage(imageData);
        
        if (aiResult.success && aiResult.data) {
          console.log('AI image analysis successful:', {
            confidence: aiResult.confidence,
            reasoning: aiResult.reasoning
          });
          parsedTicket = aiResult.data;
        } else {
          console.warn('AI image analysis failed:', aiResult.error);
        }
      } catch (error) {
        console.error('AI image parsing error:', error);
      }
    }
    
    // Enhance with customer data if we got a result
    if (parsedTicket) {
      parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(parsedTicket);
    }
    
    return parsedTicket;
  }

  /**
   * Get parsing confidence score
   */
  static async getParsingConfidence(ticket: ParsedTicket): Promise<number> {
    // If ticket was parsed by AI, confidence is typically high
    if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
      return 0.95; // Gemini 2.5 Pro has high accuracy
    }
    
    // Fallback to regex parser confidence calculation
    return TicketParser.getParsingConfidence(ticket);
  }

  /**
   * Check if AI parsing is available
   */
  static async isAIAvailable(): Promise<boolean> {
    return GeminiService.isAvailable();
  }
}