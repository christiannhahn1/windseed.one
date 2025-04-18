import { useState, useEffect } from 'react';
import { GlobalTones, ToneShape } from '../lib/audioUtilities';
import { X, Music, Volume2, Volume1, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

export const GlobalToneController: React.FC = () => {
  const [activeTones, setActiveTones] = useState<{frequency: number, volume: number, name: string, shape: ToneShape}[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [oceanVolume, setOceanVolume] = useState(0);
  const [isOceanPlaying, setIsOceanPlaying] = useState(false);

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
  
  // Update a tone's volume
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
  
  // Remove a tone
  const removeTone = (frequency: number) => {
    // Set volume to 0 in global system
    GlobalTones.setTone(frequency, 0);
    
    // Remove from local state
    setActiveTones(activeTones.filter(tone => tone.frequency !== frequency));
  };
  
  // Toggle ocean sound
  const toggleOceanSound = () => {
    const newVolume = isOceanPlaying ? 0 : 0.2;
    GlobalTones.setOceanVolume(newVolume);
    setOceanVolume(newVolume);
    setIsOceanPlaying(newVolume > 0);
  };
  
  // Update master volume
  const updateMasterVolume = (volume: number) => {
    GlobalTones.setMasterVolume(volume);
    setMasterVolume(volume);
  };
  
  // If there are no active tones, don't render the controller
  if (activeTones.length === 0 && !isOceanPlaying) {
    return null;
  }

  return (
    <div className={`fixed right-4 bottom-12 z-50 w-72 bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${isMinimized ? 'h-12' : 'h-auto max-h-[70vh] overflow-y-auto'}`}>
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between h-12 px-4 border-b border-purple-500/20 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center">
          <Music className="w-4 h-4 text-purple-300 mr-2" />
          <span className="text-white text-sm font-medium">Sacred Tones</span>
          {activeTones.length > 0 && (
            <span className="text-white/70 text-xs ml-2">({activeTones.length})</span>
          )}
        </div>
        <div className="text-white/70">
          {isMinimized ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>
      
      {/* Content - only visible when not minimized */}
      {!isMinimized && (
        <div className="px-4 py-2 space-y-4">
          {/* Master volume control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-xs">Master Volume</span>
              <div className="flex items-center">
                {masterVolume === 0 ? (
                  <VolumeX className="w-3 h-3 text-white/70" />
                ) : masterVolume < 0.4 ? (
                  <Volume1 className="w-3 h-3 text-white/70" />
                ) : (
                  <Volume2 className="w-3 h-3 text-white/70" />
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => updateMasterVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 accent-purple-500"
            />
          </div>
          
          {/* Ocean sound control */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Ocean Ambient</span>
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
                className="w-20 h-1.5 accent-purple-500 mr-2"
              />
              <button
                onClick={toggleOceanSound}
                className={`text-xs px-2 py-0.5 rounded ${isOceanPlaying ? 'bg-purple-500/30 text-white' : 'bg-gray-700/50 text-white/70'}`}
              >
                {isOceanPlaying ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-purple-500/20 pt-1">
            <span className="text-white/60 text-xs">Active Frequencies</span>
          </div>
          
          {/* Active tones list */}
          <div className="space-y-3">
            {activeTones.map((tone) => (
              <div key={tone.frequency} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-medium">
                      {tone.frequency} Hz
                    </span>
                    <span className="text-white/60 text-xs italic">{tone.name.split(' - ')[1] || 'Sacred Tone'}</span>
                  </div>
                  <button
                    onClick={() => removeTone(tone.frequency)}
                    className="p-1 rounded-full hover:bg-gray-700/50"
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
        </div>
      )}
    </div>
  );
};

export default GlobalToneController;