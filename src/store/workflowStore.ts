// src/store/workflowStore.ts

import { create } from 'zustand';
import { WorkflowState, ParsedTicket, VisualWorkflow, WorkflowNode, WorkflowEdge } from '../types';
import { TicketParser } from '../utils/ticketParser';

const generateWorkflowFromTicket = (ticket: ParsedTicket): VisualWorkflow => {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];
  
  const baseFlows = {
    '810': [
      { id: 'start', label: 'Invoice Received', status: 'complete' as const },
      { id: 'validate', label: 'Validate Invoice', status: 'processing' as const },
      { id: 'error', label: `Error: ${ticket.errorType}`, status: 'error' as const },
      { id: 'resolution', label: 'Apply Resolution', status: 'processing' as const },
      { id: 'complete', label: 'Invoice Processed', status: 'start' as const }
    ],
    '850': [
      { id: 'start', label: 'PO Received', status: 'complete' as const },
      { id: 'validate', label: 'Validate Order', status: 'processing' as const },
      { id: 'error', label: `Error: ${ticket.errorType}`, status: 'error' as const },
      { id: 'resolution', label: 'Resolve Issue', status: 'processing' as const },
      { id: 'complete', label: 'Order Accepted', status: 'start' as const }
    ],
    '856': [
      { id: 'start', label: 'ASN Created', status: 'complete' as const },
      { id: 'validate', label: 'Validate Shipment', status: 'processing' as const },
      { id: 'error', label: `Error: ${ticket.errorType}`, status: 'error' as const },
      { id: 'resolution', label: 'Correct ASN', status: 'processing' as const },
      { id: 'complete', label: 'ASN Accepted', status: 'start' as const }
    ],
    '855': [
      { id: 'start', label: 'PO Acknowledgment', status: 'complete' as const },
      { id: 'complete', label: 'Acknowledged', status: 'start' as const }
    ],
    '997': [
      { id: 'start', label: 'Functional Ack', status: 'complete' as const },
      { id: 'complete', label: 'Acknowledged', status: 'start' as const }
    ]
  };

  const flow = baseFlows[ticket.documentType] || baseFlows['810'];
  
  flow.forEach((step, index) => {
    const x = 200 + (index * 250);
    const y = 200 + (index % 2 === 0 ? 0 : 50);
    
    nodes.push({
      id: step.id,
      type: 'station',
      position: { x, y },
      data: {
        label: step.label,
        status: step.status,
        description: step.id === 'error' ? ticket.errorCode : undefined,
        errorDetails: step.id === 'error' ? ticket.rawText.substring(0, 100) + '...' : undefined
      }
    });
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    const isErrorPath = nodes[i].data.status === 'error' || nodes[i + 1].data.status === 'error';
    
    edges.push({
      id: `edge-${i}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: isErrorPath ? 'error' : 'main',
      animated: nodes[i].data.status === 'processing'
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      documentType: ticket.documentType,
      generatedAt: new Date(),
      confidence: TicketParser.getParsingConfidence(ticket)
    }
  };
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentTicket: null,
  workflow: null,
  isProcessing: false,
  error: null,

  parseTicket: async (rawText: string) => {
    set({ isProcessing: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const parsedTicket = TicketParser.parse(rawText);
      
      if (!parsedTicket) {
        throw new Error('Failed to parse ticket. Please check the format.');
      }

      set({ currentTicket: parsedTicket });
      get().generateWorkflow(parsedTicket);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isProcessing: false 
      });
    }
  },

  generateWorkflow: (ticket: ParsedTicket) => {
    try {
      const workflow = generateWorkflowFromTicket(ticket);
      set({ 
        workflow, 
        isProcessing: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate workflow',
        isProcessing: false 
      });
    }
  },

  clearWorkflow: () => {
    set({
      currentTicket: null,
      workflow: null,
      isProcessing: false,
      error: null
    });
  }
}));

export const useParsedTicket = () => {
  return useWorkflowStore(state => state.currentTicket);
};

export const useWorkflow = () => {
  return useWorkflowStore(state => state.workflow);
};