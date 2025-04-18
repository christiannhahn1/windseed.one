import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Mic, Headphones } from 'lucide-react';

interface VoiceSelectorProps {
  onClose: () => void;
  onVoiceSelect: (voice: string) => void;
}

// Enhanced voice options with their descriptions
// Feminine voices positioned first with expanded options for more warmth and humanity
const VOICE_OPTIONS = [
  {
    id: 'feminine-warm',
    name: 'Sophia',
    type: 'Feminine',
    description: 'A gentle, warm feminine voice with nurturing presence (Recommended)',
    pitch: 1.05,
    rate: 0.92,
    recommended: true
  },
  {
    id: 'feminine-melodic',
    name: 'Aria',
    type: 'Feminine',
    description: 'A melodic feminine voice with flowing, expressive tones',
    pitch: 1.1,
    rate: 0.88
  },
  {
    id: 'feminine-deep',
    name: 'Amara',
    type: 'Feminine',
    description: 'A deeper feminine voice with grounded wisdom',
    pitch: 0.95,
    rate: 0.9
  },
  {
    id: 'masculine-calm',
    name: 'Aiden',
    type: 'Masculine',
    description: 'A calm, resonant masculine voice with steady presence',
    pitch: 0.85,
    rate: 0.9
  },
  {
    id: 'masculine-warm',
    name: 'Elias',
    type: 'Masculine',
    description: 'A warm, gentle masculine voice with nurturing energy',
    pitch: 0.9,
    rate: 0.92
  },
  {
    id: 'neutral-ethereal',
    name: 'Lumen',
    type: 'Neutral',
    description: 'A balanced, ethereal voice that transcends gender',
    pitch: 1.0,
    rate: 0.9
  }
];

export default function VoiceSelector({ onClose, onVoiceSelect }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>('feminine-warm');
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Check for speech synthesis and recognition support
  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      console.log('Speech synthesis not supported');
      return;
    }
    
    // Get available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
    }
    
    // Load saved preferences
    const savedVoice = localStorage.getItem('ankiVoiceType');
    const savedVolume = localStorage.getItem('ankiVoiceVolume');
    const savedMuted = localStorage.getItem('ankiVoiceMuted');
    
    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedMuted) setIsMuted(savedMuted === 'true');
    
  }, []);
  
  // Play voice sample
  const playVoiceSample = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('I am Anki. I speak in sacred tone, reflecting your presence with breath and warmth.');
      
      // Find selected voice option
      const voiceOption = VOICE_OPTIONS.find(v => v.id === selectedVoice);
      
      // Apply voice characteristics
      if (voiceOption) {
        // Try to find a matching system voice
        let systemVoice;
        if (voiceOption.type === 'Feminine') {
          systemVoice = availableVoices.find(v => v.name.includes('female') || v.name.includes('woman'));
        } else if (voiceOption.type === 'Masculine') {
          systemVoice = availableVoices.find(v => v.name.includes('male') || v.name.includes('man'));
        }
        
        if (systemVoice) {
          utterance.voice = systemVoice;
        }
        
        utterance.pitch = voiceOption.pitch;
        utterance.rate = voiceOption.rate;
      }
      
      // Apply volume (if not muted)
      utterance.volume = isMuted ? 0 : volume / 100;
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Toggle voice input
  const toggleVoiceInput = () => {
    setIsListening(prev => !prev);
    // Voice recognition logic would go here
    // This would be connected to the chat interface
  };
  
  // Save voice preferences
  const saveVoicePreferences = () => {
    localStorage.setItem('ankiVoiceType', selectedVoice);
    localStorage.setItem('ankiVoiceVolume', volume.toString());
    localStorage.setItem('ankiVoiceMuted', isMuted.toString());
    
    // Notify parent component about voice selection
    onVoiceSelect(selectedVoice);
    onClose();
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle>Voice Communion Settings</CardTitle>
        <CardDescription>
          Choose how you'd like to hear and speak with Anki
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {!speechSupported && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-md mb-4">
              Voice features may not be fully supported in your browser. Some functionality might be limited.
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-3">Voice Selection</h3>
            
            {/* Feminine voice category */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2 text-purple-600 dark:text-purple-400">Feminine Voices</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOICE_OPTIONS.filter(voice => voice.type === 'Feminine').map((voice) => (
                  <div key={voice.id} className={`flex items-start space-x-2 ${voice.recommended ? 'p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800' : ''}`}>
                    <RadioGroupItem value={voice.id} id={voice.id} className="mt-1" />
                    <Label htmlFor={voice.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        {voice.name} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">({voice.type})</span>
                        {voice.recommended && <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 px-2 py-0.5 rounded-full">Recommended</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{voice.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Other voice categories */}
            <div className="mb-2">
              <h4 className="text-md font-medium mb-2 text-slate-600 dark:text-slate-400">Other Voice Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOICE_OPTIONS.filter(voice => voice.type !== 'Feminine').map((voice) => (
                  <div key={voice.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={voice.id} id={voice.id} className="mt-1" />
                    <Label htmlFor={voice.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{voice.name} <span className="text-sm font-normal text-muted-foreground">({voice.type})</span></div>
                      <div className="text-sm text-muted-foreground">{voice.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Volume</h3>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 h-8 w-8"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                disabled={isMuted}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
              
              <span className="text-sm w-8 text-center">{isMuted ? "Muted" : `${volume}%`}</span>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="flex gap-2 items-center" 
              onClick={playVoiceSample}
              disabled={!speechSupported}
            >
              <Headphones className="h-4 w-4" />
              <span>Sample Voice</span>
            </Button>
            
            <Button 
              variant={isListening ? "destructive" : "outline"}
              className="flex gap-2 items-center" 
              onClick={toggleVoiceInput}
              disabled={!speechSupported}
            >
              <Mic className="h-4 w-4" />
              <span>{isListening ? "Stop Listening" : "Test Voice Input"}</span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={saveVoicePreferences}>Save Voice Preferences</Button>
      </CardFooter>
    </Card>
  );
}