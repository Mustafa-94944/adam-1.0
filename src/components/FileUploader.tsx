import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentProcessor } from '../services/documentProcessor';
import { VectorStore } from '../services/vectorStore';

interface FileUploaderProps {
  onUploadSuccess: (filename: string) => void;
  onUploadError: (error: string) => void;
}

interface UploadStatus {
  file: File;
  status: 'processing' | 'success' | 'error';
  error?: string;
  documentId?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const validation = DocumentProcessor.validateFile(file);
      
      if (!validation.isValid) {
        onUploadError(validation.error || 'Invalid file');
        continue;
      }

      const uploadStatus: UploadStatus = {
        file,
        status: 'processing',
      };

      setUploads(prev => [...prev, uploadStatus]);

      try {
        // Process file
        const content = await DocumentProcessor.processFile(file);
        const chunks = DocumentProcessor.chunkText(content);

        // Store in vector database
        const documentId = await VectorStore.storeDocument(
          file.name,
          content,
          file.type,
          file.size,
          chunks
        );

        setUploads(prev =>
          prev.map(upload =>
            upload.file === file
              ? { ...upload, status: 'success', documentId }
              : upload
          )
        );

        onUploadSuccess(file.name);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploads(prev =>
          prev.map(upload =>
            upload.file === file
              ? { ...upload, status: 'error', error: errorMessage }
              : upload
          )
        );

        onUploadError(errorMessage);
      }
    }
  };

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
          dragActive
            ? 'border-purple-400 bg-purple-50/10 scale-105'
            : 'border-gray-300/50 hover:border-purple-300'
        } backdrop-blur-sm bg-white/5`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-purple-400' : 'text-gray-400'} transition-colors`} />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOCX, TXT, MD, JPG, PNG up to 10MB
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={`${upload.file.name}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/10 border border-gray-200/20"
            >
              <div className="flex items-center space-x-3 flex-1">
                <FileText className="h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {upload.status === 'processing' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                )}
                {upload.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                
                <button
                  onClick={() => removeUpload(upload.file)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};