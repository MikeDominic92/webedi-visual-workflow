import { BaseProcessor, ProcessResult } from './BaseProcessor';
import { createWorker, Worker } from 'tesseract.js';

export class VideoProcessor extends BaseProcessor {
  private worker: Worker | null = null;

  async process(): Promise<ProcessResult> {
    try {
      console.log('Starting video processing for:', this.file.name);
      
      // Create video element to extract frames
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Load video
      const videoUrl = URL.createObjectURL(this.file);
      video.src = videoUrl;
      
      // Wait for video metadata
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      console.log(`Video metadata - Duration: ${duration}s, Resolution: ${width}x${height}`);

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Extract frames at intervals (every 5 seconds, max 10 frames)
      const frameCount = Math.min(10, Math.ceil(duration / 5));
      const frameTexts: string[] = [];
      
      // Initialize OCR worker
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Frame OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      for (let i = 0; i < frameCount; i++) {
        const time = (i * duration) / frameCount;
        
        // Seek to time
        video.currentTime = time;
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, width, height);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });

        // Run OCR on frame
        try {
          const dataUrl = await this.blobToDataURL(blob);
          const { data: { text, confidence } } = await this.worker.recognize(dataUrl);
          
          if (text && text.trim().length > 0) {
            console.log(`Frame ${i + 1}: Found text (confidence: ${confidence})`);
            frameTexts.push(`[Frame ${i + 1} at ${time.toFixed(1)}s]:\n${text.trim()}`);
          }
        } catch (error) {
          console.error(`Error processing frame ${i + 1}:`, error);
        }
      }

      // Cleanup
      URL.revokeObjectURL(videoUrl);
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }

      // Combine results and look for EDI-specific content
      let extractedText = '';
      const allText = frameTexts.join('\n');
      
      // Look for EDI indicators in the extracted text
      const hasEDIContent = /810|850|856|997|invoice|order|shipment|edi|error|reject/i.test(allText);
      const errorMessages = this.extractErrorMessages(allText);
      const systemNames = this.extractSystemNames(allText);
      
      if (frameTexts.length > 0) {
        extractedText = `Video Analysis Results:\n\n` +
          `Duration: ${duration.toFixed(1)} seconds\n` +
          `Resolution: ${width}x${height}\n` +
          `Frames analyzed: ${frameCount}\n` +
          `EDI content detected: ${hasEDIContent ? 'Yes' : 'No'}\n\n`;
        
        if (errorMessages.length > 0) {
          extractedText += `Error Messages Found:\n${errorMessages.map(e => `- ${e}`).join('\n')}\n\n`;
        }
        
        if (systemNames.length > 0) {
          extractedText += `Systems/Screens Identified:\n${systemNames.map(s => `- ${s}`).join('\n')}\n\n`;
        }
        
        extractedText += `Text found in video:\n\n${frameTexts.join('\n\n')}`;
        
        if (!hasEDIContent) {
          extractedText += `\n\n--- Manual Input Required ---\n` +
            `The video was processed but no clear EDI information was found.\n` +
            `Please provide:\n` +
            `1. Document Type: (810/850/856/997)\n` +
            `2. Company/Trading Partner:\n` +
            `3. Error Description:\n` +
            `4. PO/Invoice Numbers (if any):`;
        }
      } else {
        extractedText = `Video Analysis Results:\n\n` +
          `Duration: ${duration.toFixed(1)} seconds\n` +
          `Resolution: ${width}x${height}\n` +
          `Frames analyzed: ${frameCount}\n\n` +
          `No text was detected in the video frames.\n\n` +
          `--- Manual Input Template ---\n` +
          `Please describe what's shown in the video:\n\n` +
          `1. Document Type: (810/850/856/997)\n` +
          `2. Company Name:\n` +
          `3. Trading Partner:\n` +
          `4. Error Message:\n` +
          `5. System/Screen shown:\n` +
          `6. PO/Invoice Numbers:\n` +
          `7. Issue Description:`;
      }

      return {
        success: true,
        text: extractedText,
        metadata: {
          fileType: 'video',
          duration: duration,
          resolution: `${width}x${height}`,
          framesAnalyzed: frameCount,
          textFound: frameTexts.length > 0
        }
      };

    } catch (error) {
      // Ensure worker is terminated on error
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }

      console.error('Video processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process video file. Videos must be playable in browser.'
      };
    }
  }

  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private extractErrorMessages(text: string): string[] {
    const errorPatterns = [
      /error[:\s]+([^\n]+)/gi,
      /exception[:\s]+([^\n]+)/gi,
      /failed[:\s]+([^\n]+)/gi,
      /rejected[:\s]+([^\n]+)/gi,
      /invalid[:\s]+([^\n]+)/gi,
      /duplicate[:\s]+([^\n]+)/gi,
      /missing[:\s]+([^\n]+)/gi
    ];

    const errors = new Set<string>();
    
    for (const pattern of errorPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          errors.add(match[1].trim());
        }
      }
    }

    // Also look for standalone error messages
    const lines = text.split('\n');
    for (const line of lines) {
      if (/error|exception|failed|rejected/i.test(line) && line.length < 200) {
        errors.add(line.trim());
      }
    }

    return Array.from(errors);
  }

  private extractSystemNames(text: string): string[] {
    const systemPatterns = [
      /WebEDI\s*(Admin|Portal)?(\s*\d+\.\d+)?/gi,
      /Cleo\s*(Integration|Harmony)?/gi,
      /DataTrans/gi,
      /LINX/gi,
      /AS2/gi,
      /SFTP/gi,
      /QuickBooks/gi,
      /ShipStation/gi,
      /(Admin|Portal)\s*>\s*[^>\n]+/gi, // Menu navigation
      /\b(Dashboard|Transactions|Reports|Maps|Partners|Users)\b/gi
    ];

    const systems = new Set<string>();
    
    for (const pattern of systemPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          systems.add(match[0].trim());
        }
      }
    }

    return Array.from(systems);
  }
}