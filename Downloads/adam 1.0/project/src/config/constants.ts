export const APP_CONFIG = {
  name: 'RAG Assistant',
  version: '1.0.0',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.pdf', '.docx', '.txt', '.md'],
  chunkSize: 1000,
  chunkOverlap: 200,
  maxResults: 5,
  embeddingDimensions: 768,
};

export const VOICE_CONFIG = {
  lang: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

export const UI_CONFIG = {
  sidebarWidth: '25%',
  chatAreaWidth: '75%',
  animationDuration: 300,
  debounceDelay: 500,
};