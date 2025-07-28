import Groq from 'groq-sdk';
import { config } from '../config/environment';
import { ParsedTicket } from '../types';

// Initialize Groq client
// Note: Using dangerouslyAllowBrowser because this is a frontend demo app
// In production, API calls should be made through a backend server
const groq = config.GROQ_API_KEY ? new Groq({
  apiKey: config.GROQ_API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

export interface KimiResponseGeneration {
  customerResponse: string;
  internalDocumentation: string;
  technicalSolutions: string[];
  resolutionSteps: string[];
  confidence: number;
  processingTime: number;
}

export interface KimiGroqResponse {
  success: boolean;
  data?: KimiResponseGeneration;
  error?: string;
  tokensPerSecond?: number;
}

const RESPONSE_GENERATION_PROMPT = `You are an expert EDI support specialist. Based on the parsed ticket information provided, generate comprehensive support responses and documentation.

Generate the following outputs in JSON format:

1. **customerResponse**: A professional, clear response to send to the customer explaining the issue and next steps
2. **internalDocumentation**: Detailed internal notes for the support team including technical details and context
3. **technicalSolutions**: Array of specific technical solutions or fixes that can be applied
4. **resolutionSteps**: Array of step-by-step instructions to resolve the issue

Guidelines:
- Be professional and empathetic in customer communications
- Include specific EDI document types, error codes, and technical details
- Provide actionable solutions and clear next steps
- Use EDI terminology appropriately
- Reference trading partner requirements when relevant

Parsed Ticket Data:
`;

export class KimiGroqService {
  static async isAvailable(): Promise<boolean> {
    return !!groq && !!config.GROQ_API_KEY && config.ENABLE_AI_INTEGRATION;
  }

  static async generateResponses(parsedTicket: ParsedTicket): Promise<KimiGroqResponse> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Kimi K2 on Groq is not configured or disabled'
        };
      }

      const startTime = Date.now();
      
      // Prepare the ticket data for the prompt
      const ticketData = {
        documentType: parsedTicket.documentType,
        supplier: parsedTicket.supplier,
        buyer: parsedTicket.buyer,
        errorType: parsedTicket.errorType,
        errorCode: parsedTicket.errorCode,
        issueDescription: parsedTicket.issueDescription,
        tradingPartner: parsedTicket.tradingPartner,
        integationType: parsedTicket.integationType,
        affectedPOs: parsedTicket.affectedPOs,
        companyName: parsedTicket.companyName,
        customerName: parsedTicket.customerName,
        ticketTitle: parsedTicket.ticketTitle
      };

      const prompt = RESPONSE_GENERATION_PROMPT + JSON.stringify(ticketData, null, 2);

      // Generate responses using Kimi K2 on Groq
      const completion = await groq!.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'moonshotai/kimi-k2-instruct',
        temperature: 0.3, // Lower temperature for more consistent responses
        max_tokens: 4000,
        top_p: 0.9,
        stream: false
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response generated from Kimi K2');
      }

      // Calculate tokens per second (approximate)
      const totalTokens = completion.usage?.total_tokens || 0;
      const tokensPerSecond = totalTokens > 0 ? Math.round((totalTokens / processingTime) * 1000) : 0;

      // Parse the JSON response
      try {
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        const generatedData = JSON.parse(jsonText);

        const responseGeneration: KimiResponseGeneration = {
          customerResponse: generatedData.customerResponse || 'Response generation failed',
          internalDocumentation: generatedData.internalDocumentation || 'Documentation generation failed',
          technicalSolutions: Array.isArray(generatedData.technicalSolutions) 
            ? generatedData.technicalSolutions 
            : ['Technical solution generation failed'],
          resolutionSteps: Array.isArray(generatedData.resolutionSteps) 
            ? generatedData.resolutionSteps 
            : ['Resolution steps generation failed'],
          confidence: 0.9, // Kimi K2 typically has high confidence for response generation
          processingTime
        };

        return {
          success: true,
          data: responseGeneration,
          tokensPerSecond
        };

      } catch (parseError) {
        console.error('Failed to parse Kimi K2 response:', parseError);
        return {
          success: false,
          error: 'Failed to parse AI response',
        };
      }

    } catch (error) {
      console.error('Kimi K2 Groq API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate responses with Kimi K2'
      };
    }
  }

  static async generateCustomerResponse(parsedTicket: ParsedTicket): Promise<string> {
    const result = await this.generateResponses(parsedTicket);
    return result.success && result.data ? result.data.customerResponse : 'Failed to generate customer response';
  }

  static async generateInternalDocs(parsedTicket: ParsedTicket): Promise<string> {
    const result = await this.generateResponses(parsedTicket);
    return result.success && result.data ? result.data.internalDocumentation : 'Failed to generate internal documentation';
  }

  static async generateTechnicalSolutions(parsedTicket: ParsedTicket): Promise<string[]> {
    const result = await this.generateResponses(parsedTicket);
    return result.success && result.data ? result.data.technicalSolutions : ['Failed to generate technical solutions'];
  }

  static async generateResolutionSteps(parsedTicket: ParsedTicket): Promise<string[]> {
    const result = await this.generateResponses(parsedTicket);
    return result.success && result.data ? result.data.resolutionSteps : ['Failed to generate resolution steps'];
  }
}
