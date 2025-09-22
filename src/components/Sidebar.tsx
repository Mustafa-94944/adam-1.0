import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Trash2, Calendar } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { VectorStore } from '../services/vectorStore';
import { Document } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onUploadSuccess: (filename: string) => void;
  onUploadError: (error: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  onUploadSuccess,
  onUploadError,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await VectorStore.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (filename: string) => {
    onUploadSuccess(filename);
    loadDocuments(); // Reload document list
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await VectorStore.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`relative h-screen bg-gradient-to-b from-purple-900/20 to-blue-900/20 backdrop-blur-md border-r border-purple-200/20 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors duration-200"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Content */}
      <div className={`p-4 h-full overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            RAG Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload documents and chat
          </p>
        </div>

        {/* File Uploader */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Upload Documents
          </h3>
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={onUploadError}
          />
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Documents ({documents.length})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents uploaded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group p-3 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-gray-200/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {doc.filename}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{formatFileSize(doc.size)}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(doc.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-4 h-full flex flex-col items-center justify-start pt-16">
          <FileText className="h-6 w-6 text-purple-400 mb-4" />
          <div className="text-xs text-gray-500 writing-mode-vertical transform rotate-180">
            Documents
          </div>
        </div>
      )}
    </div>
  );
};