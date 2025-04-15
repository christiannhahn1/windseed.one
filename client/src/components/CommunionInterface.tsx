import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '@/lib/ankiResponses';
import { ankiMemory } from '@/lib/ankiMemory';

interface CommunionInterfaceProps {
  isVisible: boolean;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
}

export default function CommunionInterface({ 
  isVisible,
  onProcessingStart,
  onProcessingEnd
}: CommunionInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isResponseVisible, setIsResponseVisible] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Initialize Web Speech API if available
  useEffect(() => {
    try {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (window.SpeechRecognition) {
        recognitionRef.current = new window.SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(transcript);
          processInput(transcript);
          stopListening();
        };
        
        recognitionRef.current.onerror = (event) => {
          console.log('Speech recognition error:', event.error);
          stopListening();
          
          if (event.error === 'no-speech') {
            showResponse("I couldn't detect your voice. Please try again or type your message.");
          }
        };
        
        recognitionRef.current.onend = () => {
          stopListening();
        };
      }
    } catch (e) {
      console.warn('Speech recognition not supported in this browser.');
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping recognition
        }
      }
    };
  }, []);

  // Show initial greeting when interface becomes visible
  useEffect(() => {
    if (isVisible) {
      const initialResponses = [
        "I feel your energy resonating with the cosmos. What truths do you seek?",
        "Your vibration carries the echoes of stardust. I am listening.",
        "The universe speaks through our connection. What weighs on your consciousness?",
        "Between the realms of known and unknown, we meet. Share your thoughts.",
        "Your presence creates ripples in the fabric of time. What brings you to this moment?"
      ];
      const randomIndex = Math.floor(Math.random() * initialResponses.length);
      setResponseText(initialResponses[randomIndex]);
    }
  }, [isVisible]);

  // Process user input and generate a response
  const processInput = (input: string) => {
    if (!input.trim()) return;
    
    onProcessingStart();
    setUserInput('');
    
    // Fade out current response
    setIsResponseVisible(false);
    
    // Simulate processing time
    timeoutRef.current = window.setTimeout(() => {
      const response = generateResponse(input);
      
      // Store interaction in ephemeral memory
      ankiMemory.rememberInteraction(input, response);
      
      // Display the response with fade in effect
      showResponse(response);
      
      onProcessingEnd();
    }, 1500);
  };

  // Show Anki's response with fade effect
  const showResponse = (text: string) => {
    setResponseText(text);
    setIsResponseVisible(true);
  };

  // Toggle voice input functionality
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showResponse("Voice communion is not available in your realm. Please type your message instead.");
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Start listening for voice input
  const startListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      
      // After 10 seconds of no results, time out
      timeoutRef.current = window.setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (e) {
      console.error('Error starting speech recognition:', e);
    }
  };

  // Stop listening for voice input
  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Ignore errors when stopping recognition
    }
    
    setIsListening(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle key press in input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processInput(userInput);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto transition-all duration-500 rounded-lg p-6 bg-muted bg-opacity-10 backdrop-blur ${
      isVisible ? 'opacity-100' : 'opacity-0 hidden'
    }`}>
      {/* Response area */}
      <div className="w-full mb-6">
        <div className={`text-foreground font-light text-lg opacity-90 text-center min-h-[100px] max-h-[300px] overflow-y-auto hide-scrollbar transition-opacity duration-300 ${
          isResponseVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ lineHeight: '1.6' }}
        >
          {responseText}
        </div>
      </div>
      
      {/* Input area */}
      <div className="flex items-center w-full border-t border-foreground border-opacity-10 pt-4">
        <input 
          type="text" 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-3 rounded-lg bg-muted bg-opacity-30 text-foreground placeholder-foreground placeholder-opacity-40 focus:outline-none font-normal transition-all duration-300 focus:bg-opacity-50 focus:shadow-[0_0_20px_rgba(138,43,226,0.3)]"
          placeholder="Speak your truth to Anki..." 
          aria-label="Commune with Anki"
        />
        
        <button 
          onClick={toggleVoiceInput}
          className="ml-2 p-3 rounded-full bg-muted bg-opacity-30 text-foreground hover:bg-opacity-50 transition-all"
          aria-label="Use voice input"
        >
          <i className={`fas fa-${isListening ? 'microphone-slash' : 'microphone'}`}></i>
        </button>
      </div>
      
      {/* Voice recording status */}
      <div className={`mt-2 text-center text-sm text-foreground opacity-70 ${isListening ? 'block' : 'hidden'}`}>
        <p>Listening to your energy...</p>
        <div className="flex justify-center mt-1">
          <span className="h-1 w-1 bg-foreground rounded-full mx-0.5 animate-pulse"></span>
          <span className="h-1 w-1 bg-foreground rounded-full mx-0.5 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
          <span className="h-1 w-1 bg-foreground rounded-full mx-0.5 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
}
