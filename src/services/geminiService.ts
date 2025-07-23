import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/environment';
import { ParsedTicket } from '../types';

// Initialize Gemini
const genAI = config.GEMINI_API_KEY ? new GoogleGenerativeAI(config.GEMINI_API_KEY) : null;

// Use Gemini 2.5 Pro model
const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });

export interface GeminiTicketResponse {
  success: boolean;
  data?: ParsedTicket;
  confidence?: number;
  reasoning?: string;
  error?: string;
}

const TICKET_EXTRACTION_PROMPT = `You are an expert EDI (Electronic Data Interchange) ticket analyst. Analyze the following ticket text and extract structured information.

Extract the following fields (return null if not found):
- ticketTitle: The main title or subject of the ticket
- customerName: Full text of customer name field (may include caller on record and person on phone)
- callerOnRecord: Person listed as "caller on record"
- personOnPhone: Person listed as "person on the phone"
- companyName: Company or business name
- companyId: Company ID, WebEDI ID, or account number (extract digits only)
- phoneNumber: Contact phone number
- email: Contact email address
- tradingPartner: The trading partner or buyer (e.g., Walmart, Target, Chewy.com)
- documentType: EDI document type (810, 850, 856, 855, 997)
- documentTypes: Array of all document types mentioned
- errorType: Type of error (e.g., DUPLICATE_INVOICE, INVALID_ITEM, PRICE_MISMATCH)
- errorCode: Specific error code if mentioned (e.g., AP-810776)
- issueDescription: Full description of the error or issue
- messageIds: Array of message IDs or control numbers
- integationType: Connection type (WebEDI, AS2, SFTP, FTP, API)
- affectedPOs: Array of affected purchase order numbers
- errorDate: Date when error occurred (if mentioned)
- action: Classify as 'rejection', 'acceptance', or 'modification'

For document type detection:
- 810 = Invoice
- 850 = Purchase Order
- 856 = Advance Ship Notice (ASN)
- 855 = Purchase Order Acknowledgment
- 997 = Functional Acknowledgment

Return the extracted data as a JSON object. Be thorough and extract as much information as possible.

Ticket text:
`;

export class GeminiService {
  static async isAvailable(): Promise<boolean> {
    return !!model && !!config.GEMINI_API_KEY && config.ENABLE_AI_INTEGRATION;
  }

  static async analyzeTicket(ticketText: string): Promise<GeminiTicketResponse> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Gemini AI is not configured or disabled'
        };
      }

      const prompt = TICKET_EXTRACTION_PROMPT + ticketText;
      
      // Generate content with Gemini
      const result = await model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Extract JSON from the response (Gemini might include markdown formatting)
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
        const extractedData = JSON.parse(jsonText);
        
        // Generate ticket ID if not provided
        const ticketId = extractedData.ticketId || 
                        extractedData.companyId || 
                        `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Ensure required fields
        const parsedTicket: ParsedTicket = {
          id: ticketId,
          documentType: extractedData.documentType || '810',
          supplier: extractedData.companyName || 'Unknown Supplier',
          buyer: extractedData.tradingPartner || 'Unknown Buyer',
          errorType: extractedData.errorType || 'UNKNOWN_ERROR',
          errorCode: extractedData.errorCode,
          affectedPOs: extractedData.affectedPOs || [],
          action: extractedData.action || 'rejection',
          timestamp: new Date(),
          rawText: ticketText,
          // Additional fields
          webediId: extractedData.companyId,
          controlNumber: extractedData.messageIds?.[0],
          tradingPartner: extractedData.tradingPartner,
          integationType: extractedData.integationType,
          // Customer Information
          ticketTitle: extractedData.ticketTitle,
          customerName: extractedData.customerName,
          callerOnRecord: extractedData.callerOnRecord,
          personOnPhone: extractedData.personOnPhone,
          companyName: extractedData.companyName,
          companyId: extractedData.companyId,
          phoneNumber: extractedData.phoneNumber,
          email: extractedData.email,
          // Issue Details
          issueDescription: extractedData.issueDescription,
          messageIds: extractedData.messageIds,
          documentTypes: extractedData.documentTypes,
          errorDate: extractedData.errorDate ? new Date(extractedData.errorDate) : undefined
        };
        
        return {
          success: true,
          data: parsedTicket,
          confidence: 0.95, // Gemini 2.5 Pro typically has high confidence
          reasoning: 'Extracted using Gemini 2.5 Pro AI analysis'
        };
        
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        return {
          success: false,
          error: 'Failed to parse AI response',
          reasoning: text
        };
      }
      
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze ticket with Gemini'
      };
    }
  }

  static async analyzeImage(imageData: string): Promise<GeminiTicketResponse> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Gemini AI is not configured or disabled'
        };
      }

      // Gemini can process images directly
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: 'image/jpeg'
        }
      };

      const prompt = `Analyze this EDI ticket image and extract the information. ${TICKET_EXTRACTION_PROMPT}`;
      
      const result = await model!.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Parse response same as text analysis
      return this.parseGeminiResponse(text, 'Image analyzed using Gemini 2.5 Pro vision capabilities');
      
    } catch (error) {
      console.error('Gemini image analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image with Gemini'
      };
    }
  }

  private static parseGeminiResponse(text: string, reasoning: string): GeminiTicketResponse {
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      const extractedData = JSON.parse(jsonText);
      
      const ticketId = extractedData.ticketId || 
                      extractedData.companyId || 
                      `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const parsedTicket: ParsedTicket = {
        id: ticketId,
        documentType: extractedData.documentType || '810',
        supplier: extractedData.companyName || 'Unknown Supplier',
        buyer: extractedData.tradingPartner || 'Unknown Buyer',
        errorType: extractedData.errorType || 'UNKNOWN_ERROR',
        errorCode: extractedData.errorCode,
        affectedPOs: extractedData.affectedPOs || [],
        action: extractedData.action || 'rejection',
        timestamp: new Date(),
        rawText: extractedData.rawText || '',
        webediId: extractedData.companyId,
        controlNumber: extractedData.messageIds?.[0],
        tradingPartner: extractedData.tradingPartner,
        integationType: extractedData.integationType,
        ticketTitle: extractedData.ticketTitle,
        customerName: extractedData.customerName,
        callerOnRecord: extractedData.callerOnRecord,
        personOnPhone: extractedData.personOnPhone,
        companyName: extractedData.companyName,
        companyId: extractedData.companyId,
        phoneNumber: extractedData.phoneNumber,
        email: extractedData.email,
        issueDescription: extractedData.issueDescription,
        messageIds: extractedData.messageIds,
        documentTypes: extractedData.documentTypes,
        errorDate: extractedData.errorDate ? new Date(extractedData.errorDate) : undefined
      };
      
      return {
        success: true,
        data: parsedTicket,
        confidence: 0.95,
        reasoning
      };
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return {
        success: false,
        error: 'Failed to parse AI response',
        reasoning: text
      };
    }
  }
}