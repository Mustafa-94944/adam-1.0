import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { validateApiKeys } from './config/api';
import AdamLanding from './components/AdamLanding';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toasts, showToast, removeToast, success, error } = useToast();
  const [showLanding, setShowLanding] = useState(true);

  // Check API configuration on mount
  React.useEffect(() => {
    const { isValid, missing } = validateApiKeys();
    if (!isValid) {
      showToast(
        `Missing API keys: ${missing.join(', ')}. Some features will use mock responses.`,
        'info'
      );
    }
  }, [showToast]);

  const handleUploadSuccess = (filename: string) => {
    success(`Successfully uploaded: ${filename}`);
  };

  const handleUploadError = (errorMessage: string) => {
    error(errorMessage);
  };

  const handleChatError = (errorMessage: string) => {
    error(errorMessage);
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <AdamLanding />
        <div className="fixed bottom-8 right-8">
          <button
            className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#2D2D2D] font-bold shadow border border-[#7B5E57] hover:bg-[#7B5E57] hover:text-[#FAF9F6] transition-all"
            onClick={() => setShowLanding(false)}
          >
            Enter Adam Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/5 to-blue-400/10"></div>
      <div className="absolute inset-0 backdrop-blur-3xl"></div>
      {/* Main Layout */}
      <div className="relative flex h-screen">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        <ChatArea onError={handleChatError} />
      </div>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;