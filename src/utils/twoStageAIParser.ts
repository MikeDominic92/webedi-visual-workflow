import { ParsedTicket, TwoStageAIResponse, AIStageResult } from '../types';
import { GeminiService } from '../services/geminiService';
import { KimiGroqService } from '../services/kimiGroqService';
import { TicketParser } from './ticketParser';
import { config } from '../config/environment';
import { LocalCustomerService } from '../services/localCustomerService';

export class TwoStageAIParser {
  /**
   * Enhanced 2-stage AI workflow: Gemini 2.5 Pro → Kimi K2 on Groq
   */
  static async parse(rawText: string): Promise<TwoStageAIResponse> {
    const startTime = Date.now();
    
    const response: TwoStageAIResponse = {
      stage1: {
        stage: 1,
        model: 'gemini-2.5-pro',
        success: false,
        processingTime: 0
      },
      totalProcessingTime: 0,
      overallSuccess: false
    };

    // Stage 1: Gemini 2.5 Pro for context processing and ticket parsing
    console.log('🚀 Starting 2-Stage AI Workflow');
    console.log('📊 Stage 1: Gemini 2.5 Pro - Context Processing & Ticket Parsing');
    
    const stage1StartTime = Date.now();
    
    try {
      if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
        const geminiResult = await GeminiService.analyzeTicket(rawText);
        
        const stage1EndTime = Date.now();
        response.stage1 = {
          stage: 1,
          model: 'gemini-2.5-pro',
          success: geminiResult.success,
          data: geminiResult.data,
          error: geminiResult.error,
          processingTime: stage1EndTime - stage1StartTime
        };

        if (geminiResult.success && geminiResult.data) {
          console.log('✅ Stage 1 Success:', {
            confidence: geminiResult.confidence,
            processingTime: response.stage1.processingTime + 'ms',
            reasoning: geminiResult.reasoning
          });
          
          response.parsedTicket = geminiResult.data;
          
          // Enhance with customer data
          response.parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(response.parsedTicket);
          
          // Generate standardized ticket title
          if (response.parsedTicket.companyId && response.parsedTicket.companyName && response.parsedTicket.errorType) {
            let errorDescription = response.parsedTicket.errorType;
            if (response.parsedTicket.issueDescription) {
              const issueMatch = response.parsedTicket.issueDescription.match(/rejected.*?(?:\.|$)|error.*?(?:\.|$)|failed.*?(?:\.|$)/i);
              if (issueMatch) {
                errorDescription = issueMatch[0].replace(/\.$/, '');
              }
            } else {
              errorDescription = response.parsedTicket.errorType.replace(/_/g, ' ').toLowerCase()
                .replace(/\b\w/g, l => l.toUpperCase());
            }
            
            response.parsedTicket.ticketTitle = TicketParser.generateTicketTitle(
              response.parsedTicket.companyId,
              response.parsedTicket.companyName,
              errorDescription,
              response.parsedTicket.documentType
            );
          }
          
        } else {
          console.warn('❌ Stage 1 Failed:', response.stage1.error);
          // Fallback to regex parser
          console.log('🔄 Falling back to regex parser...');
          const fallbackTicket = TicketParser.parse(rawText);
          if (fallbackTicket) {
            response.parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(fallbackTicket);
            response.stage1.success = true;
            response.stage1.data = response.parsedTicket;
          }
        }
      } else {
        console.log('⚠️ Gemini 2.5 Pro not available, using regex parser');
        const fallbackTicket = TicketParser.parse(rawText);
        if (fallbackTicket) {
          response.parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(fallbackTicket);
          response.stage1.success = true;
          response.stage1.data = response.parsedTicket;
          response.stage1.processingTime = Date.now() - stage1StartTime;
        }
      }
    } catch (error) {
      console.error('❌ Stage 1 Error:', error);
      response.stage1.error = error instanceof Error ? error.message : 'Stage 1 processing failed';
      response.stage1.processingTime = Date.now() - stage1StartTime;
    }

    // Stage 2: Kimi K2 on Groq for fast response generation (185 tokens/sec)
    if (response.stage1.success && response.parsedTicket) {
      console.log('⚡ Stage 2: Kimi K2 on Groq - Fast Response Generation (185 tokens/sec)');
      
      const stage2StartTime = Date.now();
      
      try {
        if (config.ENABLE_AI_INTEGRATION && await KimiGroqService.isAvailable()) {
          const kimiResult = await KimiGroqService.generateResponses(response.parsedTicket);
          
          const stage2EndTime = Date.now();
          response.stage2 = {
            stage: 2,
            model: 'kimi-k2-groq',
            success: kimiResult.success,
            data: kimiResult.data,
            error: kimiResult.error,
            processingTime: stage2EndTime - stage2StartTime,
            tokensPerSecond: kimiResult.tokensPerSecond
          };

          if (kimiResult.success && kimiResult.data) {
            console.log('✅ Stage 2 Success:', {
              processingTime: response.stage2.processingTime + 'ms',
              tokensPerSecond: kimiResult.tokensPerSecond + ' tokens/sec',
              confidence: kimiResult.data.confidence
            });
            
            response.responseGeneration = {
              customerResponse: kimiResult.data.customerResponse,
              internalDocumentation: kimiResult.data.internalDocumentation,
              technicalSolutions: kimiResult.data.technicalSolutions,
              resolutionSteps: kimiResult.data.resolutionSteps,
              confidence: kimiResult.data.confidence
            };
          } else {
            console.warn('❌ Stage 2 Failed:', response.stage2.error);
          }
        } else {
          console.log('⚠️ Kimi K2 on Groq not available, skipping Stage 2');
          response.stage2 = {
            stage: 2,
            model: 'kimi-k2-groq',
            success: false,
            error: 'Kimi K2 on Groq not configured',
            processingTime: 0
          };
        }
      } catch (error) {
        console.error('❌ Stage 2 Error:', error);
        response.stage2 = {
          stage: 2,
          model: 'kimi-k2-groq',
          success: false,
          error: error instanceof Error ? error.message : 'Stage 2 processing failed',
          processingTime: Date.now() - stage2StartTime
        };
      }
    } else {
      console.log('⏭️ Skipping Stage 2 - Stage 1 failed or no parsed ticket');
    }

    // Calculate total processing time and overall success
    const endTime = Date.now();
    response.totalProcessingTime = endTime - startTime;
    response.overallSuccess = response.stage1.success;

    console.log('🏁 2-Stage AI Workflow Complete:', {
      overallSuccess: response.overallSuccess,
      totalTime: response.totalProcessingTime + 'ms',
      stage1Time: response.stage1.processingTime + 'ms',
      stage2Time: response.stage2?.processingTime + 'ms' || 'N/A',
      stage2TokensPerSec: response.stage2?.tokensPerSecond || 'N/A'
    });

    return response;
  }

  /**
   * Parse image using 2-stage workflow
   */
  static async parseImage(imageData: string): Promise<TwoStageAIResponse> {
    const startTime = Date.now();
    
    const response: TwoStageAIResponse = {
      stage1: {
        stage: 1,
        model: 'gemini-2.5-pro',
        success: false,
        processingTime: 0
      },
      totalProcessingTime: 0,
      overallSuccess: false
    };

    console.log('🚀 Starting 2-Stage AI Image Workflow');
    console.log('📊 Stage 1: Gemini 2.5 Pro Vision - Image Analysis & Parsing');
    
    const stage1StartTime = Date.now();
    
    try {
      if (config.ENABLE_AI_INTEGRATION && await GeminiService.isAvailable()) {
        const geminiResult = await GeminiService.analyzeImage(imageData);
        
        const stage1EndTime = Date.now();
        response.stage1 = {
          stage: 1,
          model: 'gemini-2.5-pro',
          success: geminiResult.success,
          data: geminiResult.data,
          error: geminiResult.error,
          processingTime: stage1EndTime - stage1StartTime
        };

        if (geminiResult.success && geminiResult.data) {
          console.log('✅ Stage 1 Image Analysis Success');
          response.parsedTicket = await LocalCustomerService.enhanceTicketWithCustomerData(geminiResult.data);
        } else {
          console.warn('❌ Stage 1 Image Analysis Failed:', response.stage1.error);
        }
      }
    } catch (error) {
      console.error('❌ Stage 1 Image Error:', error);
      response.stage1.error = error instanceof Error ? error.message : 'Stage 1 image processing failed';
      response.stage1.processingTime = Date.now() - stage1StartTime;
    }

    // Continue with Stage 2 if Stage 1 succeeded
    if (response.stage1.success && response.parsedTicket) {
      const stage2Result = await this.runStage2(response.parsedTicket);
      response.stage2 = stage2Result.stage2;
      response.responseGeneration = stage2Result.responseGeneration;
    }

    response.totalProcessingTime = Date.now() - startTime;
    response.overallSuccess = response.stage1.success;

    return response;
  }

  /**
   * Helper method to run Stage 2 processing
   */
  private static async runStage2(parsedTicket: ParsedTicket) {
    console.log('⚡ Stage 2: Kimi K2 on Groq - Fast Response Generation');
    
    const stage2StartTime = Date.now();
    let stage2: AIStageResult;
    let responseGeneration;
    
    try {
      if (config.ENABLE_AI_INTEGRATION && await KimiGroqService.isAvailable()) {
        const kimiResult = await KimiGroqService.generateResponses(parsedTicket);
        
        const stage2EndTime = Date.now();
        stage2 = {
          stage: 2,
          model: 'kimi-k2-groq',
          success: kimiResult.success,
          data: kimiResult.data,
          error: kimiResult.error,
          processingTime: stage2EndTime - stage2StartTime,
          tokensPerSecond: kimiResult.tokensPerSecond
        };

        if (kimiResult.success && kimiResult.data) {
          console.log('✅ Stage 2 Success');
          responseGeneration = {
            customerResponse: kimiResult.data.customerResponse,
            internalDocumentation: kimiResult.data.internalDocumentation,
            technicalSolutions: kimiResult.data.technicalSolutions,
            resolutionSteps: kimiResult.data.resolutionSteps,
            confidence: kimiResult.data.confidence
          };
        }
      } else {
        stage2 = {
          stage: 2,
          model: 'kimi-k2-groq',
          success: false,
          error: 'Kimi K2 on Groq not configured',
          processingTime: 0
        };
      }
    } catch (error) {
      stage2 = {
        stage: 2,
        model: 'kimi-k2-groq',
        success: false,
        error: error instanceof Error ? error.message : 'Stage 2 processing failed',
        processingTime: Date.now() - stage2StartTime
      };
    }

    return { stage2, responseGeneration };
  }

  /**
   * Check if 2-stage AI is available
   */
  static async isAvailable(): Promise<{ stage1: boolean; stage2: boolean }> {
    return {
      stage1: await GeminiService.isAvailable(),
      stage2: await KimiGroqService.isAvailable()
    };
  }
}
