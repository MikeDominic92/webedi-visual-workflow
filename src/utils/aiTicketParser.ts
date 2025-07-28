import { ParsedTicket, TwoStageAIResponse } from '../types';
import { OpenRouterAIParser } from './openRouterAIParser';
import { OpenRouterService, OpenRouterResponse } from '../services/openRouterService';
import { GeminiService } from '../services/geminiService';
import { KimiGroqService } from '../services/kimiGroqService';
import { TwoStageAIParser } from './twoStageAIParser';
import { TicketParser } from './ticketParser';
import { config } from '../config/environment';
import { LocalCustomerService } from '../services/localCustomerService';

export class AITicketParser {
  // Store the last OpenRouter response for access by other components
  private static lastOpenRouterResponse: OpenRouterResponse | null = null;
  // Keep legacy 2-stage response for backward compatibility
  private static lastTwoStageResponse: TwoStageAIResponse | null = null;

  /**
   * Parse ticket using OpenRouter unified AI workflow
   */
  static async parse(rawText: string): Promise<ParsedTicket | null> {
    try {
      console.log('🚀 Starting OpenRouter AI ticket parsing');

      // Use OpenRouter for unified AI processing
      const openRouterResult = await OpenRouterAIParser.parseWithDetails(rawText);

      // Store the OpenRouter response for backward compatibility
      if (openRouterResult.openRouterResponse) {
        this.lastTwoStageResponse = this.convertToLegacyFormat(openRouterResult.openRouterResponse);
      }

      if (openRouterResult.success && openRouterResult.parsedTicket) {
        console.log('✅ OpenRouter parsing successful');
        return await LocalCustomerService.enhanceTicketWithCustomerData(openRouterResult.parsedTicket);
      } else {
        console.warn('⚠️ OpenRouter parsing failed, using fallback');
        const fallbackTicket = TicketParser.parse(rawText);
        if (fallbackTicket) {
          return await LocalCustomerService.enhanceTicketWithCustomerData(fallbackTicket);
        }
      }
    } catch (error) {
      console.error('❌ OpenRouter AI parsing failed:', error);

      // Fallback to regex parser
      const fallbackTicket = TicketParser.parse(rawText);
      if (fallbackTicket) {
        return await LocalCustomerService.enhanceTicketWithCustomerData(fallbackTicket);
      }
    }

    return null;
  }

  /**
   * Parse image-based ticket using enhanced 2-stage AI workflow
   */
  static async parseImage(imageData: string): Promise<ParsedTicket | null> {
    try {
      // Use the new 2-stage AI workflow for images
      const twoStageResult = await TwoStageAIParser.parseImage(imageData);

      // Store the result for access by other components
      this.lastTwoStageResponse = twoStageResult;

      if (twoStageResult.overallSuccess && twoStageResult.parsedTicket) {
        return twoStageResult.parsedTicket;
      } else {
        console.warn('2-stage AI image workflow failed');
      }
    } catch (error) {
      console.error('2-stage AI image parsing error:', error);
    }

    return null;
  }

  /**
   * Convert OpenRouter response to legacy 2-stage format for backward compatibility
   */
  private static convertToLegacyFormat(openRouterResponse: OpenRouterResponse): TwoStageAIResponse {
    return {
      stage1: {
        success: openRouterResponse.stage1.success,
        data: openRouterResponse.parsedTicket,
        error: openRouterResponse.stage1.error,
        processingTime: openRouterResponse.stage1.processingTime,
        model: openRouterResponse.stage1.model
      },
      stage2: openRouterResponse.stage2 ? {
        success: openRouterResponse.stage2.success,
        data: openRouterResponse.responseGeneration,
        error: openRouterResponse.stage2.error,
        processingTime: openRouterResponse.stage2.processingTime,
        tokensPerSecond: openRouterResponse.stage2.tokensPerSecond,
        model: openRouterResponse.stage2.model
      } : undefined,
      parsedTicket: openRouterResponse.parsedTicket,
      responseGeneration: openRouterResponse.responseGeneration,
      totalProcessingTime: openRouterResponse.totalProcessingTime,
      overallSuccess: openRouterResponse.overallSuccess
    };
  }

  /**
   * Get parsing confidence score from 2-stage AI workflow
   */
  static async getParsingConfidence(ticket: ParsedTicket): Promise<number> {
    // If we have a recent OpenRouter response, use its confidence
    if (this.lastOpenRouterResponse?.responseGeneration?.confidence) {
      return this.lastOpenRouterResponse.responseGeneration.confidence;
    }

    // If we have a legacy 2-stage response, use its confidence
    if (this.lastTwoStageResponse?.responseGeneration?.confidence) {
      return this.lastTwoStageResponse.responseGeneration.confidence;
    }

    // If OpenRouter is available, confidence is typically high
    if (await OpenRouterAIParser.isOpenRouterAvailable()) {
      return 0.95; // OpenRouter models have high accuracy
    }

    // Fallback to regex parser confidence calculation
    return TicketParser.getParsingConfidence(ticket);
  }

  /**
   * Check if OpenRouter AI parsing is available
   */
  static async isAIAvailable(): Promise<boolean> {
    return await OpenRouterAIParser.isOpenRouterAvailable();
  }

  /**
   * Get the last 2-stage AI response for detailed analysis
   */
  static getLastTwoStageResponse(): TwoStageAIResponse | null {
    return this.lastTwoStageResponse;
  }

  /**
   * Get response generation data from the last workflow
   */
  static getLastResponseGeneration() {
    // Prefer OpenRouter response if available
    if (this.lastOpenRouterResponse?.responseGeneration) {
      return this.lastOpenRouterResponse.responseGeneration;
    }
    // Fallback to legacy 2-stage response
    return this.lastTwoStageResponse?.responseGeneration || null;
  }

  /**
   * Get the last OpenRouter response for detailed analysis
   */
  static getLastOpenRouterResponse(): OpenRouterResponse | null {
    return this.lastOpenRouterResponse;
  }

  /**
   * Get OpenRouter processing statistics
   */
  static getOpenRouterStats() {
    return OpenRouterAIParser.getProcessingStats();
  }

  /**
   * Get available OpenRouter models
   */
  static getAvailableModels() {
    return OpenRouterAIParser.getAvailableModels();
  }

  /**
   * Check if both AI stages are available (legacy method)
   */
  static async getTwoStageAvailability(): Promise<{ stage1: boolean; stage2: boolean }> {
    const isAvailable = await this.isAIAvailable();
    return { stage1: isAvailable, stage2: isAvailable };
  }

  /**
   * Clear all cached responses
   */
  static clearCache(): void {
    this.lastOpenRouterResponse = null;
    this.lastTwoStageResponse = null;
    OpenRouterAIParser.clearLastResponse();
  }
}