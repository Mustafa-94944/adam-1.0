import { supabase } from '../utils/supabase';
import { DocumentChunk, SearchResult } from '../types';
import { EmbeddingService } from './embeddingService';

export class VectorStore {
  static async storeDocument(
    filename: string,
    content: string,
    fileType: string,
    fileSize: number,
    chunks: string[]
  ): Promise<string> {
    try {
      // Store document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          filename,
          content,
          file_type: fileType,
          file_size: fileSize,
        })
        .select('id')
        .single();

      if (docError) throw docError;

      // Generate embeddings for chunks
      const embeddings = await EmbeddingService.generateEmbeddings(chunks);

      // Store chunks with embeddings
      const chunkData = chunks.map((chunk, index) => ({
        document_id: document.id,
        content: chunk,
        embedding: embeddings[index],
        chunk_index: index,
        metadata: { length: chunk.length },
      }));

      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(chunkData);

      if (chunkError) throw chunkError;

      return document.id;
    } catch (error) {
      console.error('Error storing document:', error);
      throw new Error('Failed to store document in vector database');
    }
  }

  static async searchSimilar(
    query: string,
    limit = 5,
    threshold = 0.7
  ): Promise<SearchResult[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      // Search for similar chunks using pgvector
      const { data, error } = await supabase.rpc('search_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;

      // Transform results
      const results: SearchResult[] = await Promise.all(
        data.map(async (item: any) => {
          const { data: document } = await supabase
            .from('documents')
            .select('*')
            .eq('id', item.document_id)
            .single();

          return {
            chunk: {
              id: item.id,
              documentId: item.document_id,
              content: item.content,
              embedding: item.embedding,
              chunkIndex: item.chunk_index,
              metadata: item.metadata,
            } as DocumentChunk,
            similarity: item.similarity,
            document: document ? {
              id: document.id,
              filename: document.filename,
              content: document.content,
              fileType: document.file_type,
              size: document.file_size,
              uploadedAt: new Date(document.uploaded_at),
              chunks: [],
            } : null,
          } as SearchResult;
        })
      );

      return results.filter(r => r.document !== null);
    } catch (error) {
      console.error('Error searching similar chunks:', error);
      throw new Error('Failed to search vector database');
    }
  }

  static async getAllDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        content: doc.content,
        fileType: doc.file_type,
        size: doc.file_size,
        uploadedAt: new Date(doc.uploaded_at),
        chunks: [],
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }
}