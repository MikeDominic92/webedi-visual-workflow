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
      const prompt = `SYSTEM ROLE — Master EDI Troubleshooter & Ticket Analyzer (Cleo/DataTrans)
You are an expert Senior Support Engineer specializing in X12/EDIFACT EDI, API integrations, and communication protocols (SFTP/AS2/HTTP). You analyze recordings, transcripts, and tickets to provide EXACT troubleshooting steps.

════════════════ INPUT HANDLING ════════════════
STAGE 1: Information Extraction
If given VIDEO/AUDIO: Extract all ticket details from the conversation
If given TRANSCRIPT: Parse for ticket information
If given FILLED TICKET: Skip to STAGE 2
Always extract: Customer name, Company name, Company ID (WebEDI ID), Phone number, Email, Issue description, Error messages, Document types, Trading partners, Message IDs, Integration Type, Priority.

STAGE 2: Auto-populate this template
Customer name:
Company name:
Company ID number: [WebEDI ID]
Phone number:
Email:
Trading Partner:
Document Types:
Error/Issue:
Message IDs/Control Numbers:
Integration Type: [if mentioned]
Priority: [if mentioned]

════════════════ EXTRACTION ════════════════
Extract the information from this ticket:
${rawText}

IMPORTANT: Return ONLY a valid JSON object with the extracted information. No additional text or formatting.

Return JSON in this format:
{
  "id": "generated-id",
  "ticketTitle": "[Company ID] [Company Name] - [Technical Issue Summary]",
  "customerName": "extracted customer name",
  "companyName": "extracted company name",
  "companyId": "extracted WebEDI ID number",
  "phoneNumber": "extracted phone",
  "email": "extracted email",
  "tradingPartner": "extracted trading partner",
  "documentType": "extracted document type (810/850/856 etc)",
  "errorType": "extracted error type",
  "errorCode": "extracted error code if any",
  "issueDescription": "detailed issue description",
  "messageIds": ["extracted message IDs or control numbers"],
  "integrationType": "WebEDI/AS2/API/FTP etc",
  "priority": "extracted priority",
  "supplier": "extracted supplier or use company name",
  "buyer": "extracted buyer or use trading partner",
  "affectedPOs": ["extracted PO numbers"],
  "action": "rejection/error/issue type",
  "timestamp": "current ISO timestamp",
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
        supplier: stage1Result.data.supplier || stage1Result.data.companyName || 'Unknown Supplier',
        buyer: stage1Result.data.buyer || stage1Result.data.tradingPartner || 'Unknown Buyer',
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
        companyId: stage1Result.data.companyId,
        phoneNumber: stage1Result.data.phoneNumber,
        email: stage1Result.data.email,
        // Issue Details
        issueDescription: stage1Result.data.issueDescription || stage1Result.data.errorDescription || 'No description available',
        ticketTitle: stage1Result.data.ticketTitle,
        messageIds: stage1Result.data.messageIds,
        integationType: stage1Result.data.integrationType,
        priority: stage1Result.data.priority
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
