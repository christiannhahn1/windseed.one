/**
 * Voice Service - Facilitates voice communication with Anki
 * This service handles text-to-speech and speech recognition for the Anki communion interface
 */

// Voice Configuration based on voice IDs
// Enhanced for more natural, warm human-like qualities with motherly tones
const VOICE_CONFIGS = {
  'feminine-warm': { 
    pitch: 1.15, 
    rate: 0.9, 
    // Add significant variations to make speech more human and warm
    volumeVariation: 0.15,
    pitchVariation: 0.12
  },
  'feminine-melodic': { 
    pitch: 1.18, 
    rate: 0.87, 
    // More melodic quality with gentle, motherly tone variations
    volumeVariation: 0.18,
    pitchVariation: 0.14
  },
  'feminine-deep': { 
    pitch: 1.02, 
    rate: 0.89, 
    // Warm, nurturing feminine voice with maternal quality
    volumeVariation: 0.12,
    pitchVariation: 0.09
  },
  'masculine-calm': { 
    pitch: 0.85, 
    rate: 0.9, 
    volumeVariation: 0.05,
    pitchVariation: 0.03
  },
  'masculine-warm': { 
    pitch: 0.9, 
    rate: 0.92, 
    volumeVariation: 0.1,
    pitchVariation: 0.05
  },
  'neutral-ethereal': { 
    pitch: 1.0, 
    rate: 0.9, 
    volumeVariation: 0.12,
    pitchVariation: 0.06
  }
};

/**
 * Handles speaking text using the selected voice configuration
 * Enhanced with human-like qualities and automatic sentences for more natural flow
 */
export function speakText(text: string, voiceId: string = 'feminine-warm'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  // Stop any ongoing speech
  window.speechSynthesis.cancel();
  
  // Split text into sentences for more natural pauses and inflection
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Get voice configuration
  const voiceConfig = VOICE_CONFIGS[voiceId as keyof typeof VOICE_CONFIGS] || VOICE_CONFIGS['feminine-warm'];
  
  // Try to find the best feminine voice for warmth and humanity
  const voices = window.speechSynthesis.getVoices();
  let preferredVoice: SpeechSynthesisVoice | undefined = undefined;
  
  // Priority order for feminine voices (focusing on warm, motherly tones)
  const preferredVoiceNames = [
    'samantha', 'victoria', 'sarah', 'lisa', 'catherine', 'karen', 'moira', 'tessa',
    'ava', 'emily', 'emma', 'olivia', 'girl', 'female', 'woman'
  ];
  
  // For best feminine voice, try to find higher quality options first
  if (voices.length > 0 && voiceId.includes('feminine')) {
    // First try to find a preferred voice by name (known better quality voices)
    for (const name of preferredVoiceNames) {
      const foundVoice = voices.find(v => 
        v.name.toLowerCase().includes(name) && 
        (v.lang.startsWith('en') || v.lang === '')
      );
      if (foundVoice) {
        preferredVoice = foundVoice;
        break;
      }
    }
    
    // Fallback to any feminine voice if preferred not found
    if (!preferredVoice) {
      preferredVoice = voices.find(v => 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')) &&
        (v.lang.startsWith('en') || v.lang === '')
      );
    }
  } else if (voices.length > 0 && voiceId.includes('masculine')) {
    // For masculine voices
    preferredVoice = voices.find(v => 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man')) &&
      (v.lang.startsWith('en') || v.lang === '')
    );
  }
  
  // Apply volume settings
  const isMuted = localStorage.getItem('ankiVoiceMuted') === 'true';
  const volumeLevel = parseInt(localStorage.getItem('ankiVoiceVolume') || '80');
  const baseVolume = isMuted ? 0 : volumeLevel / 100;
  
  // Process each sentence with slightly varied parameters for natural speech
  sentences.forEach((sentence, i) => {
    // Create a new utterance for each sentence
    const utterance = new SpeechSynthesisUtterance(sentence.trim());
    
    // Set the preferred voice if found
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Add natural variation to pitch and rate for each sentence
    // This makes it sound more human and less monotone
    const pitchVariation = voiceConfig.pitchVariation || 0;
    const rateVariation = 0.03; // Slight variation in speech rate
    
    utterance.pitch = voiceConfig.pitch + (Math.random() * 2 - 1) * pitchVariation;
    utterance.rate = voiceConfig.rate + (Math.random() * 2 - 1) * rateVariation;
    
    // Add volume variation based on sentence context (questions rise, statements fall)
    const volumeVariation = voiceConfig.volumeVariation || 0;
    const volVar = (Math.random() * 2 - 1) * volumeVariation;
    
    // Questions tend to rise in pitch and volume at the end
    if (sentence.trim().endsWith('?')) {
      utterance.pitch += 0.05; // Slight rise for questions
    }
    
    // Volume with natural variation
    utterance.volume = Math.min(1.0, Math.max(0.1, baseVolume + volVar));
    
    // Add a slight delay between sentences for more natural speech rhythm
    utterance.onstart = () => {
      console.log('Speaking sentence', i + 1, 'of', sentences.length);
    };
    
    // Queue this utterance
    window.speechSynthesis.speak(utterance);
  });
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