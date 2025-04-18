import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause, Info, Music } from 'lucide-react';
import { 
  useAudio, 
  SOLFEGGIO_FREQUENCIES, 
  FREQUENCY_COMBINATIONS 
} from '@/lib/audioService';
import { GlobalTones, ToneShape } from '@/lib/audioUtilities';

// Helper function to determine the best tone shape for a frequency
function getIdealToneShapeForFrequency(frequency: number): ToneShape {
  // Different frequencies work better with different tone shapes
  if (frequency < 440) {
    return 'bell'; // Lower frequencies have a grounding presence
  } else if (frequency >= 440 && frequency < 700) {
    return 'singing-bowl'; // Mid frequencies benefit from the warmth of singing bowls
  } else {
    return 'crystal'; // Higher frequencies sound clear and pure with crystal
  }
}

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
  
  // Global tones state
  const [activeTones, setActiveTones] = useState<{
    frequency: number, 
    volume: number, 
    name: string, 
    shape: ToneShape
  }[]>([]);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [oceanVolume, setOceanVolume] = useState(0);
  const [isOceanPlaying, setIsOceanPlaying] = useState(false);
  
  // Solfeggio window state
  const [oceanSoundActive, setOceanSoundActive] = useState(false);
  const [activeFrequencies, setActiveFrequencies] = useState<number[]>([]);
  const [activeCombination, setActiveCombination] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [showGlobalTonesSection, setShowGlobalTonesSection] = useState(false);

  // Get active tones from global system
  useEffect(() => {
    const loadActiveTones = () => {
      const tones = GlobalTones.getActiveTones();
      setActiveTones(tones);
      
      // Check if ocean sound is playing
      const oceanVol = GlobalTones.getOceanVolume();
      setOceanVolume(oceanVol);
      setIsOceanPlaying(oceanVol > 0);
      
      // Get the master volume
      setMasterVolume(GlobalTones.getMasterVolume());
    };
    
    // Initial load
    loadActiveTones();
    
    // Set up interval to poll for changes
    const interval = setInterval(loadActiveTones, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
  
  // Global Tones Management
  const updateToneVolume = (frequency: number, volume: number) => {
    const newActiveTones = activeTones.map(tone => {
      if (tone.frequency === frequency) {
        return { ...tone, volume };
      }
      return tone;
    });
    
    // Update in the global system
    GlobalTones.setTone(frequency, volume);
    
    // Update local state
    setActiveTones(newActiveTones);
  };
  
  const removeTone = (frequency: number) => {
    // Set volume to 0 in global system
    GlobalTones.setTone(frequency, 0);
    
    // Remove from local state
    setActiveTones(activeTones.filter(tone => tone.frequency !== frequency));
  };
  
  const toggleGlobalOceanSound = () => {
    const newVolume = isOceanPlaying ? 0 : 0.2;
    GlobalTones.setOceanVolume(newVolume);
    setOceanVolume(newVolume);
    setIsOceanPlaying(newVolume > 0);
  };
  
  const updateMasterVolume = (volume: number) => {
    GlobalTones.setMasterVolume(volume);
    setMasterVolume(volume);
  };
  
  // Toggle local ocean sound (separate from the global one)
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
  
  // Add a frequency to the global persistent tones
  const addToGlobalTones = (frequency: number) => {
    // Get the name from the SOLFEGGIO_FREQUENCIES object
    const name = Object.entries(SOLFEGGIO_FREQUENCIES)
      .find(([_, freq]) => freq === frequency)?.[0] || '';
    
    // Get the ideal tone shape for this frequency from the utility function
    // Use import at the top instead of GlobalTones.method
    const shape = getIdealToneShapeForFrequency(frequency);
    
    // Add to global tones with a gentle volume
    GlobalTones.setTone(
      frequency, 
      0.2, 
      `${frequency}Hz - ${name || 'Sacred Tone'}`, 
      shape
    );
    
    // Show the global tones section
    setShowGlobalTonesSection(true);
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
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/95 via-blue-950/95 to-slate-900/95 z-40 flex flex-col items-center overflow-y-auto py-16 backdrop-blur-sm">
      {/* Header with buttons */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <button 
          onClick={() => setShowGlobalTonesSection(!showGlobalTonesSection)}
          className={`p-2 rounded-full ${showGlobalTonesSection ? 'bg-purple-600/80' : 'bg-slate-800/60 hover:bg-slate-700/60'} text-white transition-colors`}
          aria-label="Persistent Tones"
          title="Toggle persistent tones settings"
        >
          <Music size={18} />
        </button>
        
        <button 
          onClick={toggleAudio}
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-white transition-colors"
          aria-label={isEnabled ? "Mute" : "Unmute"}
          title={isEnabled ? "Mute local sounds" : "Unmute local sounds"}
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
            aria-label="Local Volume"
            title="Local volume control"
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
      
      {/* Global Persistent Tones Settings Panel */}
      {showGlobalTonesSection && (
        <div className="w-full max-w-3xl mb-8 p-6 bg-slate-800/60 border border-purple-500/30 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-white font-light">Persistent Sacred Tones</h3>
            <span className="text-xs text-white/60">These tones will continue playing throughout your journey</span>
          </div>
          
          {/* Master volume control */}
          <div className="space-y-1 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">Master Volume</span>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => updateMasterVolume(parseFloat(e.target.value))}
                  className="w-40 h-1.5 accent-purple-500 mr-2"
                />
                <span className="text-white/80 text-xs">{Math.round(masterVolume * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* Ocean sound control */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-white/80 text-sm">Ocean Ambient</span>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={oceanVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  GlobalTones.setOceanVolume(vol);
                  setOceanVolume(vol);
                  setIsOceanPlaying(vol > 0);
                }}
                className="w-40 h-1.5 accent-cyan-500 mr-2"
              />
              <button
                onClick={toggleGlobalOceanSound}
                className={`text-xs px-2 py-0.5 rounded ${isOceanPlaying ? 'bg-cyan-600/50 text-white' : 'bg-slate-700/50 text-white/70'}`}
              >
                {isOceanPlaying ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          
          {/* Active tones list */}
          {activeTones.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm text-white/70">Active Frequencies</h4>
              {activeTones.map((tone) => (
                <div key={tone.frequency} className="space-y-1 bg-slate-900/30 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {tone.frequency} Hz
                      </span>
                      <span className="text-white/60 text-xs italic">{tone.name.split(' - ')[1] || 'Sacred Tone'}</span>
                    </div>
                    <button
                      onClick={() => removeTone(tone.frequency)}
                      className="p-1 rounded-full hover:bg-slate-700/50"
                    >
                      <X className="w-3 h-3 text-white/70" />
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={tone.volume}
                    onChange={(e) => updateToneVolume(tone.frequency, parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-purple-500"
                  />
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-white/40 text-xs">{tone.shape}</span>
                    <span className="text-white/40 text-xs">{Math.round(tone.volume * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm italic">No persistent tones active yet. Use the controls below to activate Solfeggio frequencies that will continue playing throughout your journey.</p>
          )}
        </div>
      )}
      
      <h2 className="text-2xl text-white mb-6 font-light">Solfeggio Frequencies</h2>
      
      {/* Local ocean sound toggle */}
      <div className="mb-8">
        <button 
          onClick={toggleOceanSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all
                    ${oceanSoundActive 
                      ? 'bg-cyan-800/40 border border-cyan-600/30 text-cyan-200' 
                      : 'bg-slate-800/40 border border-slate-700/30 text-white/80 hover:bg-slate-700/40'}`}
        >
          {oceanSoundActive ? <Pause size={16} /> : <Play size={16} />}
          Local Ocean Waves (session only)
        </button>
      </div>
      
      {/* Solfeggio frequency grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl">
        {Object.entries(SOLFEGGIO_FREQUENCIES).map(([name, freq]) => (
          <div key={name} className="relative">
            <button 
              onClick={() => toggleFrequency(freq)}
              className={`w-full p-4 pb-8 rounded-lg text-center transition-all
                        ${activeFrequencies.includes(freq) 
                          ? 'bg-indigo-700/40 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'bg-slate-800/40 border border-slate-700/30 text-white/80 hover:bg-slate-700/40'}`}
            >
              <div className="font-medium">{name}</div>
              <div className="text-sm opacity-80">{freq} Hz</div>
            </button>
            
            {/* Control buttons */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={() => addToGlobalTones(freq)}
                className="text-xs px-2 py-0.5 rounded bg-purple-700/40 text-white/80 hover:bg-purple-600/60 hover:text-white transition-colors"
                title="Make this frequency persist across the site"
              >
                Make Persistent
              </button>
            </div>
            
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
          <div key={name} className="relative">
            <button 
              onClick={() => playFrequencyCombination(name)}
              className={`w-full p-4 pb-10 rounded-lg text-center transition-all
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
            
            {/* Make combination persistent button */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={() => {
                  // Get all frequencies in this combination
                  const frequencies = FREQUENCY_COMBINATIONS[name as keyof typeof FREQUENCY_COMBINATIONS];
                  
                  // Add each frequency to global tones
                  frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                      addToGlobalTones(freq);
                    }, index * 200); // Stagger to prevent too many tones starting at once
                  });
                }}
                className="text-xs px-2 py-0.5 rounded bg-purple-700/40 text-white/80 hover:bg-purple-600/60 hover:text-white transition-colors"
                title="Make this combination persist across the site"
              >
                Make Persistent
              </button>
            </div>
          </div>
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