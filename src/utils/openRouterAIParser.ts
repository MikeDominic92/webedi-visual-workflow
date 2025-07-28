import { ParsedTicket } from '../types';
import { OpenRouterService, OpenRouterResponse } from '../services/openRouterService';
import { TicketParser } from './ticketParser';

export interface OpenRouterAIResult {
  success: boolean;
  parsedTicket?: ParsedTicket;
  openRouterResponse?: OpenRouterResponse;
  error?: string;
  processingTime: number;
  usedFallback: boolean;
}

export class OpenRouterAIParser {
  private static lastOpenRouterResponse: OpenRouterResponse | null = null;

  /**
   * Parse EDI ticket using OpenRouter 2-stage workflow
   */
  static async parse(rawText: string): Promise<ParsedTicket | null> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting OpenRouter 2-Stage AI Workflow');
      
      // Test OpenRouter connection first
      const connectionTest = await OpenRouterService.testConnection();
      if (!connectionTest) {
        console.warn('⚠️ OpenRouter connection failed, falling back to regex parser');
        return this.fallbackToRegex(rawText);
      }

      // Process ticket through OpenRouter 2-stage workflow
      const openRouterResponse = await OpenRouterService.processTicket(rawText);
      this.lastOpenRouterResponse = openRouterResponse;

      if (openRouterResponse.overallSuccess && openRouterResponse.parsedTicket) {
        console.log('✅ OpenRouter 2-Stage Workflow successful');
        return openRouterResponse.parsedTicket;
      } else {
        console.warn('⚠️ OpenRouter workflow failed, falling back to regex parser');
        console.warn('Stage 1 error:', openRouterResponse.stage1.error);
        console.warn('Stage 2 error:', openRouterResponse.stage2?.error);
        return this.fallbackToRegex(rawText);
      }

    } catch (error) {
      console.error('❌ OpenRouter AI parsing failed:', error);
      return this.fallbackToRegex(rawText);
    }
  }

  /**
   * Fallback to regex parser when AI fails
   */
  private static fallbackToRegex(rawText: string): ParsedTicket | null {
    console.log('🔄 Using regex fallback parser');
    try {
      return TicketParser.parse(rawText);
    } catch (error) {
      console.error('❌ Regex fallback also failed:', error);
      return null;
    }
  }

  /**
   * Get the last OpenRouter response for UI display
   */
  static getLastOpenRouterResponse(): OpenRouterResponse | null {
    return this.lastOpenRouterResponse;
  }

  /**
   * Clear the last response
   */
  static clearLastResponse(): void {
    this.lastOpenRouterResponse = null;
  }

  /**
   * Get detailed parsing result with metadata
   */
  static async parseWithDetails(rawText: string): Promise<OpenRouterAIResult> {
    const startTime = Date.now();
    let usedFallback = false;
    
    try {
      // Test connection
      const connectionTest = await OpenRouterService.testConnection();
      if (!connectionTest) {
        usedFallback = true;
        const fallbackTicket = this.fallbackToRegex(rawText);
        return {
          success: !!fallbackTicket,
          parsedTicket: fallbackTicket || undefined,
          processingTime: Date.now() - startTime,
          usedFallback,
          error: fallbackTicket ? undefined : 'Both OpenRouter and regex parsing failed'
        };
      }

      // Process with OpenRouter
      const openRouterResponse = await OpenRouterService.processTicket(rawText);
      this.lastOpenRouterResponse = openRouterResponse;

      if (openRouterResponse.overallSuccess && openRouterResponse.parsedTicket) {
        return {
          success: true,
          parsedTicket: openRouterResponse.parsedTicket,
          openRouterResponse,
          processingTime: Date.now() - startTime,
          usedFallback: false
        };
      } else {
        // Fallback to regex
        usedFallback = true;
        const fallbackTicket = this.fallbackToRegex(rawText);
        return {
          success: !!fallbackTicket,
          parsedTicket: fallbackTicket || undefined,
          openRouterResponse,
          processingTime: Date.now() - startTime,
          usedFallback,
          error: fallbackTicket ? 'OpenRouter failed, used regex fallback' : 'Both OpenRouter and regex parsing failed'
        };
      }

    } catch (error) {
      // Fallback to regex
      usedFallback = true;
      const fallbackTicket = this.fallbackToRegex(rawText);
      return {
        success: !!fallbackTicket,
        parsedTicket: fallbackTicket || undefined,
        processingTime: Date.now() - startTime,
        usedFallback,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get processing statistics
   */
  static getProcessingStats() {
    const response = this.lastOpenRouterResponse;
    if (!response) return null;

    return {
      stage1: {
        model: response.stage1.model,
        processingTime: response.stage1.processingTime,
        success: response.stage1.success,
        error: response.stage1.error
      },
      stage2: response.stage2 ? {
        model: response.stage2.model,
        processingTime: response.stage2.processingTime,
        tokensPerSecond: response.stage2.tokensPerSecond,
        success: response.stage2.success,
        error: response.stage2.error
      } : null,
      total: {
        processingTime: response.totalProcessingTime,
        overallSuccess: response.overallSuccess
      }
    };
  }

  /**
   * Get response generation data
   */
  static getResponseGeneration() {
    const response = this.lastOpenRouterResponse;
    return response?.responseGeneration || null;
  }

  /**
   * Check if OpenRouter is available
   */
  static async isOpenRouterAvailable(): Promise<boolean> {
    try {
      return await OpenRouterService.testConnection();
    } catch {
      return false;
    }
  }

  /**
   * Get available models from OpenRouter
   */
  static getAvailableModels() {
    return OpenRouterService.getAvailableModels();
  }
}
