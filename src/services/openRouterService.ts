import OpenAI from 'openai';
import { ParsedTicket } from '../types';

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model configurations for different stages
const MODELS = {
  // Stage 1: Advanced reasoning and ticket parsing (using Gemini 2.0 Flash - working model)
  STAGE1_PARSER: 'google/gemini-2.0-flash-exp:free',
  // Stage 2: Fast response generation (using Kimi K2 via OpenRouter)
  STAGE2_GENERATOR: 'moonshot/kimi-k2-0711-preview',
  // Alternative models
  FALLBACK_PARSER: 'meta-llama/llama-3.1-8b-instruct:free',
  FALLBACK_GENERATOR: 'openai/gpt-4o-mini'
};

// Initialize OpenRouter client
const openRouter = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'WebEDI Visual Workflow'
  }
});

export interface OpenRouterStageResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  tokensPerSecond?: number;
  model: string;
}

export interface OpenRouterResponse {
  stage1: OpenRouterStageResult;
  stage2?: OpenRouterStageResult;
  parsedTicket?: ParsedTicket;
  responseGeneration?: {
    customerResponse: string;
    internalDocumentation: string;
    technicalSolutions: string[];
    resolutionSteps: string[];
    confidence: number;
  };
  totalProcessingTime: number;
  overallSuccess: boolean;
}

export class OpenRouterService {
  /**
   * Stage 1: Parse EDI ticket using Gemini 2.0 Flash
   */
  static async parseTicket(rawText: string): Promise<OpenRouterStageResult> {
    const startTime = Date.now();
    
    try {
      const prompt = `You are an expert EDI (Electronic Data Interchange) support analyst. Parse the following EDI support ticket and extract structured information.

IMPORTANT: Respond with ONLY a valid JSON object, no additional text or formatting.

Extract the following information:
- Customer information (company name, contact details)
- Trading partner information
- EDI document types involved (810 Invoice, 856 ASN, 850 PO, etc.)
- Error description and type
- Priority level
- Any transaction IDs or reference numbers

Raw ticket text:
${rawText}

Respond with a JSON object in this exact format:
{
  "id": "generated-id",
  "customerName": "string",
  "companyName": "string",
  "tradingPartner": "string",
  "documentType": "810",
  "errorType": "string",
  "issueDescription": "string",
  "supplier": "string",
  "buyer": "string",
  "affectedPOs": ["string"],
  "action": "rejection",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "rawText": "original ticket text",
  "confidence": 0.95
}`;

      const completion = await openRouter.chat.completions.create({
        model: MODELS.STAGE1_PARSER,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 0.9
      });

      const processingTime = Date.now() - startTime;
      const responseText = completion.choices[0]?.message?.content?.trim();

      if (!responseText) {
        throw new Error('No response from OpenRouter');
      }

      // Parse JSON response - handle markdown-wrapped JSON
      let cleanedResponse = responseText;
      if (responseText.includes('```json')) {
        cleanedResponse = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      } else if (responseText.includes('```')) {
        cleanedResponse = responseText.replace(/```\s*/g, '').trim();
      }

      const parsedData = JSON.parse(cleanedResponse);
      
      return {
        success: true,
        data: parsedData,
        processingTime,
        model: MODELS.STAGE1_PARSER
      };

    } catch (error) {
      console.error('Stage 1 parsing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        processingTime: Date.now() - startTime,
        model: MODELS.STAGE1_PARSER
      };
    }
  }

  /**
   * Stage 2: Generate responses using Claude 3.5 Haiku
   */
  static async generateResponses(parsedTicket: ParsedTicket): Promise<OpenRouterStageResult> {
    const startTime = Date.now();
    
    try {
      const prompt = `You are an expert EDI support engineer. Based on the parsed ticket information, generate comprehensive support responses.

Ticket Information:
- Customer: ${parsedTicket.customerName || parsedTicket.companyName}
- Trading Partner: ${parsedTicket.tradingPartner}
- Document Type: ${parsedTicket.documentType}
- Issue: ${parsedTicket.issueDescription || parsedTicket.rawText.substring(0, 200)}
- Error Type: ${parsedTicket.errorType}

Generate responses in the following JSON format:
{
  "customerResponse": "Professional response to send to the customer explaining the issue and next steps",
  "internalDocumentation": "Detailed technical notes for internal team documentation",
  "technicalSolutions": ["Solution 1", "Solution 2", "Solution 3"],
  "resolutionSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "confidence": 0.92
}

Make the customer response professional and reassuring. Include specific technical solutions and clear resolution steps.`;

      const completion = await openRouter.chat.completions.create({
        model: MODELS.STAGE2_GENERATOR,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000,
        top_p: 0.9
      });

      const processingTime = Date.now() - startTime;
      const responseText = completion.choices[0]?.message?.content?.trim();

      if (!responseText) {
        throw new Error('No response from OpenRouter');
      }

      // Parse JSON response - handle markdown-wrapped JSON
      let cleanedResponse = responseText;
      if (responseText.includes('```json')) {
        cleanedResponse = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      } else if (responseText.includes('```')) {
        cleanedResponse = responseText.replace(/```\s*/g, '').trim();
      }

      const responseData = JSON.parse(cleanedResponse);
      
      // Calculate tokens per second (estimate)
      const estimatedTokens = responseText.length / 4; // Rough estimate
      const tokensPerSecond = estimatedTokens / (processingTime / 1000);

      return {
        success: true,
        data: responseData,
        processingTime,
        tokensPerSecond,
        model: MODELS.STAGE2_GENERATOR
      };

    } catch (error) {
      console.error('Stage 2 generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error',
        processingTime: Date.now() - startTime,
        model: MODELS.STAGE2_GENERATOR
      };
    }
  }

  /**
   * Complete 2-stage workflow using OpenRouter
   */
  static async processTicket(rawText: string): Promise<OpenRouterResponse> {
    const totalStartTime = Date.now();
    
    // Stage 1: Parse ticket
    console.log('🚀 Starting Stage 1: Ticket Parsing with', MODELS.STAGE1_PARSER);
    const stage1Result = await this.parseTicket(rawText);
    
    let stage2Result: OpenRouterStageResult | undefined;
    let parsedTicket: ParsedTicket | undefined;
    let responseGeneration: any;

    if (stage1Result.success && stage1Result.data) {
      // Convert parsed data to ParsedTicket format
      parsedTicket = {
        id: stage1Result.data.id || `ticket-${Date.now()}`,
        documentType: stage1Result.data.documentType || '810',
        supplier: stage1Result.data.supplier || stage1Result.data.tradingPartner || 'Unknown Supplier',
        buyer: stage1Result.data.buyer || stage1Result.data.customerName || 'Unknown Buyer',
        errorType: stage1Result.data.errorType || 'Unknown Error',
        errorCode: stage1Result.data.errorCode,
        affectedPOs: stage1Result.data.affectedPOs || [],
        action: stage1Result.data.action || 'rejection',
        timestamp: new Date(stage1Result.data.timestamp || Date.now()),
        rawText: rawText,
        // Additional EDI fields
        tradingPartner: stage1Result.data.tradingPartner,
        // Customer Information
        customerName: stage1Result.data.customerName,
        companyName: stage1Result.data.companyName || stage1Result.data.customerName,
        // Issue Details
        issueDescription: stage1Result.data.issueDescription || stage1Result.data.errorDescription || 'No description available'
      };

      // Stage 2: Generate responses
      console.log('🚀 Starting Stage 2: Response Generation with', MODELS.STAGE2_GENERATOR);
      stage2Result = await this.generateResponses(parsedTicket);
      
      if (stage2Result.success && stage2Result.data) {
        responseGeneration = stage2Result.data;
      }
    }

    const totalProcessingTime = Date.now() - totalStartTime;
    const overallSuccess = stage1Result.success && (stage2Result?.success ?? false);

    console.log(`✅ OpenRouter 2-Stage Workflow Complete:`, {
      stage1Success: stage1Result.success,
      stage2Success: stage2Result?.success,
      totalTime: totalProcessingTime,
      overallSuccess
    });

    return {
      stage1: stage1Result,
      stage2: stage2Result,
      parsedTicket,
      responseGeneration,
      totalProcessingTime,
      overallSuccess
    };
  }

  /**
   * Test OpenRouter connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const completion = await openRouter.chat.completions.create({
        model: MODELS.STAGE1_PARSER,
        messages: [{ role: 'user', content: 'Hello, this is a connection test.' }],
        max_tokens: 10
      });
      
      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available models
   */
  static getAvailableModels() {
    return MODELS;
  }
}
