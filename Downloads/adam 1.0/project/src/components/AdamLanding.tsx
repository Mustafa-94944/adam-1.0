import React, { useState } from 'react';

// Simple SVG avatar (male, medium beard, fair skin, brown eyes, black suit)
const AdamAvatar = ({ speaking }: { speaking: boolean }) => (
  <div className="relative w-40 h-40 mx-auto">
    <svg viewBox="0 0 160 160" width="160" height="160">
      {/* Head */}
      <ellipse cx="80" cy="80" rx="55" ry="60" fill="#F5EBDD" />
      {/* Beard */}
      <ellipse cx="80" cy="120" rx="35" ry="18" fill="#7B5E57" />
      {/* Eyes */}
      <ellipse cx="62" cy="85" rx="7" ry="5" fill="#6B4F2A" />
      <ellipse cx="98" cy="85" rx="7" ry="5" fill="#6B4F2A" />
      {/* Blinking animation */}
      {speaking ? (
        <ellipse cx="62" cy="85" rx="7" ry="1.5" fill="#F5EBDD" />
      ) : null}
      {speaking ? (
        <ellipse cx="98" cy="85" rx="7" ry="1.5" fill="#F5EBDD" />
      ) : null}
      {/* Mouth (animated) */}
      <ellipse cx="80" cy="110" rx="12" ry={speaking ? 6 : 3} fill="#7B5E57" />
      {/* Suit */}
      <rect x="40" y="120" width="80" height="40" rx="20" fill="#222" />
      {/* Shirt */}
      <ellipse cx="80" cy="140" rx="18" ry="8" fill="#E0D7C6" />
    </svg>
  </div>
);

const AdamLanding: React.FC = () => {
  const [speaking, setSpeaking] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ user: string; adam: string }[]>([]);

  // SpeechSynthesis API
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    setSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // SpeechRecognition API
  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Simulate Adam's reply
    const reply = `Hello! You said: "${input}". How can I assist you further?`;
    setMessages([...messages, { user: input, adam: reply }]);
    setInput('');
    speak(reply);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] font-[Poppins,Inter,sans-serif]">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16">
        <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">Welcome to Adam</h1>
        <p className="text-lg text-[#7B5E57] mb-8 max-w-md text-center">
          Your 24/7 AI assistant for documents, chat, and voice. Ask anything, upload files, or use your voice!
        </p>
        <form onSubmit={handleSend} className="w-full max-w-md flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#E0D7C6] bg-[#FFF8E7] text-[#2D2D2D] shadow focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="button"
              onClick={handleMic}
              className="p-3 rounded-xl bg-[#D4AF37] text-[#2D2D2D] font-bold shadow border border-[#7B5E57] hover:bg-[#7B5E57] hover:text-[#FAF9F6] transition-all"
              title="Voice input"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="4"/><rect x="8" y="15" width="8" height="2" rx="1"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#7B5E57] text-[#FAF9F6] font-bold shadow border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2D2D2D] transition-all"
          >
            Send
          </button>
        </form>
        {/* Chat bubbles */}
        <div className="mt-8 w-full max-w-md space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className="mb-1 text-right">
                <span className="inline-block px-4 py-2 rounded-xl bg-[#D4AF37] text-[#2D2D2D] shadow">{msg.user}</span>
              </div>
              <div className="mb-1 text-left">
                <span className="inline-block px-4 py-2 rounded-xl bg-[#FFF8E7] text-[#2D2D2D] border border-[#E0D7C6] shadow">{msg.adam}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-[#FAF9F6]">
        <AdamAvatar speaking={speaking} />
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-[#2D2D2D]">Adam</h2>
          <p className="text-[#7B5E57]">Your AI Assistant</p>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37] text-[#2D2D2D] shadow">Medium beard</span>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8E7] text-[#2D2D2D] border border-[#E0D7C6] shadow">Brown eyes</span>
            <span className="inline-block px-3 py-1 rounded-full bg-[#222] text-[#FAF9F6] shadow">Jet black suit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdamLanding;
