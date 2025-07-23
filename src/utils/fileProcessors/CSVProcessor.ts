import { BaseProcessor, ProcessResult } from './BaseProcessor';
import Papa from 'papaparse';

export class CSVProcessor extends BaseProcessor {
  async process(): Promise<ProcessResult> {
    try {
      const text = await this.readFileAsText();
      
      // Parse CSV
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        const errorMessages = parseResult.errors.map((e: any) => e.message).join(', ');
        return {
          success: false,
          error: `CSV parsing errors: ${errorMessages}`
        };
      }

      // Convert CSV data to readable text format
      const formattedText = this.formatCSVAsText(parseResult.data as any[], parseResult.meta.fields);
      
      console.log('CSV processing completed:');
      console.log('- Rows:', parseResult.data.length);
      console.log('- Columns:', parseResult.meta.fields?.length || 0);
      console.log('- Text preview:', formattedText.substring(0, 200));

      if (!formattedText) {
        return {
          success: false,
          error: 'No data found in CSV file'
        };
      }

      return {
        success: true,
        text: formattedText,
        metadata: {
          fileType: 'csv',
          rowCount: parseResult.data.length,
          columnCount: parseResult.meta.fields?.length || 0,
          columns: parseResult.meta.fields || [],
          hasHeaders: true
        }
      };
    } catch (error) {
      console.error('CSV processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process CSV file'
      };
    }
  }

  private formatCSVAsText(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    let text = '';

    // Add headers if available
    if (headers && headers.length > 0) {
      text += `CSV Data with ${data.length} rows and ${headers.length} columns:\n\n`;
      text += `Columns: ${headers.join(', ')}\n\n`;
    }

    // Format each row
    data.forEach((row, index) => {
      text += `Row ${index + 1}:\n`;
      
      if (headers) {
        // Use headers as keys
        headers.forEach(header => {
          const value = row[header];
          if (value !== null && value !== undefined && value !== '') {
            text += `  ${header}: ${value}\n`;
          }
        });
      } else {
        // No headers, use index
        Object.entries(row).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            text += `  Column ${key}: ${value}\n`;
          }
        });
      }
      
      text += '\n';
    });

    // Look for EDI-specific patterns in the data
    const ediPatterns = this.extractEDIPatterns(data, headers);
    if (ediPatterns) {
      text += '\n--- Detected EDI Information ---\n' + ediPatterns;
    }

    return text.trim();
  }

  private extractEDIPatterns(data: any[], headers?: string[]): string | null {
    // Look for common EDI fields in the CSV
    const ediFields = ['document_type', 'po_number', 'invoice_number', 'error', 'supplier', 'buyer'];
    let ediInfo = '';

    if (headers) {
      const relevantHeaders = headers.filter(h => 
        ediFields.some(field => h.toLowerCase().includes(field))
      );

      if (relevantHeaders.length > 0) {
        ediInfo += 'EDI-related fields found:\n';
        relevantHeaders.forEach(header => {
          const values = data.map(row => row[header]).filter(v => v);
          if (values.length > 0) {
            ediInfo += `  ${header}: ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}\n`;
          }
        });
      }
    }

    return ediInfo || null;
  }
}