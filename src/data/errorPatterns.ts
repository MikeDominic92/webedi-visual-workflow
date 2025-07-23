export interface ErrorPattern {
  id: string;
  errorType: string;
  errorCode?: string;
  documentTypes: string[];
  commonCauses: string[];
  resolutionSteps: string[];
  preventionTips: string[];
  estimatedTime: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number; // percentage
}

export const errorPatterns: ErrorPattern[] = [
  {
    id: 'duplicate-invoice',
    errorType: 'Duplicate Invoice Number',
    errorCode: 'ERR_810_DUP',
    documentTypes: ['810'],
    commonCauses: [
      'Invoice number already exists in buyer system',
      'Resubmission of previously sent invoice',
      'System error causing double submission',
      'Incorrect invoice numbering sequence'
    ],
    resolutionSteps: [
      'Verify the invoice hasn\'t been previously submitted',
      'Check buyer\'s system for existing invoice with same number',
      'If legitimate duplicate, append suffix (e.g., -R1) to invoice number',
      'Review invoice numbering sequence for gaps or duplicates',
      'Contact buyer\'s EDI team if issue persists'
    ],
    preventionTips: [
      'Implement unique invoice numbering system',
      'Maintain log of all submitted invoices',
      'Use automated sequence generation',
      'Regular reconciliation with buyer'
    ],
    estimatedTime: '15-30 minutes',
    severity: 'medium',
    frequency: 25
  },
  {
    id: 'missing-line-items',
    errorType: 'Missing Line Items',
    errorCode: 'ERR_810_MLI',
    documentTypes: ['810', '850'],
    commonCauses: [
      'Line items from PO not included in invoice',
      'Cancelled items not properly indicated',
      'Partial shipment not reflected',
      'System mapping error'
    ],
    resolutionSteps: [
      'Compare invoice line items with original PO',
      'Verify all shipped items are included',
      'Check for any cancelled or backordered items',
      'Ensure proper line item numbering sequence',
      'Resubmit with complete line item details'
    ],
    preventionTips: [
      'Automated PO to invoice matching',
      'Pre-submission validation checks',
      'Regular system mapping reviews',
      'Clear partial shipment procedures'
    ],
    estimatedTime: '30-45 minutes',
    severity: 'high',
    frequency: 18
  },
  {
    id: 'invalid-dates',
    errorType: 'Invalid Date Format',
    errorCode: 'ERR_GEN_DATE',
    documentTypes: ['810', '850', '856'],
    commonCauses: [
      'Incorrect date format (YYYYMMDD vs MM/DD/YYYY)',
      'Future ship dates',
      'Invoice date before ship date',
      'Timezone discrepancies'
    ],
    resolutionSteps: [
      'Verify required date format for trading partner',
      'Check all dates are in correct format',
      'Ensure logical date sequence (PO → Ship → Invoice)',
      'Correct any timezone issues',
      'Resubmit with corrected dates'
    ],
    preventionTips: [
      'Standardize date formats across systems',
      'Implement date validation rules',
      'Automated date logic checks',
      'Document partner-specific requirements'
    ],
    estimatedTime: '10-20 minutes',
    severity: 'low',
    frequency: 30
  },
  {
    id: 'price-mismatch',
    errorType: 'Price Mismatch',
    errorCode: 'ERR_810_PRICE',
    documentTypes: ['810'],
    commonCauses: [
      'Invoice price differs from PO price',
      'Unapproved price changes',
      'Unit of measure discrepancies',
      'Discount calculations errors'
    ],
    resolutionSteps: [
      'Compare invoice prices with original PO',
      'Verify any approved price changes',
      'Check unit of measure consistency',
      'Review discount calculations',
      'Contact buyer for price approval if needed',
      'Resubmit with correct pricing'
    ],
    preventionTips: [
      'Automated price matching with PO',
      'Price change approval workflow',
      'Regular price file updates',
      'Clear discount agreement documentation'
    ],
    estimatedTime: '20-40 minutes',
    severity: 'high',
    frequency: 22
  },
  {
    id: 'invalid-product-id',
    errorType: 'Invalid Product Identifier',
    errorCode: 'ERR_GEN_PROD',
    documentTypes: ['810', '850', '856'],
    commonCauses: [
      'Incorrect UPC/GTIN',
      'Buyer SKU mismatch',
      'Discontinued product codes',
      'New item not yet in buyer system'
    ],
    resolutionSteps: [
      'Verify product codes against buyer catalog',
      'Check for recent product code changes',
      'Confirm new items are set up in buyer system',
      'Use correct identifier type (UPC vs SKU)',
      'Update and resubmit with correct codes'
    ],
    preventionTips: [
      'Regular catalog synchronization',
      'New item setup verification',
      'Product master data management',
      'Automated code validation'
    ],
    estimatedTime: '15-30 minutes',
    severity: 'medium',
    frequency: 20
  },
  {
    id: 'missing-asn',
    errorType: 'Missing Advance Ship Notice',
    errorCode: 'ERR_856_MISS',
    documentTypes: ['856'],
    commonCauses: [
      'ASN not sent before shipment arrival',
      'ASN sent to wrong destination',
      'System transmission failure',
      'Incorrect shipment identification'
    ],
    resolutionSteps: [
      'Verify ASN was generated for shipment',
      'Check transmission logs for errors',
      'Confirm correct receiver ID',
      'Resend ASN immediately',
      'Notify buyer of delay'
    ],
    preventionTips: [
      'Automated ASN generation at ship time',
      'Transmission confirmation monitoring',
      'Backup transmission methods',
      'Real-time alerting for failures'
    ],
    estimatedTime: '10-15 minutes',
    severity: 'critical',
    frequency: 12
  },
  {
    id: 'invalid-ship-to',
    errorType: 'Invalid Ship-To Location',
    errorCode: 'ERR_GEN_SHIP',
    documentTypes: ['850', '856'],
    commonCauses: [
      'Incorrect store/DC number',
      'Closed or inactive location',
      'Missing location in system',
      'Wrong location format'
    ],
    resolutionSteps: [
      'Verify ship-to location against buyer directory',
      'Check for recent location changes',
      'Confirm location is active',
      'Use correct location identifier format',
      'Update and retransmit'
    ],
    preventionTips: [
      'Regular location file updates',
      'Automated location validation',
      'Change notification process',
      'Location master maintenance'
    ],
    estimatedTime: '15-25 minutes',
    severity: 'medium',
    frequency: 15
  },
  {
    id: 'po-acknowledgment',
    errorType: 'Missing PO Acknowledgment',
    errorCode: 'ERR_855_MISS',
    documentTypes: ['855'],
    commonCauses: [
      'PO acknowledgment not sent timely',
      'System didn\'t generate 855',
      'Acknowledgment requirements unclear',
      'Transmission failure'
    ],
    resolutionSteps: [
      'Check if 855 is required by trading partner',
      'Generate and send acknowledgment',
      'Include all required elements',
      'Confirm successful transmission',
      'Document acknowledgment sent'
    ],
    preventionTips: [
      'Automated 855 generation rules',
      'Partner requirement documentation',
      'Acknowledgment deadline monitoring',
      'Exception reporting'
    ],
    estimatedTime: '10-20 minutes',
    severity: 'low',
    frequency: 8
  }
];

export const getErrorPattern = (errorType: string): ErrorPattern | undefined => {
  return errorPatterns.find(pattern => 
    pattern.errorType.toLowerCase().includes(errorType.toLowerCase()) ||
    pattern.id === errorType
  );
};

export const getErrorsByDocumentType = (docType: string): ErrorPattern[] => {
  return errorPatterns.filter(pattern => 
    pattern.documentTypes.includes(docType)
  );
};

export const getErrorsBySeverity = (severity: ErrorPattern['severity']): ErrorPattern[] => {
  return errorPatterns.filter(pattern => pattern.severity === severity);
};