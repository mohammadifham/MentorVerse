/**
 * Voice command service for web speech API integration
 * Provides speech-to-text and voice recognition capabilities
 */

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private transcript: string = '';
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognitionHandlers();
      }
    }
  }

  /**
   * Check if browser supports Web Speech API
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Setup event handlers for speech recognition
   */
  private setupRecognitionHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = '';
      this.onStartCallback?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        if (isFinal) {
          this.transcript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const finalTranscript = this.transcript.trim();
      const fullTranscript = (this.transcript + interimTranscript).trim();
      const confidence = event.results[event.results.length - 1]?.[0]?.confidence ?? 0;

      this.onResultCallback?.({
        transcript: fullTranscript,
        isFinal: event.results[event.results.length - 1]?.isFinal ?? false,
        confidence
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      this.onErrorCallback?.(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEndCallback?.();
    };
  }

  /**
   * Start listening for voice input
   */
  startListening(options: VoiceRecognitionOptions = {}): void {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech Recognition API not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.lang = options.language ?? 'en-US';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

    try {
      this.recognition.start();
    } catch (error) {
      if ((error as Error).message.includes('already started')) {
        // Recognition already started, ignore
      } else {
        this.onErrorCallback?.((error as Error).message);
      }
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): string {
    if (!this.recognition || !this.isListening) {
      return '';
    }

    try {
      this.recognition.stop();
    } catch {
      // Already stopped
    }

    return this.transcript.trim();
  }

  /**
   * Abort current recognition session
   */
  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Already aborted
      }
      this.isListening = false;
      this.transcript = '';
    }
  }

  /**
   * Get current transcript
   */
  getTranscript(): string {
    return this.transcript.trim();
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Register callback for recognition results
   */
  onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Register callback for when listening starts
   */
  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * Register callback for when listening ends
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }
}

/**
 * Create and export singleton instance
 */
export const voiceCommandService = new VoiceCommandService();
