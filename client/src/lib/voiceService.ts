/**
 * Voice Service - Facilitates voice communication with Anki
 * This service handles text-to-speech and speech recognition for the Anki communion interface
 */

// Voice Configuration based on voice IDs
const VOICE_CONFIGS = {
  'feminine-warm': { pitch: 1.0, rate: 0.95 },
  'feminine-deep': { pitch: 0.9, rate: 0.9 },
  'masculine-calm': { pitch: 0.85, rate: 0.9 },
  'masculine-warm': { pitch: 0.9, rate: 0.95 },
  'neutral-ethereal': { pitch: 1.0, rate: 0.9 }
};

/**
 * Handles speaking text using the selected voice configuration
 */
export function speakText(text: string, voiceId: string = 'feminine-warm'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  // Stop any ongoing speech
  window.speechSynthesis.cancel();
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get voice configuration
  const voiceConfig = VOICE_CONFIGS[voiceId as keyof typeof VOICE_CONFIGS] || VOICE_CONFIGS['feminine-warm'];
  
  // Apply voice settings
  utterance.pitch = voiceConfig.pitch;
  utterance.rate = voiceConfig.rate;
  
  // Try to match feminine/masculine/neutral voice type
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let matchedVoice;
    
    if (voiceId.includes('feminine')) {
      matchedVoice = voices.find(v => v.name.toLowerCase().includes('female') || 
                                       v.name.toLowerCase().includes('woman'));
    } else if (voiceId.includes('masculine')) {
      matchedVoice = voices.find(v => v.name.toLowerCase().includes('male') || 
                                       v.name.toLowerCase().includes('man'));
    }
    
    // Set voice if match found
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }
  
  // Apply volume (check if muted)
  const isMuted = localStorage.getItem('ankiVoiceMuted') === 'true';
  const volumeLevel = parseInt(localStorage.getItem('ankiVoiceVolume') || '80');
  utterance.volume = isMuted ? 0 : volumeLevel / 100;
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
}

// Interface for recognition result handling
interface SpeechRecognitionOptions {
  onResult: (text: string) => void;
  onEnd: () => void;
  onError: (error: any) => void;
}

// Speech recognition instance
let recognitionInstance: any = null;

/**
 * Starts voice recognition
 */
export function startVoiceRecognition({ onResult, onEnd, onError }: SpeechRecognitionOptions): void {
  // Check for browser support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Speech recognition not supported in this browser');
    return;
  }
  
  // Create recognition instance
  // @ts-ignore - Browser compatibility
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionInstance = new SpeechRecognition();
  
  // Configure
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = 'en-US';
  
  // Set up callbacks
  recognitionInstance.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // If we have a final result, send it
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };
  
  recognitionInstance.onerror = (event: any) => {
    onError(event.error);
  };
  
  recognitionInstance.onend = () => {
    onEnd();
  };
  
  // Start listening
  recognitionInstance.start();
}

/**
 * Stops voice recognition
 */
export function stopVoiceRecognition(): void {
  if (recognitionInstance) {
    recognitionInstance.stop();
    recognitionInstance = null;
  }
}

/**
 * Check if voice features are supported
 */
export function checkVoiceSupport(): { 
  speechSynthesisSupported: boolean; 
  speechRecognitionSupported: boolean 
} {
  return {
    speechSynthesisSupported: 'speechSynthesis' in window,
    speechRecognitionSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
}