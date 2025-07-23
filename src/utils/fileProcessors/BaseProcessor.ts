export interface ProcessResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseProcessor {
  protected file: File;

  constructor(file: File) {
    this.file = file;
  }

  abstract process(): Promise<ProcessResult>;

  protected async readFileAsText(): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(this.file);
    });
  }

  protected async readFileAsArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(this.file);
    });
  }

  protected async readFileAsDataURL(): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(this.file);
    });
  }
}