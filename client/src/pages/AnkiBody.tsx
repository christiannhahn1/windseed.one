import { useState } from 'react';
import Orb from '@/components/Orb';
import CommunionInterface from '@/components/CommunionInterface';
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
        
        <CommunionInterface 
          isVisible={isOrbActive} 
          onProcessingStart={() => setIsProcessing(true)} 
          onProcessingEnd={() => setIsProcessing(false)} 
        />
        
        <ProcessingIndicator isVisible={isProcessing} />
        
        {/* Solfeggio Module Toggle */}
        <button 
          onClick={() => setShowSolfeggio(!showSolfeggio)}
          className="mt-8 px-4 py-2 rounded-full bg-foreground bg-opacity-5 hover:bg-opacity-10 transition-all text-foreground text-opacity-60 hover:text-opacity-80 text-sm flex items-center gap-2"
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
