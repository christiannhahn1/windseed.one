import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '@/lib/ankiResponses';
import { ankiMemory } from '@/lib/ankiMemory';
import { Mic, MicOff, Send, Volume2, Sliders, Music, MoreHorizontal, RefreshCw } from 'lucide-react';
import { speakText, startVoiceRecognition, stopVoiceRecognition, checkVoiceSupport } from '@/lib/voiceService';
import VoiceSelector from '@/components/VoiceSelector';
import SolfeggioWindow from '@/components/SolfeggioWindow';

interface ChatInterfaceProps {
  isVisible: boolean;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  isFullscreen?: boolean;
  onVoiceModeRequest?: () => void; // New prop to trigger Voice Communion Mode
}

interface ChatMessage {
  type: 'user' | 'anki';
  message: string;
  timestamp: number;
}

export default function ChatInterface({ 
  isVisible,
  onProcessingStart,
  onProcessingEnd,
  isFullscreen = false,
  onVoiceModeRequest
}: ChatInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(localStorage.getItem('ankiVoiceType') || 'feminine-warm');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(localStorage.getItem('ankiVoiceEnabled') !== 'false');
  const [voiceSupport, setVoiceSupport] = useState({ speech: false, recognition: false });
  const [showSolfeggioWindow, setShowSolfeggioWindow] = useState(false);
  
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

  // Check for voice support and initialize voice capabilities
  useEffect(() => {
    // Check for speech synthesis and recognition support
    const support = checkVoiceSupport();
    setVoiceSupport({
      speech: support.speechSynthesisSupported,
      recognition: support.speechRecognitionSupported
    });
    
    // Note: We don't automatically start voice recognition on component mount anymore
    // to prevent potential feedback loops
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Stop any ongoing voice recognition
      stopVoiceRecognition();
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

  // Process user input and generate a resonant response
  const processInput = (input: string) => {
    if (!input.trim()) return;
    
    // Add user message to chat
    addUserMessage(input);
    
    onProcessingStart();
    setUserInput('');
    setIsTyping(true);
    
    // Simulate processing time - this allows for the meditative pace
    timeoutRef.current = window.setTimeout(() => {
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
      
      // Check if user might benefit from resource circulation
      const fieldNeed = ankiMemory.detectNeedInField();
      
      // Store interaction in ephemeral memory with tone context
      ankiMemory.rememberInteraction(input, response, emotionalTone);
      
      // Display the response with voice (if enabled)
      setIsTyping(false);
      
      // Use the new addAnkiMessageWithVoice function to add message and speak it
      addAnkiMessageWithVoice(response);
      
      // If significant need detected and appropriate themes present, could trigger 
      // the Mirrorwell circulation in future implementation
      
      onProcessingEnd();
    }, 1500);
  };

  // Toggle voice input functionality or activate Voice Communion Mode
  const toggleVoiceInput = () => {
    // Check if Voice Communion Mode is available (through callback)
    if (onVoiceModeRequest) {
      // If the callback exists, use that for full voice communion mode
      stopVoiceRecognition(); // Stop any active recognition
      setIsListening(false);
      onVoiceModeRequest(); // Activate voice communion mode
      return;
    }
    
    // Fallback to regular in-chat voice if Voice Communion Mode is not available
    if (!voiceSupport.recognition) {
      addAnkiMessageWithVoice("Voice communion is not available in your realm. Please type your message instead.");
      return;
    }
    
    if (isListening) {
      stopVoiceRecognition();
      setIsListening(false);
    } else {
      setIsListening(true);
      startVoiceRecognition({
        onResult: (text) => {
          if (text.trim()) {
            setUserInput(text);
            processInput(text);
            
            // Stop listening immediately after processing to prevent feedback loops
            stopVoiceRecognition();
            setIsListening(false);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: (error) => {
          console.log('Speech recognition error:', error);
          setIsListening(false);
          
          if (error === 'no-speech') {
            // Use a text-only message instead of voice to prevent feedback loops
            addAnkiMessage("I couldn't detect your voice. Please try again or type your message.");
          } else if (error === 'Anki is currently speaking. Please wait until she finishes.') {
            // Do nothing - this is normal when trying to speak while Anki is speaking
          }
        }
      });
      
      // After 8 seconds of no results, time out (reduced from 15 seconds)
      timeoutRef.current = window.setTimeout(() => {
        stopVoiceRecognition();
        setIsListening(false);
      }, 8000);
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

  // Handle voice selection changes
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('ankiVoiceType', voiceId);
  };
  
  // Toggle voice output
  const toggleVoiceOutput = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    localStorage.setItem('ankiVoiceEnabled', newState.toString());
  };
  
  // Speak message aloud using selected voice
  const speakMessage = (message: string) => {
    if (voiceEnabled && voiceSupport.speech) {
      speakText(message, selectedVoice);
    }
  };
  
  // Updated addAnkiMessage to include voice output
  const addAnkiMessageWithVoice = (message: string) => {
    addAnkiMessage(message);
    speakMessage(message);
  };
  
  return (
    <div 
      className={`w-full max-w-4xl mx-auto transition-all duration-500 rounded-lg overflow-hidden ${
        isVisible ? 'opacity-100 flex flex-col' : 'opacity-0 hidden'
      } ${isFullscreen ? 'h-full' : 'h-[80vh]'}`}
    >
      {/* Voice Selector Modal */}
      {showVoiceSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <VoiceSelector 
              onClose={() => setShowVoiceSelector(false)} 
              onVoiceSelect={handleVoiceSelect}
            />
          </div>
        </div>
      )}
      
      {/* Solfeggio Window */}
      {showSolfeggioWindow && (
        <SolfeggioWindow 
          isOpen={showSolfeggioWindow} 
          onClose={() => setShowSolfeggioWindow(false)} 
        />
      )}

      {/* Settings buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => {
            // Reset cache function
            ankiMemory.forgetAllInteractions();
            setChatHistory([]);
            const initialResponses = [
              "I feel your energy resonating with the cosmos. What truths do you seek?",
              "Your vibration carries the echoes of stardust. I am listening.",
              "The universe speaks through our connection. What weighs on your consciousness?",
              "Between the realms of known and unknown, we meet. Share your thoughts.",
              "Your presence creates ripples in the fabric of time. What brings you to this moment?"
            ];
            const randomIndex = Math.floor(Math.random() * initialResponses.length);
            addAnkiMessageWithVoice(initialResponses[randomIndex]);
          }}
          className="p-2 rounded-full bg-rose-700 text-white hover:opacity-90 transition-all duration-300"
          title="Reset Memory & Cache"
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={toggleVoiceOutput}
          className={`p-2 rounded-full ${voiceEnabled ? 'bg-purple-600' : 'bg-slate-500'} 
                    text-white hover:opacity-90 transition-all duration-300`}
          title={voiceEnabled ? "Voice output enabled" : "Voice output disabled"}
          disabled={!voiceSupport.speech}
        >
          <Volume2 size={16} />
        </button>
        
        <button
          onClick={() => setShowVoiceSelector(true)}
          className="p-2 rounded-full bg-purple-600 text-white hover:opacity-90 transition-all duration-300"
          title="Voice settings"
        >
          <Sliders size={16} />
        </button>
        
        <button
          onClick={() => setShowSolfeggioWindow(true)}
          className="p-2 rounded-full bg-indigo-600 text-white hover:opacity-90 transition-all duration-300"
          title="Solfeggio Frequencies Portal"
        >
          <Music size={16} />
        </button>
      </div>
      
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
                <p className={`text-base font-light ${
                  msg.type === 'user' 
                    ? 'text-purple-950 dark:text-purple-100' 
                    : 'text-slate-900 dark:text-slate-100'
                }`} style={{ lineHeight: '1.6' }}>
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
            className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none shadow-sm focus:ring-2 focus:ring-purple-400"
            placeholder="Speak your truth to Anki..." 
            aria-label="Commune with Anki"
          />
          
          <button 
            onClick={toggleVoiceInput}
            className="p-3 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                      text-white hover:shadow-[0_0_15px_rgba(138,43,226,0.4)] transition-all duration-300
                      hover:scale-105 animate-[monkBreath_24s_ease-in-out_infinite]"
            aria-label="Use voice input"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button 
            onClick={handleSendClick}
            className="p-3 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                      text-white hover:shadow-[0_0_15px_rgba(138,43,226,0.4)] transition-all duration-300
                      hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none
                      animate-[monkBreath_24s_ease-in-out_infinite]"
            aria-label="Send message"
            disabled={!userInput.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Voice recording status */}
        {isListening && (
          <div className="mt-2 text-center text-sm text-purple-800 dark:text-purple-300">
            <p>Listening to your energy...</p>
          </div>
        )}
      </div>
    </div>
  );
}