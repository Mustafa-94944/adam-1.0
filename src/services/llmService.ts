import { DocumentChunk } from '../types';
import { API_CONFIG } from '../config/api';

export class LLMService {
  static async generateResponse(query: string, context: DocumentChunk[]): Promise<string> {
    try {
      if (!API_CONFIG.gemini.apiKey) {
        console.warn('Gemini API key not configured, using mock response');
        return this.generateMockResponse(query, context);
      }

      const contextText = context
        .map(chunk => `Source: ${chunk.metadata?.filename || 'Document'}\n${chunk.content}`)
        .join('\n\n---\n\n');

      const prompt = `Based on the following context from uploaded documents, please provide a comprehensive and accurate answer to the user's question. If the context doesn't contain relevant information, please state that clearly.

Context:
${contextText}

Question: ${query}

Please provide a helpful response based on the available context:`;

      const response = await fetch(
        `${API_CONFIG.gemini.baseUrl}/${API_CONFIG.gemini.model}:generateContent?key=${API_CONFIG.gemini.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating LLM response:', error);
      return this.generateMockResponse(query, context);
    }
  }

  private static generateMockResponse(query: string, context: DocumentChunk[]): string {
    const contextText = context.map(chunk => chunk.content).join('\n\n');
    
    if (context.length === 0) {
      return `I don't have any relevant information in the uploaded documents to answer your question about "${query}". Please upload some documents first or try a different question.`;
    }

    const summaryLength = Math.min(300, contextText.length);
    const summary = contextText.substring(0, summaryLength) + 
      (contextText.length > summaryLength ? '...' : '');

    return `Based on the uploaded documents, here's what I found regarding "${query}":\n\n${summary}\n\nThis information comes from ${context.length} relevant section${context.length > 1 ? 's' : ''} in your uploaded documents. For more detailed information, you might want to ask more specific questions about particular aspects.`;
  }
}