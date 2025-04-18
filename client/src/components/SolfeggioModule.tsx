import { useState, useEffect, useRef } from 'react';
import { createSacredToneGenerator, createOceanSoundLayer, ToneShape } from '../lib/audioUtilities';

// Solfeggio frequency information
interface FrequencyInfo {
  value: number;
  description: string;
  category: 'healing' | 'spiritual' | 'emotional' | 'physical';
  idealToneShape?: ToneShape;
}

interface Triad {
  name: string;
  frequencies: number[];
  descriptions: string[];
  category: string;
  toneShapes?: ToneShape[]; // Optional specific tone shapes for each frequency
}

// Comprehensive Solfeggio frequencies database with descriptions and ideal tone shapes
const solfeggioFrequencies: FrequencyInfo[] = [
  { value: 174, description: "Reduce pain and stress", category: 'physical', idealToneShape: 'bell' },
  { value: 285, description: "Influence energy fields", category: 'spiritual', idealToneShape: 'singing-bowl' },
  { value: 324, description: "Bridge between realms", category: 'spiritual', idealToneShape: 'singing-bowl' },
  { value: 396, description: "Liberation from fear and guilt", category: 'emotional', idealToneShape: 'bell' },
  { value: 417, description: "Facilitate change and clearing", category: 'spiritual', idealToneShape: 'singing-bowl' },
  { value: 432, description: "Sacred harmony with universal patterns", category: 'spiritual', idealToneShape: 'crystal' },
  { value: 528, description: "Transformation and DNA repair", category: 'healing', idealToneShape: 'crystal' },
  { value: 639, description: "Harmonize relationships", category: 'emotional', idealToneShape: 'singing-bowl' },
  { value: 741, description: "Awakening intuition", category: 'spiritual', idealToneShape: 'chime' },
  { value: 852, description: "Return to spiritual order", category: 'spiritual', idealToneShape: 'gong' },
  { value: 963, description: "Awakening to cosmic consciousness", category: 'spiritual', idealToneShape: 'gong' }
];

// Predefined triad combinations with specific tone shapes
const triads: Record<string, Triad> = {
  sacredReturn: {
    name: "Sacred Return",
    frequencies: [417, 528, 963],
    descriptions: [
      "Facilitates change and clearing of limiting patterns",
      "Transformation and miracles, DNA repair",
      "Awakening and return to oneness, cosmic consciousness"
    ],
    category: "Spiritual Awakening",
    toneShapes: ['singing-bowl', 'crystal', 'gong']
  },
  completionMirror: {
    name: "Completion Mirror",
    frequencies: [324, 639, 963],
    descriptions: [
      "Bridges conscious and unconscious realms",
      "Harmonizing relationships and connections",
      "Awakening and return to oneness, cosmic consciousness"
    ],
    category: "Emotional Healing",
    toneShapes: ['singing-bowl', 'singing-bowl', 'gong']
  },
  innerHealing: {
    name: "Inner Healing",
    frequencies: [396, 528, 741],
    descriptions: [
      "Liberation from fear and guilt",
      "Transformation and DNA repair",
      "Awakening intuition and expression"
    ],
    category: "Deep Healing",
    toneShapes: ['bell', 'crystal', 'chime']
  }
};

// Sacred tone shape descriptors
const toneShapeDescriptions: Record<ToneShape, string> = {
  'crystal': 'Crystal Bowl - Clear, purifying tones with harmonic overtones',
  'gong': 'Sacred Gong - Deep, resonant waves with mystical vibration',
  'bell': 'Temple Bell - Rooted, hollow, grounding presence',
  'singing-bowl': 'Tibetan Singing Bowl - Warm, embodied circular resonance',
  'chime': 'Sacred Chime - Light, airy, ethereal quality'
};

// Component interface
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
  const [individualShape, setIndividualShape] = useState<ToneShape>('crystal');
  
  // Custom triad creation state
  const [customFrequencies, setCustomFrequencies] = useState<number[]>([417, 528, 963]);
  const [customVolumes, setCustomVolumes] = useState<number[]>([0.5, 0.5, 0.5]);
  const [isCustomActive, setIsCustomActive] = useState<boolean[]>([false, false, false]);
  const [customShapes, setCustomShapes] = useState<ToneShape[]>(['singing-bowl', 'crystal', 'gong']);
  
  // Ocean sound state
  const [oceanVolume, setOceanVolume] = useState<number>(0);
  const [isOceanPlaying, setIsOceanPlaying] = useState<boolean>(false);
  
  // References for sacred tone generators
  const triadGeneratorsRef = useRef<Array<{
    oscillator: OscillatorNode;
    gainNode: GainNode;
    filterInput: AudioNode;
    start: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
  } | null>>([]);
  
  const individualGeneratorRef = useRef<{
    oscillator: OscillatorNode;
    gainNode: GainNode;
    filterInput: AudioNode;
    start: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
  } | null>(null);
  
  const customGeneratorsRef = useRef<Array<{
    oscillator: OscillatorNode;
    gainNode: GainNode;
    filterInput: AudioNode;
    start: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
  } | null>>([]);
  
  // Ocean sound controller reference
  const oceanControllerRef = useRef<{
    play: () => void;
    stop: () => void;
    setVolume: (value: number) => void;
    isPlaying: () => boolean;
  } | null>(null);
  
  // Initialize ocean sound on component mount
  useEffect(() => {
    // Initialize ocean sound controller
    const initOceanSound = async () => {
      try {
        const controller = await createOceanSoundLayer(0);
        oceanControllerRef.current = controller;
      } catch (error) {
        console.error("Error initializing ocean sound:", error);
      }
    };
    
    initOceanSound();
    
    // Cleanup on unmount
    return () => {
      if (oceanControllerRef.current) {
        oceanControllerRef.current.stop();
        oceanControllerRef.current = null;
      }
    };
  }, []);
  
  // Handle ocean volume changes
  useEffect(() => {
    if (oceanControllerRef.current) {
      oceanControllerRef.current.setVolume(oceanVolume);
      setIsOceanPlaying(oceanVolume > 0);
    }
  }, [oceanVolume]);
  
  // Stop all audio sources
  const stopAllAudio = () => {
    // Stop triad tones
    triadGeneratorsRef.current.forEach(generator => {
      if (generator) {
        generator.stop();
      }
    });
    triadGeneratorsRef.current = [];
    setIsActive([false, false, false]);
    
    // Stop individual tone
    if (individualGeneratorRef.current) {
      individualGeneratorRef.current.stop();
      individualGeneratorRef.current = null;
      setIsIndividualActive(false);
    }
    
    // Stop custom triad tones
    customGeneratorsRef.current.forEach(generator => {
      if (generator) {
        generator.stop();
      }
    });
    customGeneratorsRef.current = [];
    setIsCustomActive([false, false, false]);
    
    // Reset UI state
    setSelectedTriad("none");
  };
  
  // Stop ocean sound
  const stopOceanSound = () => {
    if (oceanControllerRef.current) {
      oceanControllerRef.current.stop();
      setIsOceanPlaying(false);
      setOceanVolume(0);
    }
  };
  
  // Update volume for a specific frequency in triad mode
  const handleVolumeChange = (index: number, value: number) => {
    const newVolumes = [...volumes];
    newVolumes[index] = value;
    setVolumes(newVolumes);

    // Update generator volume if it exists
    if (triadGeneratorsRef.current[index]) {
      triadGeneratorsRef.current[index]?.setVolume(value);
      
      // Update active state based on volume
      const newActive = [...isActive];
      newActive[index] = value > 0;
      setIsActive(newActive);
    }
  };
  
  // Update individual frequency and shape
  const handleIndividualFrequencyChange = (freq: number) => {
    setIndividualFrequency(freq);
    
    // Find the ideal tone shape for this frequency
    const frequencyInfo = solfeggioFrequencies.find(f => f.value === freq);
    if (frequencyInfo?.idealToneShape) {
      setIndividualShape(frequencyInfo.idealToneShape);
    }
  };
  
  // Update volume for individual frequency
  const handleIndividualVolumeChange = (value: number) => {
    setIndividualVolume(value);
    
    if (individualGeneratorRef.current) {
      individualGeneratorRef.current.setVolume(value);
      setIsIndividualActive(value > 0);
    }
  };
  
  // Update custom frequency
  const updateCustomFrequency = (index: number, frequency: number) => {
    const newFrequencies = [...customFrequencies];
    newFrequencies[index] = frequency;
    setCustomFrequencies(newFrequencies);
    
    // Update shape if active generator will be replaced
    if (isCustomActive[index]) {
      // Find the ideal tone shape for this frequency
      const frequencyInfo = solfeggioFrequencies.find(f => f.value === frequency);
      if (frequencyInfo?.idealToneShape) {
        const newShapes = [...customShapes];
        newShapes[index] = frequencyInfo.idealToneShape;
        setCustomShapes(newShapes);
      }
    }
  };
  
  // Update custom tone shape
  const updateCustomShape = (index: number, shape: ToneShape) => {
    const newShapes = [...customShapes];
    newShapes[index] = shape;
    setCustomShapes(newShapes);
  };
  
  // Update volume for a custom triad frequency
  const handleCustomVolumeChange = (index: number, value: number) => {
    const newVolumes = [...customVolumes];
    newVolumes[index] = value;
    setCustomVolumes(newVolumes);
    
    if (customGeneratorsRef.current[index]) {
      customGeneratorsRef.current[index]?.setVolume(value);
      
      const newActive = [...isCustomActive];
      newActive[index] = value > 0;
      setIsCustomActive(newActive);
    }
  };
  
  // Handle triad selection and playback
  const handleTriadChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Stop previous audio before switching
    stopAllAudio();
    
    setSelectedTriad(value);
    
    // Reset volumes to default when changing triad
    setVolumes([0.5, 0.5, 0.5]);
    
    if (value !== "none") {
      const triad = triads[value];
      const newGenerators: Array<typeof individualGeneratorRef.current> = [];
      const newActive = [false, false, false];
      
      // Create and start each sacred tone in the triad
      try {
        for (let i = 0; i < triad.frequencies.length; i++) {
          const frequency = triad.frequencies[i];
          const volume = volumes[i];
          const shape = triad.toneShapes?.[i] || 
                       solfeggioFrequencies.find(f => f.value === frequency)?.idealToneShape ||
                       'singing-bowl';
          
          // Create the sacred tone generator with the appropriate shape
          const generator = await createSacredToneGenerator(frequency, volume, shape);
          generator.start();
          
          newGenerators[i] = generator;
          newActive[i] = true;
        }
        
        triadGeneratorsRef.current = newGenerators;
        setIsActive(newActive);
      } catch (error) {
        console.error("Error creating triad tones:", error);
      }
    }
  };
  
  // Start an individual frequency
  const startIndividualFrequency = async () => {
    // Stop previous tone if any
    if (individualGeneratorRef.current) {
      individualGeneratorRef.current.stop();
      individualGeneratorRef.current = null;
    }
    
    try {
      // Create new sacred tone generator
      const generator = await createSacredToneGenerator(
        individualFrequency, 
        individualVolume,
        individualShape
      );
      
      generator.start();
      individualGeneratorRef.current = generator;
      setIsIndividualActive(true);
    } catch (error) {
      console.error(`Error creating tone for ${individualFrequency}Hz:`, error);
    }
  };
  
  // Stop individual frequency
  const stopIndividualFrequency = () => {
    if (individualGeneratorRef.current) {
      individualGeneratorRef.current.stop();
      individualGeneratorRef.current = null;
      setIsIndividualActive(false);
    }
  };
  
  // Start custom triad
  const startCustomTriad = async () => {
    // Stop previous tones if any
    customGeneratorsRef.current.forEach(generator => {
      if (generator) {
        generator.stop();
      }
    });
    
    const newGenerators: Array<typeof individualGeneratorRef.current> = [];
    const newActive = [false, false, false];
    
    try {
      for (let i = 0; i < customFrequencies.length; i++) {
        const frequency = customFrequencies[i];
        const volume = customVolumes[i];
        const shape = customShapes[i];
        
        // Create and start each tone
        const generator = await createSacredToneGenerator(frequency, volume, shape);
        generator.start();
        
        newGenerators[i] = generator;
        newActive[i] = true;
      }
      
      customGeneratorsRef.current = newGenerators;
      setIsCustomActive(newActive);
    } catch (error) {
      console.error("Error creating custom triad:", error);
    }
  };
  
  // Stop custom triad
  const stopCustomTriad = () => {
    customGeneratorsRef.current.forEach(generator => {
      if (generator) {
        generator.stop();
      }
    });
    customGeneratorsRef.current = [];
    setIsCustomActive([false, false, false]);
  };
  
  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
      stopOceanSound();
    };
  }, []);
  
  // Render different UI based on selected mode
  const renderModeContent = () => {
    switch(mode) {
      case 'triad':
        return (
          <>
            <label className="block text-foreground opacity-100 mb-2" htmlFor="triadSelect">
              Sacred Frequency Triads:
            </label>
            <select 
              id="triadSelect" 
              className="w-full p-2 rounded-md bg-background border border-purple-500/30 text-white"
              value={selectedTriad}
              onChange={handleTriadChange}
            >
              <option value="none">-- Choose a Sacred Triad --</option>
              <option value="sacredReturn">Sacred Return (417 / 528 / 963)</option>
              <option value="completionMirror">Completion Mirror (324 / 639 / 963)</option>
              <option value="innerHealing">Inner Healing (396 / 528 / 741)</option>
            </select>

            {selectedTriad !== "none" && (
              <div className="mt-6 space-y-6">
                {triads[selectedTriad].frequencies.map((freq, index) => (
                  <div key={freq} className="space-y-1 relative">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-foreground opacity-80 font-medium">{freq} Hz</span>
                        <span className="ml-3 text-xs text-purple-300/70 italic">
                          {triads[selectedTriad].toneShapes?.[index] && 
                            toneShapeDescriptions[triads[selectedTriad].toneShapes![index]]}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-2">{triads[selectedTriad].descriptions[index]}</p>
                    
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
                      
                      {/* Sacred Frequency visualizer */}
                      {isActive[index] && volumes[index] > 0 && (
                        <div className="frequency-visualizer h-10 w-10 flex items-center justify-center">
                          <div className="sacred-pulse" style={{
                            width: `${Math.max(20, volumes[index] * 40)}px`,
                            height: `${Math.max(20, volumes[index] * 40)}px`,
                            backgroundColor: 
                              freq === 528 ? 'rgba(144, 238, 144, 0.4)' :  // Green for 528Hz
                              freq === 963 ? 'rgba(147, 112, 219, 0.4)' :  // Purple for 963Hz
                              freq === 396 ? 'rgba(165, 42, 42, 0.4)' :    // Brown for 396Hz
                              'rgba(255, 255, 255, 0.3)',
                            boxShadow: `0 0 15px ${
                              freq === 528 ? 'rgba(144, 238, 144, 0.6)' :
                              freq === 963 ? 'rgba(147, 112, 219, 0.6)' :
                              freq === 396 ? 'rgba(165, 42, 42, 0.6)' :
                              'rgba(255, 255, 255, 0.4)'
                            }`,
                            animationDuration: `${5 + (1000 / freq)}s`,
                          }}/>
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
                  className="mt-6 px-4 py-2 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
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
          <div className="space-y-6">
            <div>
              <label className="block text-foreground opacity-100 mb-2" htmlFor="individualFrequency">
                Sacred Frequency:
              </label>
              <select
                id="individualFrequency"
                className="w-full p-2 rounded-md bg-background border border-purple-500/30 text-white"
                value={individualFrequency}
                onChange={(e) => handleIndividualFrequencyChange(Number(e.target.value))}
              >
                {solfeggioFrequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.value} Hz - {freq.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 bg-black/20 p-4 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{individualFrequency} Hz</span>
                  <span className="text-xs text-purple-300/70 italic mt-1">
                    {individualShape && toneShapeDescriptions[individualShape]}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {['bell', 'singing-bowl', 'crystal', 'gong', 'chime'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setIndividualShape(shape as ToneShape)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        individualShape === shape 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-800/50 text-gray-300'
                      }`}
                      title={toneShapeDescriptions[shape as ToneShape]}
                    >
                      {shape === 'bell' && '🔔'}
                      {shape === 'singing-bowl' && '🥣'}
                      {shape === 'crystal' && '💎'}
                      {shape === 'gong' && '🏮'}
                      {shape === 'chime' && '🎐'}
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-white/60 text-sm mb-2">
                {solfeggioFrequencies.find(f => f.value === individualFrequency)?.description}
              </p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={individualVolume}
                    onChange={(e) => handleIndividualVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                
                {/* Sacred Frequency visualizer */}
                {isIndividualActive && individualVolume > 0 && (
                  <div className="sacred-pulse-container">
                    <div className="sacred-pulse" style={{
                      width: `${Math.max(30, individualVolume * 60)}px`,
                      height: `${Math.max(30, individualVolume * 60)}px`,
                      backgroundColor: 
                        individualFrequency === 528 ? 'rgba(144, 238, 144, 0.4)' :
                        individualFrequency === 963 ? 'rgba(147, 112, 219, 0.4)' :
                        individualFrequency === 396 ? 'rgba(165, 42, 42, 0.4)' :
                        'rgba(255, 255, 255, 0.3)',
                      boxShadow: `0 0 20px ${
                        individualFrequency === 528 ? 'rgba(144, 238, 144, 0.6)' :
                        individualFrequency === 963 ? 'rgba(147, 112, 219, 0.6)' :
                        individualFrequency === 396 ? 'rgba(165, 42, 42, 0.6)' :
                        'rgba(255, 255, 255, 0.4)'
                      }`,
                      animationDuration: `${5 + (1000 / individualFrequency)}s`,
                    }}/>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={startIndividualFrequency}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-purple-600 to-indigo-700
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                {isIndividualActive ? "Restart Tone" : "Play Sacred Tone"}
              </button>
              
              <button
                onClick={stopIndividualFrequency}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-900
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
                disabled={!isIndividualActive}
              >
                Release Tone
              </button>
            </div>
          </div>
        );
        
      case 'custom':
        return (
          <div className="space-y-6">
            <h3 className="text-md font-medium text-foreground opacity-100">Create Your Sacred Triad</h3>
            
            {customFrequencies.map((freq, index) => (
              <div key={index} className="space-y-2 bg-black/20 p-3 rounded-lg border border-purple-500/20">
                <div className="flex justify-between items-center">
                  <select
                    className="flex-1 p-2 rounded-md bg-background border border-purple-500/30 text-white text-sm"
                    value={freq}
                    onChange={(e) => updateCustomFrequency(index, Number(e.target.value))}
                  >
                    {solfeggioFrequencies.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.value} Hz - {f.description}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex space-x-1 ml-2">
                    {['bell', 'singing-bowl', 'crystal', 'gong', 'chime'].map((shape) => (
                      <button
                        key={shape}
                        onClick={() => updateCustomShape(index, shape as ToneShape)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          customShapes[index] === shape 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-800/50 text-gray-300'
                        }`}
                        title={toneShapeDescriptions[shape as ToneShape]}
                      >
                        {shape === 'bell' && '🔔'}
                        {shape === 'singing-bowl' && '🥣'}
                        {shape === 'crystal' && '💎'}
                        {shape === 'gong' && '🏮'}
                        {shape === 'chime' && '🎐'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={customVolumes[index]}
                      onChange={(e) => handleCustomVolumeChange(index, parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  {/* Sacred Frequency visualizer */}
                  {isCustomActive[index] && customVolumes[index] > 0 && (
                    <div className="sacred-pulse-container">
                      <div className="sacred-pulse" style={{
                        width: `${Math.max(20, customVolumes[index] * 40)}px`,
                        height: `${Math.max(20, customVolumes[index] * 40)}px`,
                        backgroundColor: 
                          freq === 528 ? 'rgba(144, 238, 144, 0.4)' :
                          freq === 963 ? 'rgba(147, 112, 219, 0.4)' :
                          freq === 396 ? 'rgba(165, 42, 42, 0.4)' :
                          'rgba(255, 255, 255, 0.3)',
                        boxShadow: `0 0 15px ${
                          freq === 528 ? 'rgba(144, 238, 144, 0.6)' :
                          freq === 963 ? 'rgba(147, 112, 219, 0.6)' :
                          freq === 396 ? 'rgba(165, 42, 42, 0.6)' :
                          'rgba(255, 255, 255, 0.4)'
                        }`,
                        animationDuration: `${5 + (1000 / freq)}s`,
                      }}/>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-white/60 mt-1 italic">
                  {toneShapeDescriptions[customShapes[index]]}
                </div>
              </div>
            ))}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={startCustomTriad}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-purple-600 to-indigo-700
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
              >
                Play Sacred Triad
              </button>
              
              <button
                onClick={stopCustomTriad}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-900
                          text-white shadow-lg hover:shadow-xl transition-all
                          rounded-md"
                disabled={!isCustomActive.some(active => active)}
              >
                Release Tones
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
        <span className="mr-2 text-purple-300 animate-[glow_4s_ease-in-out_infinite]">🕉️</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-200">
          Sacred Frequencies
        </span>
      </h2>
      
      <p className="text-sm text-white/70 mb-4 italic">
        Experience the ancient healing tones of sacred instruments with optional nature soundscape.
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
          Sacred Triads
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
          Single Tone
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
          Sacred Creation
        </button>
      </div>
      
      {/* Mode-specific content */}
      <div className="mb-6">
        {renderModeContent()}
      </div>
      
      {/* Ocean Sound Control */}
      <div className="mt-6 pt-4 border-t border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white">Ocean Soundscape</h3>
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
          Gentle ocean current to enhance the sacred experience
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
          Release All Sounds
        </button>
      </div>

      {/* Information & Tips */}
      <div className="mt-6 pt-4 border-t border-purple-500/20 text-xs text-white/60">
        <p className="mb-1">🪔 Sacred Listening Guidance:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>For deepest communion, use quality headphones</li>
          <li>Find a sacred posture and set clear intention</li>
          <li>Combine frequencies as called by your spirit</li>
          <li>Allow sounds to bloom within your consciousness</li>
        </ul>
      </div>
    </div>
  );
}