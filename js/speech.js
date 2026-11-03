/**
 * Anime Nexus - Speech-to-Text Voice Recognition Engine (Web Speech API)
 * Provides voice transcription for:
 * 1. Global Header Search Bar (Voice-activated live anime search)
 * 2. Saitama HelpBot & AI Concierge (Voice-driven anime inquiries and actions)
 */

import { soundFXMatrix } from './audio.js';

export class VoiceRecognitionEngine {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    this.activeTarget = null; // 'search' or 'helpbot'
    this.callbacks = {};
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.setupHandlers();
        this.isSupported = true;
      } catch (e) {
        console.warn('[VoiceRecognition] SpeechRecognition init failed:', e);
        this.isSupported = false;
      }
    } else {
      console.warn('[VoiceRecognition] Web Speech API not supported in this browser.');
      this.isSupported = false;
    }
  }

  setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      soundFXMatrix.playClick();
      if (this.callbacks.onStart) {
        this.callbacks.onStart(this.activeTarget);
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (this.callbacks.onResult) {
        this.callbacks.onResult(text, Boolean(finalTranscript), this.activeTarget);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[VoiceRecognition] Error event:', event.error);
      this.isListening = false;
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error, this.activeTarget);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(this.activeTarget);
      }
    };
  }

  /**
   * Start listening for Search Bar
   */
  startSearchListening(inputElement, onTranscriptFinalized) {
    if (!this.isSupported) {
      this.fallbackSimulation(inputElement, onTranscriptFinalized, 'search');
      return;
    }

    if (this.isListening) {
      this.stop();
      return;
    }

    this.activeTarget = 'search';
    this.callbacks = {
      onStart: () => {
        inputElement.placeholder = '🎙️ Listening... Speak anime title, studio, or genre!';
        inputElement.classList.add('voice-active');
      },
      onResult: (text, isFinal) => {
        inputElement.value = text;
        // Trigger input event for live instant search dropdown
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        if (isFinal && typeof onTranscriptFinalized === 'function') {
          onTranscriptFinalized(text);
        }
      },
      onEnd: () => {
        inputElement.placeholder = 'Search anime, studios, moves... (or click 🎙️)';
        inputElement.classList.remove('voice-active');
      },
      onError: (err) => {
        inputElement.placeholder = `Voice error: ${err}. Type manually or try again.`;
        inputElement.classList.remove('voice-active');
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[VoiceRecognition] Start error:', e);
    }
  }

  /**
   * Start listening for HelpBot
   */
  startHelpBotListening(inputElement, onSubmitCallback) {
    if (!this.isSupported) {
      this.fallbackSimulation(inputElement, onSubmitCallback, 'helpbot');
      return;
    }

    if (this.isListening) {
      this.stop();
      return;
    }

    this.activeTarget = 'helpbot';
    this.callbacks = {
      onStart: () => {
        inputElement.placeholder = '🎙️ Listening to your voice... Speak to Saitama!';
        inputElement.classList.add('voice-active');
      },
      onResult: (text, isFinal) => {
        inputElement.value = text;
        if (isFinal) {
          soundFXMatrix.playEnergyPulse();
          if (typeof onSubmitCallback === 'function') {
            onSubmitCallback(text);
          }
        }
      },
      onEnd: () => {
        inputElement.placeholder = 'Ask Saitama anything (or click 🎙️)...';
        inputElement.classList.remove('voice-active');
      },
      onError: (err) => {
        inputElement.placeholder = `Mic error: ${err}. Type to chat.`;
        inputElement.classList.remove('voice-active');
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[VoiceRecognition] Start error:', e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  /**
   * Simulated fallback with helpful anime speech examples if Web Speech API is blocked
   */
  fallbackSimulation(inputElement, callback, mode) {
    const demoPhrases = mode === 'search'
      ? ['Solo Leveling', 'Jujutsu Kaisen', 'Attack on Titan', 'Frieren', 'Vinland Saga']
      : [
          'Recommend a hype action anime',
          'Tell me about the Logistic Regression model',
          'Give me a chill slice of life',
          'Serious Punch!',
          'Show me winter season anime'
        ];

    const pick = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
    inputElement.value = '';
    inputElement.placeholder = `🎙️ [Voice Demo] "${pick}"`;

    let charIdx = 0;
    const typeInterval = setInterval(() => {
      inputElement.value += pick[charIdx];
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      charIdx++;
      if (charIdx >= pick.length) {
        clearInterval(typeInterval);
        soundFXMatrix.playClick();
        if (typeof callback === 'function') {
          setTimeout(() => callback(pick), 400);
        }
      }
    }, 45);
  }
}

export const voiceRecognition = new VoiceRecognitionEngine();
