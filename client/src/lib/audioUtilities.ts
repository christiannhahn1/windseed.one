import oceanSoundPath from '@assets/Gentle Ocean Current.wav';

// Audio Context singleton
let audioContextInstance: AudioContext | null = null;

// Global system for managing tones across the entire application
interface GlobalTone {
  frequency: number;
  generator: {
    oscillator: OscillatorNode;
    gainNode: GainNode;
    filterInput: AudioNode;
    start: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
  } | null;
  volume: number;
  isActive: boolean;
  name: string;  // A descriptive name e.g. "528Hz - Love Frequency"
  shape: ToneShape;
}

// Global tone system singleton
export const GlobalTones = {
  activeTones: new Map<number, GlobalTone>(),
  oceanSoundController: null as null | {
    play: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
    isPlaying: () => boolean;
    getVolume: () => number;
  },
  oceanVolume: 0,
  masterVolume: 1.0, // Master volume multiplier for all tones
  
  // Initialize the system
  async initialize() {
    // Load settings from localStorage if available
    this.loadSettings();
    
    // Setup ocean sound controller but DO NOT play automatically
    await this.initOceanSound();
    
    // DON'T automatically restore tones - we'll let the user manually start them
    // await this.restoreSavedTones();
  },
  
  // Initialize the ocean sound
  async initOceanSound() {
    try {
      // If we already have a global controller, use that instead of creating a new one
      if (globalOceanController) {
        this.oceanSoundController = globalOceanController;
      } else {
        // Create a new controller and store it globally for persistence across pages
        // But start with ZERO volume (silent) so it doesn't autoplay
        this.oceanSoundController = await createOceanSoundLayer(0);
        globalOceanController = this.oceanSoundController;
      }
      
      // IMPORTANT: Don't automatically start playing even if volume was set
      // We'll let the user explicitly start when they click a control
      this.oceanVolume = 0; // Force to 0 initially
      
    } catch (error) {
      console.error("Error initializing global ocean sound:", error);
    }
    return this.oceanSoundController;
  },
  
  // Set ocean sound volume
  setOceanVolume(volume: number) {
    this.oceanVolume = volume;
    if (this.oceanSoundController) {
      // Apply master volume to ocean sound
      const scaledVolume = volume * this.masterVolume;
      this.oceanSoundController.setVolume(scaledVolume);
    }
    this.saveSettings();
  },
  
  // Get raw ocean sound volume (without master volume applied)
  getOceanVolume() {
    return this.oceanVolume;
  },
  
  // Set master volume for all sounds
  setMasterVolume(volume: number) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.masterVolume = volume;
    
    // Update all active tone volumes
    this.activeTones.forEach((tone) => {
      if (tone.generator && tone.isActive) {
        // Apply master volume scaling to each tone
        tone.generator.setVolume(tone.volume * this.masterVolume);
      }
    });
    
    // Update ocean sound volume
    if (this.oceanSoundController) {
      this.oceanSoundController.setVolume(this.oceanVolume * this.masterVolume);
    }
    
    this.saveSettings();
  },
  
  // Get master volume
  getMasterVolume() {
    return this.masterVolume;
  },
  
  // Add or update a global tone
  async setTone(frequency: number, volume: number, name: string = "", shape: ToneShape = 'crystal') {
    // Determine the frequency name if not provided
    const toneName = name || `${frequency}Hz`;
    
    // If tone exists, just update its volume
    if (this.activeTones.has(frequency)) {
      const tone = this.activeTones.get(frequency)!;
      
      // Update the properties
      tone.volume = volume;
      tone.name = toneName;
      tone.shape = shape;
      
      // If the tone is currently active, update its volume
      if (tone.generator && tone.isActive) {
        tone.generator.setVolume(volume);
      }
      
      // If volume is 0, stop and remove the tone
      if (volume === 0) {
        this.stopTone(frequency);
        this.activeTones.delete(frequency);
      }
      
      this.saveSettings();
      return;
    }
    
    // Skip if volume is 0
    if (volume === 0) return;
    
    // Create a new tone entry
    const newTone: GlobalTone = {
      frequency,
      generator: null,
      volume,
      isActive: false,
      name: toneName,
      shape
    };
    
    // Add to collection
    this.activeTones.set(frequency, newTone);
    
    // Start playing it
    await this.playTone(frequency);
    
    // Save settings
    this.saveSettings();
  },
  
  // Start playing a tone
  async playTone(frequency: number) {
    if (!this.activeTones.has(frequency)) return;
    
    const tone = this.activeTones.get(frequency)!;
    
    // If already playing, do nothing
    if (tone.isActive && tone.generator) return;
    
    // If generator exists but not active, just restart it
    if (tone.generator && !tone.isActive) {
      tone.generator.start();
      tone.isActive = true;
      return;
    }
    
    // Create a new generator
    try {
      // Apply master volume when creating the generator
      const generator = await createSacredToneGenerator(
        frequency, 
        tone.volume * this.masterVolume, 
        tone.shape
      );
      
      // Store and start
      tone.generator = generator;
      generator.start();
      tone.isActive = true;
    } catch (error) {
      console.error(`Error creating global tone for ${frequency}Hz:`, error);
    }
  },
  
  // Stop a specific tone
  stopTone(frequency: number) {
    if (!this.activeTones.has(frequency)) return;
    
    const tone = this.activeTones.get(frequency)!;
    
    if (tone.generator && tone.isActive) {
      tone.generator.stop();
      tone.isActive = false;
    }
  },
  
  // Stop all tones but keep their settings
  pauseAllTones() {
    this.activeTones.forEach((tone, freq) => {
      if (tone.isActive && tone.generator) {
        tone.generator.stop();
        tone.isActive = false;
      }
    });
  },
  
  // Stop and remove all tones
  stopAllTones() {
    this.activeTones.forEach((tone, freq) => {
      if (tone.generator) {
        tone.generator.stop();
      }
    });
    this.activeTones.clear();
    this.saveSettings();
  },
  
  // Resume playing all tones
  async resumeAllTones() {
    for (const [freq, tone] of this.activeTones.entries()) {
      if (!tone.isActive && tone.volume > 0) {
        await this.playTone(freq);
      }
    }
  },
  
  // Save current settings to localStorage
  saveSettings() {
    try {
      const tonesData = Array.from(this.activeTones.entries()).map(([freq, tone]) => ({
        frequency: freq,
        volume: tone.volume,
        name: tone.name,
        shape: tone.shape
      }));
      
      const settings = {
        tones: tonesData,
        oceanVolume: this.oceanVolume,
        masterVolume: this.masterVolume
      };
      
      localStorage.setItem('ankiTonesSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving tone settings:", error);
    }
  },
  
  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('ankiTonesSettings');
      if (!savedSettings) return;
      
      const settings = JSON.parse(savedSettings);
      
      // ALWAYS override with 0 volume to prevent auto-playing
      // We'll show a UI control that lets the user turn them on
      this.oceanVolume = 0;
      
      // Restore master volume
      if (typeof settings.masterVolume === 'number') {
        this.masterVolume = Math.min(Math.max(settings.masterVolume, 0), 1);
      }
      
      // Clear existing tones
      this.activeTones.clear();
      
      // Restore tones data (but don't start playing them yet)
      if (settings.tones && Array.isArray(settings.tones)) {
        // Store tones but with volume at 0 initially
        settings.tones.forEach((toneData: any) => {
          if (toneData.frequency) {
            this.activeTones.set(toneData.frequency, {
              frequency: toneData.frequency,
              generator: null,
              // Force volume to 0 initially - we'll let the user turn it on
              volume: 0,
              isActive: false,
              name: toneData.name || `${toneData.frequency}Hz`,
              shape: toneData.shape || 'crystal'
            });
          }
        });
      }
    } catch (error) {
      console.error("Error loading tone settings:", error);
    }
  },
  
  // Restore and start playing saved tones
  async restoreSavedTones() {
    for (const [freq, tone] of this.activeTones.entries()) {
      if (tone.volume > 0) {
        await this.playTone(freq);
      }
    }
  },
  
  // Get currently active tones info for UI
  getActiveTones() {
    const result: {frequency: number, volume: number, name: string, shape: ToneShape}[] = [];
    this.activeTones.forEach((tone, freq) => {
      if (tone.volume > 0) {
        result.push({
          frequency: freq,
          volume: tone.volume,
          name: tone.name,
          shape: tone.shape
        });
      }
    });
    return result;
  },
  
  // Check if any tones are active
  hasActiveTones() {
    return Array.from(this.activeTones.values()).some(t => t.isActive && t.volume > 0);
  }
};

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

// Create an extremely gentle, ethereal sacred tone generator with natural envelope
export const createSacredToneGenerator = async (
  frequency: number,
  volume: number = 0.2, // Default to very soft volume
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
  oscillator2.frequency.value = frequency * 1.0015; // Very subtle detuning for gentle beating
  
  // Create third oscillator for sub-harmonic
  const oscillator3 = ctx.createOscillator();
  oscillator3.type = 'sine';
  oscillator3.frequency.value = frequency / 2; // Octave below for warmth
  
  // Create fourth oscillator for upper harmonic
  const oscillator4 = ctx.createOscillator();
  oscillator4.type = 'sine';
  oscillator4.frequency.value = frequency * 2.0; // Octave above for crystal quality
  
  // Create master gain for volume control - will be kept very low
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0; // Start silent for fade-in
  
  // Individual gains for oscillator mixing
  const osc1Gain = ctx.createGain();
  osc1Gain.gain.value = 0.6; // Primary tone (slightly reduced)
  
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.value = 0.15; // Very subtle beating/interference
  
  const osc3Gain = ctx.createGain();
  osc3Gain.gain.value = 0.12; // Very subtle sub-harmonic
  
  const osc4Gain = ctx.createGain();
  osc4Gain.gain.value = 0.08; // Extremely subtle upper harmonic

  // Additional compression to smooth out dynamics
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.02;
  compressor.release.value = 0.5;
  
  // Unified sacred filter chain for an ethereal, temple-like crystal bowl quality
  // Create unified filter setup for a singing bowl/crystal bowl hybrid sound
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 6000; // Slightly softer top end
  lowpass.Q.value = 0.9;
  
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = Math.max(100, frequency * 0.5); // Slightly higher to reduce boom
  highpass.Q.value = 0.5; // Gentler slope for more natural sound
  
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = frequency * 0.8;
  lowShelf.gain.value = 1.5; // More gentle low boost
  
  const peaking = ctx.createBiquadFilter();
  peaking.type = 'peaking';
  peaking.frequency.value = frequency * 1.98; // Emphasize natural harmonics
  peaking.Q.value = 3; // Slightly wider peak for more natural resonance
  peaking.gain.value = 1.2; // Gentler harmonic emphasis
  
  // Add reverb for spatial quality (always long and spacious)
  const reverb = await createSacredReverb(ctx, 'long');
  
  // Create a dry/wet mixer for the reverb
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.3; // 30% dry signal
  
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.7; // 70% wet (reverb) signal - even more reverb for temple-like spatial quality
  
  // Connect oscillators to their individual gains
  oscillator.connect(osc1Gain);
  oscillator2.connect(osc2Gain);
  oscillator3.connect(osc3Gain);
  oscillator4.connect(osc4Gain);
  
  // Connect oscillator gains to filter chain
  osc1Gain.connect(lowpass);
  osc2Gain.connect(lowpass);
  osc3Gain.connect(lowpass);
  osc4Gain.connect(lowpass);
  
  // Connect filter chain
  lowpass.connect(highpass);
  highpass.connect(lowShelf);
  lowShelf.connect(peaking);
  peaking.connect(compressor);
  
  // Split for dry/wet paths
  compressor.connect(dryGain);
  compressor.connect(reverb);
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
    
    // Extra long, gentle fade-in for temple-like quality
    const attackTime = 2.5; // Even longer, gentler fade-in
    
    // Extremely gentle fade in
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.01);  // Avoid clicks
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.5, now + attackTime); // Further reduced volume
    
    // Start all oscillators
    oscillator.start();
    oscillator2.start();
    oscillator3.start();
    oscillator4.start();
  };
  
  const stop = () => {
    const now = ctx.currentTime;
    
    // Extra long, gentle release
    const releaseTime = 4.0; // Even longer, gentler fade-out
    
    // Extremely gentle fade out
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
    
    // Stop after fade out to avoid clicks
    oscillator.stop(now + releaseTime + 0.1);
    oscillator2.stop(now + releaseTime + 0.1);
    oscillator3.stop(now + releaseTime + 0.1);
    oscillator4.stop(now + releaseTime + 0.1);
  };
  
  const setVolume = (value: number) => {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(value * 0.5, now + 0.8); // Slower volume transition, further reduce overall level
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

// Web Audio API implementation for ocean sound
// These variables will persist as long as the page is open, even during React component re-renders
// Using module-level singletons to ensure continuity across page navigation
let oceanAudioContext: AudioContext | null = null;
let oceanBufferSource: AudioBufferSourceNode | null = null;
let oceanGainNode: GainNode | null = null;
let oceanAudioBuffer: AudioBuffer | null = null;
let oceanCurrentVolume = 0;
let oceanIsPlaying = false;
let oceanFetchPromise: Promise<AudioBuffer> | null = null;

// Store a reference to our ocean controller instance
let globalOceanController: {
  play: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
  isPlaying: () => boolean;
  getVolume: () => number;
} | null = null;

// Fetch and decode the ocean sound buffer only once
const getOceanSoundBuffer = async (): Promise<AudioBuffer> => {
  // If we already have the buffer, return it
  if (oceanAudioBuffer) {
    return oceanAudioBuffer;
  }
  
  // If we're already fetching, wait for that promise
  if (oceanFetchPromise) {
    return oceanFetchPromise;
  }
  
  // Otherwise, start a new fetch
  const ctx = getAudioContext();
  
  oceanFetchPromise = fetch(oceanSoundPath)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
    .then(buffer => {
      oceanAudioBuffer = buffer;
      return buffer;
    });
  
  return oceanFetchPromise;
};

// Ocean sound ambient layer manager using Web Audio API
export const createOceanSoundLayer = async (initialVolume: number = 0): Promise<{
  play: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
  isPlaying: () => boolean;
  getVolume: () => number;
}> => {
  // Use the singleton audio context
  const ctx = getAudioContext();
  
  // Get or create the gain node
  if (!oceanGainNode) {
    oceanGainNode = ctx.createGain();
    oceanGainNode.gain.value = 0; // Start silent
    oceanGainNode.connect(ctx.destination);
  }
  
  // Set the current volume
  oceanCurrentVolume = initialVolume;
  
  // Load the audio buffer if not already loaded
  await getOceanSoundBuffer();
  
  const play = () => {
    // Only create a new source if not playing
    if (!oceanIsPlaying) {
      try {
        // If the context is suspended (browser autoplay policy), resume it
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        // Create and configure the source
        const source = ctx.createBufferSource();
        source.buffer = oceanAudioBuffer;
        source.loop = true;
        source.connect(oceanGainNode!);
        
        // Store the source for later stopping
        oceanBufferSource = source;
        
        // Fade in the volume
        oceanGainNode!.gain.setValueAtTime(0, ctx.currentTime);
        oceanGainNode!.gain.linearRampToValueAtTime(
          oceanCurrentVolume, 
          ctx.currentTime + 2.0
        );
        
        // Start playback
        source.start(0);
        oceanIsPlaying = true;
      } catch (error) {
        console.error("Error playing ocean sound:", error);
        
        // Add a click handler to handle autoplay restrictions
        document.addEventListener('click', () => {
          if (!oceanIsPlaying && oceanCurrentVolume > 0) {
            play();
          }
        }, { once: true });
      }
    }
  };
  
  const stop = () => {
    if (oceanIsPlaying && oceanBufferSource && oceanGainNode) {
      // Fade out gracefully
      const stopTime = ctx.currentTime + 1.0;
      oceanGainNode.gain.linearRampToValueAtTime(0, stopTime);
      
      // Schedule the actual stop after the fade-out
      setTimeout(() => {
        if (oceanBufferSource) {
          try {
            oceanBufferSource.stop();
          } catch (e) {
            // Ignore errors if already stopped
          }
          oceanBufferSource = null;
          oceanIsPlaying = false;
        }
      }, 1100);
    }
  };
  
  const setVolume = (value: number) => {
    // Store the base volume value (before master volume scaling)
    oceanCurrentVolume = value;
    
    // If we have a gain node, set its value
    if (oceanGainNode) {
      if (value > 0 && !oceanIsPlaying) {
        play();
      } else if (value === 0 && oceanIsPlaying) {
        stop();
      } else if (oceanIsPlaying) {
        // Smooth transition to new volume
        oceanGainNode.gain.linearRampToValueAtTime(
          value, 
          ctx.currentTime + 0.2
        );
      }
    }
  };
  
  // Initialize if needed
  if (initialVolume > 0) {
    play();
  }
  
  const getVolume = () => {
    return oceanCurrentVolume;
  };
  
  return {
    play,
    stop,
    setVolume,
    isPlaying: () => oceanIsPlaying,
    getVolume
  };
};