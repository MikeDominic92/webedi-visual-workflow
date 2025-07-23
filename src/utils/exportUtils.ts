import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { ParsedTicket, VisualWorkflow } from '../types';

export type ExportFormat = 'png' | 'svg' | 'pdf';

interface ExportOptions {
  fileName?: string;
  quality?: number;
  backgroundColor?: string;
}

export const exportWorkflow = async (
  element: HTMLElement,
  format: ExportFormat,
  options: ExportOptions = {}
) => {
  const {
    fileName = `workflow-${new Date().toISOString().split('T')[0]}`,
    quality = 0.95,
    backgroundColor = '#ffffff'
  } = options;

  try {
    switch (format) {
      case 'png':
        return await exportAsPNG(element, fileName, quality, backgroundColor);
      case 'svg':
        return await exportAsSVG(element, fileName, backgroundColor);
      case 'pdf':
        return await exportAsPDF(element, fileName, backgroundColor);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

const exportAsPNG = async (
  element: HTMLElement,
  fileName: string,
  quality: number,
  backgroundColor: string
) => {
  const dataUrl = await toPng(element, {
    quality,
    backgroundColor,
    pixelRatio: 2, // Higher resolution for better quality
  });
  
  saveAs(dataUrl, `${fileName}.png`);
};

const exportAsSVG = async (
  element: HTMLElement,
  fileName: string,
  backgroundColor: string
) => {
  const dataUrl = await toSvg(element, {
    backgroundColor,
  });
  
  const blob = await (await fetch(dataUrl)).blob();
  saveAs(blob, `${fileName}.svg`);
};

const exportAsPDF = async (
  element: HTMLElement,
  fileName: string,
  backgroundColor: string
) => {
  const imgData = await toPng(element, {
    backgroundColor,
    pixelRatio: 2,
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: 'a4',
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${fileName}.pdf`);
};

export const generateWorkflowReport = (
  ticket: ParsedTicket | null,
  workflow: VisualWorkflow | null
): string => {
  if (!ticket || !workflow) {
    return 'No workflow data available';
  }

  const report = `
WebEDI Workflow Report
Generated: ${new Date().toLocaleString()}

TICKET INFORMATION
==================
Document Type: ${ticket.documentType}
Supplier: ${ticket.supplier}
Buyer: ${ticket.buyer}
Error Type: ${ticket.errorType}
${ticket.errorCode ? `Error Code: ${ticket.errorCode}` : ''}
${ticket.affectedPOs.length > 0 ? `Affected POs: ${ticket.affectedPOs.join(', ')}` : ''}

WORKFLOW ANALYSIS
=================
Confidence: ${Math.round(workflow.metadata.confidence * 100)}%
Total Steps: ${workflow.nodes.length}
Status Breakdown:
- Start/Success: ${workflow.nodes.filter(n => n.data.status === 'start').length}
- Processing: ${workflow.nodes.filter(n => n.data.status === 'processing').length}
- Errors: ${workflow.nodes.filter(n => n.data.status === 'error').length}
- Complete: ${workflow.nodes.filter(n => n.data.status === 'complete').length}

WORKFLOW STEPS
==============
${workflow.nodes.map((node, index) => 
  `${index + 1}. ${node.data.label} (${node.data.status})${
    node.data.errorDetails ? `\n   Error: ${node.data.errorDetails}` : ''
  }`
).join('\n')}

RESOLUTION SUGGESTIONS
=====================
${generateResolutionSuggestions(ticket.errorType)}
  `;

  return report.trim();
};

const generateResolutionSuggestions = (errorType: string): string => {
  const suggestions: Record<string, string> = {
    'duplicate_invoice': `
1. Verify the invoice number hasn't been previously submitted
2. Check for any system duplications or resubmissions
3. If legitimate duplicate, add a suffix to the invoice number
4. Contact the buyer's EDI team if the issue persists`,
    
    'missing_line_items': `
1. Review the original purchase order for all required items
2. Ensure all line items from the PO are included in the invoice
3. Check for any items that may have been cancelled or modified
4. Resubmit with complete line item details`,
    
    'invalid_dates': `
1. Verify date formats match the trading partner's requirements
2. Check that ship dates are not in the future
3. Ensure invoice date is after or equal to ship date
4. Correct any timezone discrepancies`,
    
    'price_mismatch': `
1. Compare invoice prices with the original PO prices
2. Check for any approved price changes or discounts
3. Verify unit of measure matches between PO and invoice
4. Contact buyer if legitimate price changes need approval`,
  };

  return suggestions[errorType] || `
1. Review the error details carefully
2. Check trading partner specifications
3. Verify all required fields are populated
4. Contact support if the issue is unclear`;
};