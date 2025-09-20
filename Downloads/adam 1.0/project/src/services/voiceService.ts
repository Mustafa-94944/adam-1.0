import { VOICE_CONFIG } from '../config/constants';

export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.lang = VOICE_CONFIG.lang;
    this.recognition.continuous = VOICE_CONFIG.continuous;
    this.recognition.interimResults = VOICE_CONFIG.interimResults;
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const isFinal = event.results[event.results.length - 1].isFinal;
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string): void {
    if (!this.synthesis) return;

    this.synthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  get isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  get isCurrentlyListening(): boolean {
    return this.isListening;
  }
}