# RAG Assistant - Complete Vector Search & Chat Application

A production-ready RAG (Retrieval-Augmented Generation) application with voice input/output, vector search, and a beautiful glassmorphism UI.

## 🚀 Features

- **Document Processing**: Upload PDF, DOCX, TXT, MD, and image files
- **Vector Search**: Semantic search using Jina AI v4 embeddings and Supabase pgvector
- **AI Chat**: Intelligent responses powered by Google Gemini API
- **Voice Interface**: Speech-to-text input and text-to-speech output
- **Real-time UI**: Responsive chat interface with typing indicators
- **Glassmorphism Design**: Beautiful purple/blue gradient theme
- **Production Ready**: Error handling, loading states, and optimized performance

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with glassmorphism effects
- **Database**: Supabase with pgvector extension
- **AI Services**: 
  - Jina AI v4 for embeddings
  - Google Gemini for LLM responses
- **Voice**: Web Speech API
- **Icons**: Lucide React

## 📋 Prerequisites

1. **Supabase Account**: [Create account](https://supabase.com) and set up a project
2. **API Keys**:
   - Jina AI API key from [Jina AI Platform](https://jina.ai/)
   - Google Gemini API key from [Google AI Studio](https://makersuite.google.com/)

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_JINA_API_KEY=your_jina_api_key

# App Configuration (optional)
VITE_APP_NAME=RAG Assistant
VITE_MAX_FILE_SIZE=10485760
VITE_CHUNK_SIZE=1000
VITE_CHUNK_OVERLAP=200
```

### 2. Database Setup

1. **Connect to Supabase**: Click "Connect to Supabase" in the top right
2. **Run Migrations**: The database schema will be automatically created
3. **Enable pgvector**: Ensure the pgvector extension is enabled in your Supabase project

### 3. API Keys Setup

#### Get Jina AI API Key:
1. Visit [Jina AI Platform](https://jina.ai/)
2. Sign up/login
3. Navigate to API section
4. Generate a new API key
5. Add to your `.env` file

#### Get Gemini API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign up/login with Google account
3. Create a new API key
4. Add to your `.env` file

## 🚦 Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

## 💡 Usage Guide

### Uploading Documents

1. **Drag & Drop**: Drag files into the upload area in the sidebar
2. **Click Upload**: Click the upload area to select files
3. **Supported Formats**: PDF, DOCX, TXT, MD, JPG, PNG (up to 10MB)
4. **Processing**: Files are automatically chunked and embedded

### Chatting with Documents

1. **Type Questions**: Enter questions in the chat input
2. **Voice Input**: Click the microphone button for speech input
3. **AI Responses**: Get contextual answers based on your documents
4. **Voice Output**: Click the speaker icon to hear responses
5. **Source Tracking**: See which document chunks were used for answers

### Managing Documents

1. **View Library**: See all uploaded documents in the sidebar
2. **Delete Files**: Click the trash icon to remove documents
3. **File Info**: View file size and upload date

## 🏗 Architecture

```
src/
├── components/          # React components
│   ├── ChatArea.tsx    # Main chat interface
│   ├── Sidebar.tsx     # File upload & document list
│   ├── FileUploader.tsx # Drag & drop upload
│   └── Toast.tsx       # Notification system
├── services/           # Core business logic
│   ├── vectorStore.ts  # Supabase vector operations
│   ├── embeddingService.ts # Jina AI integration
│   ├── llmService.ts   # Gemini API integration
│   ├── voiceService.ts # Speech recognition/synthesis
│   └── documentProcessor.ts # File processing
├── config/             # Configuration
│   ├── api.ts         # API endpoints & keys
│   └── constants.ts   # App constants
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── hooks/             # Custom React hooks
```

## 🔒 Security Features

- **Row Level Security**: Supabase RLS policies protect data
- **API Key Validation**: Checks for required environment variables  
- **File Validation**: Size and type restrictions on uploads
- **Error Boundaries**: Graceful error handling throughout app
- **Input Sanitization**: Safe handling of user inputs

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern translucent interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished micro-interactions
- **Loading States**: Clear feedback during operations
- **Voice Indicators**: Visual feedback for speech recognition
- **Toast Notifications**: Success/error message system

## 📱 Browser Support

- **Chrome/Edge**: Full support including voice features
- **Firefox**: Full support including voice features  
- **Safari**: Full support including voice features
- **Mobile**: Responsive design works on all mobile browsers

## 🚀 Deployment

### Using Bolt Hosting (Recommended)

1. **Build**: The app builds automatically during deployment
2. **Deploy**: Click the deploy button in the interface
3. **Environment**: Add your API keys to the hosting environment

### Manual Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy**: Upload `dist` folder to your hosting provider

3. **Environment Variables**: Configure environment variables on your hosting platform

## 🔧 Troubleshooting

### Common Issues

1. **API Keys Not Working**:
   - Verify keys are correctly set in `.env`
   - Check API key permissions and quotas
   - Ensure keys have correct format

2. **Database Connection Issues**:
   - Verify Supabase URL and anon key
   - Check if pgvector extension is enabled
   - Ensure RLS policies allow operations

3. **Voice Features Not Working**:
   - Use HTTPS (required for voice features)
   - Check browser permissions for microphone
   - Verify browser supports Web Speech API

4. **File Upload Failures**:
   - Check file size limits (10MB default)
   - Verify file type is supported
   - Ensure sufficient Supabase storage quota

### Development Tips

- **Mock Mode**: App works without API keys using mock responses
- **Debug Mode**: Check browser console for detailed error logs
- **Network Tab**: Monitor API requests in browser dev tools

## 📈 Performance Optimization

- **Code Splitting**: Automatic chunk splitting with Vite
- **Lazy Loading**: Components loaded on demand
- **Caching**: Browser caching for static assets
- **Optimized Builds**: Minified production bundles
- **Vector Indexing**: Efficient similarity search with pgvector

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using React, TypeScript, and modern web technologies.