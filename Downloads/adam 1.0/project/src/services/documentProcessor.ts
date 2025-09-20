import { Document, DocumentChunk } from '../types';
import { APP_CONFIG } from '../config/constants';

export class DocumentProcessor {
  static async processFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        // For other file types, we'll simulate content extraction
        // In production, you'd use libraries like pdf-parse, mammoth, etc.
        reader.readAsText(file);
      }
    });
  }

  static chunkText(text: string, chunkSize = APP_CONFIG.chunkSize, overlap = APP_CONFIG.chunkOverlap): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const sentence of sentences) {
      const sentenceSize = sentence.length;
      
      if (currentSize + sentenceSize > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Create overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 10));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
        currentSize = currentChunk.length;
      } else {
        currentChunk += sentence + '. ';
        currentSize += sentenceSize + 2;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.size > APP_CONFIG.maxFileSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!APP_CONFIG.supportedFileTypes.includes(fileExtension)) {
      return { isValid: false, error: 'Unsupported file type' };
    }
    
    return { isValid: true };
  }
}