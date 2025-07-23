// src/utils/ticketParser.ts

import { ParsedTicket, DocumentType, ActionType, ErrorPattern } from '../types';

const ERROR_PATTERNS: Record<DocumentType, ErrorPattern[]> = {
  '810': [
    {
      pattern: /duplicate.*invoice/i,
      errorType: 'DUPLICATE_INVOICE',
      commonCauses: ['Invoice number already exists', 'Resubmission of processed invoice'],
      resolutionSteps: [
        'Verify invoice number uniqueness',
        'Check if invoice was already processed',
        'Generate new invoice number if needed'
      ]
    },
    {
      pattern: /invoice.*already.*exists/i,
      errorType: 'DUPLICATE_INVOICE',
      commonCauses: ['Invoice number already exists in system'],
      resolutionSteps: [
        'Resubmit with unique invoice number',
        'Add suffix like -A or -1 to original number',
        'Create new invoice from scratch if needed'
      ]
    },
    {
      pattern: /price.*mismatch|pricing.*error/i,
      errorType: 'PRICE_MISMATCH',
      commonCauses: ['PO price differs from invoice', 'Tax calculation error'],
      resolutionSteps: [
        'Compare invoice price with PO',
        'Verify tax calculations',
        'Update pricing in source system'
      ]
    },
    {
      pattern: /invalid.*po|purchase.*order.*not.*found/i,
      errorType: 'INVALID_PO',
      commonCauses: ['PO number incorrect', 'PO not yet in system'],
      resolutionSteps: [
        'Verify PO number format',
        'Check if PO exists in buyer system',
        'Wait for PO synchronization if recent'
      ]
    }
  ],
  '850': [
    {
      pattern: /item.*not.*found|invalid.*item/i,
      errorType: 'INVALID_ITEM',
      commonCauses: ['Item code not in catalog', 'Discontinued item'],
      resolutionSteps: [
        'Verify item code in catalog',
        'Check for alternate item codes',
        'Contact buyer for clarification'
      ]
    },
    {
      pattern: /quantity.*exceeds|over.*limit/i,
      errorType: 'QUANTITY_EXCEEDED',
      commonCauses: ['Order exceeds available stock', 'Maximum order limit reached'],
      resolutionSteps: [
        'Check current inventory levels',
        'Verify order quantity limits',
        'Split order if necessary'
      ]
    }
  ],
  '856': [
    {
      pattern: /tracking.*invalid|carrier.*not.*recognized/i,
      errorType: 'INVALID_TRACKING',
      commonCauses: ['Incorrect tracking format', 'Unsupported carrier code'],
      resolutionSteps: [
        'Verify tracking number format',
        'Confirm carrier code mapping',
        'Update carrier information'
      ]
    },
    {
      pattern: /shipment.*not.*match.*po/i,
      errorType: 'SHIPMENT_MISMATCH',
      commonCauses: ['Items shipped differ from PO', 'Quantity mismatch'],
      resolutionSteps: [
        'Compare shipment details with PO',
        'Verify picking and packing',
        'Send corrected ASN if needed'
      ]
    }
  ],
  '855': [],
  '997': []
};

// Extended list of known retailers
const KNOWN_BUYERS = [
  'walmart', 'target', 'amazon', 'costco', 'kroger', 'chewy', 
  'home depot', 'lowes', 'cvs', 'walgreens', 'best buy',
  'macys', 'nordstrom', 'kohls', 'petco', 'petsmart'
];

export class TicketParser {
  private static isZendeskTicket(text: string): boolean {
    return /zendesk|ticket\s*#|assignee|requester|cleo\.zendesk/i.test(text);
  }

  private static extractZendeskFields(text: string): {
    ticketNumber?: string;
    requester?: string;
    assignee?: string;
    subject?: string;
    priority?: string;
    tags?: string[];
  } {
    const fields: any = {};
    
    // Extract ticket number
    const ticketMatch = text.match(/ticket\s*#(\d+)/i) || text.match(/#(\d+)/);
    if (ticketMatch) fields.ticketNumber = ticketMatch[1];
    
    // Extract requester
    const requesterMatch = text.match(/requester[:\s]+([^\n]+)/i);
    if (requesterMatch) fields.requester = requesterMatch[1].trim();
    
    // Extract assignee
    const assigneeMatch = text.match(/assignee[:\s]+([^\n]+)/i);
    if (assigneeMatch) fields.assignee = assigneeMatch[1].trim();
    
    // Extract subject
    const subjectMatch = text.match(/subject[:\s]+([^\n]+)/i);
    if (subjectMatch) fields.subject = subjectMatch[1].trim();
    
    // Extract priority
    const priorityMatch = text.match(/priority[:\s]+(\w+)/i);
    if (priorityMatch) fields.priority = priorityMatch[1];
    
    // Extract tags
    const tagsMatch = text.match(/tags[:\s]+([^\n]+)/i);
    if (tagsMatch) {
      fields.tags = tagsMatch[1].split(/[,\s]+/).filter(t => t.length > 0);
    }
    
    return fields;
  }

  private static extractDocumentType(text: string): DocumentType | null {
    // Look for document type in various formats
    const patterns = [
      /\b(810|850|856|855|997)\b/,
      /EDI\s*(810|850|856|855|997)/i,
      /document\s*type[:\s]*(810|850|856|855|997)/i,
      /(810|850|856|855|997)\s*(invoice|order|asn|shipment|acknowledgment)/i,
      /EDI\s*(\d{3})/i, // Generic EDI document type
      /X12[:\s]*(\d{3})/i // X12 format
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const docType = match[1] || match[2];
        // Validate it's a known type
        if (['810', '850', '856', '855', '997'].includes(docType)) {
          return docType as DocumentType;
        }
      }
    }
    
    // Fallback: try to detect based on content keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes('invoice') && (lowerText.includes('810') || lowerText.includes('rejected'))) {
      return '810';
    } else if (lowerText.includes('purchase order') || lowerText.includes('po number')) {
      return '850';
    } else if (lowerText.includes('shipment') || lowerText.includes('asn') || lowerText.includes('tracking')) {
      return '856';
    } else if (lowerText.includes('acknowledgment') || lowerText.includes('997')) {
      return '855';
    }
    
    // Check for specific error patterns that indicate document type
    if (/invoice.*reject|reject.*invoice|duplicate.*invoice/i.test(lowerText)) {
      return '810';
    }
    if (/order.*reject|po.*reject|purchase.*order.*error/i.test(lowerText)) {
      return '850';
    }
    if (/asn.*error|shipment.*reject|tracking.*invalid/i.test(lowerText)) {
      return '856';
    }
    
    // Default to 810 if invoice-related keywords are found
    if (lowerText.includes('invoice') || lowerText.includes('payment') || lowerText.includes('billing')) {
      return '810';
    }
    
    return null;
  }

  private static extractEDISpecificData(text: string): {
    webediId?: string;
    controlNumber?: string;
    tradingPartner?: string;
    integationType?: string;
    errorCode?: string;
    messageId?: string;
  } {
    const data: any = {};
    
    // Extract WebEDI ID (Company ID)
    const webediIdPatterns = [
      /company\s*id[:\s]*(\d+)/i,
      /webedi\s*id[:\s]*(\d+)/i,
      /customer\s*id[:\s]*(\d+)/i,
      /account\s*#?[:\s]*(\d+)/i,
      /\bid[:\s]*(\d{4,})/i // 4+ digit IDs
    ];
    
    for (const pattern of webediIdPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.webediId = match[1];
        break;
      }
    }
    
    // Extract control numbers
    const controlPatterns = [
      /control\s*number[:\s]*([A-Z0-9]+)/i,
      /control\s*#[:\s]*([A-Z0-9]+)/i,
      /message\s*control[:\s]*([A-Z0-9]+)/i,
      /interchange\s*control[:\s]*(\d+)/i,
      /ISA13[:\s]*(\d+)/i // ISA13 control number
    ];
    
    for (const pattern of controlPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.controlNumber = match[1];
        break;
      }
    }
    
    // Extract trading partner
    const tradingPartnerPatterns = [
      /trading\s*partner[:\s]+([^\n]+)/i,
      /partner[:\s]+([^\n]+)/i,
      /tp[:\s]+([^\n]+)/i
    ];
    
    for (const pattern of tradingPartnerPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.tradingPartner = match[1].trim();
        break;
      }
    }
    
    // Extract integration type
    const integrationPatterns = [
      /integration[:\s]+([^\n]+)/i,
      /connection\s*type[:\s]+([^\n]+)/i,
      /protocol[:\s]+(AS2|SFTP|FTP|HTTP|API)/i,
      /(AS2|SFTP|FTP|HTTP|API)\s+connection/i
    ];
    
    for (const pattern of integrationPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.integationType = match[1].trim();
        break;
      }
    }
    
    return data;
  }

  private static extractCompanyNames(text: string): { supplier: string; buyer: string } {
    let supplier = 'Unknown Supplier';
    let buyer = 'Unknown Buyer';

    // Enhanced supplier patterns
    const supplierPatterns = [
      /supplier[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /vendor[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /from[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /sender[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /\b(\w+(?:\s+\w+)*)\s*-\s*(?:outbound|inbound)\s+\d+/i, // "Zero Egg Count - Outbound 810"
      /email\s+[\w\s]+\([\w.]+@([\w-]+)\.com\)/i, // Extract from email domain
      /[\w.]+@([\w-]+)\.com/i // General email pattern
    ];

    // Enhanced buyer patterns
    const buyerPatterns = [
      /buyer[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /customer[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /receiver[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /to[:\s]+([A-Za-z0-9\s&,.'()-]+?)(?:\s*[-–\n]|\s*$)/i,
      /rejected\s+by\s+([A-Za-z0-9\s&,.'()-]+?)(?:\s*\(|$)/i, // "rejected by Chewy.com"
      /invoices?\s+rejected\s+by\s+([A-Za-z0-9\s&,.'()-]+)/i,
      /CC\s+[\w\s]+\([\w.]+@([\w.-]+)\)/i // Extract from CC email
    ];

    // Try supplier patterns - check for title pattern first
    const titleMatch = text.match(/^\d+\s+([^-]+)\s*-\s*(?:outbound|inbound)\s+\d+/i);
    if (titleMatch) {
      supplier = titleMatch[1].trim();
    } else {
      // Try other supplier patterns
      for (const pattern of supplierPatterns) {
        const match = text.match(pattern);
        if (match) {
          let extracted = match[1].trim();
          
          // Skip if this is an email domain that matches the buyer
          if (extracted.toLowerCase() === 'chewy' || extracted.toLowerCase() === 'chewy.com') {
            continue;
          }
          
          // Clean up email domain to company name
          if (extracted.includes('@') || extracted.match(/^[\w-]+$/)) {
            // Extract from email like tdavis@zeroeggcount.com
            if (pattern.toString().includes('@')) {
              const emailMatch = text.match(/[\w.]+@([\w-]+)\.com/i);
              if (emailMatch && emailMatch[1].toLowerCase() !== 'chewy') {
                extracted = emailMatch[1].replace(/[.-]/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                supplier = extracted;
                break;
              }
            }
          } else {
            supplier = extracted;
            break;
          }
        }
      }
    }

    // Try buyer patterns
    for (const pattern of buyerPatterns) {
      const match = text.match(pattern);
      if (match) {
        let extracted = match[1].trim();
        
        // Clean up .com suffix
        extracted = extracted.replace(/\.com$/i, '');
        
        // Clean up email domain
        if (extracted.match(/^[\w.-]+$/)) {
          extracted = extracted.split('.')[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        buyer = extracted;
        break;
      }
    }

    // Check for known buyers
    const lowerText = text.toLowerCase();
    for (const knownBuyer of KNOWN_BUYERS) {
      if (lowerText.includes(knownBuyer)) {
        buyer = knownBuyer.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      }
    }
    
    // Additional patterns for company names in headers/footers
    if (supplier === 'Unknown Supplier' || buyer === 'Unknown Buyer') {
      // Look for company names in common formats
      const companyPatterns = [
        /^([A-Z][A-Za-z0-9\s&,.'()-]+?)[\s\n]/m, // Company name at start of line
        /From:\s*([A-Za-z0-9\s&,.'()-]+?)[\s\n]/i,
        /To:\s*([A-Za-z0-9\s&,.'()-]+?)[\s\n]/i,
        /Company:\s*([A-Za-z0-9\s&,.'()-]+?)[\s\n]/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const company = match[1].trim();
          if (company.length > 2 && company.length < 50) {
            if (supplier === 'Unknown Supplier') {
              supplier = company;
            } else if (buyer === 'Unknown Buyer' && company !== supplier) {
              buyer = company;
            }
          }
        }
      }
    }

    // Extract from email addresses if still unknown
    if (supplier === 'Unknown Supplier') {
      // Look for supplier email pattern specifically
      const supplierEmailMatch = text.match(/email\s+[\w\s]+\(([\w.]+@([\w-]+)\.com)\)/i);
      if (supplierEmailMatch && supplierEmailMatch[2].toLowerCase() !== buyer.toLowerCase()) {
        supplier = supplierEmailMatch[2].replace(/[-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    return { supplier, buyer };
  }

  private static extractPONumbers(text: string): string[] {
    const poPatterns = [
      /PO[#\s:]*([A-Z0-9-]+)/gi,
      /purchase\s*order[#\s:]*([A-Z0-9-]+)/gi,
      /order[#\s:]*([A-Z0-9-]+)/gi,
      /PO\s*Numbers?[:\s]+([A-Z0-9,\s-]+)/gi, // "PO Numbers: RS41745897, RS41732724"
      /affected\s*PO\s*Numbers?[:\s]+([A-Z0-9,\s-]+)/gi,
      /\b(RS\d{8})\b/g, // Specific pattern for RS followed by 8 digits
      /\b([A-Z]{2,3}\d{6,10})\b/g, // General pattern for 2-3 letters + 6-10 digits
      /Invoice\s*#?\s*([A-Z0-9-]+)/gi, // Invoice numbers
      /Invoice\s*Number[:\s]+([A-Z0-9-]+)/gi,
      /Order\s*#?\s*([A-Z0-9-]+)/gi, // Order numbers
      /Reference[:\s]+([A-Z0-9-]+)/gi, // Reference numbers
      /Document\s*#?\s*([A-Z0-9-]+)/gi // Document numbers
    ];

    const poNumbers: string[] = [];
    
    for (const pattern of poPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // Handle comma-separated PO numbers
          const poList = match[1].split(/[,\s]+/).filter(po => po.length > 0);
          for (const po of poList) {
            const cleanPO = po.trim();
            // More flexible validation - allow mixed alphanumeric
            if (cleanPO.match(/^[A-Z0-9-]+$/i) && cleanPO.length > 3 && !poNumbers.includes(cleanPO)) {
              poNumbers.push(cleanPO);
            }
          }
        }
      }
    }
    
    console.log('Found PO/Invoice numbers:', poNumbers);
    return poNumbers;
  }

  private static detectErrorType(text: string, docType: DocumentType): { 
    errorType: string; 
    errorCode?: string;
    resolutionSteps: string[];
  } {
    const patterns = ERROR_PATTERNS[docType] || [];
    
    // Check predefined patterns
    for (const errorPattern of patterns) {
      if (errorPattern.pattern.test(text)) {
        // Also try to extract error code from parentheses
        const errorCodeMatch = text.match(/\(([A-Z]{2}-\d{6})\)/);
        
        return {
          errorType: errorPattern.errorType,
          errorCode: errorCodeMatch ? errorCodeMatch[1] : undefined,
          resolutionSteps: errorPattern.resolutionSteps
        };
      }
    }

    // Enhanced error code extraction
    const errorCodePatterns = [
      /error\s*code[:\s]+([A-Z0-9-]+)/i,
      /\(([A-Z]{2}-\d{6})\)/, // Pattern like (AP-810776)
      /error[:\s]+([A-Z0-9-]+)/i,
      /code[:\s]+([A-Z0-9-]+)/i
    ];

    let errorCode: string | undefined;
    for (const pattern of errorCodePatterns) {
      const match = text.match(pattern);
      if (match) {
        errorCode = match[1];
        break;
      }
    }
    
    // Try to determine error type from text if not found in patterns
    let errorType = 'UNKNOWN_ERROR';
    if (/duplicate|already exists/i.test(text)) {
      errorType = 'DUPLICATE_INVOICE';
    } else if (/price|pricing|amount/i.test(text)) {
      errorType = 'PRICE_MISMATCH';
    } else if (/item|product|sku/i.test(text)) {
      errorType = 'INVALID_ITEM';
    } else if (/tracking|carrier|shipment/i.test(text)) {
      errorType = 'INVALID_TRACKING';
    }
    
    return {
      errorType,
      errorCode,
      resolutionSteps: ['Review error details', 'Check document format', 'Contact support if needed']
    };
  }

  private static detectAction(text: string): ActionType {
    if (/reject|denied|failed/i.test(text)) return 'rejection';
    if (/modif|change|update/i.test(text)) return 'modification';
    if (/accept|success|approved/i.test(text)) return 'acceptance';
    return 'rejection';
  }

  private static extractTicketId(text: string): string | undefined {
    // Extract ticket ID from patterns like "5064 Zero Egg Count"
    const patterns = [
      /^(\d{4,6})\s+/,
      /ticket[#:\s]+(\d{4,6})/i,
      /case[#:\s]+(\d{4,6})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  public static parse(rawText: string): ParsedTicket | null {
    try {
      // Debug logging
      console.log('=== TICKET PARSER DEBUG ===');
      console.log('Text length:', rawText.length);
      console.log('First 500 chars:', rawText.substring(0, 500));
      
      // Check if this is a Zendesk ticket
      const isZendesk = this.isZendeskTicket(rawText);
      console.log('Is Zendesk ticket:', isZendesk);
      
      if (isZendesk) {
        const zendeskFields = this.extractZendeskFields(rawText);
        console.log('Zendesk fields:', zendeskFields);
      }
      
      // Check if this is video analysis output
      const isVideoAnalysis = rawText.includes('Video Analysis Results:');
      console.log('Is video analysis:', isVideoAnalysis);
      
      if (isVideoAnalysis && rawText.includes('Manual Input Required')) {
        console.log('Video requires manual input - showing template');
        // Return a special result for video that needs manual input
        return {
          id: `video-${Date.now()}`,
          documentType: '810', // Default for now
          supplier: 'Video Analysis',
          buyer: 'Manual Review Required',
          errorType: 'VIDEO_ANALYSIS',
          errorCode: 'MANUAL_INPUT_NEEDED',
          affectedPOs: [],
          action: 'modification' as ActionType,
          timestamp: new Date(),
          rawText,
          webediId: undefined,
          controlNumber: undefined,
          tradingPartner: undefined,
          integationType: 'Video'
        };
      }
      
      // Extract EDI-specific data
      const ediData = this.extractEDISpecificData(rawText);
      console.log('EDI specific data:', ediData);
      
      // Try to extract as much as possible
      const { supplier, buyer } = this.extractCompanyNames(rawText);
      const affectedPOs = this.extractPONumbers(rawText);
      const ticketId = this.extractTicketId(rawText);
      
      console.log('Extracted so far:', { supplier, buyer, affectedPOs, ticketId });
      
      // Try to detect document type with fallback
      let documentType = this.extractDocumentType(rawText);
      
      if (!documentType) {
        console.log('No document type found, attempting fallback detection...');
        
        // Check for specific EDI error messages that indicate document type
        if (/810|invoice/i.test(rawText)) {
          documentType = '810';
          console.log('Found 810/invoice reference');
        } else if (/850|purchase\s*order|po\s/i.test(rawText)) {
          documentType = '850';
          console.log('Found 850/PO reference');
        } else if (/856|asn|advance\s*ship/i.test(rawText)) {
          documentType = '856';
          console.log('Found 856/ASN reference');
        } else if (/997|functional\s*ack/i.test(rawText)) {
          documentType = '997';
          console.log('Found 997 reference');
        } else if (affectedPOs.length > 0) {
          // If we have PO numbers but no clear type, default to 810
          documentType = '810';
          console.log('Have PO numbers, defaulting to 810');
        } else {
          // Absolute last resort - check for any business terms
          if (/payment|billing|order|ship|deliver|invoice|purchase/i.test(rawText)) {
            documentType = '810';
            console.log('Found business terms, defaulting to 810');
          } else {
            console.log('No EDI indicators found in text');
            throw new Error('Could not detect any EDI-related content');
          }
        }
      }
      
      const { errorType, errorCode } = this.detectErrorType(rawText, documentType);
      const action = this.detectAction(rawText);

      const result = {
        id: ticketId || ediData.webediId || `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        documentType,
        supplier,
        buyer: buyer !== 'Unknown Buyer' ? buyer : (ediData.tradingPartner || buyer),
        errorType,
        errorCode: errorCode || ediData.errorCode,
        affectedPOs,
        action,
        timestamp: new Date(),
        rawText,
        // Additional EDI fields
        webediId: ediData.webediId,
        controlNumber: ediData.controlNumber,
        tradingPartner: ediData.tradingPartner,
        integationType: ediData.integationType
      };
      
      console.log('Final parsed result:', result);
      console.log('=== END PARSER DEBUG ===');
      
      return result;
    } catch (error) {
      console.error('Ticket parsing failed:', error);
      console.log('Raw text that failed:', rawText.substring(0, 1000));
      return null;
    }
  }

  public static getParsingConfidence(ticket: ParsedTicket): number {
    let confidence = 0;
    
    if (ticket.supplier !== 'Unknown Supplier') confidence += 0.2;
    if (ticket.buyer !== 'Unknown Buyer') confidence += 0.2;
    if (ticket.affectedPOs.length > 0) confidence += 0.2;
    if (ticket.errorType !== 'UNKNOWN_ERROR') confidence += 0.3;
    if (ticket.errorCode) confidence += 0.1;
    
    return confidence;
  }
}