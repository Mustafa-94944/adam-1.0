import { API_CONFIG } from '../config/api';

export class EmbeddingService {
  private static readonly EMBEDDING_DIMENSION = 768;

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!API_CONFIG.jina.apiKey) {
        console.warn('Jina API key not configured, using mock embeddings');
        return this.generateMockEmbedding(text);
      }

      const response = await fetch(API_CONFIG.jina.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.jina.apiKey}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.jina.model,
          input: [text],
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        throw new Error(`Jina API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback to mock embedding for demo
      return this.generateMockEmbedding(text);
    }
  }

  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      if (!API_CONFIG.jina.apiKey) {
        console.warn('Jina API key not configured, using mock embeddings');
        return texts.map(text => this.generateMockEmbedding(text));
      }

      const response = await fetch(API_CONFIG.jina.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.jina.apiKey}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.jina.model,
          input: texts,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        throw new Error(`Jina API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      // Fallback to mock embeddings for demo
      return texts.map(text => this.generateMockEmbedding(text));
    }
  }

  private static generateMockEmbedding(text: string): number[] {
    // Generate deterministic mock embedding based on text
    const hash = this.simpleHash(text);
    const embedding = Array.from({ length: this.EMBEDDING_DIMENSION }, (_, i) => 
      Math.sin(hash + i) * Math.cos(hash - i)
    );
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}