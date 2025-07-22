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