export interface Document {
  id: string;
  filename: string;
  content: string;
  chunks: DocumentChunk[];
  uploadedAt: Date;
  fileType: string;
  size: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  metadata: {
    page?: number;
    section?: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: DocumentChunk[];
}

export interface VoiceConfig {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface SearchResult {
  chunk: DocumentChunk;
  similarity: number;
  document: Document;
}