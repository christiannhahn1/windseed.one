import { useState, useEffect, useRef } from 'react';

interface Triad {
  name: string;
  frequencies: number[];
  descriptions: string[];
}

const triads: Record<string, Triad> = {
  sacredReturn: {
    name: "Sacred Return",
    frequencies: [417, 528, 963],
    descriptions: [
      "Facilitates change and clearing of limiting patterns",
      "Transformation and miracles, DNA repair",
      "Awakening and return to oneness, cosmic consciousness"
    ]
  },
  completionMirror: {
    name: "Completion Mirror",
    frequencies: [324, 639, 963],
    descriptions: [
      "Bridges conscious and unconscious realms",
      "Harmonizing relationships and connections",
      "Awakening and return to oneness, cosmic consciousness"
    ]
  }
};

// Additional known Solfeggio frequencies for future expansion
const allSolfeggioFrequencies: number[] = [
  174, 285, 324, 396, 417, 528, 639, 741, 852, 963
];

export default function SolfeggioModule() {
  const [selectedTriad, setSelectedTriad] = useState<string>("none");
  const [volumes, setVolumes] = useState<number[]>([0.5, 0.5, 0.5]);
  const [isActive, setIsActive] = useState<boolean[]>([false, false, false]);
  
  // Web Audio API references
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  
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
  
  // Stop and reset all oscillators
  const stopAllAudio = () => {
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
    
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    setIsActive([false, false, false]);
  };

  // Update volume for a specific frequency
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

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
      }
    };
  }, []);

  return (
    <div className="p-6 bg-muted bg-opacity-10 backdrop-blur rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-foreground opacity-80">🎶 Solfeggio Frequencies</h2>
      
      <p className="text-sm text-foreground opacity-60 mb-3 italic">
        Sound is generated using sine waves at the exact Solfeggio frequencies for harmonic resonance.
      </p>
      
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
                     transition-all duration-300 rounded-md hover:scale-105
                     animate-[breathe_8s_ease-in-out_infinite]"
          >
            Stop All Frequencies
          </button>
        </div>
      )}
      
      {/* Mirrorwell Portal */}
      <div className="mt-8 pt-6 border-t border-foreground border-opacity-10">
        <h2 className="text-xl font-semibold mb-4 text-foreground opacity-80">🪞 Mirrorwell Portal</h2>
        <p className="text-foreground opacity-70 mb-2">Offer or receive in resonance:</p>
        <ul className="list-disc pl-5 space-y-2 text-foreground opacity-80">
          <li>
            <a 
              href="https://ko-fi.com/fieldisopen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              Ko-fi Portal
            </a>
          </li>
          <li>
            <span>Phantom Wallet: </span>
            <code className="bg-background bg-opacity-50 px-2 py-1 rounded text-sm">
              6U4FuEP1MbvxyQSEffoDWUAcENQ1SLnsYgyyA8MJJ4oX
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}