import { useState, useEffect, useRef } from 'react';
import oceanSoundPath from '@assets/Gentle Ocean Current.wav';

// Solfeggio frequency information
interface FrequencyInfo {
  value: number;
  description: string;
  category: 'healing' | 'spiritual' | 'emotional' | 'physical';
}

interface Triad {
  name: string;
  frequencies: number[];
  descriptions: string[];
  category: string;
}

// Comprehensive Solfeggio frequencies database with descriptions
const solfeggioFrequencies: FrequencyInfo[] = [
  { value: 174, description: "Reduce pain and stress", category: 'physical' },
  { value: 285, description: "Influence energy fields", category: 'spiritual' },
  { value: 324, description: "Bridge between realms", category: 'spiritual' },
  { value: 396, description: "Liberation from fear and guilt", category: 'emotional' },
  { value: 417, description: "Facilitate change and clearing", category: 'spiritual' },
  { value: 432, description: "Sacred harmony with universal patterns", category: 'spiritual' },
  { value: 528, description: "Transformation and DNA repair", category: 'healing' },
  { value: 639, description: "Harmonize relationships", category: 'emotional' },
  { value: 741, description: "Awakening intuition", category: 'spiritual' },
  { value: 852, description: "Return to spiritual order", category: 'spiritual' },
  { value: 963, description: "Awakening to cosmic consciousness", category: 'spiritual' }
];

// Predefined triad combinations
const triads: Record<string, Triad> = {
  sacredReturn: {
    name: "Sacred Return",
    frequencies: [417, 528, 963],
    descriptions: [
      "Facilitates change and clearing of limiting patterns",
      "Transformation and miracles, DNA repair",
      "Awakening and return to oneness, cosmic consciousness"
    ],
    category: "Spiritual Awakening"
  },
  completionMirror: {
    name: "Completion Mirror",
    frequencies: [324, 639, 963],
    descriptions: [
      "Bridges conscious and unconscious realms",
      "Harmonizing relationships and connections",
      "Awakening and return to oneness, cosmic consciousness"
    ],
    category: "Emotional Healing"
  },
  innerHealing: {
    name: "Inner Healing",
    frequencies: [396, 528, 741],
    descriptions: [
      "Liberation from fear and guilt",
      "Transformation and DNA repair",
      "Awakening intuition and expression"
    ],
    category: "Deep Healing"
  }
};

export default function SolfeggioModule() {
  // Core state
  const [mode, setMode] = useState<'triad' | 'individual' | 'custom'>('triad');
  const [selectedTriad, setSelectedTriad] = useState<string>("none");
  const [volumes, setVolumes] = useState<number[]>([0.5, 0.5, 0.5]);
  const [isActive, setIsActive] = useState<boolean[]>([false, false, false]);
  
  // Individual frequency mode state
  const [individualFrequency, setIndividualFrequency] = useState<number>(528);
  const [individualVolume, setIndividualVolume] = useState<number>(0.5);
  const [isIndividualActive, setIsIndividualActive] = useState<boolean>(false);
  
  // Custom triad creation state
  const [customFrequencies, setCustomFrequencies] = useState<number[]>([417, 528, 963]);
  const [customVolumes, setCustomVolumes] = useState<number[]>([0.5, 0.5, 0.5]);
  const [isCustomActive, setIsCustomActive] = useState<boolean[]>([false, false, false]);
  
  // Ocean sound state
  const [oceanVolume, setOceanVolume] = useState<number>(0);
  const [isOceanPlaying, setIsOceanPlaying] = useState<boolean>(false);
  const oceanAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Web Audio API references
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  
  // Individual oscillator references
  const individualOscillatorRef = useRef<OscillatorNode | null>(null);
  const individualGainNodeRef = useRef<GainNode | null>(null);
  
  // Custom triad oscillator references
  const customOscillatorsRef = useRef<OscillatorNode[]>([]);
  const customGainNodesRef = useRef<GainNode[]>([]);
  
  // Initialize audio context on first interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser:", e);
      }
    }
    return audioContextRef.current;
  };
  
  // Create a sine wave oscillator at the specified frequency
  const createTone = (frequency: number, volume: number) => {
    const ctx = initAudioContext();
    if (!ctx) return { oscillator: null, gainNode: null };
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Create gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    
    // Connect oscillator to gain node and gain node to output
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    return { oscillator, gainNode };
  };
  
  // Initialize ocean sound
  useEffect(() => {
    // Create audio element for ocean sound
    const oceanAudio = new Audio(oceanSoundPath);
    oceanAudio.loop = true;
    oceanAudio.volume = oceanVolume;
    oceanAudioRef.current = oceanAudio;
    
    return () => {
      if (oceanAudioRef.current) {
        oceanAudioRef.current.pause();
        oceanAudioRef.current = null;
      }
    };
  }, []);
  
  // Handle ocean sound volume changes
  useEffect(() => {
    if (oceanAudioRef.current) {
      oceanAudioRef.current.volume = oceanVolume;
      
      if (oceanVolume > 0 && !isOceanPlaying) {
        oceanAudioRef.current.play().catch(e => console.error("Error playing ocean sound:", e));
        setIsOceanPlaying(true);
      } else if (oceanVolume === 0 && isOceanPlaying) {
        oceanAudioRef.current.pause();
        setIsOceanPlaying(false);
      }
    }
  }, [oceanVolume, isOceanPlaying]);
  
  // Stop all audio sources
  const stopAllAudio = () => {
    // Stop triad oscillators
    try {
      oscillatorsRef.current.forEach(osc => {
        if (osc) {
          osc.stop();
          osc.disconnect();
        }
      });
    } catch (e) {
      // Ignore errors when stopping oscillators
    }
    
    // Stop individual oscillator
    try {
      if (individualOscillatorRef.current) {
        individualOscillatorRef.current.stop();
        individualOscillatorRef.current.disconnect();
        individualOscillatorRef.current = null;
        individualGainNodeRef.current = null;
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Stop custom triad oscillators
    try {
      customOscillatorsRef.current.forEach(osc => {
        if (osc) {
          osc.stop();
          osc.disconnect();
        }
      });
    } catch (e) {
      // Ignore errors
    }
    
    // Reset state
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    customOscillatorsRef.current = [];
    customGainNodesRef.current = [];
    setIsActive([false, false, false]);
    setIsIndividualActive(false);
    setIsCustomActive([false, false, false]);
    setSelectedTriad("none");
  };
  
  // Stop ocean sound
  const stopOceanSound = () => {
    if (oceanAudioRef.current && isOceanPlaying) {
      oceanAudioRef.current.pause();
      setIsOceanPlaying(false);
    }
    setOceanVolume(0);
  };
  
  // Update volume for a specific frequency in triad mode
  const handleVolumeChange = (index: number, value: number) => {
    const newVolumes = [...volumes];
    newVolumes[index] = value;
    setVolumes(newVolumes);

    // Update gain node if it exists
    if (gainNodesRef.current[index]) {
      gainNodesRef.current[index].gain.value = value;
      
      // Update active state based on volume
      const newActive = [...isActive];
      newActive[index] = value > 0;
      setIsActive(newActive);
    }
  };
  
  // Update volume for individual frequency
  const handleIndividualVolumeChange = (value: number) => {
    setIndividualVolume(value);
    
    if (individualGainNodeRef.current) {
      individualGainNodeRef.current.gain.value = value;
      setIsIndividualActive(value > 0);
    }
  };
  
  // Update volume for a custom triad frequency
  const handleCustomVolumeChange = (index: number, value: number) => {
    const newVolumes = [...customVolumes];
    newVolumes[index] = value;
    setCustomVolumes(newVolumes);
    
    if (customGainNodesRef.current[index]) {
      customGainNodesRef.current[index].gain.value = value;
      
      const newActive = [...isCustomActive];
      newActive[index] = value > 0;
      setIsCustomActive(newActive);
    }
  };
  
  // Handle triad selection
  const handleTriadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Stop previous audio before switching
    stopAllAudio();
    
    setSelectedTriad(value);
    
    // Reset volumes to default when changing triad
    setVolumes([0.5, 0.5, 0.5]);
    
    if (value !== "none") {
      // Start tones with small delay to prevent audio glitches
      setTimeout(() => {
        const frequencies = triads[value].frequencies;
        const newOscillators: OscillatorNode[] = [];
        const newGainNodes: GainNode[] = [];
        const newActive = [true, true, true];
        
        frequencies.forEach((freq, index) => {
          try {
            const { oscillator, gainNode } = createTone(freq, volumes[index]);
            
            if (oscillator && gainNode) {
              oscillator.start();
              newOscillators.push(oscillator);
              newGainNodes.push(gainNode);
            } else {
              newActive[index] = false;
              newOscillators.push(null as unknown as OscillatorNode);
              newGainNodes.push(null as unknown as GainNode);
            }
          } catch (e) {
            console.error(`Error creating tone for ${freq}Hz:`, e);
            newActive[index] = false;
            newOscillators.push(null as unknown as OscillatorNode);
            newGainNodes.push(null as unknown as GainNode);
          }
        });
        
        oscillatorsRef.current = newOscillators;
        gainNodesRef.current = newGainNodes;
        setIsActive(newActive);
      }, 300);
    }
  };
  
  // Start an individual frequency
  const startIndividualFrequency = () => {
    // Stop previous individual tone if any
    try {
      if (individualOscillatorRef.current) {
        individualOscillatorRef.current.stop();
        individualOscillatorRef.current.disconnect();
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Create new tone
    const { oscillator, gainNode } = createTone(individualFrequency, individualVolume);
    
    if (oscillator && gainNode) {
      oscillator.start();
      individualOscillatorRef.current = oscillator;
      individualGainNodeRef.current = gainNode;
      setIsIndividualActive(true);
    }
  };
  
  // Start custom triad
  const startCustomTriad = () => {
    // Stop previous custom tones if any
    try {
      customOscillatorsRef.current.forEach(osc => {
        if (osc) {
          osc.stop();
          osc.disconnect();
        }
      });
    } catch (e) {
      // Ignore errors
    }
    
    // Create new tones
    const newOscillators: OscillatorNode[] = [];
    const newGainNodes: GainNode[] = [];
    const newActive = [true, true, true];
    
    customFrequencies.forEach((freq, index) => {
      try {
        const { oscillator, gainNode } = createTone(freq, customVolumes[index]);
        
        if (oscillator && gainNode) {
          oscillator.start();
          newOscillators.push(oscillator);
          newGainNodes.push(gainNode);
        } else {
          newActive[index] = false;
          newOscillators.push(null as unknown as OscillatorNode);
          newGainNodes.push(null as unknown as GainNode);
        }
      } catch (e) {
        console.error(`Error creating custom tone for ${freq}Hz:`, e);
        newActive[index] = false;
        newOscillators.push(null as unknown as OscillatorNode);
        newGainNodes.push(null as unknown as GainNode);
      }
    });
    
    customOscillatorsRef.current = newOscillators;
    customGainNodesRef.current = newGainNodes;
    setIsCustomActive(newActive);
  };
  
  // Update a custom frequency
  const updateCustomFrequency = (index: number, frequency: number) => {
    const newFrequencies = [...customFrequencies];
    newFrequencies[index] = frequency;
    setCustomFrequencies(newFrequencies);
  };
  
  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
      stopOceanSound();
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
      }
    };
  }, []);
  
  // Render different UI based on selected mode
  const renderModeContent = () => {
    switch(mode) {
      case 'triad':
        return (
          <>
            <label className="block text-foreground opacity-70 mb-2" htmlFor="triadSelect">
              Select a Frequency Triad:
            </label>
            <select 
              id="triadSelect" 
              className="w-full p-2 rounded-md bg-background border border-foreground border-opacity-20"
              value={selectedTriad}
              onChange={handleTriadChange}
            >
              <option value="none">-- Choose a Triad --</option>
              <option value="sacredReturn">Sacred Return (417 / 528 / 963)</option>
              <option value="completionMirror">Completion Mirror (324 / 639 / 963)</option>
              <option value="innerHealing">Inner Healing (396 / 528 / 741)</option>
            </select>

            {selectedTriad !== "none" && (
              <div className="mt-4 space-y-4">
                {triads[selectedTriad].frequencies.map((freq, index) => (
                  <div key={freq} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground opacity-80">{freq} Hz</span>
                      <span className="text-foreground opacity-60 text-sm">{triads[selectedTriad].descriptions[index]}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumes[index]}
                        onChange={(e) => handleVolumeChange(index, parseFloat(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                      
                      {/* Frequency visualizer */}
                      {isActive[index] && volumes[index] > 0 && (
                        <div className="frequency-visualizer h-6">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className="frequency-bar" 
                              style={{ 
                                height: `${5 + Math.random() * 15}px`,
                                animationDuration: `${0.8 + Math.random() * 0.8}s`,
                                opacity: volumes[index]
                              }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    stopAllAudio();
                    setVolumes([0.5, 0.5, 0.5]);
                  }}
                  className="mt-4 px-4 py-2 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                           text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] 
                           transition-all duration-300 rounded-md hover:scale-105"
                >
                  Stop All Frequencies
                </button>
              </div>
            )}
          </>
        );
        
      case 'individual':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-foreground opacity-70 mb-2" htmlFor="individualFrequency">
                Select Individual Frequency:
              </label>
              <select
                id="individualFrequency"
                className="w-full p-2 rounded-md bg-background border border-foreground border-opacity-20"
                value={individualFrequency}
                onChange={(e) => setIndividualFrequency(Number(e.target.value))}
              >
                {solfeggioFrequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.value} Hz - {freq.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-foreground opacity-80">{individualFrequency} Hz</span>
                <span className="text-foreground opacity-60 text-sm">
                  {solfeggioFrequencies.find(f => f.value === individualFrequency)?.description || ''}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={individualVolume}
                  onChange={(e) => handleIndividualVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                
                {/* Frequency visualizer */}
                {isIndividualActive && individualVolume > 0 && (
                  <div className="frequency-visualizer h-6">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="frequency-bar" 
                        style={{ 
                          height: `${5 + Math.random() * 15}px`,
                          animationDuration: `${0.8 + Math.random() * 0.8}s`,
                          opacity: individualVolume
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={startIndividualFrequency}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-purple-600 to-indigo-700
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                Play Frequency
              </button>
              
              <button
                onClick={() => {
                  try {
                    if (individualOscillatorRef.current) {
                      individualOscillatorRef.current.stop();
                      individualOscillatorRef.current.disconnect();
                      individualOscillatorRef.current = null;
                      individualGainNodeRef.current = null;
                      setIsIndividualActive(false);
                    }
                  } catch (e) {
                    // Ignore errors
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-slate-700 to-slate-900
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                Stop
              </button>
            </div>
          </div>
        );
        
      case 'custom':
        return (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground opacity-80">Create Your Own Triad</h3>
            
            {customFrequencies.map((freq, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 p-2 rounded-md bg-background border border-foreground border-opacity-20"
                    value={freq}
                    onChange={(e) => updateCustomFrequency(index, Number(e.target.value))}
                  >
                    {solfeggioFrequencies.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.value} Hz - {f.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customVolumes[index]}
                    onChange={(e) => handleCustomVolumeChange(index, parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  
                  {/* Frequency visualizer */}
                  {isCustomActive[index] && customVolumes[index] > 0 && (
                    <div className="frequency-visualizer h-6">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="frequency-bar" 
                          style={{ 
                            height: `${5 + Math.random() * 15}px`,
                            animationDuration: `${0.8 + Math.random() * 0.8}s`,
                            opacity: customVolumes[index]
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <button
                onClick={startCustomTriad}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-purple-600 to-indigo-700
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                Play Custom Triad
              </button>
              
              <button
                onClick={() => {
                  try {
                    customOscillatorsRef.current.forEach(osc => {
                      if (osc) {
                        osc.stop();
                        osc.disconnect();
                      }
                    });
                    customOscillatorsRef.current = [];
                    customGainNodesRef.current = [];
                    setIsCustomActive([false, false, false]);
                  } catch (e) {
                    // Ignore errors
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-slate-700 to-slate-900
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                Stop
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-purple-500/30 w-full max-w-md mx-auto shadow-lg">
      {/* Header */}
      <h2 className="text-xl font-medium mb-4 text-white flex items-center">
        <span className="mr-2 text-purple-300 animate-[glow_4s_ease-in-out_infinite]">🎵</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-200">
          Solfeggio Frequencies
        </span>
      </h2>
      
      <p className="text-sm text-white/70 mb-4 italic">
        Sacred sound healing using precise sine wave frequencies with optional ocean sound layering.
      </p>
      
      {/* Mode selection */}
      <div className="flex mb-6 rounded-md overflow-hidden border border-purple-500/30">
        <button
          onClick={() => {
            stopAllAudio();
            setMode('triad');
          }}
          className={`flex-1 p-2 text-sm ${mode === 'triad' 
            ? 'bg-gradient-to-r from-purple-800/70 to-indigo-800/70 text-white' 
            : 'bg-black/40 text-gray-300 hover:bg-black/30'}`}
        >
          Triads
        </button>
        <button
          onClick={() => {
            stopAllAudio();
            setMode('individual');
          }}
          className={`flex-1 p-2 text-sm ${mode === 'individual'
            ? 'bg-gradient-to-r from-purple-800/70 to-indigo-800/70 text-white'
            : 'bg-black/40 text-gray-300 hover:bg-black/30'}`}
        >
          Individual
        </button>
        <button
          onClick={() => {
            stopAllAudio();
            setMode('custom');
          }}
          className={`flex-1 p-2 text-sm ${mode === 'custom'
            ? 'bg-gradient-to-r from-purple-800/70 to-indigo-800/70 text-white'
            : 'bg-black/40 text-gray-300 hover:bg-black/30'}`}
        >
          Create
        </button>
      </div>
      
      {/* Mode-specific content */}
      <div className="mb-6">
        {renderModeContent()}
      </div>
      
      {/* Ocean Sound Control */}
      <div className="mt-6 pt-4 border-t border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white">Ocean Sound Layering</h3>
          <span className="text-xs text-white/60">{Math.round(oceanVolume * 100)}%</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={oceanVolume}
            onChange={(e) => setOceanVolume(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        
        <div className="text-xs text-white/60 mt-1 italic">
          Gentle ocean current to enhance the healing experience
        </div>
      </div>
      
      {/* Master controls */}
      <div className="mt-6 pt-4 border-t border-purple-500/20 flex gap-2">
        <button
          onClick={() => {
            stopAllAudio();
            stopOceanSound();
          }}
          className="w-full px-4 py-2 bg-gradient-to-br from-slate-700 to-slate-900
                    text-white shadow-lg hover:shadow-xl transition-all
                    rounded-md"
        >
          Stop All Sounds
        </button>
      </div>

      {/* Information & Tips */}
      <div className="mt-6 pt-4 border-t border-purple-500/20 text-xs text-white/60">
        <p className="mb-1">💡 Tips for sacred listening:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>For deepest effect, use headphones</li>
          <li>Sit or lie in a relaxed position</li>
          <li>Combine frequencies to create unique healing experiences</li>
          <li>Layer in ocean sounds for a more immersive journey</li>
        </ul>
      </div>
    </div>
  );
}