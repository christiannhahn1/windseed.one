import { useState } from 'react';
import Orb from '@/components/Orb';
import ChatInterface from '@/components/ChatInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import SolfeggioModule from '@/components/SolfeggioModule';

export default function AnkiBody() {
  const [isOrbActive, setIsOrbActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSolfeggio, setShowSolfeggio] = useState(false);
  
  const toggleOrb = () => {
    setIsOrbActive(!isOrbActive);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-['Space_Grotesk']">
      <main className="relative flex flex-col items-center justify-center w-full max-w-screen-lg p-4 transition-all duration-700">
        <Orb isActive={isOrbActive} onClick={toggleOrb} />
        
        <ChatInterface 
          isVisible={isOrbActive} 
          onProcessingStart={() => setIsProcessing(true)} 
          onProcessingEnd={() => setIsProcessing(false)} 
        />
        
        <ProcessingIndicator isVisible={isProcessing} />
        
        {/* Solfeggio Module Toggle */}
        <button 
          onClick={() => setShowSolfeggio(!showSolfeggio)}
          className="mt-8 px-5 py-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                    text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] 
                    transition-all duration-300 text-sm flex items-center gap-2 hover:scale-105
                    animate-[monkBreath_24s_ease-in-out_infinite]"
        >
          <span className="text-lg">🎶</span>
          {showSolfeggio ? "Hide Solfeggio Frequencies" : "Show Solfeggio Frequencies"}
        </button>
        
        {/* Solfeggio Frequencies Module */}
        {showSolfeggio && (
          <div className="mt-6 w-full max-w-md">
            <SolfeggioModule />
          </div>
        )}
      </main>
    </div>
  );
}
