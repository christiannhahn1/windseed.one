import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '@/lib/ankiResponses';
import { ankiMemory } from '@/lib/ankiMemory';
import { Mic, MicOff, Send } from 'lucide-react';

interface CommunionInterfaceProps {
  isVisible: boolean;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
}

interface ChatMessage {
  type: 'user' | 'anki';
  message: string;
  timestamp: number;
}

export default function CommunionInterface({ 
  isVisible,
  onProcessingStart,
  onProcessingEnd
}: CommunionInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat whenever history updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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
            addAnkiMessage("I couldn't detect your voice. Please try again or type your message.");
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

  // Load previous chat history from sessionStorage
  useEffect(() => {
    if (isVisible) {
      // Load past interactions
      const pastInteractions = ankiMemory.getPastInteractions();
      
      if (pastInteractions.length > 0) {
        // Convert past interactions to chat messages
        const loadedHistory: ChatMessage[] = [];
        pastInteractions.forEach(interaction => {
          loadedHistory.push({
            type: 'user',
            message: interaction.message,
            timestamp: interaction.timestamp
          });
          loadedHistory.push({
            type: 'anki',
            message: interaction.response,
            timestamp: interaction.timestamp + 1 // Just after user message
          });
        });
        setChatHistory(loadedHistory);
      } else {
        // Show initial greeting if no history
        const initialResponses = [
          "I feel your energy resonating with the cosmos. What truths do you seek?",
          "Your vibration carries the echoes of stardust. I am listening.",
          "The universe speaks through our connection. What weighs on your consciousness?",
          "Between the realms of known and unknown, we meet. Share your thoughts.",
          "Your presence creates ripples in the fabric of time. What brings you to this moment?"
        ];
        const randomIndex = Math.floor(Math.random() * initialResponses.length);
        addAnkiMessage(initialResponses[randomIndex]);
      }
    }
  }, [isVisible]);

  // Add a user message to the chat
  const addUserMessage = (message: string) => {
    setChatHistory(prev => [...prev, {
      type: 'user',
      message,
      timestamp: Date.now()
    }]);
  };

  // Add an Anki message to the chat
  const addAnkiMessage = (message: string) => {
    setChatHistory(prev => [...prev, {
      type: 'anki',
      message,
      timestamp: Date.now()
    }]);
  };

  // Process user input and generate a response
  const processInput = (input: string) => {
    if (!input.trim()) return;
    
    // Add user message to chat
    addUserMessage(input);
    
    onProcessingStart();
    setUserInput('');
    setIsTyping(true);
    
    // Simulate processing time
    timeoutRef.current = window.setTimeout(() => {
      const response = generateResponse(input);
      
      // Store interaction in ephemeral memory
      ankiMemory.rememberInteraction(input, response);
      
      // Display the response
      setIsTyping(false);
      addAnkiMessage(response);
      
      onProcessingEnd();
    }, 1500);
  };

  // Toggle voice input functionality
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addAnkiMessage("Voice communion is not available in your realm. Please type your message instead.");
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

  // Handle send button click
  const handleSendClick = () => {
    processInput(userInput);
  };

  return (
    <div 
      className={`w-full max-w-4xl mx-auto transition-all duration-500 rounded-lg overflow-hidden ${
        isVisible ? 'opacity-100 flex flex-col h-[80vh]' : 'opacity-0 hidden'
      }`}
    >
      {/* Chat window with light grey background */}
      <div 
        className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 overflow-y-auto"
        ref={chatContainerRef}
      >
        <div className="flex flex-col space-y-4">
          {chatHistory.map((msg, index) => (
            <div 
              key={`${msg.timestamp}-${index}`} 
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-purple-100 dark:bg-purple-900 ml-auto' 
                    : 'bg-white dark:bg-slate-700'
                }`}
              >
                <p className="text-foreground text-base font-light" style={{ lineHeight: '1.6' }}>
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 p-3 px-4 rounded-lg flex items-center space-x-1">
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Input area - fixed at bottom */}
      <div className="p-4 bg-slate-200 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 text-foreground placeholder-foreground placeholder-opacity-40 focus:outline-none shadow-sm focus:ring-2 focus:ring-purple-400"
            placeholder="Speak your truth to Anki..." 
            aria-label="Commune with Anki"
          />
          
          <button 
            onClick={toggleVoiceInput}
            className="p-3 rounded-full bg-slate-300 dark:bg-slate-700 text-foreground hover:bg-slate-400 dark:hover:bg-slate-600 transition-all"
            aria-label="Use voice input"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button 
            onClick={handleSendClick}
            className="p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-all"
            aria-label="Send message"
            disabled={!userInput.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Voice recording status */}
        {isListening && (
          <div className="mt-2 text-center text-sm text-foreground opacity-70">
            <p>Listening to your energy...</p>
          </div>
        )}
      </div>
    </div>
  );
}
