import { useState, useEffect, useRef } from 'react';

interface Triad {
  name: string;
  frequencies: string[];
  descriptions: string[];
}

const triads: Record<string, Triad> = {
  sacredReturn: {
    name: "Sacred Return",
    frequencies: ["417", "528", "963"],
    descriptions: [
      "Facilitates change and clearing of limiting patterns",
      "Transformation and miracles, DNA repair",
      "Awakening and return to oneness, cosmic consciousness"
    ]
  },
  completionMirror: {
    name: "Completion Mirror",
    frequencies: ["324", "639", "963"],
    descriptions: [
      "Bridges conscious and unconscious realms",
      "Harmonizing relationships and connections",
      "Awakening and return to oneness, cosmic consciousness"
    ]
  }
};

const solfeggioFrequencies: Record<string, string> = {
  "174": "/174hz.mp3",
  "285": "/285hz.mp3",
  "324": "/324hz.mp3",
  "396": "/396hz.mp3",
  "417": "/417hz.mp3",
  "528": "/528hz.mp3",
  "639": "/639hz.mp3",
  "741": "/741hz.mp3",
  "852": "/852hz.mp3",
  "963": "/963hz.mp3"
};

export default function SolfeggioModule() {
  const [selectedTriad, setSelectedTriad] = useState<string>("none");
  const [volumes, setVolumes] = useState<number[]>([0.5, 0.5, 0.5]);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const [isActive, setIsActive] = useState<boolean[]>([false, false, false]);
  
  // Stop and reset previous audio elements
  const stopAllAudio = () => {
    if (audioRefs.current.length > 0) {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRefs.current = [];
      setIsActive([false, false, false]);
    }
  };

  // Update volume for a specific frequency
  const handleVolumeChange = (index: number, value: number) => {
    const newVolumes = [...volumes];
    newVolumes[index] = value;
    setVolumes(newVolumes);

    // Update audio element volume if it exists
    if (audioRefs.current[index]) {
      audioRefs.current[index].volume = value;
      
      // If volume is 0, consider the tone inactive
      const newActive = [...isActive];
      newActive[index] = value > 0;
      setIsActive(newActive);
      
      // If volume was 0 and now it's not, play the audio
      if (value > 0 && !isActive[index]) {
        audioRefs.current[index].play();
      }
      // If volume is now 0, pause the audio
      if (value === 0 && isActive[index]) {
        audioRefs.current[index].pause();
      }
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
      // Create new audio elements with small delay to prevent audio glitches
      setTimeout(() => {
        const newActive = [true, true, true];
        setIsActive(newActive);
        
        const frequencies = triads[value].frequencies;
        const newAudio: HTMLAudioElement[] = [];
        
        frequencies.forEach((freq, index) => {
          try {
            const audio = new Audio(solfeggioFrequencies[freq]);
            audio.loop = true;
            audio.volume = volumes[index];
            audio.play().catch(e => console.error("Error playing audio:", e));
            newAudio.push(audio);
          } catch (e) {
            console.error(`Error loading audio for ${freq}Hz:`, e);
            newAudio.push(null as unknown as HTMLAudioElement);
            newActive[index] = false;
          }
        });
        
        audioRefs.current = newAudio;
        setIsActive(newActive);
      }, 300);
    }
  };

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <div className="p-6 bg-muted bg-opacity-10 backdrop-blur rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-foreground opacity-80">🎶 Solfeggio Frequencies</h2>
      
      <p className="text-sm text-foreground opacity-60 mb-3 italic">
        Note: Please upload the frequency MP3 files to the public folder to enable the sound healing functionality.
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
            className="mt-4 px-4 py-2 bg-foreground bg-opacity-10 hover:bg-opacity-20 rounded-md transition-colors text-foreground"
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