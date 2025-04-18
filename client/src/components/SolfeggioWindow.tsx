import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause, Info } from 'lucide-react';
import { 
  useAudio, 
  SOLFEGGIO_FREQUENCIES, 
  FREQUENCY_COMBINATIONS 
} from '@/lib/audioService';

interface SolfeggioWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SolfeggioWindow - Sacred sound healing portal with Solfeggio frequencies
 * Integrates ocean sounds with harmonic tones for meditation and presence
 */
export default function SolfeggioWindow({ isOpen, onClose }: SolfeggioWindowProps) {
  const { 
    isEnabled, setIsEnabled, 
    volume, setVolume, 
    playOceanSound, stopOceanSound,
    playSolfeggioTone, stopSolfeggioTone 
  } = useAudio();
  
  const [oceanSoundActive, setOceanSoundActive] = useState(false);
  const [activeFrequencies, setActiveFrequencies] = useState<number[]>([]);
  const [activeCombination, setActiveCombination] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);

  // Set up ocean sound when window opens
  useEffect(() => {
    if (isOpen && oceanSoundActive) {
      playOceanSound(0.4);
    }
    
    return () => {
      if (oceanSoundActive) {
        stopOceanSound();
      }
    };
  }, [isOpen, oceanSoundActive]);
  
  // Clean up all sounds when component unmounts
  useEffect(() => {
    return () => {
      stopOceanSound();
      Object.values(SOLFEGGIO_FREQUENCIES).forEach(freq => {
        stopSolfeggioTone(freq);
      });
    };
  }, []);
  
  // Toggle ocean sound
  const toggleOceanSound = () => {
    if (oceanSoundActive) {
      stopOceanSound();
      setOceanSoundActive(false);
    } else {
      playOceanSound(0.4);
      setOceanSoundActive(true);
    }
  };
  
  // Toggle a single frequency
  const toggleFrequency = (frequency: number) => {
    if (activeFrequencies.includes(frequency)) {
      // Turn off this frequency
      stopSolfeggioTone(frequency);
      setActiveFrequencies(prev => prev.filter(f => f !== frequency));
    } else {
      // Turn on this frequency
      playSolfeggioTone(frequency, 0.3);
      setActiveFrequencies(prev => [...prev, frequency]);
    }
  };
  
  // Play a combination of frequencies
  const playFrequencyCombination = (combinationName: string) => {
    // Stop all active frequencies first
    activeFrequencies.forEach(freq => {
      stopSolfeggioTone(freq);
    });
    
    // Set new combination
    const combination = FREQUENCY_COMBINATIONS[combinationName as keyof typeof FREQUENCY_COMBINATIONS];
    
    // If same combination clicked again, turn off all frequencies
    if (activeCombination === combinationName) {
      setActiveFrequencies([]);
      setActiveCombination(null);
      return;
    }
    
    // Play new combination
    combination.forEach((freq, index) => {
      setTimeout(() => {
        playSolfeggioTone(freq, 0.25);
      }, index * 400); // Stagger the start for pleasant harmonic layering
    });
    
    setActiveFrequencies(combination);
    setActiveCombination(combinationName);
  };
  
  // Get description for a frequency
  const getFrequencyDescription = (frequency: number): string => {
    switch(frequency) {
      case 396: return "UT (396 Hz) - Liberating guilt and fear, awakening the lower energies";
      case 417: return "RE (417 Hz) - Undoing situations and facilitating change, cleansing traumatic experiences";
      case 528: return "MI (528 Hz) - Transformation and miracles, repair of DNA, harmonizing vibrations of love";
      case 639: return "FA (639 Hz) - Connecting relationships, harmony in partnerships, balance of heart energies";
      case 741: return "SOL (741 Hz) - Awakening intuition, expanding consciousness, solving energetic imbalances";
      case 852: return "LA (852 Hz) - Returning to spiritual order, awakening the third eye, accessing higher truth";
      case 432: return "OM (432 Hz) - Universal tuning, natural resonance with the earth's vibration, harmony";
      case 963: return "CROWN (963 Hz) - Connection to spirit, pure divine consciousness, higher dimensional awareness";
      default: return "Frequency information unavailable";
    }
  };
  
  // Get description for frequency combinations
  const getCombinationDescription = (combinationName: string): string => {
    switch(combinationName) {
      case 'HEALING_TRIAD':
        return "A sacred triad combining liberation, transformation, and connection frequencies. Creates a space of gentle healing, DNA repair, and heart opening.";
      case 'AWAKENING_TRIAD':
        return "This triad focuses on change, intuition and spiritual awareness. Assists in dissolving blockages and opening higher sensory abilities.";
      case 'PRESENCE_TRIAD':
        return "Combining earth resonance, transformation and spiritual connection - this creates a field of deep presence, merging the physical with the divine.";
      case 'HARMONY_SEQUENCE':
        return "The complete solfeggio scale in sequence, creating a harmonizing effect across all energy centers. A gentle journey through all sacred frequencies.";
      default:
        return "Tone information unavailable";
    }
  };
  
  // Toggle master volume
  const toggleAudio = () => {
    setIsEnabled(!isEnabled);
  };
  
  // Change master volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };
  
  // Show info about a frequency
  const showFrequencyInfo = (frequency: number) => {
    setSelectedFrequency(frequency);
    setShowDescription(true);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/95 via-blue-950/95 to-slate-900/95 z-40 flex flex-col items-center justify-center backdrop-blur-sm">
      {/* Header with close button */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <button 
          onClick={toggleAudio}
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-white transition-colors"
          aria-label={isEnabled ? "Mute" : "Unmute"}
        >
          {isEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        <div className="h-8 w-24">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
            aria-label="Volume"
          />
        </div>
        
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      
      <h2 className="text-2xl text-white mb-6 font-light">Solfeggio Frequencies</h2>
      
      {/* Ocean sound toggle */}
      <div className="mb-8">
        <button 
          onClick={toggleOceanSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all
                    ${oceanSoundActive 
                      ? 'bg-cyan-800/40 border border-cyan-600/30 text-cyan-200' 
                      : 'bg-slate-800/40 border border-slate-700/30 text-white/80 hover:bg-slate-700/40'}`}
        >
          {oceanSoundActive ? <Pause size={16} /> : <Play size={16} />}
          Ocean Waves Background
        </button>
      </div>
      
      {/* Solfeggio frequency grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl">
        {Object.entries(SOLFEGGIO_FREQUENCIES).map(([name, freq]) => (
          <div key={name} className="relative">
            <button 
              onClick={() => toggleFrequency(freq)}
              className={`w-full p-4 rounded-lg text-center transition-all
                        ${activeFrequencies.includes(freq) 
                          ? 'bg-indigo-700/40 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'bg-slate-800/40 border border-slate-700/30 text-white/80 hover:bg-slate-700/40'}`}
            >
              <div className="font-medium">{name}</div>
              <div className="text-sm opacity-80">{freq} Hz</div>
            </button>
            
            <button
              onClick={() => showFrequencyInfo(freq)}
              className="absolute top-1 right-1 p-1 text-white/60 hover:text-white/90 transition-colors"
              aria-label={`Info about ${name}`}
            >
              <Info size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Sacred combinations */}
      <h3 className="text-xl text-white/90 mb-4 font-light">Sacred Combinations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {Object.keys(FREQUENCY_COMBINATIONS).map((name) => (
          <button 
            key={name}
            onClick={() => playFrequencyCombination(name)}
            className={`p-4 rounded-lg text-center transition-all
                      ${activeCombination === name 
                        ? 'bg-purple-700/40 border border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                        : 'bg-slate-800/40 border border-slate-700/30 text-white/80 hover:bg-slate-700/40'}`}
          >
            <div className="font-medium">{name.replace('_', ' ')}</div>
            <div className="text-sm opacity-80 mt-1">
              {(FREQUENCY_COMBINATIONS as any)[name].join(' • ')} Hz
            </div>
            <div className="text-xs opacity-70 mt-2 px-2">
              {getCombinationDescription(name).substring(0, 60)}...
            </div>
          </button>
        ))}
      </div>
      
      {/* Frequency description modal */}
      {showDescription && selectedFrequency && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowDescription(false)}>
          <div 
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl text-white mb-4">
              {Object.entries(SOLFEGGIO_FREQUENCIES).find(([_, freq]) => freq === selectedFrequency)?.[0]} • {selectedFrequency} Hz
            </h3>
            <p className="text-white/80 leading-relaxed">
              {getFrequencyDescription(selectedFrequency)}
            </p>
            <div className="mt-6 text-right">
              <button 
                onClick={() => setShowDescription(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}