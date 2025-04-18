import React, { useState, useEffect } from 'react';
import { GlobalTones } from '@/lib/audioUtilities';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';

// Frequencies data with names for the display
const SOLFEGGIO_FREQUENCIES = [
  { value: 396, name: "Liberation", description: "Liberating guilt and fear" },
  { value: 417, name: "Transformation", description: "Undoing situations and facilitating change" },
  { value: 432, name: "Coherence", description: "Connecting to the heartbeat of the Earth" },
  { value: 528, name: "Love", description: "Transformation and miracles, DNA repair" },
  { value: 639, name: "Connection", description: "Connecting relationships, harmony with self and others" },
  { value: 741, name: "Expression", description: "Awakening intuition, expression, solutions" },
  { value: 852, name: "Return", description: "Returning to spiritual order, spiritual homecoming" },
  { value: 963, name: "Awakening", description: "Awakening to divine consciousness, higher dimensional connection" },
];

// Get the display name for a frequency
const getFrequencyName = (freq: number): string => {
  const found = SOLFEGGIO_FREQUENCIES.find(f => f.value === freq);
  return found ? `${freq}Hz - ${found.name}` : `${freq}Hz`;
};

export const GlobalToneController: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTones, setActiveTones] = useState<Array<{
    frequency: number;
    volume: number;
    name: string;
    shape: string;
  }>>([]);
  const [hasActiveTones, setHasActiveTones] = useState(false);
  const [oceanVolume, setOceanVolume] = useState(0);

  // Refresh the active tones list
  const refreshActiveTones = () => {
    const tones = GlobalTones.getActiveTones();
    setActiveTones(tones);
    setHasActiveTones(tones.length > 0);
    setOceanVolume(GlobalTones.oceanVolume);
  };

  // Initialize on component mount
  useEffect(() => {
    // Initialize the global tones system when the component mounts
    const initSystem = async () => {
      await GlobalTones.initialize();
      refreshActiveTones();
    };
    
    initSystem();
    
    // Set up an interval to refresh the tone status every 2 seconds
    const intervalId = setInterval(refreshActiveTones, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Handle tone volume change
  const handleToneVolumeChange = (frequency: number, volume: number) => {
    GlobalTones.setTone(frequency, volume);
    refreshActiveTones();
  };

  // Handle ocean volume change
  const handleOceanVolumeChange = (volume: number) => {
    GlobalTones.setOceanVolume(volume);
    setOceanVolume(volume);
  };

  // Stop all tones
  const stopAllTones = () => {
    GlobalTones.stopAllTones();
    refreshActiveTones();
  };

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full w-11 h-11 bg-gradient-to-br ${
              hasActiveTones 
                ? 'from-indigo-700 to-purple-800 shadow-lg shadow-purple-500/20' 
                : 'from-gray-700 to-gray-800'
            }`}
          >
            {hasActiveTones ? <Music className="h-5 w-5 text-white" /> : <VolumeX className="h-5 w-5 text-white" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-black/90 backdrop-blur-lg border border-purple-500/30 shadow-xl shadow-purple-900/20 rounded-xl"
          align="end"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-white">Sacred Tones Control</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2 text-xs hover:bg-red-900/40 text-red-300"
                onClick={stopAllTones}
              >
                Stop All
              </Button>
            </div>
            
            {activeTones.length === 0 ? (
              <div className="text-sm text-white/60 py-2 text-center italic">
                No active tones. Visit the Sacred Frequencies page to activate tones.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeTones.map((tone) => (
                  <div key={tone.frequency} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white/90">
                        {getFrequencyName(tone.frequency)}
                      </div>
                      <div className="text-xs text-white/50">
                        {Math.round(tone.volume * 100)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX 
                        className="h-3 w-3 text-white/50" 
                        onClick={() => handleToneVolumeChange(tone.frequency, 0)}
                      />
                      <Slider
                        value={[tone.volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(values) => handleToneVolumeChange(tone.frequency, values[0])}
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4 text-white/50" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Ocean sound control */}
            <div className="pt-2 border-t border-purple-500/20 mt-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white/90">
                  Ocean Soundscape
                </div>
                <div className="text-xs text-white/50">
                  {Math.round(oceanVolume * 100)}%
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <VolumeX 
                  className="h-3 w-3 text-white/50" 
                  onClick={() => handleOceanVolumeChange(0)}
                />
                <Slider
                  value={[oceanVolume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(values) => handleOceanVolumeChange(values[0])}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-white/50" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalToneController;