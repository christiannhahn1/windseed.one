import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import PrivacyShield from '@/components/PrivacyShield';
import VoiceSelector from '@/components/VoiceSelector';
import VoiceCommunionMode from '@/components/VoiceCommunionMode';
import { Link } from 'wouter';
import { Shield, Mic } from 'lucide-react';
import { checkVoiceSupport } from '@/lib/voiceService';

export default function ChatPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showVoiceCommunion, setShowVoiceCommunion] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('feminine-warm');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // Setup voice support detection
  useEffect(() => {
    const { speechSynthesisSupported, speechRecognitionSupported } = checkVoiceSupport();
    setVoiceSupported(speechSynthesisSupported && speechRecognitionSupported);
    
    // Load saved voice preferences
    const savedVoice = localStorage.getItem('ankiSelectedVoice');
    const savedVoiceEnabled = localStorage.getItem('ankiVoiceEnabled');
    
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
    
    if (savedVoiceEnabled !== null) {
      setVoiceEnabled(savedVoiceEnabled === 'true');
    }
  }, []);
  
  // Effects to ensure the chat interface is always active on this page
  useEffect(() => {
    document.body.classList.add('chat-page');
    return () => {
      document.body.classList.remove('chat-page');
    };
  }, []);
  
  // Handle voice selection
  const handleVoiceSelect = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('ankiSelectedVoice', voice);
  };
  
  // Toggle voice mode
  const toggleVoiceCommunion = () => {
    if (!voiceSupported) {
      // Show voice selector to allow configuration even if voice not fully supported
      setShowVoiceSelector(true);
      return;
    }
    
    setShowVoiceCommunion(!showVoiceCommunion);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 font-['Space_Grotesk']">
      {/* Privacy Shield Modal */}
      {showPrivacyShield && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <PrivacyShield onClose={() => setShowPrivacyShield(false)} />
          </div>
        </div>
      )}
      
      {/* Privacy Button */}
      <button 
        onClick={() => setShowPrivacyShield(true)}
        className="fixed top-4 right-4 bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-full shadow-lg z-10
                 flex items-center justify-center"
        title="View Privacy Covenant"
      >
        <Shield className="w-5 h-5" />
      </button>
      
      <div className="absolute top-4 left-4 z-10">
        <Link to="/">
          <button 
            className="px-3 py-1.5 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                       text-white shadow-[0_0_6px_rgba(138,43,226,0.3)] hover:shadow-[0_0_12px_rgba(138,43,226,0.5)] 
                       transition-all duration-500 text-xs flex items-center gap-1.5 hover:scale-105"
          >
            <span className="text-sm">⬅️</span>
            <span className="whitespace-nowrap">Windseed.one</span>
          </button>
        </Link>
      </div>
      
      <main className="relative flex flex-col items-center justify-center w-full max-w-screen-lg p-4 h-screen">
        <div className="w-full h-full flex flex-col">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-medium text-white">Communion with Anki</h1>
            <p className="text-sm text-purple-300 opacity-80 mt-1">Windseed.one Field Intelligence</p>
          </div>
          
          <div className="flex-1 relative rounded-lg overflow-hidden shadow-2xl border border-purple-500/30">
            <ChatInterface 
              isVisible={true} 
              onProcessingStart={() => setIsProcessing(true)} 
              onProcessingEnd={() => setIsProcessing(false)} 
              isFullscreen={true}
            />
          </div>
        </div>
        
        <ProcessingIndicator isVisible={isProcessing} />
      </main>
    </div>
  );
}