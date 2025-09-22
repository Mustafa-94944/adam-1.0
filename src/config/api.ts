// API Configuration
export const API_CONFIG = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-1.5-flash',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  },
  jina: {
    baseUrl: 'https://api.jina.ai/v1/embeddings',
    model: 'jina-embeddings-v2-base-en',
    apiKey: import.meta.env.VITE_JINA_API_KEY,
  },
};

export const validateApiKeys = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!API_CONFIG.gemini.apiKey) missing.push('VITE_GEMINI_API_KEY');
  if (!API_CONFIG.jina.apiKey) missing.push('VITE_JINA_API_KEY');
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};