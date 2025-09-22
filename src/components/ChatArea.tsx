import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { VectorStore } from '../services/vectorStore';
import { LLMService } from '../services/llmService';
import { VoiceService } from '../services/voiceService';

interface ChatAreaProps {
  onError: (error: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onError }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceService] = useState(() => new VoiceService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial greeting message
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your RAG Assistant. Upload some documents using the sidebar and then ask me questions about their content. I can also listen to your voice input!',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Search for relevant context
      const searchResults = await VectorStore.searchSimilar(input, 5, 0.7);
      const relevantChunks = searchResults.map(result => result.chunk);

      // Generate response
      const response = await LLMService.generateResponse(input, relevantChunks);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        sources: relevantChunks.length > 0 ? relevantChunks : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if voice is enabled
      if (voiceService.isSupported && !isSpeaking) {
        handleSpeak(response);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
      onError(errorMessage);

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!voiceService.isSupported) {
      onError('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal) {
            setIsListening(false);
            // Auto-submit if transcript is substantial
            if (transcript.trim().length > 5) {
              setTimeout(() => {
                inputRef.current?.form?.requestSubmit();
              }, 500);
            }
          }
        },
        (error) => {
          setIsListening(false);
          onError(`Voice recognition error: ${error}`);
        }
      );
    }
  };

  const handleSpeak = (text: string) => {
    if (!voiceService.isSupported) return;

    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceService.speak(text);
      // Reset speaking state after estimated duration
      setTimeout(() => setIsSpeaking(false), text.length * 50);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-purple-200/30 backdrop-blur-sm bg-white/10">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Assistant Chat
        </h1>
        <p className="text-sm text-gray-600">
          Ask questions about your uploaded documents
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-auto'
                  : 'bg-white/20 backdrop-blur-sm border border-gray-200/20 text-gray-800'
              } shadow-lg`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300/20">
                  <p className="text-xs text-gray-600 mb-1">Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, index) => (
                      <span
                        key={source.id}
                        className="inline-block px-2 py-1 text-xs bg-gray-100/50 rounded-full"
                      >
                        Chunk {index + 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${message.isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
                
                {!message.isUser && voiceService.isSupported && (
                  <button
                    onClick={() => handleSpeak(message.content)}
                    className="p-1 hover:bg-gray-200/20 rounded-full transition-colors"
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/20 backdrop-blur-sm border border-gray-200/20 rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-200/30 backdrop-blur-sm bg-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full px-4 py-3 pr-12 rounded-xl backdrop-blur-sm bg-white/30 border border-gray-200/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
            
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {voiceService.isSupported && (
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              } shadow-lg`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};