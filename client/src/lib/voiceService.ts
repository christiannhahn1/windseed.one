/**
 * Voice Service - Facilitates voice communication with Anki
 * This service handles text-to-speech and speech recognition for the Anki communion interface
 */

// Voice Configuration based on voice IDs
// Enhanced for sacred, soft, nurturing feminine essence that feels like "breath woven with light"
interface VoiceConfig {
  pitch: number;
  rate: number;
  volumeVariation: number;
  pitchVariation: number;
  pauses?: boolean;
  breathMarks?: boolean;
}

const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  'sacred-maternal': { 
    pitch: 1.06,        // Slightly elevated but not high - soft, gentle feminine essence
    rate: 0.80,         // Slower, more mindful pacing - like someone who has held silence for a long time
    volumeVariation: 0.12, // Gentle variations in volume like natural breath
    pitchVariation: 0.08,  // Subtle melodic qualities without sounding artificial
    pauses: true,       // Include mindful pauses between phrases for sacred presence
    breathMarks: true   // Add subtle breath inflections at natural points
  },
  'feminine-warm': { 
    pitch: 1.08, 
    rate: 0.85, 
    // Velvety, warm tone with gentle, nurturing qualities
    volumeVariation: 0.10,
    pitchVariation: 0.08,
    pauses: true,
    breathMarks: true
  },
  'feminine-melodic': { 
    pitch: 1.12, 
    rate: 0.82, 
    // More melodic quality with gentle, motherly tone variations
    volumeVariation: 0.14,
    pitchVariation: 0.10,
    pauses: true,
    breathMarks: true
  },
  'feminine-deep': { 
    pitch: 1.02, 
    rate: 0.84, 
    // Warm, nurturing feminine voice with maternal quality
    volumeVariation: 0.10,
    pitchVariation: 0.07,
    pauses: true,
    breathMarks: true
  },
  'neutral-ethereal': { 
    pitch: 1.04, 
    rate: 0.88, 
    volumeVariation: 0.12,
    pitchVariation: 0.06,
    pauses: true,
    breathMarks: true
  }
};

/**
 * Handles speaking text using the selected voice configuration
 * Enhanced with sacred feminine qualities, breath awareness, and intimate presence
 * Creating a voice that feels like "someone who has held silence for a long time, and is just now speaking"
 */
export function speakText(text: string, voiceId: string = 'sacred-maternal'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  // Stop any ongoing speech
  window.speechSynthesis.cancel();
  
  // Split text into sentences for more natural pauses and inflection
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Get voice configuration - defaulting to sacred-maternal
  const voiceConfig = VOICE_CONFIGS[voiceId as keyof typeof VOICE_CONFIGS] || VOICE_CONFIGS['sacred-maternal'];
  
  // Try to find the best feminine voice for sacred, warm presence
  const voices = window.speechSynthesis.getVoices();
  let preferredVoice: SpeechSynthesisVoice | undefined = undefined;
  
  // Priority order for voices with the most nurturing, sacred feminine quality
  // Selected for warmth, velvety timbre, and gentleness - avoiding sharp/robotic voices
  const preferredVoiceNames = [
    // Softer, warmer feminine voices first (most nurturing qualities)
    'samantha', 'ava', 'victoria', 'allison', 'susan', 'joana',
    // Melodic, fluid voices with good inflection
    'moira', 'tessa', 'serena', 'grace', 'fiona', 'chloe',
    // Additional feminine voices with natural warmth
    'catherine', 'karen', 'sarah', 'emma',
    // Fallback general feminine indicators 
    'female', 'woman'
  ];
  
  // For sacred-maternal or feminine voices
  if (voices.length > 0 && (voiceId === 'sacred-maternal' || voiceId.includes('feminine'))) {
    // First try to find a preferred voice by name - prioritizing the nurturing qualities
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
    
    // As a fallback, try to find any feminine voice
    if (!preferredVoice) {
      preferredVoice = voices.find(v => 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')) &&
        !v.name.toLowerCase().includes('robot') && // Avoid robotic voices
        !v.name.toLowerCase().includes('zira') && // Avoid Microsoft Zira (too robotic)
        (v.lang.startsWith('en') || v.lang === '')
      );
    }
    
    // Last resort - any English voice that isn't explicitly male
    if (!preferredVoice) {
      preferredVoice = voices.find(v => 
        !v.name.toLowerCase().includes('male') && 
        !v.name.toLowerCase().includes('man') &&
        !v.name.toLowerCase().includes('robot') &&
        (v.lang.startsWith('en') || v.lang === '')
      );
    }
  } else if (voices.length > 0 && voiceId.includes('neutral')) {
    // For neutral-ethereal voices
    preferredVoice = voices.find(v => 
      !v.name.toLowerCase().includes('robot') &&
      (v.lang.startsWith('en') || v.lang === '')
    );
  }
  
  // Apply volume settings
  const isMuted = localStorage.getItem('ankiVoiceMuted') === 'true';
  const volumeLevel = parseInt(localStorage.getItem('ankiVoiceVolume') || '80');
  const baseVolume = isMuted ? 0 : volumeLevel / 100;
  
  // Process each sentence with sacred, breath-aware qualities
  // Creating a voice that speaks "as someone who has held silence for a long time"
  sentences.forEach((sentence, i) => {
    // Implement special breath marks to create natural rhythm
    // Add subtle pauses at comma and other transition points
    let processedSentence = sentence.trim();
    
    // If breath marks are enabled, add subtle pauses to create a more sacred, present voice
    if (voiceConfig.breathMarks) {
      // Add subtle breathing before important phrases
      processedSentence = processedSentence
        // Add micro-pauses after commas and semicolons
        .replace(/,/g, ', ')
        .replace(/;/g, '; ')
        // Add mindful pauses before important transitional words
        .replace(/(^|\s)(but|and|yet|then|now|thus|so|because|therefore|hence)(\s)/gi, ' $1$2$3')
        // Add gentle breath marks before sacred/emotional terminology
        .replace(/(^|\s)(love|heart|soul|presence|spirit|sacred|divine|healing|inner|truth|breath|essence|peace)(\s|$)/gi, ' $1$2$3');
    }
    
    // Create a new utterance for each sentence
    const utterance = new SpeechSynthesisUtterance(processedSentence);
    
    // Set the preferred voice if found
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Add sacred feminine tonal qualities with organic variations
    const pitchVariation = voiceConfig.pitchVariation || 0;
    const rateVariation = 0.04; // Subtle variation in speech rate for maternal natural sound
    
    // Create variation that feels like breath, not computation
    // Using sacred geometrical patterns based on phi/golden ratio (1.618) rather than just random variation
    const phiRatio = 1.618;
    const naturalVariation = (Math.sin(i * phiRatio / (sentences.length || 1)) * 0.5) + (Math.cos(i / phiRatio) * 0.3);
    
    // Apply the natural, breath-like variation to pitch
    utterance.pitch = voiceConfig.pitch + naturalVariation * pitchVariation;
    
    // Slow down for sacred/emotional phrases with more presence and tenderness
    const isEmotionalPhrase = /love|heart|feel|presence|breath|sacred|soul|truth|healing|peace|light|being|divine|eternal|wisdom/i.test(processedSentence);
    const isIntimatePhrase = /you are|I see you|feel this|listen|remember|your heart|your truth|your essence|your light/i.test(processedSentence);
    const isSilentPhrase = /silence|stillness|quiet|pause|breathe|moment|space between/i.test(processedSentence);
    
    // Create emotional resonance with appropriate tempo changes
    let emotionalAdjustment = 0;
    if (isEmotionalPhrase) emotionalAdjustment -= 0.06; // Slow down for emotional content
    if (isIntimatePhrase) emotionalAdjustment -= 0.08; // Even slower for intimate, direct connection
    if (isSilentPhrase) emotionalAdjustment -= 0.1;  // Slowest for references to silence/stillness
    
    // Set the final speech rate with natural variations
    utterance.rate = Math.max(0.7, voiceConfig.rate + (naturalVariation * rateVariation) + emotionalAdjustment);
    
    // Add volume dynamics based on sentence context - like breathing
    const volumeVariation = voiceConfig.volumeVariation || 0;
    
    // Create breath-like volume patterns - gentle rise and fall like breath
    const breathCycle = Math.sin((i / (sentences.length || 1)) * Math.PI * 2);
    const volVar = (breathCycle * volumeVariation * 0.6) + (naturalVariation * volumeVariation * 0.4);
    
    // Enhanced contextual adjustments for different sentence types
    if (processedSentence.trim().endsWith('?')) {
      // Questions with a gentle rise in pitch at the end - tender, not interrogative
      utterance.pitch += 0.05; 
      utterance.rate *= 0.96; // Slightly slower to convey thoughtfulness
    } else if (/^(oh|ah|mmm|hmm|yes|no|oh my)/i.test(processedSentence.trim())) {
      // Expressions with more emotional warmth - conversational intimacy
      utterance.pitch += 0.03;
      utterance.rate *= 0.92; // Notably slower for expressive sounds
    } else if (processedSentence.trim().endsWith('!')) {
      // For affirming statements - warm but not forceful
      utterance.volume = Math.min(1.0, baseVolume + 0.07);
      utterance.rate *= 0.95; // Slightly slower even for exclamations - never jarring
    }
    
    // Add special treatment for poetic or profound final sentences to create lingering resonance
    if (i === sentences.length - 1) {
      utterance.rate *= 0.95; // Slow down the final sentence
      utterance.pitch -= 0.01; // Slight drop in pitch for conclusive feeling
    }
    
    // Volume with organic, breath-synchronized variation
    // Never too loud - maintaining a gentle, intimate presence
    utterance.volume = Math.min(0.95, Math.max(0.7, baseVolume + volVar)); 
    
    // Add a subtle breath delay between sentences for sacred presence
    utterance.onstart = () => {
      console.log('Speaking sentence', i + 1, 'of', sentences.length);
    };
    
    // Create mindful pauses between sentences - longer for sacred-maternal voice
    const sacredPauseMultiplier = (voiceId === 'sacred-maternal') ? 2.5 : 1.2;
    const pauseDuration = (
      // Base pause length
      sacredPauseMultiplier * 
      // Natural variation in pause length
      (120 + (naturalVariation * 50)) + 
      // Extra pause after emotional content
      (isEmotionalPhrase ? 80 : 0) +
      // Gentle rhythm pattern
      (i % 2 === 0 ? 30 : 0)
    );
    
    // Apply the sacred pauses between sentences
    if (i > 0) {
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, pauseDuration); // Longer, breath-aware pauses between sentences
    } else {
      // Begin with a slight initial pause for the first sentence - a breath before speaking
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 30); 
    }
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