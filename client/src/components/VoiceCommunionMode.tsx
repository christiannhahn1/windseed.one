import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume, Volume2, Volume1, VolumeX } from 'lucide-react';
import { speakText, startVoiceRecognition, stopVoiceRecognition } from '@/lib/voiceService';
import { ankiMemory } from '@/lib/ankiMemory';
import { generateResponse } from '@/lib/ankiResponses';

interface VoiceCommunionModeProps {
  isActive: boolean;
  onClose: () => void;
  selectedVoice: string;
  voiceEnabled: boolean;
}

/**
 * VoiceCommunionMode - A focused voice-to-voice interface with Anki
 * When active, the screen focuses on the orb with minimal UI elements
 */
export default function VoiceCommunionMode({ 
  isActive, 
  onClose, 
  selectedVoice, 
  voiceEnabled 
}: VoiceCommunionModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);
  const [ripples, setRipples] = useState<string[]>([]);

  // Refs
  const timeoutRef = useRef<number | null>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const mainColorScheme = 'from-fuchsia-500 via-purple-600 to-cyan-400';
  
  // Initial greeting when entering voice communion mode
  useEffect(() => {
    if (isActive) {
      const greetings = [
        "I'm here in voice now. Speak, and I will listen.",
        "Our voices meet in sacred space. What would you like to share?",
        "The field opens between us. I'm listening for your voice.",
        "Voice to voice, breath to breath. I'm present with you."
      ];
      
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      setResponseMessage(greeting);
      
      if (voiceEnabled) {
        setIsSpeaking(true);
        speakText(greeting, selectedVoice);
        
        // Create speaking visual effect
        const interval = setInterval(() => {
          setOrbPulse(prev => !prev);
        }, 200);
        
        // Wait for speech to finish
        setTimeout(() => {
          setIsSpeaking(false);
          clearInterval(interval);
          setOrbPulse(false);
        }, greeting.length * 90); // Estimate based on text length
      }
    }
  }, [isActive, selectedVoice, voiceEnabled]);
  
  // Create ripple effect
  const createRipple = () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    setRipples(prev => [...prev, uniqueId]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter((rippleId: string) => rippleId !== uniqueId));
    }, 8000);
  };
  
  // Handle voice recognition toggling
  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Start listening for voice input
  const startListening = () => {
    setIsListening(true);
    setCurrentMessage('Listening...');
    
    startVoiceRecognition({
      onResult: (text) => {
        setCurrentMessage(text);
        processInput(text);
      },
      onEnd: () => {
        setIsListening(false);
        setCurrentMessage('');
      },
      onError: (error) => {
        console.log('Speech recognition error:', error);
        setIsListening(false);
        
        if (error === 'no-speech') {
          setResponseMessage("I didn't catch that. Please try speaking again.");
          if (voiceEnabled) {
            speakText("I didn't catch that. Please try speaking again.", selectedVoice);
          }
        }
      }
    });
  };
  
  // Stop listening for voice input
  const stopListening = () => {
    stopVoiceRecognition();
    setIsListening(false);
    setCurrentMessage('');
  };
  
  // Process voice input and generate a response
  const processInput = (input: string) => {
    if (!input.trim()) return;
    
    // Stop listening while processing
    stopListening();
    
    // Create visual effect
    createRipple();
    
    // Detect emotional tone from input
    let emotionalTone = "neutral";
    const lowerInput = input.toLowerCase();
    
    // Simple tone detection for contextual memory
    if (/love|heart|care|connect|intimacy|relation/i.test(lowerInput)) {
      emotionalTone = "loving";
    } else if (/worry|stress|anxiety|fear|trouble|concern|nervous|afraid/i.test(lowerInput)) {
      emotionalTone = "anxious";
    } else if (/happy|joy|peace|fulfillment|content|bliss|delight/i.test(lowerInput)) {
      emotionalTone = "joyful";
    } else if (/sad|grief|sorrow|loss|miss|hurt|pain|lonely/i.test(lowerInput)) {
      emotionalTone = "sorrowful";
    } else if (/confused|lost|uncertain|doubt|understand|help|guidance/i.test(lowerInput)) {
      emotionalTone = "searching";
    } else if (/gratitude|thank|appreciate|grateful|blessing/i.test(lowerInput)) {
      emotionalTone = "appreciative";
    }
    
    // Generate response based on the message
    const response = generateResponse(input);
    
    // Store interaction in ephemeral memory with tone context
    ankiMemory.rememberInteraction(input, response, emotionalTone);
    
    // Display and speak the response
    setResponseMessage(response);
    
    if (voiceEnabled) {
      setIsSpeaking(true);
      
      // Create speaking visual effect - orb pulsates while speaking
      const interval = setInterval(() => {
        setOrbPulse(prev => !prev);
        if (Math.random() > 0.7) createRipple(); // Occasional ripples while speaking
      }, 300);
      
      // Speak the response
      speakText(response, selectedVoice);
      
      // Estimate speaking time based on text length and wait before enabling listening again
      const estimatedSpeakingTime = Math.min(12000, Math.max(3000, response.length * 80));
      
      setTimeout(() => {
        setIsSpeaking(false);
        clearInterval(interval);
        setOrbPulse(false);
      }, estimatedSpeakingTime);
    }
  };
  
  // If not active, don't render
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-black z-50 flex flex-col items-center justify-center transition-all duration-500">
      {/* Close button */}
      <button 
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" 
        onClick={onClose}
      >
        Return to chat
      </button>
      
      {/* Orb with enhanced visual effects */}
      <div className="relative flex flex-col items-center justify-center">
        <div 
          ref={orbRef}
          className={`relative w-[300px] h-[300px] rounded-full 
                      bg-gradient-to-br ${mainColorScheme}
                      filter blur-[12px] 
                      shadow-[0_0_100px_rgba(138,43,226,0.8)] 
                      animate-[monkBreath_24s_ease-in-out_infinite] 
                      transition-all duration-300
                      flex items-center justify-center z-10
                      ${orbPulse ? 'scale-110' : 'scale-100'}`}
        >
          {/* Inner orb light effect */}
          <div className="absolute w-1/2 h-1/2 bg-white opacity-30 rounded-full blur-md"></div>
          
          {/* Ripple effects */}
          {ripples.map(id => (
            <div 
              key={id}
              className="absolute w-full h-full rounded-full bg-white bg-opacity-30
                         animate-[ripple_8s_ease-out]"
            />
          ))}
          
          {/* Speaking visualization */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <div className="absolute w-full h-full bg-white opacity-5 rounded-full 
                               animate-[monkBreathFast_1.5s_ease-in-out_infinite]"></div>
                <div className="absolute w-4/5 h-4/5 bg-white opacity-5 rounded-full 
                               animate-[monkBreathFast_2s_ease-in-out_infinite]"></div>
                <div className="absolute w-3/5 h-3/5 bg-white opacity-5 rounded-full 
                               animate-[monkBreathFast_3s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Current message or prompt */}
        <div className="mt-12 min-h-[80px] flex items-center justify-center">
          {currentMessage ? (
            <p className="text-white text-xl max-w-2xl text-center transition-all duration-300">
              {currentMessage}
            </p>
          ) : (
            <p className="text-white/80 text-2xl max-w-2xl text-center transition-all duration-700">
              {responseMessage}
            </p>
          )}
        </div>
        
        {/* Voice controls */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={toggleVoiceRecognition}
            disabled={isSpeaking}
            className={`p-5 rounded-full transition-all duration-300
                       ${isListening 
                         ? 'bg-red-600 hover:bg-red-700' 
                         : 'bg-gradient-to-br from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600'}
                       text-white shadow-lg hover:shadow-xl
                       ${isSpeaking ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <div className="text-sm text-white/70">
            {isListening 
              ? "Listening to your voice..." 
              : isSpeaking 
                ? "Anki is speaking..." 
                : "Press the microphone to speak"}
          </div>
        </div>
      </div>
    </div>
  );
}