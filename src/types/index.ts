// src/types/index.ts

export type DocumentType = '810' | '850' | '856' | '855' | '997';
export type ActionType = 'rejection' | 'acceptance' | 'modification';
export type NodeStatus = 'start' | 'processing' | 'error' | 'complete';

export interface ParsedTicket {
  id: string;
  documentType: DocumentType;
  supplier: string;
  buyer: string;
  errorType: string;
  errorCode?: string;
  affectedPOs: string[];
  action: ActionType;
  timestamp: Date;
  rawText: string;
  // Additional EDI fields
  webediId?: string;
  controlNumber?: string;
  tradingPartner?: string;
  integationType?: string;
  // Customer Information
  ticketTitle?: string;
  customerName?: string;
  callerOnRecord?: string;
  personOnPhone?: string;
  companyName?: string;
  companyId?: string;
  phoneNumber?: string;
  email?: string;
  // Issue Details
  issueDescription?: string;
  messageIds?: string[];
  // Additional context
  documentTypes?: string[];
  errorDate?: Date;
}

export interface WorkflowNode {
  id: string;
  type: 'station' | 'junction' | 'terminus';
  position: { x: number; y: number };
  data: {
    label: string;
    status: NodeStatus;
    description?: string;
    errorDetails?: string;
    timestamp?: Date;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'main' | 'error' | 'alternative';
  animated?: boolean;
  label?: string;
}

export interface VisualWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    documentType: DocumentType;
    generatedAt: Date;
    confidence: number;
  };
}

export interface ErrorPattern {
  pattern: RegExp;
  errorType: string;
  commonCauses: string[];
  resolutionSteps: string[];
}

export interface DocumentTypeConfig {
  type: DocumentType;
  name: string;
  errorPatterns: ErrorPattern[];
  standardFlow: {
    steps: string[];
    criticalPoints: number[];
  };
}

export interface WorkflowState {
  currentTicket: ParsedTicket | null;
  workflow: VisualWorkflow | null;
  isProcessing: boolean;
  error: string | null;
  
  parseTicket: (rawText: string) => Promise<void>;
  generateWorkflow: (ticket: ParsedTicket) => void;
  clearWorkflow: () => void;
}

export interface AIAnalysisState {
  phase: 'idle' | 'parsing' | 'analyzing' | 'building-consensus' | 'complete';
  activeModel?: string;
  progress: number;
  insights: string[];
}

// 2-Stage AI Workflow Types
export interface AIStageResult {
  stage?: 1 | 2;
  model?: string; // Flexible model name to support OpenRouter and other providers
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  tokensPerSecond?: number;
}

export interface TwoStageAIResponse {
  stage1: AIStageResult; // Gemini 2.5 Pro parsing
  stage2?: AIStageResult; // Kimi K2 response generation
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