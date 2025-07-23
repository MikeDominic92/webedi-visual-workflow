// src/store/workflowStore.ts

import { create } from 'zustand';
import { WorkflowState, ParsedTicket, VisualWorkflow, WorkflowNode, WorkflowEdge } from '../types';
import { TicketParser } from '../utils/ticketParser';
import { TicketService } from '../services/ticketService';
import { Ticket } from '../lib/supabase';

const generateWorkflowFromTicket = (ticket: ParsedTicket): VisualWorkflow => {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];
  
  // Special handling for video analysis
  if (ticket.errorType === 'VIDEO_ANALYSIS') {
    const videoFlow = [
      { id: 'start', label: 'Video Uploaded', status: 'complete' as const },
      { id: 'process', label: 'Frame Extraction', status: 'complete' as const },
      { id: 'ocr', label: 'OCR Analysis', status: 'complete' as const },
      { id: 'manual', label: 'Manual Review Required', status: 'processing' as const },
      { id: 'complete', label: 'Ready for Input', status: 'start' as const }
    ];
    
    videoFlow.forEach((step, index) => {
      const x = 400; // Center horizontally
      const y = 100 + (index * 200); // Increased vertical spacing
      
      nodes.push({
        id: step.id,
        type: 'station',
        position: { x, y },
        data: {
          label: step.label,
          status: step.status,
          description: step.id === 'manual' ? 'Please fill in the EDI details from the video' : undefined
        }
      });
    });
    
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'main',
        animated: nodes[i].data.status === 'processing'
      });
    }
    
    return {
      nodes,
      edges,
      metadata: {
        documentType: ticket.documentType,
        generatedAt: new Date(),
        confidence: 0.5 // Lower confidence for video analysis
      }
    };
  }
  
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
    const x = 400; // Center horizontally
    const y = 100 + (index * 200); // Increased vertical spacing
    
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

interface ExtendedWorkflowState extends WorkflowState {
  savedTicket: Ticket | null;
  recentTickets: Ticket[];
  loadRecentTickets: () => Promise<void>;
}

export const useWorkflowStore = create<ExtendedWorkflowState>((set, get) => ({
  currentTicket: null,
  workflow: null,
  isProcessing: false,
  error: null,
  savedTicket: null,
  recentTickets: [],

  parseTicket: async (rawText: string) => {
    console.log('parseTicket called with text length:', rawText.length);
    set({ isProcessing: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Attempting to parse ticket...');
      const parsedTicket = TicketParser.parse(rawText);
      
      if (!parsedTicket) {
        console.error('Ticket parsing returned null');
        throw new Error('Could not extract EDI information from the text. The parser is looking for: invoice numbers, PO numbers, company names, or EDI document types (810, 850, 856). Please check the console for debug information.');
      }

      console.log('Ticket parsed successfully:', parsedTicket);
      set({ currentTicket: parsedTicket });
      get().generateWorkflow(parsedTicket);
      
    } catch (error) {
      console.error('Parse ticket error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isProcessing: false 
      });
    }
  },

  generateWorkflow: async (ticket: ParsedTicket) => {
    try {
      const workflow = generateWorkflowFromTicket(ticket);
      set({ 
        workflow, 
        isProcessing: false,
        error: null 
      });
      
      // Save ticket to database
      const savedTicket = await TicketService.saveTicket(ticket, workflow);
      if (savedTicket) {
        set({ savedTicket });
        console.log('Ticket saved to database:', savedTicket.id);
        
        // Reload recent tickets
        get().loadRecentTickets();
      }
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
      error: null,
      savedTicket: null
    });
  },
  
  loadRecentTickets: async () => {
    try {
      const tickets = await TicketService.getRecentTickets(5);
      set({ recentTickets: tickets });
    } catch (error) {
      console.error('Error loading recent tickets:', error);
    }
  }
}));

export const useParsedTicket = () => {
  return useWorkflowStore(state => state.currentTicket);
};

export const useWorkflow = () => {
  return useWorkflowStore(state => state.workflow);
};

export const useWorkflowError = () => {
  return useWorkflowStore(state => state.error);
};

export const useRecentTickets = () => {
  return useWorkflowStore(state => state.recentTickets);
};

export const useSavedTicket = () => {
  return useWorkflowStore(state => state.savedTicket);
};