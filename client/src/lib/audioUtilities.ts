import oceanSoundPath from '@assets/Gentle Ocean Current.wav';

// Audio Context singleton
let audioContextInstance: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContextInstance) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextInstance = new AudioContextClass();
  }
  return audioContextInstance;
};

// Sacred tone shapes based on instrument types
export type ToneShape = 'crystal' | 'gong' | 'bell' | 'singing-bowl' | 'chime';

interface FilterSettings {
  lowpass: {
    frequency: number;
    Q: number;
  };
  highpass: {
    frequency: number;
    Q: number;
  };
  lowShelf: {
    frequency: number;
    gain: number;
  };
  highShelf: {
    frequency: number;
    gain: number;
  };
  notch?: {
    frequency: number;
    Q: number;
  };
  peaking?: {
    frequency: number;
    Q: number;
    gain: number;
  };
}

// Mapping of frequencies to ideal tone shapes
export const getIdealToneShapeForFrequency = (frequency: number): ToneShape => {
  // Sacred frequency to tone shape mapping
  if (frequency === 396) return 'bell';
  if (frequency === 417) return 'singing-bowl';
  if (frequency === 528) return 'crystal';
  if (frequency === 639) return 'singing-bowl';
  if (frequency === 741) return 'chime';
  if (frequency === 852) return 'gong';
  if (frequency === 963) return 'gong';
  
  // Default mappings by range
  if (frequency < 400) return 'bell';
  if (frequency < 520) return 'singing-bowl';
  if (frequency < 600) return 'crystal';
  if (frequency < 800) return 'chime';
  return 'gong';
};

// Get filter settings for a specific tone shape
export const getFilterSettingsForShape = (shape: ToneShape): FilterSettings => {
  // Each tone shape has unique EQ characteristics that simulate sacred instruments
  switch (shape) {
    case 'crystal':
      return {
        lowpass: { frequency: 8000, Q: 1 },
        highpass: { frequency: 300, Q: 0.7 },
        lowShelf: { frequency: 500, gain: -6 },
        highShelf: { frequency: 3000, gain: 3 },
        peaking: { frequency: 5200, Q: 8, gain: 4 }
      };
    case 'gong':
      return {
        lowpass: { frequency: 5000, Q: 1 },
        highpass: { frequency: 60, Q: 0.7 },
        lowShelf: { frequency: 150, gain: 3 },
        highShelf: { frequency: 2000, gain: -6 },
        peaking: { frequency: 420, Q: 4, gain: 6 }
      };
    case 'bell':
      return {
        lowpass: { frequency: 6000, Q: 1 },
        highpass: { frequency: 120, Q: 1 },
        lowShelf: { frequency: 200, gain: 4 },
        highShelf: { frequency: 4000, gain: -8 },
        notch: { frequency: 1000, Q: 8 }
      };
    case 'singing-bowl':
      return {
        lowpass: { frequency: 7000, Q: 0.7 },
        highpass: { frequency: 200, Q: 0.8 },
        lowShelf: { frequency: 400, gain: 2 },
        highShelf: { frequency: 3500, gain: -5 },
        peaking: { frequency: 1800, Q: 5, gain: 3 }
      };
    case 'chime':
      return {
        lowpass: { frequency: 10000, Q: 1 },
        highpass: { frequency: 400, Q: 0.7 },
        lowShelf: { frequency: 600, gain: -3 },
        highShelf: { frequency: 5000, gain: 4 },
        peaking: { frequency: 8000, Q: 6, gain: 5 }
      };
  }
};

// Create a filter chain for a specific tone shape
export const createSacredToneFilters = (
  audioContext: AudioContext,
  shape: ToneShape
): {
  input: AudioNode;
  output: AudioNode;
} => {
  const filterSettings = getFilterSettingsForShape(shape);
  
  // Create filters
  const lowpassFilter = audioContext.createBiquadFilter();
  lowpassFilter.type = 'lowpass';
  lowpassFilter.frequency.value = filterSettings.lowpass.frequency;
  lowpassFilter.Q.value = filterSettings.lowpass.Q;
  
  const highpassFilter = audioContext.createBiquadFilter();
  highpassFilter.type = 'highpass';
  highpassFilter.frequency.value = filterSettings.highpass.frequency;
  highpassFilter.Q.value = filterSettings.highpass.Q;
  
  const lowShelfFilter = audioContext.createBiquadFilter();
  lowShelfFilter.type = 'lowshelf';
  lowShelfFilter.frequency.value = filterSettings.lowShelf.frequency;
  lowShelfFilter.gain.value = filterSettings.lowShelf.gain;
  
  const highShelfFilter = audioContext.createBiquadFilter();
  highShelfFilter.type = 'highshelf';
  highShelfFilter.frequency.value = filterSettings.highShelf.frequency;
  highShelfFilter.gain.value = filterSettings.highShelf.gain;
  
  // Optional filters based on the shape
  const additionalFilters: BiquadFilterNode[] = [];
  
  if (filterSettings.notch) {
    const notchFilter = audioContext.createBiquadFilter();
    notchFilter.type = 'notch';
    notchFilter.frequency.value = filterSettings.notch.frequency;
    notchFilter.Q.value = filterSettings.notch.Q;
    additionalFilters.push(notchFilter);
  }
  
  if (filterSettings.peaking) {
    const peakingFilter = audioContext.createBiquadFilter();
    peakingFilter.type = 'peaking';
    peakingFilter.frequency.value = filterSettings.peaking.frequency;
    peakingFilter.Q.value = filterSettings.peaking.Q;
    peakingFilter.gain.value = filterSettings.peaking.gain;
    additionalFilters.push(peakingFilter);
  }
  
  // Connect filters in series
  lowpassFilter.connect(highpassFilter);
  highpassFilter.connect(lowShelfFilter);
  lowShelfFilter.connect(highShelfFilter);
  
  let lastNode: AudioNode = highShelfFilter;
  
  // Connect any additional filters
  additionalFilters.forEach(filter => {
    lastNode.connect(filter);
    lastNode = filter;
  });
  
  return {
    input: lowpassFilter,
    output: lastNode
  };
};

// Create a convolver node for reverb effect
export const createSacredReverb = async (
  audioContext: AudioContext,
  reverbTime: 'short' | 'medium' | 'long' = 'medium'
): Promise<ConvolverNode> => {
  const convolver = audioContext.createConvolver();
  
  // Generate impulse response for natural reverb
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * (reverbTime === 'short' ? 2 : reverbTime === 'medium' ? 3 : 5);
  const impulseResponse = audioContext.createBuffer(2, length, sampleRate);
  
  // Create left and right channels
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulseResponse.getChannelData(channel);
    
    // Create a natural decay curve with random reflections
    for (let i = 0; i < length; i++) {
      // Base exponential decay
      const decay = Math.exp(-i / (sampleRate * (reverbTime === 'short' ? 0.5 : reverbTime === 'medium' ? 0.8 : 1.2)));
      
      // Add some natural random reflections and harmonics
      const reflection = (Math.random() * 2 - 1) * 
                         (1 - Math.min(1, i / (sampleRate * 0.1))); // Early reflections
      
      // Slowly decaying oscillation patterns
      const harmonicOscillation = Math.sin(i * 0.01) * 0.015 * decay;
      
      // Combine for final impulse shape
      channelData[i] = (decay * 0.85 + reflection * 0.1 + harmonicOscillation) * 0.5;
    }
  }
  
  convolver.buffer = impulseResponse;
  return convolver;
};

// Create a unified, gentle sacred tone generator with natural envelope
export const createSacredToneGenerator = async (
  frequency: number,
  volume: number = 0.3, // Default to softer volume
  shape: ToneShape | null = null
): Promise<{
  oscillator: OscillatorNode;
  gainNode: GainNode;
  filterInput: AudioNode;
  start: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
}> => {
  const ctx = getAudioContext();
  
  // Create base oscillator (sine wave for purity)
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Create secondary oscillator for harmonic depth (slightly detuned)
  const oscillator2 = ctx.createOscillator();
  oscillator2.type = 'sine';
  oscillator2.frequency.value = frequency * 1.0019; // Very slight detuning for natural depth
  
  // Create third oscillator for sub-harmonic
  const oscillator3 = ctx.createOscillator();
  oscillator3.type = 'sine';
  oscillator3.frequency.value = frequency / 2; // Octave below for warmth
  
  // Create master gain for volume control
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0; // Start silent for fade-in
  
  // Individual gains for oscillator mixing
  const osc1Gain = ctx.createGain();
  osc1Gain.gain.value = 0.7; // Primary tone
  
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.value = 0.2; // Subtle beating/interference
  
  const osc3Gain = ctx.createGain();
  osc3Gain.gain.value = 0.15; // Subtle sub-harmonic
  
  // Unified sacred filter chain for a singing bowl-like quality
  // Create unified filter setup for a singing bowl/crystal bowl hybrid sound
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 7000;
  lowpass.Q.value = 1.2;
  
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = Math.max(80, frequency * 0.4);
  highpass.Q.value = 0.7;
  
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = frequency * 0.8;
  lowShelf.gain.value = 2; // Boost lows slightly
  
  const peaking = ctx.createBiquadFilter();
  peaking.type = 'peaking';
  peaking.frequency.value = frequency * 1.98; // Emphasize natural harmonics
  peaking.Q.value = 4;
  peaking.gain.value = 1.5;
  
  // Add reverb for spatial quality (always long and spacious)
  const reverb = await createSacredReverb(ctx, 'long');
  
  // Create a dry/wet mixer for the reverb
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.4; // 40% dry signal
  
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.6; // 60% wet (reverb) signal - more reverb for spatial quality
  
  // Connect oscillators to their individual gains
  oscillator.connect(osc1Gain);
  oscillator2.connect(osc2Gain);
  oscillator3.connect(osc3Gain);
  
  // Connect oscillator gains to filter chain
  osc1Gain.connect(lowpass);
  osc2Gain.connect(lowpass);
  osc3Gain.connect(lowpass);
  
  // Connect filter chain
  lowpass.connect(highpass);
  highpass.connect(lowShelf);
  lowShelf.connect(peaking);
  
  // Split for dry/wet paths
  peaking.connect(dryGain);
  peaking.connect(reverb);
  reverb.connect(wetGain);
  
  // Mix dry and wet to master
  dryGain.connect(masterGain);
  wetGain.connect(masterGain);
  
  // Final connection to output
  masterGain.connect(ctx.destination);
  
  // Create smooth envelope functions
  const start = () => {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    
    // Always use very gentle, slow attack for singing bowl quality
    const attackTime = 1.5; // Long, gentle fade-in
    
    // Gentle fade in
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.01);  // Avoid clicks
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.7, now + attackTime); // Reduced volume
    
    // Start all oscillators
    oscillator.start();
    oscillator2.start();
    oscillator3.start();
  };
  
  const stop = () => {
    const now = ctx.currentTime;
    
    // Always use very gentle, slow release
    const releaseTime = 3.0; // Long, gentle fade-out
    
    // Gentle fade out
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
    
    // Stop after fade out to avoid clicks
    oscillator.stop(now + releaseTime + 0.1);
    oscillator2.stop(now + releaseTime + 0.1);
    oscillator3.stop(now + releaseTime + 0.1);
  };
  
  const setVolume = (value: number) => {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(value * 0.7, now + 0.5); // Slow volume transition, reduce overall level
  };
  
  return {
    oscillator,
    gainNode: masterGain,
    filterInput: lowpass,
    start,
    stop,
    setVolume
  };
};

// Ocean sound ambient layer manager
export const createOceanSoundLayer = async (initialVolume: number = 0): Promise<{
  play: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
  isPlaying: () => boolean;
}> => {
  const ctx = getAudioContext();
  
  // Create audio element for ocean sound
  const oceanAudio = new Audio(oceanSoundPath);
  oceanAudio.loop = true;
  oceanAudio.volume = 0; // Start silent
  
  // Load the audio
  await new Promise<void>((resolve) => {
    oceanAudio.addEventListener('canplaythrough', () => resolve(), { once: true });
    oceanAudio.load();
  });
  
  let isPlaying = false;
  
  const play = () => {
    if (!isPlaying) {
      oceanAudio.play().catch(e => console.error("Error playing ocean sound:", e));
      oceanAudio.volume = initialVolume;
      isPlaying = true;
    }
  };
  
  const stop = () => {
    if (isPlaying) {
      oceanAudio.pause();
      isPlaying = false;
    }
  };
  
  const setVolume = (value: number) => {
    oceanAudio.volume = value;
    
    if (value > 0 && !isPlaying) {
      play();
    } else if (value === 0 && isPlaying) {
      stop();
    }
  };
  
  // Initialize if needed
  if (initialVolume > 0) {
    play();
  }
  
  return {
    play,
    stop,
    setVolume,
    isPlaying: () => isPlaying
  };
};