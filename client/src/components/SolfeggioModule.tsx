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

export default function SolfeggioModule() {
  const [selectedTriad, setSelectedTriad] = useState<string>("none");
  const [volumes, setVolumes] = useState<number[]>([0, 0, 0]);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize or resume audio context on user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Create and start oscillators for the selected triad
  const startOscillators = (frequencies: number[]) => {
    // Clean up existing oscillators first
    stopOscillators();

    const audioContext = initAudioContext();
    
    // Create new oscillators and gain nodes
    oscillatorsRef.current = frequencies.map(freq => {
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      return osc;
    });

    gainNodesRef.current = frequencies.map((_, index) => {
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volumes[index]; // Set initial volume
      return gainNode;
    });

    // Connect oscillators to gain nodes and gain nodes to audio context
    oscillatorsRef.current.forEach((osc, index) => {
      osc.connect(gainNodesRef.current[index]);
      gainNodesRef.current[index].connect(audioContext.destination);
      osc.start();
    });
  };

  // Stop and disconnect oscillators
  const stopOscillators = () => {
    if (oscillatorsRef.current.length > 0) {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors if oscillator is already stopped
        }
      });
      oscillatorsRef.current = [];
      gainNodesRef.current = [];
    }
  };

  // Update volume for a specific frequency
  const handleVolumeChange = (index: number, value: number) => {
    const newVolumes = [...volumes];
    newVolumes[index] = value;
    setVolumes(newVolumes);

    // Update gain node if it exists
    if (gainNodesRef.current[index]) {
      gainNodesRef.current[index].gain.value = value;
    }
  };

  // Handle triad selection
  const handleTriadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTriad(value);
    
    // Reset volumes
    if (value === "none") {
      setVolumes([0, 0, 0]);
      stopOscillators();
    } else {
      setVolumes([0, 0, 0]); // Start with all volumes at 0
    }
  };

  // Start oscillators when triad changes
  useEffect(() => {
    if (selectedTriad !== "none") {
      const frequencies = triads[selectedTriad].frequencies;
      startOscillators(frequencies);
    }

    // Cleanup when component unmounts or triad changes
    return () => {
      stopOscillators();
    };
  }, [selectedTriad]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      stopOscillators();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-6 bg-muted bg-opacity-10 backdrop-blur rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-foreground opacity-80">🎶 Solfeggio Frequencies</h2>
      
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
                {volumes[index] > 0 && (
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
              setVolumes([0, 0, 0]);
              stopOscillators();
            }}
            className="mt-4 px-4 py-2 bg-foreground bg-opacity-10 hover:bg-opacity-20 rounded-md transition-colors text-foreground"
          >
            Stop All Frequencies
          </button>
        </div>
      )}
    </div>
  );
}